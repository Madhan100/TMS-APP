import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

export const GlassCard = ({
  children,
  style,
  contentStyle,
  onPress,
  activeOpacity = 0.8,
}) => {
  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.card, style]}
    >
      <View style={[styles.innerContent, contentStyle]}>{children}</View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  innerContent: {
    padding: theme.spacing.lg,
    width: '100%',
  },
});
