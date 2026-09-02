import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { formatDatePtBr } from './dateUtils';
import { AppState, Profile, WEEKDAY_LABELS, Weekday, WeeklyPlan } from './types';

function planRows(plan: WeeklyPlan | undefined) {
  if (!plan) return [];
  const rows: Record<string, string | number>[] = [];
  (Object.keys(plan) as unknown as Weekday[]).forEach((weekdayKey) => {
    const weekday = Number(weekdayKey) as Weekday;
    const slots = [...plan[weekday]].sort((a, b) => a.order - b.order);
    slots.forEach((slot) => {
      rows.push({
        'Dia da semana': WEEKDAY_LABELS[weekday],
        Refeição: slot.label,
        Horário: slot.timeHint ?? '',
        Orientação: slot.orientation,
      });
    });
  });
  return rows;
}

function mealLogRows(state: AppState, profileId: string, plan: WeeklyPlan | undefined) {
  return state.mealLogs
    .filter((log) => log.profileId === profileId)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((log) => {
      const slot = plan?.[log.weekday]?.find((s) => s.id === log.mealSlotId);
      return {
        Data: formatDatePtBr(log.date),
        'Dia da semana': WEEKDAY_LABELS[log.weekday],
        Refeição: slot?.label ?? '(removida)',
        Realizada: log.completed ? 'Sim' : 'Não',
        'Escore (0-5)': log.score,
        Observações: log.notes ?? '',
      };
    });
}

function dayLogRows(state: AppState, profileId: string) {
  return state.dayLogs
    .filter((log) => log.profileId === profileId)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((log) => ({
      Data: formatDatePtBr(log.date),
      'Escore do dia (0-5)': log.score,
      Observações: log.notes ?? '',
    }));
}

function healthRecordRows(state: AppState, profileId: string) {
  return state.healthRecords
    .filter((r) => r.profileId === profileId)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((r) => ({
      Data: formatDatePtBr(r.date),
      'Altura (cm)': r.heightCm ?? '',
      'Peso (kg)': r.weightKg ?? '',
      'Idade (anos)': r.age ?? '',
      'FC repouso (bpm)': r.restingHeartRate ?? '',
      'Gordura corporal (%)': r.bioimpedance?.bodyFatPct ?? '',
      'Massa muscular (kg)': r.bioimpedance?.muscleMassKg ?? '',
      'Água corporal (%)': r.bioimpedance?.bodyWaterPct ?? '',
      'Gordura visceral': r.bioimpedance?.visceralFat ?? '',
      'Massa óssea (kg)': r.bioimpedance?.boneMassKg ?? '',
      'TMB (kcal)': r.bioimpedance?.bmr ?? '',
      Observações: r.notes ?? '',
    }));
}

export async function exportProfileToXlsx(state: AppState, profile: Profile): Promise<void> {
  const plan = state.weeklyPlans[profile.id];
  const workbook = XLSX.utils.book_new();

  const profileSheet = XLSX.utils.json_to_sheet([
    {
      Nome: profile.name,
      'Data de nascimento': profile.birthDate ?? '',
      Sexo: profile.sex ?? '',
      'Exportado em': formatDatePtBr(new Date().toISOString().slice(0, 10)),
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, profileSheet, 'Perfil');

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(planRows(plan)),
    'Plano Alimentar'
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(mealLogRows(state, profile.id, plan)),
    'Registro de Refeições'
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(dayLogRows(state, profile.id)),
    'Registro Diário'
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(healthRecordRows(state, profile.id)),
    'Ficha de Saúde'
  );

  const fileName = `nutritri_${profile.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.xlsx`;

  if (Platform.OS === 'web') {
    // In the browser, SheetJS triggers a normal file download on its own —
    // there is no app cache directory or native share sheet to go through.
    XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
    return;
  }

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Compartilhar dados com a nutricionista',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
  });
}
