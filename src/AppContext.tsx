import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { generateId } from './id';
import { createDefaultWeeklyPlan, loadState, saveState } from './storage';
import {
  AppState,
  Bioimpedance,
  DayLog,
  HealthRecord,
  MealLog,
  MealSlot,
  Profile,
  Weekday,
  WeeklyPlan,
} from './types';

interface AppContextValue {
  state: AppState;
  loading: boolean;
  activeProfile: Profile | null;
  activeWeeklyPlan: WeeklyPlan | null;
  addProfile: (input: { name: string; birthDate?: string; sex?: Profile['sex'] }) => Profile;
  setActiveProfileId: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  addMealSlot: (profileId: string, weekday: Weekday, label: string) => void;
  updateMealSlot: (
    profileId: string,
    weekday: Weekday,
    mealSlotId: string,
    updates: Partial<Pick<MealSlot, 'label' | 'orientation' | 'timeHint'>>
  ) => void;
  removeMealSlot: (profileId: string, weekday: Weekday, mealSlotId: string) => void;
  reorderMealSlots: (profileId: string, weekday: Weekday, orderedIds: string[]) => void;
  getMealLog: (profileId: string, date: string, mealSlotId: string) => MealLog | undefined;
  logMeal: (input: {
    profileId: string;
    date: string;
    weekday: Weekday;
    mealSlotId: string;
    completed: boolean;
    score: number;
    notes?: string;
  }) => void;
  getDayLog: (profileId: string, date: string) => DayLog | undefined;
  logDay: (input: { profileId: string; date: string; score: number; notes?: string }) => void;
  addHealthRecord: (
    input: Omit<HealthRecord, 'id' | 'createdAt'>
  ) => HealthRecord;
  deleteHealthRecord: (recordId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    profiles: [],
    activeProfileId: null,
    weeklyPlans: {},
    healthRecords: [],
    mealLogs: [],
    dayLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    saveState(state);
  }, [state, loading]);

  const addProfile = useCallback<AppContextValue['addProfile']>((input) => {
    const profile: Profile = {
      id: generateId(),
      name: input.name.trim(),
      birthDate: input.birthDate,
      sex: input.sex,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, profile],
      activeProfileId: profile.id,
      weeklyPlans: { ...prev.weeklyPlans, [profile.id]: createDefaultWeeklyPlan() },
    }));
    return profile;
  }, []);

  const setActiveProfileId = useCallback((profileId: string) => {
    setState((prev) => ({ ...prev, activeProfileId: profileId }));
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    setState((prev) => {
      const { [profileId]: _removed, ...restPlans } = prev.weeklyPlans;
      return {
        ...prev,
        profiles: prev.profiles.filter((p) => p.id !== profileId),
        weeklyPlans: restPlans,
        healthRecords: prev.healthRecords.filter((r) => r.profileId !== profileId),
        mealLogs: prev.mealLogs.filter((l) => l.profileId !== profileId),
        dayLogs: prev.dayLogs.filter((l) => l.profileId !== profileId),
        activeProfileId: prev.activeProfileId === profileId ? null : prev.activeProfileId,
      };
    });
  }, []);

  const addMealSlot = useCallback((profileId: string, weekday: Weekday, label: string) => {
    setState((prev) => {
      const plan = prev.weeklyPlans[profileId] ?? createDefaultWeeklyPlan();
      const slots = plan[weekday] ?? [];
      const newSlot: MealSlot = {
        id: generateId(),
        label: label.trim() || 'Nova refeição',
        order: slots.length,
        orientation: '',
      };
      return {
        ...prev,
        weeklyPlans: {
          ...prev.weeklyPlans,
          [profileId]: { ...plan, [weekday]: [...slots, newSlot] },
        },
      };
    });
  }, []);

  const updateMealSlot = useCallback(
    (
      profileId: string,
      weekday: Weekday,
      mealSlotId: string,
      updates: Partial<Pick<MealSlot, 'label' | 'orientation' | 'timeHint'>>
    ) => {
      setState((prev) => {
        const plan = prev.weeklyPlans[profileId];
        if (!plan) return prev;
        const slots = plan[weekday] ?? [];
        return {
          ...prev,
          weeklyPlans: {
            ...prev.weeklyPlans,
            [profileId]: {
              ...plan,
              [weekday]: slots.map((s) => (s.id === mealSlotId ? { ...s, ...updates } : s)),
            },
          },
        };
      });
    },
    []
  );

  const removeMealSlot = useCallback((profileId: string, weekday: Weekday, mealSlotId: string) => {
    setState((prev) => {
      const plan = prev.weeklyPlans[profileId];
      if (!plan) return prev;
      const slots = (plan[weekday] ?? []).filter((s) => s.id !== mealSlotId);
      return {
        ...prev,
        weeklyPlans: {
          ...prev.weeklyPlans,
          [profileId]: { ...plan, [weekday]: slots },
        },
      };
    });
  }, []);

  const reorderMealSlots = useCallback((profileId: string, weekday: Weekday, orderedIds: string[]) => {
    setState((prev) => {
      const plan = prev.weeklyPlans[profileId];
      if (!plan) return prev;
      const slots = plan[weekday] ?? [];
      const byId = new Map(slots.map((s) => [s.id, s]));
      const reordered = orderedIds
        .map((id, index) => {
          const slot = byId.get(id);
          return slot ? { ...slot, order: index } : undefined;
        })
        .filter((s): s is MealSlot => !!s);
      return {
        ...prev,
        weeklyPlans: { ...prev.weeklyPlans, [profileId]: { ...plan, [weekday]: reordered } },
      };
    });
  }, []);

  const getMealLog = useCallback(
    (profileId: string, date: string, mealSlotId: string) =>
      state.mealLogs.find(
        (l) => l.profileId === profileId && l.date === date && l.mealSlotId === mealSlotId
      ),
    [state.mealLogs]
  );

  const logMeal = useCallback<AppContextValue['logMeal']>((input) => {
    setState((prev) => {
      const existing = prev.mealLogs.find(
        (l) =>
          l.profileId === input.profileId && l.date === input.date && l.mealSlotId === input.mealSlotId
      );
      const entry: MealLog = {
        id: existing?.id ?? generateId(),
        profileId: input.profileId,
        date: input.date,
        weekday: input.weekday,
        mealSlotId: input.mealSlotId,
        completed: input.completed,
        score: input.score,
        notes: input.notes,
        loggedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        mealLogs: existing
          ? prev.mealLogs.map((l) => (l.id === existing.id ? entry : l))
          : [...prev.mealLogs, entry],
      };
    });
  }, []);

  const getDayLog = useCallback(
    (profileId: string, date: string) =>
      state.dayLogs.find((l) => l.profileId === profileId && l.date === date),
    [state.dayLogs]
  );

  const logDay = useCallback<AppContextValue['logDay']>((input) => {
    setState((prev) => {
      const existing = prev.dayLogs.find((l) => l.profileId === input.profileId && l.date === input.date);
      const entry: DayLog = {
        id: existing?.id ?? generateId(),
        profileId: input.profileId,
        date: input.date,
        score: input.score,
        notes: input.notes,
        loggedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        dayLogs: existing
          ? prev.dayLogs.map((l) => (l.id === existing.id ? entry : l))
          : [...prev.dayLogs, entry],
      };
    });
  }, []);

  const addHealthRecord = useCallback<AppContextValue['addHealthRecord']>((input) => {
    const record: HealthRecord = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, healthRecords: [...prev.healthRecords, record] }));
    return record;
  }, []);

  const deleteHealthRecord = useCallback((recordId: string) => {
    setState((prev) => ({
      ...prev,
      healthRecords: prev.healthRecords.filter((r) => r.id !== recordId),
    }));
  }, []);

  const activeProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) ?? null,
    [state.profiles, state.activeProfileId]
  );

  const activeWeeklyPlan = useMemo(
    () => (state.activeProfileId ? state.weeklyPlans[state.activeProfileId] ?? null : null),
    [state.activeProfileId, state.weeklyPlans]
  );

  const value: AppContextValue = {
    state,
    loading,
    activeProfile,
    activeWeeklyPlan,
    addProfile,
    setActiveProfileId,
    deleteProfile,
    addMealSlot,
    updateMealSlot,
    removeMealSlot,
    reorderMealSlots,
    getMealLog,
    logMeal,
    getDayLog,
    logDay,
    addHealthRecord,
    deleteHealthRecord,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return ctx;
}

export type { Bioimpedance };
