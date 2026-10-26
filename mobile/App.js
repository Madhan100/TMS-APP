import './src/utils/alertPolyfill';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="light" backgroundColor="#090d16" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
