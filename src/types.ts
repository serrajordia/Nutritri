// Weekday index matches JS Date#getDay(): 0 = Domingo ... 6 = Sábado
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

export const WEEKDAY_SHORT_LABELS: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export interface Profile {
  id: string;
  name: string;
  birthDate?: string; // YYYY-MM-DD
  sex?: 'feminino' | 'masculino' | 'outro';
  createdAt: string;
}

export interface MealSlot {
  id: string;
  label: string;
  order: number;
  timeHint?: string; // e.g. "07:30"
  orientation: string; // guidance written by the nutrition professional
}

// One list of meal slots per weekday, per profile
export type WeeklyPlan = Record<Weekday, MealSlot[]>;

export interface Bioimpedance {
  bodyFatPct?: number;
  muscleMassKg?: number;
  bodyWaterPct?: number;
  visceralFat?: number;
  boneMassKg?: number;
  bmr?: number; // kcal
}

export interface HealthRecord {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  heightCm?: number;
  weightKg?: number;
  age?: number;
  restingHeartRate?: number;
  bioimpedance?: Bioimpedance;
  notes?: string;
  createdAt: string;
}

export interface MealLog {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD, the actual calendar date the meal was logged for
  weekday: Weekday;
  mealSlotId: string;
  completed: boolean;
  score: number; // 0-5, how well the guidance was followed
  notes?: string;
  loggedAt: string;
}

export interface DayLog {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  score: number; // 0-5, overall adherence for the day
  notes?: string;
  loggedAt: string;
}

export interface AppState {
  profiles: Profile[];
  activeProfileId: string | null;
  weeklyPlans: Record<string, WeeklyPlan>; // keyed by profileId
  healthRecords: HealthRecord[];
  mealLogs: MealLog[];
  dayLogs: DayLog[];
}

export const DEFAULT_MEAL_LABELS = [
  'Café da manhã',
  'Lanche da manhã',
  'Almoço',
  'Lanche da tarde',
  'Jantar',
];
