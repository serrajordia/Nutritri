import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useApp } from '../src/AppContext';
import { Profile } from '../src/types';
import { Button, Card, Screen, SectionTitle, colors } from '../src/ui';

const SEX_OPTIONS: { value: Profile['sex']; label: string }[] = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'outro', label: 'Outro' },
];

export default function ProfilesScreen() {
  const { state, loading, addProfile, setActiveProfileId, deleteProfile } = useApp();
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Profile['sex']>(undefined);
  const [creating, setCreating] = useState(false);

  if (loading) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Carregando...</Text>
      </Screen>
    );
  }

  function openProfile(id: string) {
    setActiveProfileId(id);
    router.push('/home');
  }

  function handleCreate() {
    if (!name.trim()) return;
    addProfile({ name, sex });
    setName('');
    setSex(undefined);
    setCreating(false);
    router.push('/home');
  }

  function confirmDelete(profile: Profile) {
    Alert.alert(
      'Remover perfil',
      `Remover "${profile.name}" e todos os dados associados? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteProfile(profile.id) },
      ]
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
        Bem-vindo(a) ao Nutritri
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: 8 }}>
        Selecione um perfil de paciente para continuar, ou crie um novo.
      </Text>

      <SectionTitle>Perfis</SectionTitle>
      {state.profiles.length === 0 && (
        <Card>
          <Text style={{ color: colors.textMuted }}>
            Nenhum perfil cadastrado ainda. Crie o primeiro abaixo.
          </Text>
        </Card>
      )}
      {state.profiles.map((profile) => (
        <Card
          key={profile.id}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{profile.name}</Text>
            {profile.id === state.activeProfileId && (
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Perfil ativo</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Abrir" onPress={() => openProfile(profile.id)} variant="secondary" />
            <Pressable onPress={() => confirmDelete(profile)} hitSlop={8}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Excluir</Text>
            </Pressable>
          </View>
        </Card>
      ))}

      <SectionTitle>Novo perfil</SectionTitle>
      {creating ? (
        <Card>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Nome do paciente</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Maria Silva"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 10,
              fontSize: 15,
            }}
          />
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Sexo (opcional)</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SEX_OPTIONS.map((option) => {
              const selected = sex === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSex(selected ? undefined : option.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : colors.surface,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: selected ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Button label="Criar perfil" onPress={handleCreate} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Cancelar" onPress={() => setCreating(false)} variant="secondary" />
            </View>
          </View>
        </Card>
      ) : (
        <Button label="+ Adicionar perfil" onPress={() => setCreating(true)} variant="secondary" />
      )}
    </Screen>
  );
}
