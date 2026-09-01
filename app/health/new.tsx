import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useApp } from '../../src/AppContext';
import { todayKey } from '../../src/dateUtils';
import { Button, Card, Screen, SectionTitle, colors } from '../../src/ui';

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function NumericField({
  label,
  value,
  onChangeText,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix?: string;
}) {
  return (
    <View style={{ flex: 1, minWidth: 140 }}>
      <Text style={{ fontSize: 12, color: colors.textMuted }}>
        {label}
        {suffix ? ` (${suffix})` : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="-"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          padding: 10,
          fontSize: 15,
          color: colors.text,
        }}
      />
    </View>
  );
}

export default function NewHealthRecordScreen() {
  const { activeProfile, addHealthRecord } = useApp();

  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [age, setAge] = useState('');
  const [restingHeartRate, setRestingHeartRate] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [muscleMassKg, setMuscleMassKg] = useState('');
  const [bodyWaterPct, setBodyWaterPct] = useState('');
  const [visceralFat, setVisceralFat] = useState('');
  const [boneMassKg, setBoneMassKg] = useState('');
  const [bmr, setBmr] = useState('');
  const [notes, setNotes] = useState('');

  if (!activeProfile) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Nenhum perfil selecionado.</Text>
      </Screen>
    );
  }

  function handleSave() {
    if (!activeProfile) return;
    addHealthRecord({
      profileId: activeProfile.id,
      date: todayKey(),
      heightCm: parseNumber(heightCm),
      weightKg: parseNumber(weightKg),
      age: parseNumber(age),
      restingHeartRate: parseNumber(restingHeartRate),
      bioimpedance: {
        bodyFatPct: parseNumber(bodyFatPct),
        muscleMassKg: parseNumber(muscleMassKg),
        bodyWaterPct: parseNumber(bodyWaterPct),
        visceralFat: parseNumber(visceralFat),
        boneMassKg: parseNumber(boneMassKg),
        bmr: parseNumber(bmr),
      },
      notes: notes.trim() || undefined,
    });
    router.back();
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Novo registro de saúde</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>Data: {todayKey()}</Text>

      <SectionTitle>Medidas básicas</SectionTitle>
      <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <NumericField label="Altura" suffix="cm" value={heightCm} onChangeText={setHeightCm} />
        <NumericField label="Peso" suffix="kg" value={weightKg} onChangeText={setWeightKg} />
        <NumericField label="Idade" suffix="anos" value={age} onChangeText={setAge} />
        <NumericField
          label="FC repouso"
          suffix="bpm, do smartwatch se disponível"
          value={restingHeartRate}
          onChangeText={setRestingHeartRate}
        />
      </Card>

      <SectionTitle>Bioimpedância (opcional, informado pela nutricionista)</SectionTitle>
      <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <NumericField label="Gordura corporal" suffix="%" value={bodyFatPct} onChangeText={setBodyFatPct} />
        <NumericField
          label="Massa muscular"
          suffix="kg"
          value={muscleMassKg}
          onChangeText={setMuscleMassKg}
        />
        <NumericField label="Água corporal" suffix="%" value={bodyWaterPct} onChangeText={setBodyWaterPct} />
        <NumericField label="Gordura visceral" value={visceralFat} onChangeText={setVisceralFat} />
        <NumericField label="Massa óssea" suffix="kg" value={boneMassKg} onChangeText={setBoneMassKg} />
        <NumericField label="Taxa metabólica basal" suffix="kcal" value={bmr} onChangeText={setBmr} />
      </Card>

      <SectionTitle>Observações</SectionTitle>
      <Card>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Observações do paciente ou da nutricionista"
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            fontSize: 14,
            minHeight: 70,
            textAlignVertical: 'top',
          }}
        />
      </Card>

      <Button label="Salvar registro" onPress={handleSave} />
    </Screen>
  );
}
