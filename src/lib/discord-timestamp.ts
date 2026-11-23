/**
 * Discord chat timestamp codes. Formatting uses Intl on the device.
 * Nothing in this file talks to Discord or to a server.
 */

export const DISCORD_STYLES = [
  { id: 't', name: 'Short time', detail: 'Hours and minutes.' },
  { id: 'T', name: 'Long time', detail: 'Hours, minutes, and seconds.' },
  { id: 'd', name: 'Short date', detail: 'A numeric date.' },
  { id: 'D', name: 'Long date', detail: 'Month name, day, and year.' },
  { id: 'f', name: 'Short date/time', detail: 'Default style. Date and time without the weekday.' },
  { id: 'F', name: 'Long date/time', detail: 'Weekday, date, and time.' },
  { id: 'R', name: 'Relative', detail: 'A relative phrase. It updates as time passes.' },
] as const;

export type DiscordStyleId = (typeof DISCORD_STYLES)[number]['id'];

const STYLE_FORMAT: Record<Exclude<DiscordStyleId, 'R'>, Intl.DateTimeFormatOptions> = {
  t: { hour: 'numeric', minute: '2-digit' },
  T: { hour: 'numeric', minute: '2-digit', second: '2-digit' },
  d: { year: 'numeric', month: '2-digit', day: '2-digit' },
  D: { year: 'numeric', month: 'long', day: 'numeric' },
  f: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  F: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' },
};

const FALLBACK_ZONES = [
  'UTC',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function isDiscordStyle(value: string): value is DiscordStyleId {
  return DISCORD_STYLES.some((style) => style.id === value);
}

export function timestampCode(unix: number, style: DiscordStyleId): string {
  return `<t:${unix}:${style}>`;
}

export function deviceTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function timeZoneNames(): string[] {
  let zones: string[] = [];
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      zones = Intl.supportedValuesOf('timeZone');
    }
  } catch {
    zones = [];
  }
  if (zones.length === 0) zones = FALLBACK_ZONES.slice();
  if (!zones.includes('UTC')) zones = ['UTC', ...zones];
  return zones;
}

export function isFormattableUnix(unix: number): boolean {
  if (!Number.isSafeInteger(unix)) return false;
  const date = new Date(unix * 1000);
  if (Number.isNaN(date.getTime())) return false;
  const year = date.getUTCFullYear();
  return year >= 1 && year <= 9999;
}

export function offsetLabel(unix: number, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
      hour: 'numeric',
    }).formatToParts(new Date(unix * 1000));
    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function readZonedParts(utcMs: number, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(new Date(utcMs))) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  let year = Number(map.year);
  let month = Number(map.month);
  let day = Number(map.day);
  let hour = Number(map.hour);
  if (hour === 24) {
    hour = 0;
    const next = new Date(Date.UTC(year, month - 1, day) + 86_400_000);
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  }
  return {
    year,
    month,
    day,
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/** Milliseconds to add to UTC to get the wall clock in `timeZone`. */
export function timeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = readZonedParts(utcMs, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - utcMs;
}

export function toDateTimeLocalValue(unix: number, timeZone: string): string {
  const parts = readZonedParts(unix * 1000, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

/**
 * Read a `datetime-local` value as a wall clock in `timeZone`.
 * Returns Unix seconds, or null when the value or zone is unusable.
 * A spring-forward gap lands on the next valid instant. A fall-back hour uses the first pass.
 */
export function unixFromDateTimeLocal(value: string, timeZone: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match || !isValidTimeZone(timeZone)) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? '0');
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;

  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let utc = wallAsUtc;
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      utc = wallAsUtc - timeZoneOffsetMs(utc, timeZone);
    }
  } catch {
    return null;
  }
  const unix = Math.trunc(utc / 1000);
  return isFormattableUnix(unix) ? unix : null;
}

export function parseTimestampInput(raw: string): { unix: number; style: DiscordStyleId | null } | null {
  const text = raw.trim();
  if (!text) return null;
  const coded = /^<?[tT]:(-?\d{1,16})(?::([tTdDfFRr]))?>?$/.exec(text);
  if (coded) {
    const styleToken = coded[2] === 'r' ? 'R' : (coded[2] ?? '');
    const style = isDiscordStyle(styleToken) ? styleToken : null;
    return normalizeUnix(Number(coded[1]), style);
  }
  if (/^-?\d{1,16}$/.test(text)) return normalizeUnix(Number(text), null);
  return null;
}

function normalizeUnix(value: number, style: DiscordStyleId | null): { unix: number; style: DiscordStyleId | null } | null {
  if (!Number.isSafeInteger(value)) return null;
  let unix = value;
  const magnitude = Math.abs(value);
  if (magnitude >= 1_000_000_000_000 && magnitude < 100_000_000_000_000) unix = Math.trunc(value / 1000);
  if (!isFormattableUnix(unix)) return null;
  return { unix, style };
}

export function formatPreview(
  unix: number,
  style: DiscordStyleId,
  timeZone: string,
  nowUnix: number,
  locale?: string,
): string {
  if (!isFormattableUnix(unix) || !isValidTimeZone(timeZone)) return 'This time cannot be formatted.';
  try {
    if (style === 'R') return formatRelative(unix, nowUnix, locale);
    return new Intl.DateTimeFormat(locale, { ...STYLE_FORMAT[style], timeZone }).format(new Date(unix * 1000));
  } catch {
    return 'This time cannot be formatted.';
  }
}

/**
 * Relative phrase for the :R style.
 * The unit steps follow the usual chat ranges. The words come from Intl, so they follow this device’s language
 * and can differ slightly from a Discord client.
 */
export function formatRelative(unix: number, nowUnix: number, locale?: string): string {
  const delta = unix - nowUnix;
  const abs = Math.abs(delta);
  if (abs < 5) return 'now';
  const steps: { unit: Intl.RelativeTimeFormatUnit; size: number }[] = [
    { unit: 'year', size: 365 * 24 * 3600 },
    { unit: 'month', size: 30 * 24 * 3600 },
    { unit: 'day', size: 24 * 3600 },
    { unit: 'hour', size: 3600 },
    { unit: 'minute', size: 60 },
    { unit: 'second', size: 1 },
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  for (const step of steps) {
    if (abs >= step.size || step.unit === 'second') {
      const value = Math.round(delta / step.size);
      if (value === 0) return 'now';
      return formatter.format(value, step.unit);
    }
  }
  return 'now';
}
