import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { complaintService, API_BASE_URL } from '../api/api';
import { ComplaintCard } from '../components/ComplaintCard';
import { StatusBadge } from '../components/StatusBadge';
import { Header } from '../components/Header';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';

const FILTER_STATUSES = ['All', 'Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];
const STATUS_OPTIONS = ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];

export const MyComplaintsScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const initialFilter = route.params?.initialFilter || 'All';

  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await complaintService.getAll();
      const rawList = res.data?.data || res.data || [];
      const allComplaints = Array.isArray(rawList) ? rawList : [];

      const userId = user?.id || user?._id;
      const userComplaints = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });

      setComplaints(userComplaints);
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (route.params?.initialFilter) {
      setFilterStatus(route.params.initialFilter);
    }
  }, [route.params?.initialFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus =
      filterStatus === 'All'
        ? true
        : c.status?.toLowerCase() === filterStatus.toLowerCase();

    if (!matchesStatus) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const type = (c.complaintType || '').toLowerCase();
    const block = (c.blockName || '').toLowerCase();
    const room = (c.roomNumber || '').toLowerCase();
    const remarks = (c.remarks || '').toLowerCase();
    return type.includes(q) || block.includes(q) || room.includes(q) || remarks.includes(q);
  });

  const handleStatusChange = async (newStatus) => {
    if (!selectedComplaint) return;
    try {
      setUpdatingStatus(true);
      await complaintService.updateStatus(selectedComplaint._id, newStatus);
      Alert.alert('Success', `Status updated to "${newStatus}"`);
      await loadData();
      const refreshed = (await complaintService.getById(selectedComplaint._id)).data;
      setSelectedComplaint(refreshed);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const backendHost = API_BASE_URL.replace(/\/api\/?$/, '');
  const modalAttachmentUrl = selectedComplaint?.attachment
    ? (selectedComplaint.attachment.startsWith('http')
        ? selectedComplaint.attachment
        : `${backendHost}${selectedComplaint.attachment}`)
    : null;

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="My Complaints"
          subtitle={`${complaints.length} tickets recorded`}
          rightAction={
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('NewComplaint')}
            >
              <Text style={styles.headerBtnText}>➕ New</Text>
            </TouchableOpacity>
          }
        />

        {/* Filter Status Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTER_STATUSES.map((status) => {
              const isActive = filterStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Glass Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="🔍 Search by issue, block, room..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Refracting complaint records...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredComplaints}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            renderItem={({ item }) => (
              <ComplaintCard
                complaint={item}
                onPress={() => setSelectedComplaint(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No complaints found</Text>
                <Text style={styles.emptySubtitle}>
                  {search ? 'Try clearing your search filter' : 'You have not raised any complaints yet'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('NewComplaint')}
                >
                  <Text style={styles.emptyBtnText}>+ Raise New Complaint</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Frosted Glass Detail Modal */}
        {selectedComplaint && (
          <Modal
            visible={!!selectedComplaint}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedComplaint(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Complaint Details</Text>
                    <Text style={styles.modalSubId}>ID: {selectedComplaint._id}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedComplaint(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <StatusBadge status={selectedComplaint.status} />
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue Type</Text>
                    <Text style={styles.detailValueBold}>
                      {selectedComplaint.complaintType}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {selectedComplaint.blockName} • Room {selectedComplaint.roomNumber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assigned Technician</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.assigned, fontWeight: '700' }]}>
                      {selectedComplaint.assignedTo?.username || 'Not yet assigned'}
                    </Text>
                  </View>

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Description & Remarks</Text>
                    <Text style={styles.remarksBox}>
                      {selectedComplaint.remarks || 'No remarks provided.'}
                    </Text>
                  </View>

                  {modalAttachmentUrl ? (
                    <View style={styles.detailBlock}>
                      <Text style={styles.detailLabel}>Attached Photo</Text>
                      <Image
                        source={{ uri: modalAttachmentUrl }}
                        style={styles.detailImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}

                  {/* Status Update Control */}
                  <View style={styles.statusUpdateSection}>
                    <Text style={styles.detailLabel}>Update Ticket Status</Text>
                    <View style={styles.statusChipsRow}>
                      {STATUS_OPTIONS.map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.statusChip,
                            selectedComplaint.status === st && styles.statusChipActive,
                          ]}
                          disabled={updatingStatus}
                          onPress={() => handleStatusChange(st)}
                        >
                          <Text
                            style={[
                              styles.statusChipText,
                              selectedComplaint.status === st && styles.statusChipTextActive,
                            ]}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
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
  headerBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  headerBtnText: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  filterSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 4,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  searchInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 14,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: theme.spacing.lg,
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    maxHeight: '85%',
    overflow: 'hidden',
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  modalSpecularRim: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
    zIndex: 2,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  modalSubId: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  modalScroll: {
    marginBottom: theme.spacing.lg,
    zIndex: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailLabel: {
    ...theme.typography.captionBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  detailValueBold: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
  },
  remarksBox: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: 6,
    lineHeight: 20,
  },
  detailImage: {
    width: '100%',
    height: 220,
    borderRadius: theme.borderRadius.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusUpdateSection: {
    paddingVertical: 16,
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: theme.colors.primary,
    borderTopColor: 'rgba(6, 182, 212, 0.8)',
  },
  statusChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
