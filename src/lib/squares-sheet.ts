/**
 * Pure state for the squares sheet.
 * The page stores this in local storage and in the URL hash. Nothing here talks to a server.
 */

export interface SquaresSheet {
  v: 1;
  colTeam: string;
  rowTeam: string;
  cols: number[];
  rows: number[];
  names: string[];
  price: string;
  splits: string[];
}

export const QUARTER_LABELS = ['Q1', 'Half', 'Q3', 'Final'] as const;

const NAME_LIMIT = 80;
const TEAM_LIMIT = 40;
const PRICE_LIMIT = 16;
const SPLIT_LIMIT = 8;

export function defaultSheet(): SquaresSheet {
  return {
    v: 1,
    colTeam: 'AFC',
    rowTeam: 'NFC',
    cols: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    rows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    names: Array.from({ length: 100 }, () => ''),
    price: '',
    splits: ['25', '25', '25', '25'],
  };
}

function isPermutation(value: unknown): value is number[] {
  if (!Array.isArray(value) || value.length !== 10) return false;
  const seen = new Set<number>();
  for (const digit of value) {
    if (!Number.isInteger(digit) || digit < 0 || digit > 9 || seen.has(digit)) return false;
    seen.add(digit);
  }
  return true;
}

export function parseSheet(value: unknown): SquaresSheet | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.v !== 1) return null;
  if (typeof record.colTeam !== 'string' || typeof record.rowTeam !== 'string') return null;
  if (!isPermutation(record.cols) || !isPermutation(record.rows)) return null;
  if (!Array.isArray(record.names) || !Array.isArray(record.splits)) return null;
  if (typeof record.price !== 'string') return null;
  const nameInput = record.names;
  const splitInput = record.splits;

  const names = nameInput.slice(0, 100).map((name) => (typeof name === 'string' ? name.slice(0, NAME_LIMIT) : ''));
  while (names.length < 100) names.push('');

  const splits = [0, 1, 2, 3].map((index) => {
    const item = splitInput[index];
    return typeof item === 'string' ? item.slice(0, SPLIT_LIMIT) : '25';
  });

  return {
    v: 1,
    colTeam: record.colTeam.slice(0, TEAM_LIMIT),
    rowTeam: record.rowTeam.slice(0, TEAM_LIMIT),
    cols: record.cols.slice(),
    rows: record.rows.slice(),
    names,
    price: record.price.slice(0, PRICE_LIMIT),
    splits,
  };
}

export function sheetsEqual(a: SquaresSheet, b: SquaresSheet): boolean {
  return JSON.stringify(parseSheet(a)) === JSON.stringify(parseSheet(b));
}

export function encodeHashPayload(sheet: SquaresSheet): string {
  const bytes = new TextEncoder().encode(JSON.stringify(sheet));
  let binary = '';
  const chunk = 0x2000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeHashPayload(payload: string): SquaresSheet | null {
  if (!payload || !/^[A-Za-z0-9_-]+$/.test(payload)) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return parseSheet(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export function sheetFromHash(hash: string): SquaresSheet | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith('s=')) return null;
  return decodeHashPayload(raw.slice(2));
}

export function shuffle<T>(items: readonly T[], randomBelow: (limit: number) => number): T[] {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomBelow(index + 1);
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }
  return copy;
}

export function randomDigits(randomBelow: (limit: number) => number): number[] {
  return shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], randomBelow);
}

export function pasteNames(value: string): string[] {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const source = lines.length === 1 && lines[0].includes(',') ? lines[0].split(',') : lines;
  return source
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(0, NAME_LIMIT));
}

export function emptyNameIndexes(names: readonly string[]): number[] {
  const indexes: number[] = [];
  names.forEach((name, index) => {
    if (name.trim() === '') indexes.push(index);
  });
  return indexes;
}

export function assignNames(
  names: readonly string[],
  incoming: readonly string[],
  indexes: readonly number[],
): { names: string[]; placed: number; leftover: number } {
  const next = names.slice();
  const placed = Math.min(incoming.length, indexes.length);
  for (let index = 0; index < placed; index += 1) {
    const square = indexes[index];
    if (square >= 0 && square < next.length) next[square] = incoming[index];
  }
  return {
    names: next,
    placed,
    leftover: Math.max(0, incoming.length - placed),
  };
}

export function namedSquareCount(names: readonly string[]): number {
  return names.reduce((count, name) => count + (name.trim() ? 1 : 0), 0);
}

/** Empty input is "no price". A bad string is invalid. Zero is a real price. */
export function parsePrice(raw: string): number | null | 'invalid' {
  const cleaned = raw.trim().replace(/[$,]/g, '');
  if (!cleaned) return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return 'invalid';
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value > 1_000_000_000) return 'invalid';
  return value;
}

/** Empty input counts as zero. A bad string is invalid. */
export function parsePercent(raw: string): number | null {
  const cleaned = raw.trim().replace(/%/g, '');
  if (!cleaned) return 0;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > 1000) return null;
  return value;
}

export interface QuarterShare {
  label: string;
  percent: number | null;
  amount: number | null;
}

export interface PotSummary {
  named: number;
  price: number | null;
  priceInvalid: boolean;
  currentPot: number | null;
  fullPot: number | null;
  shares: QuarterShare[];
  percentTotal: number | null;
  percentInvalid: boolean;
  balanced: boolean;
}

export function summarizePot(sheet: SquaresSheet): PotSummary {
  const named = namedSquareCount(sheet.names);
  const price = parsePrice(sheet.price);
  const priceInvalid = price === 'invalid';
  const priceValue = typeof price === 'number' ? price : null;
  const shares = QUARTER_LABELS.map((label, index) => {
    const percent = parsePercent(sheet.splits[index] ?? '');
    const amount =
      priceValue !== null && percent !== null ? (priceValue * 100 * percent) / 100 : null;
    return { label, percent, amount };
  });
  const percentInvalid = shares.some((share) => share.percent === null);
  const percentTotal = percentInvalid
    ? null
    : shares.reduce((total, share) => total + (share.percent ?? 0), 0);

  return {
    named,
    price: priceValue,
    priceInvalid,
    currentPot: priceValue === null ? null : priceValue * named,
    fullPot: priceValue === null ? null : priceValue * 100,
    shares,
    percentTotal,
    percentInvalid,
    balanced: percentTotal !== null && Math.abs(percentTotal - 100) < 0.001,
  };
}
