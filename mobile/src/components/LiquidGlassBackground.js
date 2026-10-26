import React from 'react';
import { View, StyleSheet } from 'react-native';

export const LiquidGlassBackground = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D1A',
  },
});
