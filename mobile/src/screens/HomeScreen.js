import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../api/api';
import { StatCard } from '../components/StatCard';
import { Header } from '../components/Header';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';

export const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    onhold: 0,
    completed: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const res = await complaintService.getAll();
      const allComplaints = res.data?.data || res.data || [];

      let targetComplaints = allComplaints;

      if (user?.role !== 'SuperAdmin') {
        const userId = user?.id || user?._id;
        targetComplaints = allComplaints.filter((c) => {
          const createdById = c.createdBy?._id || c.createdBy;
          const assignedToId = c.assignedTo?._id || c.assignedTo;
          return (
            String(createdById) === String(userId) ||
            String(assignedToId) === String(userId)
          );
        });
      }

      setStats({
        total: targetComplaints.length,
        pending: targetComplaints.filter((c) => c.status === 'Pending').length,
        assigned: targetComplaints.filter((c) => c.status === 'Assigned').length,
        inProgress: targetComplaints.filter((c) => c.status === 'In-Progress').length,
        onhold: targetComplaints.filter((c) => c.status === 'Onhold' || c.status === 'On Hold').length,
        completed: targetComplaints.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isSuperAdmin = user?.role === 'SuperAdmin';

  const navigateToComplaints = (filterStatus) => {
    if (isSuperAdmin) {
      navigation.navigate('AllComplaints', { initialFilter: filterStatus });
    } else {
      navigation.navigate('MyComplaints', { initialFilter: filterStatus });
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="TMS Dashboard"
          subtitle={todayStr}
          rightAction={
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileBadgeText}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={styles.contentWrapper}>
            {/* Executive Welcome Banner */}
            <GlassCard style={styles.banner} intensity={35}>
              <View style={styles.bannerContent}>
                <Text style={styles.greetingTitle}>
                  Welcome back,{' '}
                  <Text style={styles.greetingName}>{user?.username || 'User'}</Text> 👋
                </Text>
                <Text style={styles.greetingSub}>
                  {isSuperAdmin
                    ? 'Campus Administration & Ticket Management'
                    : 'Report issues and track real-time repair progress'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.raiseBtn}
                onPress={() => navigation.navigate('NewComplaint')}
                activeOpacity={0.85}
              >
                <View style={styles.raiseBtnSolid}>
                  <Text style={styles.raiseBtnText}>➕ Raise Complaint Ticket</Text>
                </View>
              </TouchableOpacity>
            </GlassCard>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overview Statistics</Text>
              <Text style={styles.sectionSubtitle}>Tap card to filter</Text>
            </View>

            {/* Executive Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  label="Total Requests"
                  value={stats.total}
                  icon="📋"
                  color="#3B82F6"
                  onPress={() => navigateToComplaints('All')}
                />
                <StatCard
                  label="Pending Fix"
                  value={stats.pending}
                  icon="⏳"
                  color="#F59E0B"
                  onPress={() => navigateToComplaints('Pending')}
                />
              </View>

              <View style={styles.statsRow}>
                <StatCard
                  label="Assigned"
                  value={stats.assigned}
                  icon="👤"
                  color="#6366F1"
                  onPress={() => navigateToComplaints('Assigned')}
                />
                <StatCard
                  label="In Progress"
                  value={stats.inProgress}
                  icon="⚙️"
                  color="#0EA5E9"
                  onPress={() => navigateToComplaints('In-Progress')}
                />
              </View>

              <View style={styles.statsRow}>
                <StatCard
                  label="On Hold"
                  value={stats.onhold}
                  icon="⏸️"
                  color="#64748B"
                  onPress={() => navigateToComplaints('Onhold')}
                />
                <StatCard
                  label="Resolved"
                  value={stats.completed}
                  icon="✅"
                  color="#10B981"
                  onPress={() => navigateToComplaints('Closed')}
                />
              </View>
            </View>

            {/* Quick Shortcuts */}
            <View style={styles.quickNavSection}>
              <Text style={styles.sectionTitle}>Quick Shortcuts</Text>

              <View style={styles.shortcutsGrid}>
                <GlassCard
                  style={styles.shortcutCard}
                  onPress={() => navigation.navigate('MyComplaints')}
                  intensity={30}
                >
                  <Text style={styles.shortcutIcon}>📝</Text>
                  <Text style={styles.shortcutTitle}>My Complaints</Text>
                  <Text style={styles.shortcutDesc}>View tickets raised by you</Text>
                </GlassCard>

                {isSuperAdmin && (
                  <>
                    <GlassCard
                      style={styles.shortcutCard}
                      onPress={() => navigation.navigate('AllComplaints')}
                      intensity={30}
                    >
                      <Text style={styles.shortcutIcon}>📂</Text>
                      <Text style={styles.shortcutTitle}>All Complaints</Text>
                      <Text style={styles.shortcutDesc}>Assign staff & track</Text>
                    </GlassCard>

                    <GlassCard
                      style={styles.shortcutCard}
                      onPress={() => navigation.navigate('Masters')}
                      intensity={30}
                    >
                      <Text style={styles.shortcutIcon}>🏛️</Text>
                      <Text style={styles.shortcutTitle}>Masters Hub</Text>
                      <Text style={styles.shortcutDesc}>Depts, Blocks, Rooms</Text>
                    </GlassCard>

                    <GlassCard
                      style={styles.shortcutCard}
                      onPress={() => navigation.navigate('Reports')}
                      intensity={30}
                    >
                      <Text style={styles.shortcutIcon}>📊</Text>
                      <Text style={styles.shortcutTitle}>Analytics</Text>
                      <Text style={styles.shortcutDesc}>Summaries & reports</Text>
                    </GlassCard>

                    <GlassCard
                      style={styles.shortcutCard}
                      onPress={() => navigation.navigate('UserHome')}
                      intensity={30}
                    >
                      <Text style={styles.shortcutIcon}>👤</Text>
                      <Text style={styles.shortcutTitle}>User Portal View</Text>
                      <Text style={styles.shortcutDesc}>Preview student dashboard</Text>
                    </GlassCard>
                  </>
                )}
              </View>
            </View>
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
    maxWidth: 560,
    alignSelf: 'center',
  },
  profileBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadgeText: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 16,
  },
  banner: {
    marginBottom: theme.spacing.xl,
  },
  bannerContent: {
    marginBottom: theme.spacing.lg,
  },
  greetingTitle: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  greetingName: {
    color: theme.colors.primary,
  },
  greetingSub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  raiseBtn: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  raiseBtnSolid: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raiseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  statsGrid: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickNavSection: {
    marginTop: theme.spacing.sm,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  shortcutCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 115,
    padding: theme.spacing.md,
  },
  shortcutIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  shortcutTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  shortcutDesc: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
