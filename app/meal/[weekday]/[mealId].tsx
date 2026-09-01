import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { useApp } from '../../../src/AppContext';
import { dateForWeekdayThisWeek, formatDatePtBr, toDateKey } from '../../../src/dateUtils';
import { Weekday, WEEKDAY_LABELS } from '../../../src/types';
import { Button, Card, Screen, SectionTitle, ScoreSelector, colors } from '../../../src/ui';

export default function MealScreen() {
  const params = useLocalSearchParams<{ weekday: string; mealId: string }>();
  const weekday = Number(params.weekday) as Weekday;
  const mealId = params.mealId;
  const { activeProfile, activeWeeklyPlan, getMealLog, logMeal } = useApp();

  const dateKey = useMemo(() => toDateKey(dateForWeekdayThisWeek(weekday)), [weekday]);
  const slot = activeWeeklyPlan?.[weekday]?.find((s) => s.id === mealId);
  const existingLog = activeProfile ? getMealLog(activeProfile.id, dateKey, mealId) : undefined;

  const [completed, setCompleted] = useState(existingLog?.completed ?? false);
  const [score, setScore] = useState(existingLog?.score ?? 0);
  const [notes, setNotes] = useState(existingLog?.notes ?? '');

  if (!activeProfile || !slot) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Refeição não encontrada.</Text>
      </Screen>
    );
  }

  function handleSave() {
    if (!activeProfile || !slot) return;
    logMeal({
      profileId: activeProfile.id,
      date: dateKey,
      weekday,
      mealSlotId: slot.id,
      completed,
      score,
      notes,
    });
    router.back();
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{slot.label}</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        {WEEKDAY_LABELS[weekday]} · {formatDatePtBr(dateKey)}
        {slot.timeHint ? ` · ${slot.timeHint}` : ''}
      </Text>

      <SectionTitle>Orientação da nutricionista</SectionTitle>
      <Card>
        {slot.orientation ? (
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{slot.orientation}</Text>
        ) : (
          <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>
            Nenhuma orientação cadastrada ainda para esta refeição. Toque em "Editar orientações
            deste dia" na tela do dia para adicionar.
          </Text>
        )}
      </Card>

      <SectionTitle>Meu registro</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Refeição realizada</Text>
          <Switch value={completed} onValueChange={setCompleted} />
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
          Quão bem você seguiu as orientações nesta refeição?
        </Text>
        <ScoreSelector value={score} onChange={setScore} />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Observações (opcional): o que comeu, dificuldades, etc."
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            fontSize: 14,
            minHeight: 70,
            textAlignVertical: 'top',
            marginTop: 8,
          }}
        />

        <Button label="Salvar" onPress={handleSave} />
      </Card>
    </Screen>
  );
}
