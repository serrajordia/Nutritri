import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useApp } from '../src/AppContext';
import { exportProfileToXlsx } from '../src/exportXlsx';
import { Button, Card, Screen, SectionTitle, colors } from '../src/ui';

export default function ExportScreen() {
  const { activeProfile, state } = useApp();
  const [exporting, setExporting] = useState(false);

  if (!activeProfile) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Nenhum perfil selecionado.</Text>
      </Screen>
    );
  }

  async function handleExport() {
    if (!activeProfile) return;
    setExporting(true);
    try {
      await exportProfileToXlsx(state, activeProfile);
    } catch (error) {
      Alert.alert('Erro ao exportar', error instanceof Error ? error.message : String(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Exportar dados</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        Gere uma planilha (.xlsx) com o plano alimentar, os registros de refeições, o escore diário
        e a ficha de saúde de {activeProfile.name}, pronta para compartilhar com a nutricionista.
      </Text>

      <SectionTitle>O que será incluído</SectionTitle>
      <Card>
        <Text style={{ color: colors.text }}>• Perfil do paciente</Text>
        <Text style={{ color: colors.text }}>• Plano alimentar (orientações por dia e refeição)</Text>
        <Text style={{ color: colors.text }}>• Registro de refeições realizadas e escores</Text>
        <Text style={{ color: colors.text }}>• Escore diário de adesão</Text>
        <Text style={{ color: colors.text }}>• Ficha de saúde (peso, altura, FC, bioimpedância)</Text>
      </Card>

      <Button
        label={exporting ? 'Gerando arquivo...' : 'Gerar e compartilhar planilha'}
        onPress={handleExport}
        disabled={exporting}
      />
    </Screen>
  );
}
