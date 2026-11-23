/**
 * Funnel numbers from a CSV or from typed stages.
 * Every stage value is a sum or a count of the rows named in that stage.
 */

import { cleanCell, formatNumber, formatPercent, parseCsv, parseNumber, toCsv } from './csv';

export const FUNNEL_LIMITS = {
  rows: 5_000,
  chars: 1_500_000,
  fileBytes: 1_500_000,
  equation: 12,
  listedRows: 100,
} as const;

export const SAMPLE_FUNNEL = `Stage,Amount
Visit,30
Visit,20
Signup,25
Signup,15
Purchase,10`;

export interface FunnelStage {
  label: string;
  value: number;
  computation: string;
  equation: string | null;
  rows: string[][];
}

export interface FunnelModel {
  stages: FunnelStage[];
  headers: string[];
  reconcile: string[];
}

export interface FunnelColumn {
  index: number;
  label: string;
}

export type FunnelBuild =
  | { ok: true; model: FunnelModel }
  | { ok: false; error: string };

function quote(value: string): string {
  return `“${value}”`;
}

export function funnelColumns(text: string, firstRowHeader: boolean): { columns: FunnelColumn[]; error: string | null } {
  if (text.length > FUNNEL_LIMITS.chars) {
    return { columns: [], error: 'The CSV is too long to read here. Shorten it and try again.' };
  }
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''));
  if (rows.length === 0) return { columns: [], error: null };
  const header = firstRowHeader ? (rows[0] ?? []) : [];
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const columns: FunnelColumn[] = [];
  for (let index = 0; index < width; index += 1) {
    const label = firstRowHeader ? cleanCell(header[index] ?? '') : '';
    columns.push({ index, label: label || `Column ${index + 1}` });
  }
  return { columns, error: null };
}

function equationFor(values: number[], total: number): string | null {
  if (values.length < 2 || values.length > FUNNEL_LIMITS.equation) return null;
  return `${values.map((value) => formatNumber(value)).join(' + ')} = ${formatNumber(total)}`;
}

function repeatedNotes(counts: Map<string, number>, verb: string, unit: 'rows' | 'lines'): string[] {
  const notes: string[] = [];
  for (const [label, count] of counts) {
    if (count > 1) notes.push(`${label} appears on ${count} ${unit} and is ${verb}`);
  }
  return notes;
}

export function funnelHeaderLikely(text: string): boolean {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''));
  const first = rows[0];
  if (!first || rows.length < 2) return false;
  return first.every((cell) => cell.trim() !== '' && parseNumber(cell) === null);
}

export function buildFunnel(options: {
  text: string;
  mode: 'sum' | 'count' | 'manual';
  firstRowHeader: boolean;
  stageColumn: number;
  valueColumn: number;
}): FunnelBuild {
  if (options.text.length > FUNNEL_LIMITS.chars) {
    return { ok: false, error: 'The text is too long to read here. Shorten it and try again.' };
  }

  if (options.mode === 'manual') return buildManual(options.text);

  const table = parseCsv(options.text).filter((row) => row.some((cell) => cell.trim() !== ''));
  if (table.length === 0) return { ok: false, error: 'Paste a CSV or choose a file first.' };
  const headerRow = options.firstRowHeader ? (table[0] ?? []) : [];
  const data = options.firstRowHeader ? table.slice(1) : table;
  if (data.length === 0) return { ok: false, error: 'The header is there, but there are no data rows under it.' };
  if (data.length > FUNNEL_LIMITS.rows) {
    return { ok: false, error: `This page charts up to ${FUNNEL_LIMITS.rows.toLocaleString('en-US')} data rows. Shorten the file and try again.` };
  }

  const width = table.reduce((max, row) => Math.max(max, row.length), 0);
  if (options.stageColumn < 0 || options.stageColumn >= width) {
    return { ok: false, error: 'Choose a stage column.' };
  }
  if (options.mode === 'sum' && (options.valueColumn < 0 || options.valueColumn >= width)) {
    return { ok: false, error: 'Choose a value column.' };
  }
  if (options.mode === 'sum' && options.valueColumn === options.stageColumn) {
    return { ok: false, error: 'Choose a value column that is not the stage column.' };
  }

  const headers = Array.from({ length: width }, (_, index) => {
    const label = options.firstRowHeader ? cleanCell(headerRow[index] ?? '') : '';
    return label || `Column ${index + 1}`;
  });
  const stageHeader = headers[options.stageColumn] ?? `Column ${options.stageColumn + 1}`;
  const valueHeader = headers[options.valueColumn] ?? `Column ${options.valueColumn + 1}`;

  const order: string[] = [];
  const grouped = new Map<string, { rows: string[][]; values: number[] }>();
  let blankStage = 0;
  let nonNumeric = 0;
  let numericSum = 0;
  let blankStageNumeric = 0;
  const rowKeys = new Map<string, number>();
  let exactDuplicates = 0;

  for (const row of data) {
    const padded = Array.from({ length: width }, (_, index) => row[index] ?? '');
    const key = padded.join('\u0000');
    const seen = rowKeys.get(key) ?? 0;
    if (seen > 0) exactDuplicates += 1;
    rowKeys.set(key, seen + 1);

    const label = cleanCell(padded[options.stageColumn] ?? '');
    const rawValue = padded[options.valueColumn] ?? '';
    const numeric = options.mode === 'sum' ? parseNumber(rawValue) : null;
    if (options.mode === 'sum' && numeric !== null) numericSum += numeric;
    if (!label) {
      blankStage += 1;
      if (numeric !== null) blankStageNumeric += numeric;
      continue;
    }
    if (options.mode === 'sum' && numeric === null) {
      nonNumeric += 1;
      continue;
    }
    let bucket = grouped.get(label);
    if (!bucket) {
      bucket = { rows: [], values: [] };
      grouped.set(label, bucket);
      order.push(label);
    }
    bucket.rows.push(padded);
    if (numeric !== null) bucket.values.push(numeric);
  }

  if (order.length === 0) {
    return { ok: false, error: 'No stage names were found in that column. Blank stages are left out.' };
  }

  const stages: FunnelStage[] = order.map((label) => {
    const bucket = grouped.get(label) ?? { rows: [], values: [] };
    const value = options.mode === 'sum' ? bucket.values.reduce((sum, item) => sum + item, 0) : bucket.rows.length;
    const rowsWord = bucket.rows.length === 1 ? '1 row' : `${bucket.rows.length} rows`;
    const computation = options.mode === 'sum'
      ? `SUM of column ${quote(valueHeader)} where ${quote(stageHeader)} = ${quote(label)} (${rowsWord})`
      : `COUNT of rows where ${quote(stageHeader)} = ${quote(label)} (${rowsWord})`;
    return {
      label,
      value,
      computation,
      equation: options.mode === 'sum' ? equationFor(bucket.values, value) : null,
      rows: bucket.rows,
    };
  });

  const stageSum = stages.reduce((sum, stage) => sum + stage.value, 0);
  const counts = new Map(stages.map((stage) => [stage.label, stage.rows.length]));
  const repeats = repeatedNotes(counts, options.mode === 'sum' ? 'summed' : 'counted', 'rows');
  const reconcile = [
    `Data rows: ${data.length.toLocaleString('en-US')}.`,
    `Blank stage: ${blankStage.toLocaleString('en-US')} ${blankStage === 1 ? 'row' : 'rows'} excluded.`,
  ];
  if (options.mode === 'sum') {
    reconcile.push(
      `Non-numeric ${valueHeader} values: ${nonNumeric.toLocaleString('en-US')} ${nonNumeric === 1 ? 'row' : 'rows'} excluded.`,
    );
  }
  reconcile.push(repeats.length === 0 ? 'No stage label is repeated.' : `${repeats.join('. ')}.`);
  reconcile.push(
    `Exact duplicate rows: ${exactDuplicates.toLocaleString('en-US')}. A repeated row is still included.`,
  );
  if (options.mode === 'sum') {
    const gap = Math.round((numericSum - stageSum) * 1000) / 1000;
    const sameGap = Math.abs(gap - blankStageNumeric) < 0.0005;
    const gapText = gap === 0
      ? `Sum of stages: ${formatNumber(stageSum)}. Sum of numeric values in ${valueHeader}: ${formatNumber(numericSum)}.`
      : `Sum of stages: ${formatNumber(stageSum)}. Sum of numeric values in ${valueHeader}: ${formatNumber(numericSum)}. The difference is ${formatNumber(gap)}${sameGap ? ', from numeric values on rows with a blank stage' : ''}.`;
    reconcile.push(gapText);
  } else {
    reconcile.push(`Rows in the chart: ${formatNumber(stageSum)}. The stage counts add up to ${formatNumber(stageSum)}.`);
  }

  return { ok: true, model: { stages, headers, reconcile } };
}

function buildManual(text: string): FunnelBuild {
  const rows = parseCsv(text);
  const order: string[] = [];
  const grouped = new Map<string, { rows: string[][]; values: number[] }>();
  let skipped = 0;
  let lines = 0;

  for (const row of rows) {
    if (row.every((cell) => cell.trim() === '')) continue;
    lines += 1;
    const label = cleanCell(row[0] ?? '');
    const numeric = parseNumber(row[1] ?? '');
    if (!label || numeric === null) {
      skipped += 1;
      continue;
    }
    let bucket = grouped.get(label);
    if (!bucket) {
      bucket = { rows: [], values: [] };
      grouped.set(label, bucket);
      order.push(label);
    }
    bucket.rows.push([label, formatNumber(numeric)]);
    bucket.values.push(numeric);
  }

  if (lines > FUNNEL_LIMITS.rows) {
    return { ok: false, error: `This page charts up to ${FUNNEL_LIMITS.rows.toLocaleString('en-US')} lines. Shorten the list and try again.` };
  }
  if (order.length === 0) {
    return { ok: false, error: 'Type one stage per line, then a comma and a number. For example: Visit, 50' };
  }

  const stages: FunnelStage[] = order.map((label) => {
    const bucket = grouped.get(label) ?? { rows: [], values: [] };
    const value = bucket.values.reduce((sum, item) => sum + item, 0);
    const lineWord = bucket.rows.length === 1 ? '1 line' : `${bucket.rows.length} lines`;
    return {
      label,
      value,
      computation: `Typed value for ${quote(label)} (${lineWord})`,
      equation: equationFor(bucket.values, value),
      rows: bucket.rows,
    };
  });

  const counts = new Map(stages.map((stage) => [stage.label, stage.rows.length]));
  const repeats = repeatedNotes(counts, 'added', 'lines');
  const reconcile = [
    `Lines read: ${lines.toLocaleString('en-US')}.`,
    `Lines skipped because the stage or the value was missing or not a number: ${skipped.toLocaleString('en-US')}.`,
    repeats.length === 0 ? 'No stage was typed twice.' : `${repeats.join('. ')}.`,
    'The chart uses the typed values. There is no source file.',
  ];

  return {
    ok: true,
    model: {
      stages,
      headers: ['Stage', 'Value'],
      reconcile,
    },
  };
}

export function funnelCsv(stages: FunnelStage[]): string {
  const top = stages[0]?.value ?? 0;
  const rows: string[][] = [['Stage', 'Value', 'Rows', 'Percent of previous', 'Percent of top', 'Computation']];
  stages.forEach((stage, index) => {
    const previous = index === 0 ? 0 : (stages[index - 1]?.value ?? 0);
    rows.push([
      stage.label,
      formatNumber(stage.value),
      String(stage.rows.length),
      index === 0 || previous === 0 ? '' : formatPercent(stage.value, previous),
      top === 0 ? '' : formatPercent(stage.value, top),
      stage.computation,
    ]);
  });
  return toCsv(rows);
}

export function stagePercents(stages: FunnelStage[], index: number): { previous: string; top: string } {
  const stage = stages[index];
  const top = stages[0]?.value ?? 0;
  if (!stage) return { previous: '—', top: '—' };
  const previousValue = index === 0 ? null : (stages[index - 1]?.value ?? 0);
  return {
    previous: previousValue === null || previousValue === 0 ? '—' : formatPercent(stage.value, previousValue),
    top: top === 0 ? '—' : formatPercent(stage.value, top),
  };
}
