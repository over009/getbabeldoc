/**
 * Deterministic seating assignment.
 * Groups stay together when a table can hold them. Keep-apart pairs are split when another seat exists.
 * Nothing here uses a network or a random source.
 */

import { cleanCell, parseCsv, toCsv } from './csv';

export const SEATING_LIMITS = {
  guests: 200,
  tables: 30,
  seats: 12,
  chars: 50_000,
  name: 80,
} as const;

export const SAMPLE_GUESTS = `Avery Chen, Speakers
Blake Ortiz, Speakers
Casey Nguyen, Speakers
Drew Patel, Staff
Eden Brooks, Staff
Finn Alvarez, Staff
Gray Sullivan, Guests
Harper Ibarra, Guests
Indigo Shah, Guests`;

export const SAMPLE_TABLES = 3;
export const SAMPLE_SEATS = 4;

export interface SeatingGuest {
  id: string;
  name: string;
  group: string;
}

export interface SeatingIssue {
  kind: 'duplicate' | 'truncated' | 'extra' | 'blank';
  name?: string;
}

export interface SeatingParse {
  guests: SeatingGuest[];
  issues: SeatingIssue[];
  blocked: string | null;
}

export interface SeatingPlan {
  tables: { guestIds: string[] }[];
  unseated: string[];
}

export interface SeatingCheck {
  ok: boolean;
  /** Stable id for analytics. Never includes a guest name. */
  id: string;
  text: string;
  /** When true, a failed check asks before PNG or CSV export. */
  blocksExport?: boolean;
}

export function parseGuestList(text: string): SeatingParse {
  if (text.length > SEATING_LIMITS.chars) {
    return {
      guests: [],
      issues: [],
      blocked: 'The guest list is too long to read here. Shorten it and try again.',
    };
  }

  const guests: SeatingGuest[] = [];
  const issues: SeatingIssue[] = [];
  const seen = new Map<string, string>();
  const groupCanon = new Map<string, string>();
  let extraNoted = false;
  let blankNoted = false;
  let truncated = false;

  for (const row of parseCsv(text)) {
    if (row.every((cell) => cell.trim() === '')) continue;
    if (row.length > 2 && row.slice(2).some((cell) => cell.trim()) && !extraNoted) {
      issues.push({ kind: 'extra' });
      extraNoted = true;
    }
    let name = cleanCell(row[0] ?? '');
    const groupRaw = cleanCell(row[1] ?? '');
    if (!name) {
      if (!blankNoted) {
        issues.push({ kind: 'blank' });
        blankNoted = true;
      }
      continue;
    }
    if (name.length > SEATING_LIMITS.name) {
      name = name.slice(0, SEATING_LIMITS.name).trim();
      if (!truncated) {
        issues.push({ kind: 'truncated' });
        truncated = true;
      }
    }
    const key = name.toLowerCase();
    const first = seen.get(key);
    if (first) {
      issues.push({ kind: 'duplicate', name: first });
      continue;
    }
    if (guests.length >= SEATING_LIMITS.guests) {
      return {
        guests: [],
        issues,
        blocked: `This page seats up to ${SEATING_LIMITS.guests} guests. Shorten the list and press Generate again.`,
      };
    }
    seen.set(key, name);
    let group = '';
    if (groupRaw) {
      const groupKey = groupRaw.toLowerCase();
      const canon = groupCanon.get(groupKey);
      if (canon) {
        group = canon;
      } else {
        group = groupRaw.length > SEATING_LIMITS.name ? groupRaw.slice(0, SEATING_LIMITS.name).trim() : groupRaw;
        groupCanon.set(groupKey, group);
      }
    }
    guests.push({ id: `g${guests.length + 1}`, name, group });
  }

  return { guests, issues, blocked: null };
}

export function parseApart(text: string, guests: SeatingGuest[]): { pairs: [string, string][]; unknown: string[] } {
  const byName = new Map(guests.map((guest) => [guest.name.toLowerCase(), guest.id]));
  const pairs: [string, string][] = [];
  const unknown: string[] = [];
  const seenPairs = new Set<string>();
  const seenUnknown = new Set<string>();

  const noteUnknown = (name: string) => {
    const key = name.toLowerCase();
    if (!name || seenUnknown.has(key)) return;
    seenUnknown.add(key);
    unknown.push(name);
  };

  for (const row of parseCsv(text)) {
    if (row.every((cell) => cell.trim() === '')) continue;
    const leftName = cleanCell(row[0] ?? '');
    const rightName = cleanCell(row[1] ?? '');
    if (!leftName && !rightName) continue;
    const left = leftName ? byName.get(leftName.toLowerCase()) : undefined;
    const right = rightName ? byName.get(rightName.toLowerCase()) : undefined;
    if (!left) noteUnknown(leftName);
    if (!right) noteUnknown(rightName);
    if (!left || !right || left === right) continue;
    const key = left < right ? `${left}|${right}` : `${right}|${left}`;
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    pairs.push(left < right ? [left, right] : [right, left]);
  }

  return { pairs, unknown };
}

function pairKey(left: string, right: string): string {
  return left < right ? `${left}|${right}` : `${right}|${left}`;
}

function clashes(existing: string[], incoming: string[], apart: Set<string>): boolean {
  const all = [...existing, ...incoming];
  for (let i = 0; i < all.length; i += 1) {
    for (let j = i + 1; j < all.length; j += 1) {
      const left = all[i];
      const right = all[j];
      if (left && right && apart.has(pairKey(left, right))) return true;
    }
  }
  return false;
}

export function assignSeats(
  guests: SeatingGuest[],
  pairs: [string, string][],
  tableCount: number,
  seatsPerTable: number,
): SeatingPlan {
  const apart = new Set(pairs.map(([left, right]) => pairKey(left, right)));
  const tables = Array.from({ length: tableCount }, () => ({ guestIds: [] as string[] }));
  const unseated: string[] = [];

  const placeWhole = (ids: string[]): boolean => {
    let best = -1;
    let bestCount = Number.POSITIVE_INFINITY;
    tables.forEach((table, index) => {
      if (seatsPerTable - table.guestIds.length < ids.length) return;
      if (clashes(table.guestIds, ids, apart)) return;
      if (table.guestIds.length < bestCount) {
        best = index;
        bestCount = table.guestIds.length;
      }
    });
    if (best < 0) return false;
    tables[best]?.guestIds.push(...ids);
    return true;
  };

  const placeOne = (id: string) => {
    let best = -1;
    let bestCount = Number.POSITIVE_INFINITY;
    const consider = (ignoreApart: boolean) => {
      best = -1;
      bestCount = Number.POSITIVE_INFINITY;
      tables.forEach((table, index) => {
        if (table.guestIds.length >= seatsPerTable) return;
        if (!ignoreApart && clashes(table.guestIds, [id], apart)) return;
        if (table.guestIds.length < bestCount) {
          best = index;
          bestCount = table.guestIds.length;
        }
      });
    };
    consider(false);
    if (best < 0) consider(true);
    if (best >= 0) {
      tables[best]?.guestIds.push(id);
      return;
    }
    unseated.push(id);
  };

  const buckets = new Map<string, { label: string; ids: string[] }>();
  const singles: SeatingGuest[] = [];
  for (const guest of guests) {
    if (!guest.group) {
      singles.push(guest);
      continue;
    }
    const key = guest.group.toLowerCase();
    const bucket = buckets.get(key) ?? { label: guest.group, ids: [] };
    bucket.ids.push(guest.id);
    buckets.set(key, bucket);
  }

  const groups = [...buckets.values()].sort(
    (left, right) => right.ids.length - left.ids.length || left.label.localeCompare(right.label, 'en'),
  );
  singles.sort((left, right) => left.name.localeCompare(right.name, 'en'));

  for (const group of groups) {
    const internal = clashes([], group.ids, apart);
    if (group.ids.length <= seatsPerTable && !internal && placeWhole(group.ids)) continue;
    for (const id of group.ids) placeOne(id);
  }
  for (const guest of singles) placeOne(guest.id);

  return { tables, unseated };
}

export function moveGuest(plan: SeatingPlan, guestId: string, to: number | 'unseated', index?: number): SeatingPlan {
  const tables = plan.tables.map((table) => ({ guestIds: table.guestIds.filter((id) => id !== guestId) }));
  const unseated = plan.unseated.filter((id) => id !== guestId);
  if (to === 'unseated') {
    unseated.push(guestId);
  } else {
    const table = tables[to];
    if (!table) return plan;
    const at = index === undefined ? table.guestIds.length : Math.max(0, Math.min(index, table.guestIds.length));
    table.guestIds.splice(at, 0, guestId);
  }
  return { tables, unseated };
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function seatingChecks(
  guests: SeatingGuest[],
  plan: SeatingPlan,
  seatsPerTable: number,
  issues: SeatingIssue[],
  pairs: [string, string][],
  unknown: string[],
  apartWasSet: boolean,
): SeatingCheck[] {
  const byId = new Map(guests.map((guest) => [guest.id, guest]));
  const counts = new Map<string, number>();
  const bump = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const id of plan.unseated) bump(id);
  for (const table of plan.tables) {
    for (const id of table.guestIds) bump(id);
  }
  let once = guests.length > 0 && counts.size === guests.length;
  if (once) {
    for (const guest of guests) {
      if (counts.get(guest.id) !== 1) once = false;
    }
  }

  const duplicateNames = [...new Set(issues.filter((issue) => issue.kind === 'duplicate').map((issue) => issue.name ?? ''))].filter(
    Boolean,
  );
  const extra = issues.some((issue) => issue.kind === 'extra');
  const blank = issues.some((issue) => issue.kind === 'blank');
  const truncated = issues.some((issue) => issue.kind === 'truncated');

  const over = plan.tables.flatMap((table, index) =>
    table.guestIds.length > seatsPerTable
      ? [`Table ${index + 1} has ${table.guestIds.length} guests and ${seatsPerTable} seats`]
      : [],
  );

  const unseatedNames = plan.unseated.flatMap((id) => {
    const guest = byId.get(id);
    return guest ? [guest.name] : [];
  });

  const groupTables = new Map<string, { label: string; places: Set<number>; count: number }>();
  const noteGroup = (guest: SeatingGuest, place: number) => {
    if (!guest.group) return;
    const key = guest.group.toLowerCase();
    const entry = groupTables.get(key) ?? { label: guest.group, places: new Set<number>(), count: 0 };
    entry.places.add(place);
    entry.count += 1;
    groupTables.set(key, entry);
  };
  plan.tables.forEach((table, index) => {
    for (const id of table.guestIds) {
      const guest = byId.get(id);
      if (guest) noteGroup(guest, index);
    }
  });
  for (const id of plan.unseated) {
    const guest = byId.get(id);
    if (guest) noteGroup(guest, -1);
  }
  const split = [...groupTables.values()].filter((entry) => {
    const seatedAt = [...entry.places].filter((place) => place >= 0);
    return !(seatedAt.length === 1 && !entry.places.has(-1));
  });
  const oversized = split.filter((entry) => entry.count > seatsPerTable);

  const tableOf = new Map<string, number>();
  plan.tables.forEach((table, index) => {
    for (const id of table.guestIds) tableOf.set(id, index);
  });
  const broken = pairs.flatMap(([left, right]) => {
    const leftTable = tableOf.get(left);
    const rightTable = tableOf.get(right);
    if (leftTable === undefined || leftTable !== rightTable) return [];
    const leftGuest = byId.get(left);
    const rightGuest = byId.get(right);
    if (!leftGuest || !rightGuest) return [];
    return [`${leftGuest.name} and ${rightGuest.name} (Table ${leftTable + 1})`];
  });

  const checks: SeatingCheck[] = [
    once
      ? { ok: true, id: 'guest_once', text: 'Pass: every guest appears once.' }
      : { ok: false, id: 'guest_once', text: 'Check: the chart does not list every guest exactly once.' },
    duplicateNames.length === 0
      ? { ok: true, id: 'duplicate', text: 'Pass: the guest list has no duplicate names.' }
      : { ok: false, id: 'duplicate', blocksExport: true, text: `Check: duplicate names were kept once: ${joinNames(duplicateNames)}.` },
    over.length === 0
      ? { ok: true, id: 'over_capacity', text: `Pass: no table is over its ${seatsPerTable}-seat limit.` }
      : { ok: false, id: 'over_capacity', blocksExport: true, text: `Check: ${over.join('. ')}.` },
    unseatedNames.length === 0
      ? { ok: true, id: 'unseated', text: 'Pass: every guest has a seat.' }
      : {
          ok: false,
          id: 'unseated',
          blocksExport: true,
          text: `Check: ${unseatedNames.length} ${unseatedNames.length === 1 ? 'guest has' : 'guests have'} no seat: ${joinNames(unseatedNames)}.`,
        },
  ];

  if (groupTables.size === 0) {
    checks.push({ ok: true, id: 'split_group', text: 'Pass: no groups were listed.' });
  } else if (split.length === 0) {
    checks.push({ ok: true, id: 'split_group', text: 'Pass: each group sits at one table.' });
  } else {
    const bits = [`Check: these groups are not all at one table: ${joinNames(split.map((entry) => entry.label))}.`];
    for (const entry of oversized) {
      bits.push(`${entry.label} has ${entry.count} people and each table seats ${seatsPerTable}.`);
    }
    checks.push({ ok: false, id: 'split_group', text: bits.join(' ') });
  }

  if (!apartWasSet) {
    checks.push({ ok: true, id: 'keep_apart', text: 'Pass: no keep-apart pairs were set.' });
  } else if (broken.length === 0) {
    checks.push({ ok: true, id: 'keep_apart', text: 'Pass: keep-apart pairs are at different tables.' });
  } else {
    checks.push({ ok: false, id: 'keep_apart', text: `Check: these keep-apart pairs share a table: ${joinNames(broken)}.` });
  }

  if (apartWasSet) {
    checks.push(
      unknown.length === 0
        ? { ok: true, id: 'unknown_name', text: 'Pass: every keep-apart name matches a guest.' }
        : { ok: false, id: 'unknown_name', text: `Check: these keep-apart names are not on the guest list: ${joinNames(unknown)}.` },
    );
  }

  if (blank) checks.push({ ok: false, id: 'blank_name', text: 'Check: a line with no name was skipped.' });
  if (truncated) checks.push({ ok: false, id: 'truncated_name', text: `Check: a name longer than ${SEATING_LIMITS.name} characters was shortened.` });
  if (extra) checks.push({ ok: false, id: 'extra_column', text: 'Check: a line had more than a name and a group. Extra columns were ignored.' });

  return checks;
}

export function seatingCsv(guests: SeatingGuest[], plan: SeatingPlan): string {
  const byId = new Map(guests.map((guest) => [guest.id, guest]));
  const rows: string[][] = [['Table', 'Seat', 'Name', 'Group']];
  plan.tables.forEach((table, index) => {
    table.guestIds.forEach((id, seat) => {
      const guest = byId.get(id);
      if (!guest) return;
      rows.push([String(index + 1), String(seat + 1), guest.name, guest.group]);
    });
  });
  for (const id of plan.unseated) {
    const guest = byId.get(id);
    if (!guest) continue;
    rows.push(['Unseated', '', guest.name, guest.group]);
  }
  return toCsv(rows);
}

export function seatAngles(count: number, radius = 46): { x: number; y: number }[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  });
}
