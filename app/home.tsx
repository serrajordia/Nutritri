import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../src/AppContext';
import { dateForWeekdayThisWeek, formatDatePtBr, isToday, toDateKey } from '../src/dateUtils';
import { Weekday, WEEKDAY_LABELS, WEEKDAY_ORDER } from '../src/types';
import { Button, Card, Screen, SectionTitle, colors, scoreColor } from '../src/ui';

export default function HomeScreen() {
  const { state, loading, activeProfile, activeWeeklyPlan, getDayLog } = useApp();

  useEffect(() => {
    if (!loading && !activeProfile) {
      router.replace('/');
    }
  }, [loading, activeProfile]);

  if (loading || !activeProfile) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Carregando...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
        Olá, {activeProfile.name.split(' ')[0]}
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        Escolha um dia da semana para ver as orientações e registrar suas refeições.
      </Text>

      <SectionTitle>Esta semana</SectionTitle>
      {WEEKDAY_ORDER.map((weekday) => {
        const date = dateForWeekdayThisWeek(weekday as Weekday);
        const dateKey = toDateKey(date);
        const dayLog = getDayLog(activeProfile.id, dateKey);
        const slots = activeWeeklyPlan?.[weekday as Weekday] ?? [];
        const completedCount = state.mealLogs.filter(
          (l) => l.profileId === activeProfile.id && l.date === dateKey && l.completed
        ).length;
        const today = isToday(dateKey);

        return (
          <Card
            key={weekday}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: today ? colors.primary : colors.border,
              borderWidth: today ? 2 : 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                {WEEKDAY_LABELS[weekday as Weekday]} {today ? '· Hoje' : ''}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {formatDatePtBr(dateKey)} · {completedCount}/{slots.length} refeições registradas
              </Text>
              {dayLog && (
                <Text style={{ color: scoreColor(dayLog.score), fontSize: 12, fontWeight: '700' }}>
                  Escore do dia: {dayLog.score}/5
                </Text>
              )}
            </View>
            <Button
              label="Abrir"
              variant="secondary"
              onPress={() => router.push(`/day/${weekday}`)}
            />
          </Card>
        );
      })}

      <SectionTitle>Ferramentas</SectionTitle>
      <Button label="Ficha de saúde" onPress={() => router.push('/health')} variant="secondary" />
      <Button
        label="Importar plano (.xlsx)"
        onPress={() => router.push('/plan/import')}
        variant="secondary"
      />
      <Button label="Exportar dados (xlsx)" onPress={() => router.push('/export')} variant="secondary" />
      <Button label="Trocar de perfil" onPress={() => router.push('/')} variant="secondary" />
    </Screen>
  );
}
