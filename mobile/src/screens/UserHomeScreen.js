import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { complaintService, API_BASE_URL } from '../api/api';
import { Header } from '../components/Header';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';

export const UserHomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const res = await complaintService.getAll();
      const allComplaints = res.data?.data || res.data || [];
      const userId = user?.id || user?._id;

      // Filter complaints created by or assigned to this user
      const userList = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });

      // Sort newest first
      userList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setMyComplaints(userList);
      setStats({
        total: userList.length,
        pending: userList.filter((c) => c.status === 'Pending').length,
        assigned: userList.filter((c) => c.status === 'Assigned').length,
        inProgress: userList.filter((c) => c.status === 'In-Progress').length,
        completed: userList.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length,
      });
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
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

  const navigateToComplaints = (filterStatus = 'All') => {
    navigation.navigate('MyComplaints', { initialFilter: filterStatus });
  };

  const startComplaintWithCategory = (category) => {
    navigation.navigate('NewComplaint', { defaultCategory: category });
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const categories = [
    { title: 'Wi-Fi / Network', icon: '🌐', color: '#00f5ff', desc: 'Slow speed or lab LAN' },
    { title: 'Electrical', icon: '💡', color: '#facc15', desc: 'Fans, lights & sockets' },
    { title: 'Plumbing', icon: '🚰', color: '#38bdf8', desc: 'Leakage & water supply' },
    { title: 'PC Hardware', icon: '🖥️', color: '#a855f7', desc: 'Monitor, CPU & lab gear' },
  ];

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="User Portal"
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
            {/* User Hero Banner */}
            <GlassCard style={styles.heroBanner}>
              <View style={styles.userRoleRow}>
                <View style={styles.rolePill}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.roleText}>
                    {user?.role === 'User' ? 'STUDENT / USER PORTAL' : `${user?.role?.toUpperCase()} PORTAL`}
                  </Text>
                </View>
                {user?.department?.shortName || user?.department?.name ? (
                  <View style={styles.deptPill}>
                    <Text style={styles.deptPillText}>
                      🏛️ {user?.department?.shortName || user?.department?.name}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.welcomeTitle}>
                Hello, <Text style={styles.usernameHighlight}>{user?.username || 'User'}</Text> 👋
              </Text>
              <Text style={styles.welcomeSub}>
                Submit campus maintenance tickets and track real-time resolution progress.
              </Text>

              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => navigation.navigate('NewComplaint')}
                activeOpacity={0.85}
              >
                <View style={styles.ctaSolidBtn}>
                  <Text style={styles.ctaBtnIcon}>🚨</Text>
                  <Text style={styles.ctaBtnText}>Raise New Complaint Ticket</Text>
                  <Text style={styles.ctaArrow}>➔</Text>
                </View>
              </TouchableOpacity>
            </GlassCard>

            {/* Quick Stats Grid */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Ticket Statistics</Text>
              <TouchableOpacity onPress={() => navigateToComplaints('All')}>
                <Text style={styles.seeAllText}>View All ({stats.total}) ➔</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.statBoxWrapper}
                  onPress={() => navigateToComplaints('All')}
                  activeOpacity={0.75}
                >
                  <GlassCard style={styles.statBox}>
                    <View style={[styles.statIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <Text style={styles.statIcon}>📋</Text>
                    </View>
                    <View style={styles.statTextGroup}>
                      <Text style={[styles.statValue, { color: '#60A5FA' }]}>{stats.total}</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>Total Raised</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statBoxWrapper}
                  onPress={() => navigateToComplaints('Pending')}
                  activeOpacity={0.75}
                >
                  <GlassCard style={styles.statBox}>
                    <View style={[styles.statIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Text style={styles.statIcon}>⏳</Text>
                    </View>
                    <View style={styles.statTextGroup}>
                      <Text style={[styles.statValue, { color: '#FBBF24' }]}>{stats.pending}</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>Pending</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.statBoxWrapper}
                  onPress={() => navigateToComplaints('In-Progress')}
                  activeOpacity={0.75}
                >
                  <GlassCard style={styles.statBox}>
                    <View style={[styles.statIconWrap, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                      <Text style={styles.statIcon}>⚙️</Text>
                    </View>
                    <View style={styles.statTextGroup}>
                      <Text style={[styles.statValue, { color: '#38BDF8' }]}>{stats.inProgress}</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>In-Progress</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statBoxWrapper}
                  onPress={() => navigateToComplaints('Closed')}
                  activeOpacity={0.75}
                >
                  <GlassCard style={styles.statBox}>
                    <View style={[styles.statIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <Text style={styles.statIcon}>✅</Text>
                    </View>
                    <View style={styles.statTextGroup}>
                      <Text style={[styles.statValue, { color: '#34D399' }]}>{stats.completed}</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>Resolved</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick 1-Tap Category Hub */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Quick Report by Category</Text>
              <Text style={styles.sectionSubHint}>1-Tap Preset</Text>
            </View>

            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.title}
                  style={styles.categoryCardWrapper}
                  onPress={() => startComplaintWithCategory(cat.title)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={styles.categoryCard}>
                    <View style={[styles.categoryIconWrap, { backgroundColor: `${cat.color}25`, borderColor: `${cat.color}50`, borderWidth: 1 }]}>
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    </View>
                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                    <Text style={styles.categoryDesc}>{cat.desc}</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Complaints Live Tracker */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Tickets Tracker</Text>
              <TouchableOpacity onPress={() => navigateToComplaints('All')}>
                <Text style={styles.seeAllText}>History ➔</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={theme.colors.primary} size="small" />
                <Text style={styles.loadingText}>Syncing ticket statuses...</Text>
              </View>
            ) : myComplaints.length === 0 ? (
              <GlassCard style={styles.emptyCard} intensity={30}>
                <Text style={styles.emptyIcon}>🎉</Text>
                <Text style={styles.emptyTitle}>No Active Complaints</Text>
                <Text style={styles.emptyDesc}>
                  You have no pending complaints. Everything in your campus facilities is running smoothly!
                </Text>
                <TouchableOpacity
                  style={styles.emptyRaiseBtn}
                  onPress={() => navigation.navigate('NewComplaint')}
                >
                  <Text style={styles.emptyRaiseBtnText}>➕ Report an Issue Now</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : (
              <View style={styles.recentList}>
                {myComplaints.slice(0, 3).map((complaint) => (
                  <TouchableOpacity
                    key={complaint._id || complaint.id}
                    onPress={() => setSelectedComplaint(complaint)}
                    activeOpacity={0.85}
                  >
                    <GlassCard style={styles.ticketCard} intensity={35}>
                      <View style={styles.ticketHeaderRow}>
                        <View style={styles.ticketTypeBadge}>
                          <Text style={styles.ticketTypeText}>
                            {complaint.complaintType || 'General Issue'}
                          </Text>
                        </View>
                        <StatusBadge status={complaint.status} />
                      </View>

                      <Text style={styles.ticketDesc} numberOfLines={2}>
                        {complaint.remarks || 'No detailed remarks provided.'}
                      </Text>

                      <View style={styles.ticketFooter}>
                        <View style={styles.ticketMetaItem}>
                          <Text style={styles.ticketMetaIcon}>📍</Text>
                          <Text style={styles.ticketMetaText}>
                            {complaint.blockName || 'Main Block'} • Room {complaint.roomNumber || 'N/A'}
                          </Text>
                        </View>
                        {complaint.assignedTo ? (
                          <View style={styles.assignedPill}>
                            <Text style={styles.assignedText}>
                              👤 {complaint.assignedTo?.username || 'Technician Assigned'}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Helpdesk & Campus Emergency Box */}
            <GlassCard style={styles.helpdeskCard} intensity={30}>
              <View style={styles.helpdeskHeader}>
                <Text style={styles.helpdeskIcon}>📞</Text>
                <View>
                  <Text style={styles.helpdeskTitle}>Campus Facilities Helpdesk</Text>
                  <Text style={styles.helpdeskSub}>Need urgent repair assistance?</Text>
                </View>
              </View>
              <Text style={styles.helpdeskNumbers}>
                ⚡ Emergency Hotline: <Text style={styles.highlightVal}>+91 98765 43210</Text>
                {'\n'}🌐 IT & Network Support: <Text style={styles.highlightVal}>Ext. 104</Text>
                {'\n'}✉️ Support Email: <Text style={styles.highlightVal}>support@tms.campus.edu</Text>
              </Text>
            </GlassCard>
          </View>
        </ScrollView>

        {/* Complaint Detail Modal */}
        {selectedComplaint && (
          <Modal
            visible={!!selectedComplaint}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedComplaint(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {Platform.OS === 'ios' && (
                  <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
                )}
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(10, 15, 30, 0.96)']}
                  style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ticket Details</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedComplaint(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalScroll}>
                  <View style={styles.modalStatusRow}>
                    <Text style={styles.modalType}>
                      {selectedComplaint.complaintType || 'General Issue'}
                    </Text>
                    <StatusBadge status={selectedComplaint.status} />
                  </View>

                  <View style={styles.modalInfoCard}>
                    <Text style={styles.modalLabel}>LOCATION</Text>
                    <Text style={styles.modalValue}>
                      {selectedComplaint.blockName || 'Main Block'} • Room {selectedComplaint.roomNumber || 'N/A'}
                    </Text>

                    <Text style={[styles.modalLabel, { marginTop: 12 }]}>DATE LOGGED</Text>
                    <Text style={styles.modalValue}>
                      {selectedComplaint.createdAt
                        ? new Date(selectedComplaint.createdAt).toLocaleString()
                        : 'Recent'}
                    </Text>

                    {selectedComplaint.assignedTo && (
                      <>
                        <Text style={[styles.modalLabel, { marginTop: 12 }]}>ASSIGNED TECHNICIAN</Text>
                        <Text style={styles.modalValue}>
                          👤 {selectedComplaint.assignedTo?.username || 'Staff'} ({selectedComplaint.assignedTo?.role || 'Technician'})
                        </Text>
                      </>
                    )}

                    <Text style={[styles.modalLabel, { marginTop: 12 }]}>REMARKS & DESCRIPTION</Text>
                    <Text style={styles.modalDesc}>
                      {selectedComplaint.remarks || 'No detailed remarks.'}
                    </Text>

                    {selectedComplaint.imageUrl && (
                      <View style={styles.imageBox}>
                        <Text style={[styles.modalLabel, { marginTop: 12 }]}>ATTACHED PHOTO</Text>
                        <Image
                          source={{
                            uri: selectedComplaint.imageUrl.startsWith('http')
                              ? selectedComplaint.imageUrl
                              : `${API_BASE_URL.replace('/api', '')}/${selectedComplaint.imageUrl.replace(/^\/+/, '')}`,
                          }}
                          style={styles.modalImg}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
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
  heroBanner: {
    marginBottom: theme.spacing.xl,
  },
  userRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: 'rgba(37, 99, 235, 0.35)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  deptPill: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deptPillText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  welcomeTitle: {
    ...theme.typography.h1,
    color: '#ffffff',
  },
  usernameHighlight: {
    color: '#60A5FA',
  },
  welcomeSub: {
    ...theme.typography.body,
    color: '#94a3b8',
    marginTop: 6,
    marginBottom: theme.spacing.lg,
  },
  primaryCtaBtn: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaSolidBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  ctaBtnIcon: {
    fontSize: 16,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
  },
  sectionSubHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBoxWrapper: {
    flex: 1,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
  },
  statTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  categoryCardWrapper: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  categoryCard: {
    padding: theme.spacing.md,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTitle: {
    ...theme.typography.bodyBold,
    color: '#f8fafc',
    fontSize: 13,
  },
  categoryDesc: {
    ...theme.typography.caption,
    color: '#94a3b8',
    marginTop: 2,
  },
  recentList: {
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  ticketCard: {
    padding: theme.spacing.md,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketTypeText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
  },
  ticketDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  ticketMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketMetaIcon: {
    fontSize: 12,
  },
  ticketMetaText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  assignedPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  assignedText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: '#ffffff',
  },
  emptyDesc: {
    ...theme.typography.caption,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyRaiseBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyRaiseBtnText: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 13,
  },
  helpdeskCard: {
    marginBottom: theme.spacing.lg,
  },
  helpdeskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  helpdeskIcon: {
    fontSize: 26,
  },
  helpdeskTitle: {
    ...theme.typography.bodyBold,
    color: '#ffffff',
  },
  helpdeskSub: {
    ...theme.typography.caption,
    color: '#94a3b8',
  },
  helpdeskNumbers: {
    ...theme.typography.caption,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  highlightVal: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(11, 15, 25, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxHeight: '80%',
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    paddingBottom: 40,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38bdf8',
  },
  modalInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 2,
  },
  modalDesc: {
    fontSize: 13,
    color: '#e2e8f0',
    marginTop: 4,
    lineHeight: 19,
  },
  imageBox: {
    marginTop: 8,
  },
  modalImg: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.md,
    marginTop: 8,
  },
});
