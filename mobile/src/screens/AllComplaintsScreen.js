import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
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
import { complaintService, userService } from '../api/api';
import { ComplaintCard } from '../components/ComplaintCard';
import { Header } from '../components/Header';
import { ModalPicker } from '../components/ModalPicker';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';

const FILTER_STATUSES = ['All', 'Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];
const STATUS_OPTIONS = ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];

export const AllComplaintsScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const initialFilter = route.params?.initialFilter || 'All';

  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assign Modal
  const [assignTargetComplaint, setAssignTargetComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Status Modal
  const [statusTargetComplaint, setStatusTargetComplaint] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const list = res.data?.data || res.data || [];
      setComplaints(Array.isArray(list) ? list : []);

      if (user?.role === 'SuperAdmin') {
        try {
          const userRes = await userService.getAll();
          const userList = userRes.data?.data || userRes.data || [];
          setUsers(Array.isArray(userList) ? userList : []);
        } catch (e) {
          console.warn('Failed to load users for assignment', e);
        }
      }
    } catch (err) {
      console.error('Failed to load all complaints:', err);
      Alert.alert('Error', 'Failed to load complaints');
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

  const filteredComplaints = (Array.isArray(complaints) ? complaints : []).filter((c) => {
    if (!c) return false;
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
    const creator = (c.createdBy?.username || '').toLowerCase();
    const assignee = (c.assignedTo?.username || '').toLowerCase();
    return type.includes(q) || block.includes(q) || room.includes(q) || creator.includes(q) || assignee.includes(q);
  });

  const handleAssignSubmit = async () => {
    if (!selectedStaffId) {
      Alert.alert('Selection Required', 'Please select a staff member');
      return;
    }
    try {
      setSubmittingAssign(true);
      await complaintService.assign(assignTargetComplaint._id, selectedStaffId);
      Alert.alert('Success', 'Staff assigned successfully');
      setAssignTargetComplaint(null);
      setSelectedStaffId('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign staff');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!selectedNewStatus) {
      Alert.alert('Selection Required', 'Please select a status');
      return;
    }
    try {
      setSubmittingStatus(true);
      await complaintService.updateStatus(statusTargetComplaint._id, selectedNewStatus);
      Alert.alert('Success', `Status updated to ${selectedNewStatus}`);
      setStatusTargetComplaint(null);
      setSelectedNewStatus('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="All Complaints"
          subtitle="Manage tickets & staff assignments"
          rightAction={
            <TouchableOpacity
              style={styles.refreshIconBtn}
              onPress={onRefresh}
            >
              <Text style={styles.refreshIconText}>🔄</Text>
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

        {/* Glass Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="🔍 Search tickets, users, rooms..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* Complaints List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Fetching system complaints...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredComplaints}
            keyExtractor={(item, index) => item?._id || String(index)}
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
                showAdminActions={true}
                onAssign={(c) => {
                  setAssignTargetComplaint(c);
                  setSelectedStaffId(c.assignedTo?._id || '');
                }}
                onStatusChange={(c) => {
                  setStatusTargetComplaint(c);
                  setSelectedNewStatus(c.status || '');
                }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyTitle}>No matching complaints</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your filter or search criteria</Text>
              </View>
            }
          />
        )}

        {/* Assign Modal with Liquid Glass Finish */}
        {assignTargetComplaint && (
          <Modal
            visible={!!assignTargetComplaint}
            transparent
            animationType="fade"
            onRequestClose={() => setAssignTargetComplaint(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>👤 Assign Technician / Staff</Text>
                  <TouchableOpacity onPress={() => setAssignTargetComplaint(null)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtext}>
                  Assigning issue in {assignTargetComplaint?.blockName || 'Block'} Room {assignTargetComplaint?.roomNumber || 'N/A'} ({assignTargetComplaint?.complaintType || 'Complaint'})
                </Text>

                <ModalPicker
                  label="SELECT STAFF MEMBER"
                  placeholder="Choose user from directory"
                  items={users}
                  value={selectedStaffId}
                  onSelect={(val) => setSelectedStaffId(val)}
                  labelExtractor={(u) => `${u.username} (${u.role || 'Staff'}) - ${u.email}`}
                  valueExtractor={(u) => u._id}
                  required
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setAssignTargetComplaint(null)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, submittingAssign && { opacity: 0.6 }]}
                    onPress={handleAssignSubmit}
                    disabled={submittingAssign}
                    activeOpacity={0.85}
                  >
                    {submittingAssign ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>Confirm Assignment</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Status Modal with Liquid Glass Finish */}
        {statusTargetComplaint && (
          <Modal
            visible={!!statusTargetComplaint}
            transparent
            animationType="fade"
            onRequestClose={() => setStatusTargetComplaint(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>⚡ Change Status</Text>
                  <TouchableOpacity onPress={() => setStatusTargetComplaint(null)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtext}>
                  Select the new progress status for Ticket #{String(statusTargetComplaint?._id || '').substring(0, 8)}
                </Text>

                <View style={styles.statusChipsGrid}>
                  {STATUS_OPTIONS.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusOptionChip,
                        selectedNewStatus === st && styles.statusOptionChipActive,
                      ]}
                      onPress={() => setSelectedNewStatus(st)}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          selectedNewStatus === st && styles.statusOptionTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setStatusTargetComplaint(null)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, submittingStatus && { opacity: 0.6 }]}
                    onPress={handleStatusSubmit}
                    disabled={submittingStatus}
                    activeOpacity={0.85}
                  >
                    {submittingStatus ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Status</Text>
                    )}
                  </TouchableOpacity>
                </View>
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
  refreshIconBtn: {
    padding: 8,
  },
  refreshIconText: {
    fontSize: 18,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0F172A',
  },
  modalSpecularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    zIndex: 2,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    lineHeight: 16,
    zIndex: 2,
  },
  statusChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.lg,
    zIndex: 2,
  },
  statusOptionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexBasis: '47%',
    alignItems: 'center',
  },
  statusOptionChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#3B82F6',
  },
  statusOptionText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.md,
    zIndex: 2,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
