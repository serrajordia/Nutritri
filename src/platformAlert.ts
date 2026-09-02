import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * react-native-web's Alert.alert is a no-op stub (it renders nothing and
 * never calls a button's onPress), so on web this falls back to
 * window.alert/window.confirm instead. Drop-in replacement for the two
 * Alert.alert shapes used in this app: a plain info message, and a
 * confirm dialog with a "Cancelar" button plus one action button.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = [title, message].filter(Boolean).join('\n\n');

  if (!buttons || buttons.length <= 1) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const actionButton = buttons.find((b) => b !== cancelButton) ?? buttons[buttons.length - 1];

  if (window.confirm(text)) {
    actionButton.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
