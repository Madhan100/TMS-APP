import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const StatusBadge = ({ status, size = 'medium' }) => {
  let badgeColor = theme.colors.pending;
  let label = status || 'Unknown';

  switch (status) {
    case 'Pending':
      badgeColor = '#fbbf24';
      break;
    case 'Assigned':
      badgeColor = '#c084fc';
      break;
    case 'In-Progress':
      badgeColor = '#38bdf8';
      break;
    case 'Onhold':
    case 'On Hold':
      badgeColor = '#818cf8';
      break;
    case 'Closed':
    case 'Resolved':
      badgeColor = '#34d399';
      break;
    default:
      badgeColor = theme.colors.textMuted;
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${badgeColor}18`,
          borderColor: `${badgeColor}55`,
          borderTopColor: `${badgeColor}88`,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 4 : 6,
          shadowColor: badgeColor,
          shadowOpacity: 0.25,
          shadowRadius: 6,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: badgeColor, shadowColor: badgeColor, shadowOpacity: 0.8, shadowRadius: 4 }]} />
      <Text
        style={[
          styles.text,
          {
            color: badgeColor,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
