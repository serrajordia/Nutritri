import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { useApp } from '../../src/AppContext';
import { formatDatePtBr } from '../../src/dateUtils';
import { Button, Card, Screen, SectionTitle, colors } from '../../src/ui';

function computeBmi(heightCm?: number, weightKg?: number): string | null {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return bmi.toFixed(1);
}

export default function HealthScreen() {
  const { activeProfile, state, deleteHealthRecord } = useApp();

  if (!activeProfile) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Nenhum perfil selecionado.</Text>
      </Screen>
    );
  }

  const records = state.healthRecords
    .filter((r) => r.profileId === activeProfile.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  function confirmDelete(id: string, date: string) {
    Alert.alert('Remover registro', `Remover o registro de ${formatDatePtBr(date)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteHealthRecord(id) },
    ]);
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Ficha de saúde</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        Histórico de peso, altura, frequência cardíaca de repouso e bioimpedância de {activeProfile.name}.
      </Text>

      <Button label="+ Novo registro" onPress={() => router.push('/health/new')} />

      <SectionTitle>Histórico</SectionTitle>
      {records.length === 0 && (
        <Card>
          <Text style={{ color: colors.textMuted }}>Nenhum registro de saúde ainda.</Text>
        </Card>
      )}
      {records.map((record) => {
        const bmi = computeBmi(record.heightCm, record.weightKg);
        return (
          <Card key={record.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{formatDatePtBr(record.date)}</Text>
              <Pressable onPress={() => confirmDelete(record.id, record.date)} hitSlop={8}>
                <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12 }}>Excluir</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {record.weightKg != null && <Metric label="Peso" value={`${record.weightKg} kg`} />}
              {record.heightCm != null && <Metric label="Altura" value={`${record.heightCm} cm`} />}
              {bmi && <Metric label="IMC" value={bmi} />}
              {record.age != null && <Metric label="Idade" value={`${record.age} anos`} />}
              {record.restingHeartRate != null && (
                <Metric label="FC repouso" value={`${record.restingHeartRate} bpm`} />
              )}
              {record.bioimpedance?.bodyFatPct != null && (
                <Metric label="Gordura corporal" value={`${record.bioimpedance.bodyFatPct}%`} />
              )}
              {record.bioimpedance?.muscleMassKg != null && (
                <Metric label="Massa muscular" value={`${record.bioimpedance.muscleMassKg} kg`} />
              )}
              {record.bioimpedance?.bodyWaterPct != null && (
                <Metric label="Água corporal" value={`${record.bioimpedance.bodyWaterPct}%`} />
              )}
              {record.bioimpedance?.visceralFat != null && (
                <Metric label="Gordura visceral" value={`${record.bioimpedance.visceralFat}`} />
              )}
              {record.bioimpedance?.boneMassKg != null && (
                <Metric label="Massa óssea" value={`${record.bioimpedance.boneMassKg} kg`} />
              )}
              {record.bioimpedance?.bmr != null && (
                <Metric label="TMB" value={`${record.bioimpedance.bmr} kcal`} />
              )}
            </View>
            {record.notes ? (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{record.notes}</Text>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 100 }}>
      <Text style={{ fontSize: 11, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{value}</Text>
    </View>
  );
}
