import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { Header } from '../components/Header';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm('Are you sure you want to log out of TMS Mobile?')
          : true;
      if (confirmed) {
        logout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out of TMS Mobile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="User Profile"
          subtitle="Account & network settings"
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentWrapper}>
            {/* Profile Card */}
            <GlassCard style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.username}>{user?.username || 'User'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{user?.role || 'User'}</Text>
              </View>
              <Text style={styles.emailText}>{user?.email || 'N/A'}</Text>
            </GlassCard>

            {/* Account Details */}
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📋 Account Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{user?.id || user?._id || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>System Role</Text>
                <Text style={styles.infoValue}>{user?.role || 'Standard User'}</Text>
              </View>

              {user?.department ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Assigned Department</Text>
                  <Text style={styles.infoValue}>
                    {typeof user.department === 'object'
                      ? (user.department.name || user.department._id || 'Department')
                      : String(user.department)}
                  </Text>
                </View>
              ) : null}
            </GlassCard>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>🚪 Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionFooter}>
              TMS Mobile • Liquid Glass Finish • Expo SDK 57
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  profileCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#60A5FA',
    textAlign: 'center',
  },
  username: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginVertical: 8,
    alignSelf: 'center',
  },
  roleBadgeText: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  emailText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    flexShrink: 0,
  },
  infoValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  versionFooter: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});
