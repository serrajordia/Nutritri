import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useApp } from '../../src/AppContext';
import { ImportedPlanRow, ParsedImportResult, pickAndParsePlanFile } from '../../src/importXlsx';
import { Weekday, WEEKDAY_LABELS, WEEKDAY_ORDER } from '../../src/types';
import { Button, Card, Screen, SectionTitle, colors } from '../../src/ui';

function groupByWeekday(rows: ImportedPlanRow[]): Map<Weekday, ImportedPlanRow[]> {
  const grouped = new Map<Weekday, ImportedPlanRow[]>();
  rows.forEach((row) => {
    const existing = grouped.get(row.weekday) ?? [];
    existing.push(row);
    grouped.set(row.weekday, existing);
  });
  return grouped;
}

export default function ImportPlanScreen() {
  const { activeProfile, replaceWeekdayMealSlots } = useApp();
  const [picking, setPicking] = useState(false);
  const [result, setResult] = useState<ParsedImportResult | null>(null);

  const grouped = useMemo(() => (result ? groupByWeekday(result.rows) : null), [result]);
  const affectedWeekdays = useMemo(
    () => (grouped ? WEEKDAY_ORDER.filter((weekday) => grouped.has(weekday)) : []),
    [grouped]
  );

  if (!activeProfile) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Nenhum perfil selecionado.</Text>
      </Screen>
    );
  }

  async function handlePick() {
    setPicking(true);
    try {
      const parsed = await pickAndParsePlanFile();
      if (parsed) setResult(parsed);
    } catch (error) {
      Alert.alert(
        'Erro ao ler o arquivo',
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setPicking(false);
    }
  }

  function handleConfirm() {
    if (!activeProfile || !grouped) return;
    Alert.alert(
      'Confirmar importação',
      `As orientações de ${affectedWeekdays.length} dia(s) serão substituídas pelas do arquivo. Esta ação não pode ser desfeita. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: () => {
            affectedWeekdays.forEach((weekday) => {
              const rows = grouped.get(weekday) ?? [];
              replaceWeekdayMealSlots(
                activeProfile.id,
                weekday,
                rows.map((row) => ({
                  label: row.label,
                  timeHint: row.timeHint,
                  orientation: row.orientation,
                }))
              );
            });
            Alert.alert('Importação concluída', 'O plano alimentar foi atualizado.');
            router.back();
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Importar plano</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        Selecione uma planilha .xlsx com a aba "Plano Alimentar" (gerada pela skill de conversão de
        documentos da nutricionista) para carregar as orientações de {activeProfile.name}.
      </Text>

      <Button
        label={picking ? 'Abrindo arquivo...' : 'Selecionar arquivo (.xlsx)'}
        onPress={handlePick}
        disabled={picking}
      />

      {result && (
        <>
          <SectionTitle>Resumo antes de importar</SectionTitle>
          <Card>
            <Text style={{ color: colors.text }}>
              {result.rows.length} refeição(ões) reconhecida(s) em {affectedWeekdays.length}{' '}
              dia(s):
            </Text>
            {affectedWeekdays.map((weekday) => (
              <View key={weekday} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text }}>{WEEKDAY_LABELS[weekday]}</Text>
                <Text style={{ color: colors.textMuted }}>
                  {grouped?.get(weekday)?.length ?? 0} refeição(ões)
                </Text>
              </View>
            ))}
          </Card>

          {result.warnings.length > 0 && (
            <Card>
              <Text style={{ color: colors.warning, fontWeight: '700' }}>
                {result.warnings.length} linha(s) ignorada(s):
              </Text>
              {result.warnings.map((warning, index) => (
                <Text key={index} style={{ color: colors.textMuted, fontSize: 12 }}>
                  {warning}
                </Text>
              ))}
            </Card>
          )}

          {result.rows.length > 0 ? (
            <Button label="Confirmar importação" onPress={handleConfirm} />
          ) : (
            <Text style={{ color: colors.danger }}>
              Nenhuma refeição válida encontrada no arquivo — nada para importar.
            </Text>
          )}
        </>
      )}
    </Screen>
  );
}
