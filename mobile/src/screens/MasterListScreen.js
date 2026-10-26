import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import {
  departmentService,
  programmeService,
  blockService,
  roomService,
  roleService,
  userService,
} from '../api/api';
import { Header } from '../components/Header';
import { ModalPicker } from '../components/ModalPicker';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';

export const MasterListScreen = ({ route, navigation }) => {
  const { moduleType, title } = route.params;

  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const getService = () => {
    switch (moduleType) {
      case 'departments':
        return departmentService;
      case 'programmes':
        return programmeService;
      case 'blocks':
        return blockService;
      case 'rooms':
        return roomService;
      case 'roles':
        return roleService;
      case 'users':
        return userService;
      default:
        return null;
    }
  };

  const loadData = useCallback(async () => {
    const s = getService();
    if (!s) return;

    try {
      setLoading(true);
      const res = await s.getAll();
      const list = res.data?.data || res.data || [];
      setItems(list);

      if (['programmes', 'blocks', 'rooms', 'users'].includes(moduleType)) {
        const dRes = await departmentService.getAll();
        setDepartments(dRes.data?.data || dRes.data || []);
      }
      if (['blocks', 'rooms'].includes(moduleType)) {
        const pRes = await programmeService.getAll();
        setProgrammes(pRes.data?.data || pRes.data || []);
      }
      if (moduleType === 'rooms') {
        const bRes = await blockService.getAll();
        setBlocks(bRes.data?.data || bRes.data || []);
      }
      if (moduleType === 'users') {
        const rRes = await roleService.getAll();
        setRoles(rRes.data?.data || rRes.data || []);
      }
    } catch (err) {
      console.error(`Failed to load ${moduleType}:`, err);
      Alert.alert('Error', `Failed to load ${title}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [moduleType, title]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const s = getService();
            await s.delete(id);
            Alert.alert('Deleted', 'Record removed successfully');
            loadData();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || err.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    const payload = { ...formData };

    // Normalize IDs to both styles for robustness
    if (payload.departmentId && !payload.department) {
      payload.department = payload.departmentId;
    }
    if (payload.department && !payload.departmentId) {
      payload.departmentId = payload.department;
    }
    if (payload.blockId && !payload.block) {
      payload.block = payload.blockId;
    }
    if (payload.block && !payload.blockId) {
      payload.blockId = payload.block;
    }
    if (payload.programmeId && !payload.programme) {
      payload.programme = payload.programmeId;
    }
    if (payload.programme && !payload.programmeId) {
      payload.programmeId = payload.programme;
    }

    // Client-side validations
    if (moduleType === 'departments') {
      if (!payload.name?.trim()) {
        Alert.alert('Required Field', 'Please enter a Department Name.');
        return;
      }
      let sCode = (payload.shortName || '').trim().toUpperCase();
      if (!sCode) {
        const words = payload.name.trim().split(/\s+/);
        sCode = words.length > 1
          ? words.map((w) => w[0]).join('').slice(0, 6)
          : payload.name.trim().slice(0, 4);
      }
      if (sCode.length < 2 || sCode.length > 8) {
        Alert.alert('Invalid Short Code', 'Short code must be between 2 and 8 characters (e.g. CSE, MECH).');
        return;
      }
      payload.shortName = sCode;
    } else if (moduleType === 'programmes') {
      if (!payload.name?.trim()) {
        Alert.alert('Required Field', 'Please enter a Programme Name.');
        return;
      }
      if (!payload.department) {
        Alert.alert('Required Field', 'Please select a Department. If none exists, create a Department first.');
        return;
      }
      let sCode = (payload.shortName || '').trim().toUpperCase();
      if (!sCode) {
        const words = payload.name.trim().split(/\s+/);
        sCode = words.length > 1
          ? words.map((w) => w[0]).join('').slice(0, 6)
          : payload.name.trim().slice(0, 4);
      }
      if (sCode.length < 2 || sCode.length > 8) {
        Alert.alert('Invalid Short Code', 'Short code must be between 2 and 8 characters (e.g. MCA, BTCS).');
        return;
      }
      payload.shortName = sCode;
    } else if (moduleType === 'blocks') {
      if (!payload.name?.trim()) {
        Alert.alert('Required Field', 'Please enter a Campus Block Name.');
        return;
      }
      if (!payload.department) {
        Alert.alert('Required Field', 'Please select a Department.');
        return;
      }
    } else if (moduleType === 'rooms') {
      const roomNum = (payload.roomNumber || payload.name || '').trim();
      if (!roomNum) {
        Alert.alert('Required Field', 'Please enter a Room Number or Name.');
        return;
      }
      payload.roomNumber = roomNum;
      if (!payload.block) {
        Alert.alert('Required Field', 'Please select a Campus Block.');
        return;
      }
    } else if (moduleType === 'roles') {
      if (!payload.name?.trim()) {
        Alert.alert('Required Field', 'Please enter a Role Name.');
        return;
      }
    } else if (moduleType === 'users') {
      if (!payload.username?.trim()) {
        Alert.alert('Required Field', 'Please enter a Username.');
        return;
      }
      if (!payload.email?.trim()) {
        Alert.alert('Required Field', 'Please enter an Email Address.');
        return;
      }
      if (!payload.password?.trim()) {
        Alert.alert('Required Field', 'Please enter a Password.');
        return;
      }
      if (!payload.role) {
        payload.role = 'User';
      }
    }

    try {
      setSaving(true);
      const s = getService();
      await s.create(payload);
      Alert.alert('Success', `${title.slice(0, -1) || 'Record'} created successfully!`);
      setShowAddModal(false);
      setFormData({});
      loadData();
    } catch (err) {
      console.error(`Failed to create ${moduleType}:`, err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create record';
      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (item.name || item.roomNumber || item.username || '').toLowerCase();
    const sub = (item.shortName || item.email || item.role || '').toLowerCase();
    return name.includes(q) || sub.includes(q);
  });

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title={title}
          subtitle={`${items.length} records`}
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setFormData({});
                setShowAddModal(true);
              }}
            >
              <Text style={styles.addBtnText}>+ Add New</Text>
            </TouchableOpacity>
          }
        />

        {/* Glass Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={`🔍 Search ${title.toLowerCase()}...`}
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Refracting master records...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item._id || item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            renderItem={({ item }) => {
              const displayName = item.roomNumber
                ? `Room ${item.roomNumber}`
                : item.name || item.username || 'Record';
              const deptName = item.department?.name || item.departmentId?.name;
              const blockName = item.block?.name || item.blockId?.name || item.blockName;
              const progName = item.programme?.name || item.programmeId?.name;

              return (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{displayName}</Text>

                    {item.shortName ? (
                      <Text style={styles.itemSubtitle}>Code: {item.shortName}</Text>
                    ) : null}

                    {item.email ? (
                      <Text style={styles.itemSubtitle}>{item.email} • {item.role || 'User'}</Text>
                    ) : null}

                    {blockName ? (
                      <Text style={styles.itemSubtitle}>Block: {blockName}</Text>
                    ) : null}

                    {deptName ? (
                      <Text style={styles.itemSubtitle}>Dept: {deptName}</Text>
                    ) : null}

                    {progName ? (
                      <Text style={styles.itemSubtitle}>Prog: {progName}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item._id || item.id)}
                  >
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No records found</Text>
              </View>
            }
          />
        )}

        {/* Add Modal with Liquid Glass Finish */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>+ Create {title.slice(0, -1) || 'Record'}</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {moduleType === 'departments' && (
                  <>
                    <Text style={styles.fieldLabel}>DEPARTMENT NAME *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Computer Science & Engineering"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.name || ''}
                      onChangeText={(t) => setFormData({ ...formData, name: t })}
                    />

                    <Text style={styles.fieldLabel}>SHORT CODE (2-8 CHARS) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. CSE"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.shortName || ''}
                      autoCapitalize="characters"
                      maxLength={8}
                      onChangeText={(t) => setFormData({ ...formData, shortName: t.toUpperCase() })}
                    />

                    <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Brief description"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.description || ''}
                      onChangeText={(t) => setFormData({ ...formData, description: t })}
                    />
                  </>
                )}

                {moduleType === 'programmes' && (
                  <>
                    {departments.length === 0 && (
                      <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                          ⚠️ No departments found yet. Please create a Department first before adding a Programme.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.fieldLabel}>PROGRAMME NAME *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. B.Tech Computer Science"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.name || ''}
                      onChangeText={(t) => setFormData({ ...formData, name: t })}
                    />

                    <Text style={styles.fieldLabel}>SHORT CODE (2-8 CHARS) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. BTCS, MCA, BE-CSE"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.shortName || ''}
                      autoCapitalize="characters"
                      maxLength={8}
                      onChangeText={(t) => setFormData({ ...formData, shortName: t.toUpperCase() })}
                    />

                    <ModalPicker
                      label="DEPARTMENT *"
                      placeholder="Select Department"
                      items={departments}
                      value={formData.department || formData.departmentId}
                      onSelect={(val) => setFormData({ ...formData, department: val, departmentId: val })}
                      labelExtractor={(d) => d.name + (d.shortName ? ` (${d.shortName})` : '')}
                      valueExtractor={(d) => d._id}
                      required
                    />

                    <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Brief description of programme"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.description || ''}
                      onChangeText={(t) => setFormData({ ...formData, description: t })}
                    />
                  </>
                )}

                {moduleType === 'blocks' && (
                  <>
                    {departments.length === 0 && (
                      <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                          ⚠️ No departments found yet. Please create a Department first.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.fieldLabel}>BLOCK NAME *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Science Block, Ramanujan Bhavan"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.name || ''}
                      onChangeText={(t) => setFormData({ ...formData, name: t })}
                    />

                    <ModalPicker
                      label="DEPARTMENT *"
                      placeholder="Select Department"
                      items={departments}
                      value={formData.department || formData.departmentId}
                      onSelect={(val) => setFormData({ ...formData, department: val, departmentId: val })}
                      labelExtractor={(d) => d.name + (d.shortName ? ` (${d.shortName})` : '')}
                      valueExtractor={(d) => d._id}
                      required
                    />

                    {programmes.length > 0 && (
                      <ModalPicker
                        label="PROGRAMME (OPTIONAL)"
                        placeholder="Select Programme"
                        items={programmes}
                        value={formData.programme || formData.programmeId}
                        onSelect={(val) => setFormData({ ...formData, programme: val, programmeId: val })}
                        labelExtractor={(p) => p.name + (p.shortName ? ` (${p.shortName})` : '')}
                        valueExtractor={(p) => p._id}
                      />
                    )}

                    <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Building details / location notes"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.description || ''}
                      onChangeText={(t) => setFormData({ ...formData, description: t })}
                    />
                  </>
                )}

                {moduleType === 'rooms' && (
                  <>
                    {blocks.length === 0 && (
                      <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                          ⚠️ No campus blocks found yet. Please create a Campus Block first.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.fieldLabel}>ROOM NUMBER / NAME *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 101, Lab 3, Auditorium"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.roomNumber || formData.name || ''}
                      onChangeText={(t) => setFormData({ ...formData, roomNumber: t, name: t })}
                    />

                    <ModalPicker
                      label="CAMPUS BLOCK *"
                      placeholder="Select Block"
                      items={blocks}
                      value={formData.block || formData.blockId}
                      onSelect={(val) => setFormData({ ...formData, block: val, blockId: val })}
                      labelExtractor={(b) => b.name}
                      valueExtractor={(b) => b._id}
                      required
                    />

                    <Text style={styles.fieldLabel}>FLOOR (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 1, 2, 3"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                      value={formData.floor !== undefined ? String(formData.floor) : ''}
                      onChangeText={(t) => setFormData({ ...formData, floor: t })}
                    />

                    <Text style={styles.fieldLabel}>CAPACITY (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 60"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                      value={formData.capacity !== undefined ? String(formData.capacity) : ''}
                      onChangeText={(t) => setFormData({ ...formData, capacity: t })}
                    />

                    <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Room equipment / facilities description"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.description || ''}
                      onChangeText={(t) => setFormData({ ...formData, description: t })}
                    />
                  </>
                )}

                {moduleType === 'roles' && (
                  <>
                    <Text style={styles.fieldLabel}>ROLE NAME *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Technician, Faculty, Electrician"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.name || ''}
                      onChangeText={(t) => setFormData({ ...formData, name: t })}
                    />

                    <Text style={styles.fieldLabel}>DESCRIPTION</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Brief description of role responsibilities"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.description || ''}
                      onChangeText={(t) => setFormData({ ...formData, description: t })}
                    />
                  </>
                )}

                {moduleType === 'users' && (
                  <>
                    <Text style={styles.fieldLabel}>USERNAME *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. john_doe"
                      placeholderTextColor={theme.colors.textMuted}
                      value={formData.username || ''}
                      onChangeText={(t) => setFormData({ ...formData, username: t })}
                    />

                    <Text style={styles.fieldLabel}>EMAIL ADDRESS *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. user@campus.edu"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email || ''}
                      onChangeText={(t) => setFormData({ ...formData, email: t })}
                    />

                    <Text style={styles.fieldLabel}>PASSWORD *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter account password"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      value={formData.password || ''}
                      onChangeText={(t) => setFormData({ ...formData, password: t })}
                    />

                    <ModalPicker
                      label="ROLE *"
                      placeholder="Select Role"
                      items={roles.length ? roles : [{ name: 'User' }, { name: 'SuperAdmin' }, { name: 'Staff' }]}
                      value={formData.role}
                      onSelect={(val) => setFormData({ ...formData, role: val })}
                      labelExtractor={(r) => r.name}
                      valueExtractor={(r) => r.name}
                      required
                    />

                    <ModalPicker
                      label="DEPARTMENT"
                      placeholder="Select Department (Optional)"
                      items={departments}
                      value={formData.department || formData.departmentId}
                      onSelect={(val) => setFormData({ ...formData, department: val, departmentId: val })}
                      labelExtractor={(d) => d.name}
                      valueExtractor={(d) => d._id}
                    />
                  </>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={handleCreate}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    {saving ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Record</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LiquidGlassBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  searchBar: {
    padding: theme.spacing.lg,
    paddingBottom: 4,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  searchInput: {
    backgroundColor: '#0F172A',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#1E293B',
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: 10,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  itemCard: {
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  itemSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginLeft: 12,
    zIndex: 2,
  },
  deleteText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    borderRadius: 16,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '85%',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
  modalScroll: {
    maxHeight: 460,
  },
  fieldLabel: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#090D1A',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
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
  warningBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: '#EAB308',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  warningText: {
    color: '#FDE047',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
