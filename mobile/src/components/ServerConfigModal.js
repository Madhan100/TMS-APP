import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { ACTIVE_LAN_IP, getDevHostIp } from '../api/api';

export const ServerConfigModal = ({ visible, onClose }) => {
  const { serverUrl, changeServerUrl, resetServerUrl } = useContext(AuthContext);
  const [url, setUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setUrl(serverUrl);
    setTestResult(null);
  }, [visible, serverUrl]);

  const activeIp = getDevHostIp();
  const presets = [
    { label: '⚡ Auto Live PC', url: `http://${activeIp}:5000/api`, isAuto: true },
    { label: 'Localhost (Web/Sim)', url: 'http://localhost:5000/api' },
    { label: 'Android Emulator', url: 'http://10.0.2.2:5000/api' },
  ];

  const handleTestConnection = async () => {
    if (!url) return;
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const healthUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/api/health`;
      const res = await axios.get(healthUrl, { timeout: 6000 });
      if (res.status === 200) {
        setTestResult({ success: true, message: 'Connected successfully to backend!' });
      } else {
        setTestResult({ success: false, message: `Server replied with HTTP ${res.status}` });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not connect. Ensure your phone and PC are on the same Wi-Fi.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!url) return;
    try {
      await changeServerUrl(url);
      Alert.alert('Server Updated', `API endpoint set to:\n${url}`);
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to save server URL');
    }
  };

  const handleResetToAuto = async () => {
    try {
      const freshUrl = await resetServerUrl();
      setUrl(freshUrl);
      setTestResult({ success: true, message: `Reset to live PC IP: ${freshUrl}` });
    } catch (err) {
      Alert.alert('Error', 'Failed to reset server URL');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Backend Server Config</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.instruction}>
            Make sure your phone is connected to the same Wi-Fi network as this PC ({activeIp}).
          </Text>

          <Text style={styles.label}>Quick Presets</Text>
          <View style={styles.presetsRow}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.url}
                style={[
                  styles.presetChip,
                  url === preset.url && styles.presetChipActive,
                ]}
                onPress={() => {
                  if (preset.isAuto) {
                    handleResetToAuto();
                  } else {
                    setUrl(preset.url);
                    setTestResult(null);
                  }
                }}
              >
                <Text
                  style={[
                    styles.presetText,
                    url === preset.url && styles.presetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Server Base URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={(txt) => {
              setUrl(txt);
              setTestResult(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={`http://${activeIp}:5000/api`}
            placeholderTextColor={theme.colors.textMuted}
          />

          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.success ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Text
                style={[
                  styles.resultText,
                  testResult.success ? styles.textSuccess : styles.textError,
                ]}
              >
                {testResult.success ? '✓ ' : '✕ '}
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.testBtn]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator color={theme.colors.textPrimary} size="small" />
              ) : (
                <Text style={styles.btnText}>Test Connection</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save & Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    borderRadius: 16,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  instruction: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
    zIndex: 2,
  },
  label: {
    ...theme.typography.captionBold,
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    zIndex: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.lg,
    zIndex: 2,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  presetChipActive: {
    borderColor: '#00f5ff',
    borderTopColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 245, 255, 0.22)',
  },
  presetText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: theme.spacing.md,
    zIndex: 2,
  },
  resultBox: {
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    zIndex: 2,
  },
  resultSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  resultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSuccess: {
    color: theme.colors.accent,
  },
  textError: {
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.sm,
    zIndex: 2,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  btnText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
