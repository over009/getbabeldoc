/**
 * Org chart tree from Name, Title, Manager rows.
 * Cycles are reported and one edge is dropped so the drawing stays a tree.
 */

import { cleanCell, parseCsv } from './csv';

export const ORG_LIMITS = {
  people: 150,
  chars: 100_000,
  name: 120,
} as const;

export const SAMPLE_ORG = `Name, Title, Manager
Avery Chen, Director,
Blake Ortiz, Programs Lead, Avery Chen
Casey Nguyen, Finance Lead, Avery Chen
Drew Patel, Events, Blake Ortiz
Eden Brooks, Volunteers, Blake Ortiz
Finn Alvarez, Bookkeeping, Casey Nguyen
Gray Sullivan, Partnerships, Casey Nguyen
Harper Ibarra, Registration, Drew Patel`;

export interface OrgPerson {
  id: string;
  name: string;
  title: string;
  managerRaw: string;
}

export interface OrgCheck {
  ok: boolean;
  /** Stable id for analytics. Never includes a person’s name. */
  id: string;
  text: string;
  /** When true, a failed check asks before PNG or SVG export. */
  blocksExport?: boolean;
}

export interface OrgModel {
  people: OrgPerson[];
  children: Map<string, string[]>;
  roots: string[];
  checks: OrgCheck[];
  blocked: string | null;
}

export interface OrgBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  collapsed: boolean;
  hasChildren: boolean;
}

export interface OrgSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface OrgLayout {
  boxes: OrgBox[];
  segments: OrgSegment[];
  width: number;
  height: number;
}

const NODE_W = 200;
const NODE_H = 68;
const GAP_X = 28;
const GAP_Y = 56;
const PAD = 24;

const NAME_HEADERS = ['name', 'employee', 'person', 'full name'];
const TITLE_HEADERS = ['title', 'role', 'position', 'job title'];
const MANAGER_HEADERS = ['manager', 'reports to', 'supervisor', 'parent', 'manager name'];

export function orgHeaderLikely(text: string): boolean {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''));
  const first = rows[0];
  if (!first || rows.length < 2) return false;
  const known = new Set<string>([...NAME_HEADERS, ...TITLE_HEADERS, ...MANAGER_HEADERS]);
  const hits = first.filter((cell) => known.has(cell.trim().toLowerCase())).length;
  return hits >= 2;
}

function headerIndex(headers: string[], names: string[]): number {
  const lower = headers.map((header) => header.trim().toLowerCase());
  for (const name of names) {
    const index = lower.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function buildOrg(text: string, firstRowHeader: boolean): OrgModel {
  const empty = (blocked: string | null, checks: OrgCheck[] = []): OrgModel => ({
    people: [],
    children: new Map(),
    roots: [],
    checks,
    blocked,
  });

  if (text.length > ORG_LIMITS.chars) {
    return empty('The list is too long to read here. Shorten it and try again.');
  }

  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''));
  if (rows.length === 0) return empty('Add at least one person.');

  let data = rows;
  let nameCol = 0;
  let titleCol = 1;
  let managerCol = 2;
  let usedFallback = false;
  if (firstRowHeader) {
    const header = rows[0] ?? [];
    data = rows.slice(1);
    const foundName = headerIndex(header, NAME_HEADERS);
    const foundTitle = headerIndex(header, TITLE_HEADERS);
    const foundManager = headerIndex(header, MANAGER_HEADERS);
    if (foundName >= 0 && foundTitle >= 0 && foundManager >= 0) {
      nameCol = foundName;
      titleCol = foundTitle;
      managerCol = foundManager;
    } else {
      usedFallback = true;
    }
  }
  if (data.length === 0) return empty('The header is there, but there are no people under it.');

  const people: OrgPerson[] = [];
  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  let truncated = false;
  let blank = false;

  for (const row of data) {
    let name = cleanCell(row[nameCol] ?? '');
    const title = cleanCell(row[titleCol] ?? '');
    const managerRaw = cleanCell(row[managerCol] ?? '');
    if (!name) {
      blank = true;
      continue;
    }
    if (name.length > ORG_LIMITS.name) {
      name = name.slice(0, ORG_LIMITS.name).trim();
      truncated = true;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      const first = seen.get(key);
      if (first && !duplicates.includes(first)) duplicates.push(first);
      continue;
    }
    if (people.length >= ORG_LIMITS.people) {
      return empty(`This page draws up to ${ORG_LIMITS.people} people. Shorten the list and try again.`);
    }
    seen.set(key, name);
    people.push({ id: `p${people.length + 1}`, name, title, managerRaw });
  }

  if (people.length === 0) return empty('Add at least one person with a name.');

  const idByName = new Map(people.map((person) => [person.name.toLowerCase(), person.id]));
  const children = new Map<string, string[]>(people.map((person) => [person.id, []]));
  const parent = new Map<string, string>();
  const missing: string[] = [];
  const selfManagers: string[] = [];
  const cycles: string[] = [];

  for (const person of people) {
    if (!person.managerRaw) continue;
    if (person.managerRaw.toLowerCase() === person.name.toLowerCase()) {
      selfManagers.push(person.name);
      continue;
    }
    const managerId = idByName.get(person.managerRaw.toLowerCase());
    if (!managerId) {
      missing.push(`${person.managerRaw} (listed by ${person.name})`);
      continue;
    }
    const chain: string[] = [];
    let cursor: string | undefined = managerId;
    let loop = false;
    const guard = new Set<string>();
    while (cursor) {
      if (cursor === person.id) {
        loop = true;
        break;
      }
      if (guard.has(cursor)) break;
      guard.add(cursor);
      chain.push(cursor);
      cursor = parent.get(cursor);
    }
    if (loop) {
      const via = chain.map((id) => people.find((item) => item.id === id)?.name ?? id);
      const names = [person.name, ...via];
      const steps = names.map((name, index) => `${name} reports to ${names[(index + 1) % names.length] ?? name}`);
      const body = steps.length <= 1
        ? `${person.name} reports to ${person.managerRaw}`
        : `${steps.slice(0, -1).join(', ')}, and ${steps[steps.length - 1]}`;
      cycles.push(`${body}. The chart leaves off the link from ${person.name} back to ${person.managerRaw}`);
      continue;
    }
    parent.set(person.id, managerId);
    children.get(managerId)?.push(person.id);
  }

  const roots = people.filter((person) => !parent.has(person.id)).map((person) => person.id);
  const byId = new Map(people.map((person) => [person.id, person]));
  const rootNames = roots.flatMap((id) => {
    const person = byId.get(id);
    return person ? [person.name] : [];
  });

  const checks: OrgCheck[] = [
    duplicates.length === 0
      ? { ok: true, id: 'duplicate', text: 'Pass: each person appears once.' }
      : { ok: false, id: 'duplicate', blocksExport: true, text: `Check: duplicate names were not drawn again: ${joinNames(duplicates)}.` },
    missing.length === 0
      ? { ok: true, id: 'missing_manager', text: 'Pass: every manager matches a person on the chart.' }
      : { ok: false, id: 'missing_manager', blocksExport: true, text: `Check: these managers are not on the list: ${joinNames(missing)}.` },
    selfManagers.length === 0
      ? { ok: true, id: 'self_manager', text: 'Pass: nobody is listed as their own manager.' }
      : {
          ok: false,
          id: 'self_manager',
          text: selfManagers.length === 1
            ? `Check: ${selfManagers[0]} is listed as their own manager. No link was drawn.`
            : `Check: ${joinNames(selfManagers)} are listed as their own managers. No links were drawn.`,
        },
    roots.length === 1
      ? { ok: true, id: 'multiple_roots', text: `Pass: one person is at the top: ${rootNames[0] ?? 'Unknown'}.` }
      : {
          ok: false,
          id: 'multiple_roots',
          blocksExport: true,
          text: `Check: ${roots.length} people are at the top, so the chart shows ${roots.length} trees: ${joinNames(rootNames)}.`,
        },
    cycles.length === 0
      ? { ok: true, id: 'cycle', text: 'Pass: there is no reporting loop.' }
      : { ok: false, id: 'cycle', blocksExport: true, text: `Check: ${cycles.join(' ')}.` },
  ];

  if (blank) checks.push({ ok: false, id: 'blank_name', text: 'Check: a row with no name was skipped.' });
  if (truncated) checks.push({ ok: false, id: 'truncated_name', text: `Check: a name longer than ${ORG_LIMITS.name} characters was shortened.` });
  if (usedFallback) {
    checks.push({
      ok: false,
      id: 'header_fallback',
      text: 'Check: the header did not include Name, Title, and Manager. The first three columns were used in that order.',
    });
  }

  return { people, children, roots, checks, blocked: null };
}

export function layoutOrg(
  children: Map<string, string[]>,
  roots: string[],
  collapsed: ReadonlySet<string>,
): OrgLayout {
  const widths = new Map<string, number>();
  const visibleKids = (id: string): string[] => (collapsed.has(id) ? [] : (children.get(id) ?? []));

  const measure = (id: string): number => {
    const cached = widths.get(id);
    if (cached !== undefined) return cached;
    const kids = visibleKids(id);
    if (kids.length === 0) {
      widths.set(id, NODE_W);
      return NODE_W;
    }
    const total = kids.reduce((sum, kid) => sum + measure(kid), 0) + GAP_X * (kids.length - 1);
    const width = Math.max(NODE_W, total);
    widths.set(id, width);
    return width;
  };

  const boxes: OrgBox[] = [];
  const segments: OrgSegment[] = [];

  const place = (id: string, left: number, depth: number) => {
    const width = measure(id);
    const kids = visibleKids(id);
    const x = left + width / 2 - NODE_W / 2;
    const y = PAD + depth * (NODE_H + GAP_Y);
    boxes.push({
      id,
      x,
      y,
      w: NODE_W,
      h: NODE_H,
      collapsed: collapsed.has(id),
      hasChildren: (children.get(id) ?? []).length > 0,
    });
    if (kids.length === 0) return;
    const kidsWidth = kids.reduce((sum, kid) => sum + measure(kid), 0) + GAP_X * (kids.length - 1);
    let cursor = left + (width - kidsWidth) / 2;
    const parentBottom = y + NODE_H;
    const busY = parentBottom + GAP_Y / 2;
    const parentCx = x + NODE_W / 2;
    const childCenters: number[] = [];
    for (const kid of kids) {
      const kidWidth = measure(kid);
      place(kid, cursor, depth + 1);
      childCenters.push(cursor + kidWidth / 2);
      cursor += kidWidth + GAP_X;
    }
    const first = childCenters[0];
    const last = childCenters[childCenters.length - 1];
    if (first === undefined || last === undefined) return;
    segments.push({ x1: parentCx, y1: parentBottom, x2: parentCx, y2: busY });
    if (first !== last) segments.push({ x1: first, y1: busY, x2: last, y2: busY });
    for (const center of childCenters) {
      segments.push({ x1: center, y1: busY, x2: center, y2: parentBottom + GAP_Y });
    }
  };

  let forestLeft = PAD;
  for (const root of roots) {
    place(root, forestLeft, 0);
    forestLeft += measure(root) + GAP_X * 2;
  }

  const width = Math.max(PAD * 2 + NODE_W, forestLeft - GAP_X * 2 + PAD);
  const height = boxes.reduce((max, box) => Math.max(max, box.y + box.h), PAD) + PAD;
  return { boxes, segments, width, height };
}
