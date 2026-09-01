import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './id';
import { AppState, DEFAULT_MEAL_LABELS, MealSlot, Weekday, WeeklyPlan } from './types';

const STORAGE_KEY = 'nutritri:v1:state';

export const EMPTY_STATE: AppState = {
  profiles: [],
  activeProfileId: null,
  weeklyPlans: {},
  healthRecords: [],
  mealLogs: [],
  dayLogs: [],
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...EMPTY_STATE,
      ...parsed,
    };
  } catch (error) {
    console.warn('Falha ao carregar dados locais, iniciando vazio.', error);
    return { ...EMPTY_STATE };
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createDefaultWeeklyPlan(): WeeklyPlan {
  const weekdays: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
  const plan = {} as WeeklyPlan;
  for (const weekday of weekdays) {
    plan[weekday] = DEFAULT_MEAL_LABELS.map(
      (label, index): MealSlot => ({
        id: generateId(),
        label,
        order: index,
        orientation: '',
      })
    );
  }
  return plan;
}
