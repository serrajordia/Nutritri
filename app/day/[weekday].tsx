import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useApp } from '../../src/AppContext';
import { dateForWeekdayThisWeek, formatDatePtBr, toDateKey } from '../../src/dateUtils';
import { Weekday, WEEKDAY_LABELS } from '../../src/types';
import { Button, Card, Screen, SectionTitle, ScoreSelector, colors, scoreColor } from '../../src/ui';

export default function DayScreen() {
  const params = useLocalSearchParams<{ weekday: string }>();
  const weekday = Number(params.weekday) as Weekday;
  const { activeProfile, activeWeeklyPlan, state, getDayLog, logDay } = useApp();

  const dateKey = useMemo(() => toDateKey(dateForWeekdayThisWeek(weekday)), [weekday]);
  const slots = useMemo(
    () => [...(activeWeeklyPlan?.[weekday] ?? [])].sort((a, b) => a.order - b.order),
    [activeWeeklyPlan, weekday]
  );

  const existingDayLog = activeProfile ? getDayLog(activeProfile.id, dateKey) : undefined;
  const [dayScore, setDayScore] = useState(existingDayLog?.score ?? 0);
  const [dayNotes, setDayNotes] = useState(existingDayLog?.notes ?? '');
  const [dayLogTouched, setDayLogTouched] = useState(false);

  useEffect(() => {
    if (!dayLogTouched) {
      setDayScore(existingDayLog?.score ?? 0);
      setDayNotes(existingDayLog?.notes ?? '');
    }
  }, [existingDayLog, dayLogTouched]);

  if (!activeProfile) {
    router.replace('/');
    return null;
  }

  function handleSaveDayScore() {
    if (!activeProfile) return;
    logDay({ profileId: activeProfile.id, date: dateKey, score: dayScore, notes: dayNotes });
    setDayLogTouched(false);
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
        {WEEKDAY_LABELS[weekday]}
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>{formatDatePtBr(dateKey)}</Text>

      <SectionTitle>Refeições</SectionTitle>
      {slots.length === 0 && (
        <Card>
          <Text style={{ color: colors.textMuted }}>
            Nenhuma refeição cadastrada para este dia ainda.
          </Text>
        </Card>
      )}
      {slots.map((slot) => {
        const log = state.mealLogs.find(
          (l) => l.profileId === activeProfile.id && l.date === dateKey && l.mealSlotId === slot.id
        );
        return (
          <Card
            key={slot.id}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                {slot.label}
                {slot.timeHint ? ` · ${slot.timeHint}` : ''}
              </Text>
              {log?.completed ? (
                <Text style={{ color: scoreColor(log.score), fontSize: 12, fontWeight: '700' }}>
                  Realizada · Escore {log.score}/5
                </Text>
              ) : (
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Pendente</Text>
              )}
            </View>
            <Button
              label={log?.completed ? 'Ver' : 'Registrar'}
              variant="secondary"
              onPress={() => router.push(`/meal/${weekday}/${slot.id}`)}
            />
          </Card>
        );
      })}

      <Button
        label="Editar orientações deste dia"
        variant="secondary"
        onPress={() => router.push(`/plan/${weekday}`)}
      />

      <SectionTitle>Como foi meu dia?</SectionTitle>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          Quão bem você seguiu as orientações da nutricionista hoje?
        </Text>
        <ScoreSelector
          value={dayScore}
          onChange={(v) => {
            setDayScore(v);
            setDayLogTouched(true);
          }}
        />
        <TextInput
          value={dayNotes}
          onChangeText={(v) => {
            setDayNotes(v);
            setDayLogTouched(true);
          }}
          placeholder="Observações sobre o dia (opcional)"
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            fontSize: 14,
            minHeight: 60,
            textAlignVertical: 'top',
          }}
        />
        <Button label="Salvar escore do dia" onPress={handleSaveDayScore} />
      </Card>
    </Screen>
  );
}
