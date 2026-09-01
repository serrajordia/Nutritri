import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, TextStyle, View } from 'react-native';
import { useApp } from '../../src/AppContext';
import { MealSlot, Weekday, WEEKDAY_LABELS } from '../../src/types';
import { Button, Card, Screen, SectionTitle, colors } from '../../src/ui';

function MealSlotEditor({
  slot,
  onSave,
  onRemove,
}: {
  slot: MealSlot;
  onSave: (updates: Partial<Pick<MealSlot, 'label' | 'orientation' | 'timeHint'>>) => void;
  onRemove: () => void;
}) {
  const [label, setLabel] = useState(slot.label);
  const [timeHint, setTimeHint] = useState(slot.timeHint ?? '');
  const [orientation, setOrientation] = useState(slot.orientation);
  const [dirty, setDirty] = useState(false);

  function commit() {
    if (!dirty) return;
    onSave({ label: label.trim() || slot.label, timeHint: timeHint.trim() || undefined, orientation });
    setDirty(false);
  }

  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={label}
          onChangeText={(v) => {
            setLabel(v);
            setDirty(true);
          }}
          onBlur={commit}
          placeholder="Nome da refeição"
          style={inputStyle({ flex: 2, fontWeight: '700' })}
        />
        <TextInput
          value={timeHint}
          onChangeText={(v) => {
            setTimeHint(v);
            setDirty(true);
          }}
          onBlur={commit}
          placeholder="Horário"
          style={inputStyle({ flex: 1 })}
        />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
        Orientação para o paciente
      </Text>
      <TextInput
        value={orientation}
        onChangeText={(v) => {
          setOrientation(v);
          setDirty(true);
        }}
        onBlur={commit}
        placeholder="Ex: 2 fatias de pão integral, 1 ovo, 1 fruta..."
        multiline
        style={inputStyle({ minHeight: 70, textAlignVertical: 'top' })}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <Button label="Salvar" onPress={commit} variant="secondary" />
        </View>
        <Pressable
          onPress={onRemove}
          style={{ paddingHorizontal: 12, justifyContent: 'center' }}
          hitSlop={8}
        >
          <Text style={{ color: colors.danger, fontWeight: '700' }}>Remover</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function inputStyle(extra: TextStyle = {}): TextStyle {
  return {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    ...extra,
  };
}

export default function PlanScreen() {
  const params = useLocalSearchParams<{ weekday: string }>();
  const weekday = Number(params.weekday) as Weekday;
  const { activeProfile, activeWeeklyPlan, addMealSlot, updateMealSlot, removeMealSlot } = useApp();

  const slots = useMemo(
    () => [...(activeWeeklyPlan?.[weekday] ?? [])].sort((a, b) => a.order - b.order),
    [activeWeeklyPlan, weekday]
  );

  const [newLabel, setNewLabel] = useState('');

  if (!activeProfile) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Nenhum perfil selecionado.</Text>
      </Screen>
    );
  }

  function handleAdd() {
    if (!activeProfile || !newLabel.trim()) return;
    addMealSlot(activeProfile.id, weekday, newLabel);
    setNewLabel('');
  }

  function handleRemove(slotId: string, label: string) {
    Alert.alert('Remover refeição', `Remover "${label}" de ${WEEKDAY_LABELS[weekday]}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => activeProfile && removeMealSlot(activeProfile.id, weekday, slotId),
      },
    ]);
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
        Orientações · {WEEKDAY_LABELS[weekday]}
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        Registre aqui as orientações passadas pela nutricionista para cada refeição deste dia da
        semana. As alterações valem para todas as semanas.
      </Text>

      <SectionTitle>Refeições</SectionTitle>
      {slots.map((slot) => (
        <MealSlotEditor
          key={slot.id}
          slot={slot}
          onSave={(updates) => activeProfile && updateMealSlot(activeProfile.id, weekday, slot.id, updates)}
          onRemove={() => handleRemove(slot.id, slot.label)}
        />
      ))}

      <SectionTitle>Adicionar refeição</SectionTitle>
      <Card style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder="Ex: Ceia"
          style={inputStyle({ flex: 1 })}
        />
        <Button label="Adicionar" onPress={handleAdd} />
      </Card>
    </Screen>
  );
}
