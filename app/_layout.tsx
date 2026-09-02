import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/AppContext';
import { colors } from '../src/ui';

// Metro's default web export serves one static index.html for every route,
// so tags that only matter for "Add to Home Screen" on iOS Safari (manifest,
// apple-touch-icon) are injected here at runtime instead — the app.json
// `web` config already covers theme-color/description via the export step.
function useWebPwaMetaTags() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const tags: [string, Record<string, string>][] = [
      ['link', { rel: 'manifest', href: '/manifest.json' }],
      ['link', { rel: 'apple-touch-icon', href: '/icon.png' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
      ['meta', { name: 'apple-mobile-web-app-title', content: 'Nutritri' }],
    ];

    for (const [tagName, attrs] of tags) {
      const selector = Object.entries(attrs)
        .map(([key, value]) => `[${key}="${value}"]`)
        .join('');
      if (document.head.querySelector(`${tagName}${selector}`)) continue;
      const el = document.createElement(tagName);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      document.head.appendChild(el);
    }
  }, []);
}

export default function RootLayout() {
  useWebPwaMetaTags();
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
