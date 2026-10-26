import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';

export const Header = ({ title, subtitle, onBack, rightAction }) => {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logoBadge}>
              <Image
                source={require('../../assets/tms-logo.png')}
                style={styles.headerLogoImage}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={styles.titleWrapper}>
            <Text style={styles.title} numberOfLines={1}>{title || 'TMS'}</Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            ) : user ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {user.username} • <Text style={styles.roleHighlight}>{user.role || 'User'}</Text>
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.right}>
          {rightAction}
        </View>
      </View>

      <View style={styles.bottomBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#0B1120',
    zIndex: 10,
  },
  webGlass: {
    backdropFilter: 'blur(35px) saturate(180%) brightness(105%)',
    WebkitBackdropFilter: 'blur(35px) saturate(180%) brightness(105%)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#070C1B',
    borderWidth: 1.2,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  headerLogoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  backArrow: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  roleHighlight: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBorder: {
    height: 1,
    backgroundColor: '#1E293B',
  },
});
