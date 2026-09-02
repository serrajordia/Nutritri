import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { WEEKDAY_LABELS, Weekday } from './types';

export interface ImportedPlanRow {
  weekday: Weekday;
  label: string;
  timeHint?: string;
  orientation: string;
}

export interface ParsedImportResult {
  rows: ImportedPlanRow[];
  warnings: string[];
}

const PLAN_SHEET_NAME = 'Plano Alimentar';

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(COMBINING_DIACRITICS, '');
}

function normalizeForCompare(value: string): string {
  return stripAccents(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+feira$/, '') // "segunda-feira" / "segunda feira" -> "segunda"
    .trim();
}

const WEEKDAY_BY_NORMALIZED_LABEL = new Map<string, Weekday>(
  (Object.entries(WEEKDAY_LABELS) as [string, string][]).map(([weekday, label]) => [
    normalizeForCompare(label),
    Number(weekday) as Weekday,
  ])
);

function resolveWeekday(rawValue: unknown): Weekday | undefined {
  if (typeof rawValue !== 'string') return undefined;
  return WEEKDAY_BY_NORMALIZED_LABEL.get(normalizeForCompare(rawValue));
}

function cellToString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

/**
 * Pure parsing/validation, kept separate from file I/O so it can be exercised
 * with plain objects (e.g. from XLSX.utils.sheet_to_json) without touching
 * DocumentPicker/FileSystem.
 */
export function parseImportRows(rawRows: Record<string, unknown>[]): ParsedImportResult {
  const rows: ImportedPlanRow[] = [];
  const warnings: string[] = [];

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for the header row
    const weekday = resolveWeekday(raw['Dia da semana']);
    const label = cellToString(raw['Refeição']);
    const timeHint = cellToString(raw['Horário']);
    const orientation = cellToString(raw['Orientação']);

    if (weekday === undefined) {
      warnings.push(`Linha ${rowNumber}: dia da semana "${raw['Dia da semana'] ?? ''}" não reconhecido — ignorada.`);
      return;
    }
    if (!label) {
      warnings.push(`Linha ${rowNumber}: sem nome de refeição — ignorada.`);
      return;
    }

    rows.push({
      weekday,
      label,
      timeHint: timeHint || undefined,
      orientation,
    });
  });

  return { rows, warnings };
}

export async function pickAndParsePlanFile(): Promise<ParsedImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.[0]) {
    return null;
  }

  const uri = picked.assets[0].uri;
  const workbook =
    Platform.OS === 'web'
      ? XLSX.read(await (await fetch(uri)).arrayBuffer(), { type: 'array' })
      : XLSX.read(
          await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }),
          { type: 'base64' }
        );
  const sheetName = workbook.SheetNames.includes(PLAN_SHEET_NAME)
    ? PLAN_SHEET_NAME
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { rows: [], warnings: ['A planilha não tem nenhuma aba com dados.'] };
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return parseImportRows(rawRows);
}
