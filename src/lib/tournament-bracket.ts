/**
 * Single-elimination bracket state.
 * The page stores this in local storage and in the URL hash. Nothing here talks to a server.
 */

export const MIN_ENTRANTS = 2;
export const MAX_ENTRANTS = 64;
export const NAME_LIMIT = 48;
export const TITLE_LIMIT = 80;
export const SOURCE_LIMIT = 8_000;

export const BRACKET_LAYOUT = {
  matchWidth: 200,
  matchHeight: 88,
  columnGap: 52,
  slotGap: 12,
  headerHeight: 36,
  padX: 2,
  padY: 2,
} as const;

export interface BracketState {
  v: 1;
  title: string;
  source: string;
  shuffled: boolean;
  names: string[];
  winners: Record<string, 0 | 1>;
}

export type Slot =
  | { kind: 'player'; name: string; seed: number }
  | { kind: 'bye' }
  | { kind: 'tbd' };

export interface MatchView {
  key: string;
  round: number;
  index: number;
  a: Slot;
  b: Slot;
  winner: 0 | 1 | null;
  automatic: boolean;
  advanced: Slot | null;
}

export function nextPowerOfTwo(count: number): number {
  let size = 1;
  while (size < count) size *= 2;
  return size;
}

/** 1-based seeds in first-round order, so 1 meets the last seed and the two finalists start opposite. */
export function seedOrder(size: number): number[] {
  let slots = [1];
  while (slots.length < size) {
    const sum = slots.length * 2 + 1;
    const next: number[] = [];
    for (const seed of slots) next.push(seed, sum - seed);
    slots = next;
  }
  return slots;
}

export function roundLabel(roundIndex: number, roundCount: number): string {
  const remaining = roundCount - roundIndex;
  if (remaining <= 1) return 'Final';
  if (remaining === 2) return 'Semifinals';
  if (remaining === 3) return 'Quarterfinals';
  return `Round ${roundIndex + 1}`;
}

export function entrantsFromSource(source: string): { names: string[]; dropped: number; clipped: boolean } {
  const clipped = source.length > SOURCE_LIMIT;
  const lines = source
    .slice(0, SOURCE_LIMIT)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    names: lines.slice(0, MAX_ENTRANTS).map((line) => line.slice(0, NAME_LIMIT)),
    dropped: Math.max(0, lines.length - MAX_ENTRANTS),
    clipped,
  };
}

export function shuffleNames(names: readonly string[], randomBelow: (limit: number) => number): string[] {
  const copy = names.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomBelow(index + 1);
    const current = copy[index] ?? '';
    copy[index] = copy[swapIndex] ?? '';
    copy[swapIndex] = current;
  }
  return copy;
}

function playerOrBye(seed: number, names: readonly string[]): Slot {
  if (seed < 1 || seed > names.length) return { kind: 'bye' };
  return { kind: 'player', name: names[seed - 1] ?? '', seed };
}

function samePlayer(slot: Slot | null | undefined): Slot {
  if (slot?.kind === 'player') return slot;
  if (slot?.kind === 'bye') return { kind: 'bye' };
  return { kind: 'tbd' };
}

export function projectBracket(names: readonly string[], winners: Readonly<Record<string, 0 | 1>>): {
  size: number;
  roundCount: number;
  rounds: MatchView[][];
  champion: Extract<Slot, { kind: 'player' }> | null;
} {
  const count = names.length;
  const size = nextPowerOfTwo(Math.max(count, 2));
  const order = seedOrder(size);
  const roundCount = Math.round(Math.log2(size));
  const rounds: MatchView[][] = [];
  let previous: MatchView[] = [];

  for (let round = 0; round < roundCount; round += 1) {
    const matchCount = size / 2 ** (round + 1);
    const matches: MatchView[] = [];
    for (let index = 0; index < matchCount; index += 1) {
      const feederA = round === 0 ? playerOrBye(order[index * 2] ?? 0, names) : samePlayer(previous[index * 2]?.advanced);
      const feederB = round === 0 ? playerOrBye(order[index * 2 + 1] ?? 0, names) : samePlayer(previous[index * 2 + 1]?.advanced);
      const key = `${round}-${index}`;
      const pick = winners[key];
      let winner: 0 | 1 | null = null;
      let automatic = false;
      if (feederA.kind === 'player' && feederB.kind === 'bye') {
        winner = 0;
        automatic = true;
      } else if (feederB.kind === 'player' && feederA.kind === 'bye') {
        winner = 1;
        automatic = true;
      } else if (feederA.kind === 'player' && feederB.kind === 'player' && (pick === 0 || pick === 1)) {
        winner = pick;
      }
      const advanced = winner === 0 ? feederA : winner === 1 ? feederB : null;
      matches.push({ key, round, index, a: feederA, b: feederB, winner, automatic, advanced });
    }
    rounds.push(matches);
    previous = matches;
  }

  const finalist = previous[0]?.advanced;
  return {
    size,
    roundCount,
    rounds,
    champion: finalist?.kind === 'player' ? finalist : null,
  };
}

export function normalizeWinners(names: readonly string[], winners: Readonly<Record<string, 0 | 1>>): Record<string, 0 | 1> {
  if (names.length < MIN_ENTRANTS) return {};
  const kept: Record<string, 0 | 1> = {};
  let pending: Record<string, 0 | 1> = {};
  for (const [key, value] of Object.entries(winners)) {
    if ((value === 0 || value === 1) && /^\d{1,2}-\d{1,2}$/.test(key)) pending[key] = value;
  }
  const roundCount = Math.round(Math.log2(nextPowerOfTwo(names.length)));
  for (let round = 0; round < roundCount; round += 1) {
    const projected = projectBracket(names, pending);
    for (const match of projected.rounds[round] ?? []) {
      const pick = pending[match.key];
      if (match.a.kind === 'player' && match.b.kind === 'player' && (pick === 0 || pick === 1)) {
        kept[match.key] = pick;
      }
    }
    const nextPending: Record<string, 0 | 1> = {};
    for (const [key, value] of Object.entries(kept)) nextPending[key] = value;
    for (const [key, value] of Object.entries(pending)) {
      const keyRound = Number(key.split('-')[0]);
      if (keyRound > round) nextPending[key] = value;
    }
    pending = nextPending;
  }
  return kept;
}

/** Set or clear a match winner and drop every result that depended on the old one. */
export function applyWinner(
  names: readonly string[],
  winners: Readonly<Record<string, 0 | 1>>,
  key: string,
  side: 0 | 1 | null,
): Record<string, 0 | 1> {
  const next: Record<string, 0 | 1> = {};
  for (const [existing, value] of Object.entries(winners)) {
    if (value === 0 || value === 1) next[existing] = value;
  }
  if (side === null) delete next[key];
  else next[key] = side;

  const [roundText, indexText] = key.split('-');
  const round = Number(roundText);
  const index = Number(indexText);
  if (Number.isInteger(round) && Number.isInteger(index)) {
    let indexes = [index];
    for (let current = round; current < 12; current += 1) {
      indexes = [...new Set(indexes.map((item) => Math.floor(item / 2)))];
      for (const parent of indexes) delete next[`${current + 1}-${parent}`];
    }
  }
  return normalizeWinners(names, next);
}

export function bracketSize(count: number): { size: number; byes: number; rounds: number } {
  const size = nextPowerOfTwo(count);
  return { size, byes: size - count, rounds: Math.round(Math.log2(size)) };
}

export function defaultState(): BracketState {
  return { v: 1, title: '', source: '', shuffled: false, names: [], winners: {} };
}

export function parseState(value: unknown): BracketState | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.v !== 1) return null;
  if (typeof record.title !== 'string' || typeof record.source !== 'string') return null;
  if (typeof record.shuffled !== 'boolean') return null;
  if (!Array.isArray(record.names)) return null;
  if (!record.winners || typeof record.winners !== 'object' || Array.isArray(record.winners)) return null;

  const names = record.names
    .filter((name): name is string => typeof name === 'string')
    .map((name) => name.trim().slice(0, NAME_LIMIT))
    .filter(Boolean)
    .slice(0, MAX_ENTRANTS);
  if (names.length < MIN_ENTRANTS) return null;

  const rawWinners = record.winners as Record<string, unknown>;
  const winners: Record<string, 0 | 1> = {};
  for (const [key, pick] of Object.entries(rawWinners)) {
    if ((pick === 0 || pick === 1) && /^\d{1,2}-\d{1,2}$/.test(key)) winners[key] = pick;
  }

  return {
    v: 1,
    title: record.title.slice(0, TITLE_LIMIT),
    source: record.source.slice(0, SOURCE_LIMIT),
    shuffled: record.shuffled,
    names,
    winners: normalizeWinners(names, winners),
  };
}

export function statesEqual(a: BracketState, b: BracketState): boolean {
  return JSON.stringify(parseState(a)) === JSON.stringify(parseState(b));
}

export function encodeHashPayload(state: BracketState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let binary = '';
  const chunk = 0x2000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeHashPayload(payload: string): BracketState | null {
  if (!payload || !/^[A-Za-z0-9_-]+$/.test(payload)) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return parseState(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export function stateFromHash(hash: string): BracketState | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith('b=')) return null;
  return decodeHashPayload(raw.slice(2));
}

export function matchPosition(round: number, index: number): { left: number; top: number; width: number; height: number } {
  const slot = (BRACKET_LAYOUT.matchHeight + BRACKET_LAYOUT.slotGap) * 2 ** round;
  return {
    left: BRACKET_LAYOUT.padX + round * (BRACKET_LAYOUT.matchWidth + BRACKET_LAYOUT.columnGap),
    top: BRACKET_LAYOUT.padY + BRACKET_LAYOUT.headerHeight + index * slot + (slot - BRACKET_LAYOUT.matchHeight) / 2,
    width: BRACKET_LAYOUT.matchWidth,
    height: BRACKET_LAYOUT.matchHeight,
  };
}

export function boardSize(roundCount: number, firstRoundMatches: number): { width: number; height: number } {
  const slot = BRACKET_LAYOUT.matchHeight + BRACKET_LAYOUT.slotGap;
  return {
    width:
      BRACKET_LAYOUT.padX * 2 +
      roundCount * BRACKET_LAYOUT.matchWidth +
      Math.max(0, roundCount - 1) * BRACKET_LAYOUT.columnGap,
    height: BRACKET_LAYOUT.padY + BRACKET_LAYOUT.headerHeight + firstRoundMatches * slot - BRACKET_LAYOUT.slotGap,
  };
}
