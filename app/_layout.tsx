import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/AppContext';
import { colors } from '../src/ui';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Nutritri' }} />
          <Stack.Screen name="home" options={{ title: 'Minha semana' }} />
          <Stack.Screen name="day/[weekday]" options={{ title: 'Dia' }} />
          <Stack.Screen name="meal/[weekday]/[mealId]" options={{ title: 'Refeição' }} />
          <Stack.Screen name="plan/[weekday]" options={{ title: 'Orientações' }} />
          <Stack.Screen name="plan/import" options={{ title: 'Importar plano' }} />
          <Stack.Screen name="health/index" options={{ title: 'Ficha de saúde' }} />
          <Stack.Screen name="health/new" options={{ title: 'Novo registro' }} />
          <Stack.Screen name="export" options={{ title: 'Exportar dados' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
