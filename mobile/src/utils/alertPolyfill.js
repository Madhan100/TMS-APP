import { Platform, Alert } from 'react-native';

/**
 * Polyfill Alert.alert for React Native Web.
 * By default, react-native-web has an empty static alert() {} implementation.
 * This polyfill enables window.alert and window.confirm for web runtime.
 */
if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons, options) => {
    const text = [title, message].filter(Boolean).join('\n\n');

    // Case 1: No buttons or single button
    if (!buttons || buttons.length <= 1) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(text);
      }
      if (buttons && buttons[0] && typeof buttons[0].onPress === 'function') {
        buttons[0].onPress();
      }
      return;
    }

    // Case 2: Multiple buttons (Confirmation dialog)
    const cancelBtn = buttons.find(
      (b) => b.style === 'cancel' || (b.text && b.text.toLowerCase() === 'cancel')
    );
    const confirmBtn =
      buttons.find(
        (b) => b.style !== 'cancel' && (!b.text || b.text.toLowerCase() !== 'cancel')
      ) || buttons[buttons.length - 1];

    let confirmed = false;
    if (typeof window !== 'undefined' && window.confirm) {
      confirmed = window.confirm(text);
    } else {
      confirmed = true;
    }

    if (confirmed) {
      if (confirmBtn && typeof confirmBtn.onPress === 'function') {
        confirmBtn.onPress();
      }
    } else {
      if (cancelBtn && typeof cancelBtn.onPress === 'function') {
        cancelBtn.onPress();
      }
    }
  };
}
