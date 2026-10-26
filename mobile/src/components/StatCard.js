import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

export const StatCard = ({
  label,
  value,
  icon,
  color = theme.colors.primary,
  onPress,
  active = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[
        styles.card,
        active && {
          borderColor: color,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrapper, { backgroundColor: `${color}15`, borderColor: `${color}35` }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <Text style={[styles.value, { color }]}>{value ?? 0}</Text>
        </View>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>

      {/* Subtle Bottom Accent Indicator */}
      <View style={[styles.accentLine, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    minWidth: 100,
    flex: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  webGlass: {
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 3,
  },
  content: {
    padding: theme.spacing.md,
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    opacity: 0.85,
    zIndex: 4,
  },
});

