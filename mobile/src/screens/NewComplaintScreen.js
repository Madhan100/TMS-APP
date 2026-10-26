import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { departmentService, blockService, roomService, complaintService } from '../api/api';
import { ModalPicker } from '../components/ModalPicker';
import { Header } from '../components/Header';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';

const COMPLAINT_TYPES = [
  'PC Hardware',
  'PC Software',
  'Application Issues',
  'Network',
  'Electronics',
  'Plumbing',
  'Other',
];

export const NewComplaintScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);

  const resolveCategory = (cat) => {
    if (!cat) return COMPLAINT_TYPES[0];
    if (cat.includes('Network') || cat.includes('Wi-Fi')) return 'Network';
    if (cat.includes('Electrical') || cat.includes('Electronics')) return 'Electronics';
    if (cat.includes('Plumbing')) return 'Plumbing';
    if (cat.includes('Hardware')) return 'PC Hardware';
    if (cat.includes('Software')) return 'PC Software';
    if (cat.includes('App')) return 'Application Issues';
    if (COMPLAINT_TYPES.includes(cat)) return cat;
    return COMPLAINT_TYPES[0];
  };

  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedBlockObj, setSelectedBlockObj] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [useCustomRoom, setUseCustomRoom] = useState(false);
  const [customRoomNumber, setCustomRoomNumber] = useState('');

  const [complaintType, setComplaintType] = useState(() =>
    resolveCategory(route?.params?.defaultCategory)
  );
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (route?.params?.defaultCategory) {
      setComplaintType(resolveCategory(route.params.defaultCategory));
    }
  }, [route?.params?.defaultCategory]);

  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load Departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoadingDepts(true);
        const res = await departmentService.getAll();
        const list = res.data?.data || res.data || [];
        setDepartments(list);
      } catch (err) {
        console.error('Failed to load departments', err);
        Alert.alert('Error', 'Failed to load departments');
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  // When Department changes, load Blocks
  const handleSelectDept = async (deptId) => {
    setSelectedDeptId(deptId);
    setSelectedBlockId('');
    setSelectedBlockObj(null);
    setSelectedRoomNumber('');
    setBlocks([]);
    setRooms([]);

    if (!deptId) return;
    try {
      setLoadingBlocks(true);
      const res = await blockService.getAll({ departmentId: deptId });
      const list = res.data?.data || res.data || [];
      setBlocks(list);
    } catch (err) {
      console.error('Failed to load blocks', err);
    } finally {
      setLoadingBlocks(false);
    }
  };

  // When Block changes, load Rooms
  const handleSelectBlock = async (blockId, blockItem) => {
    setSelectedBlockId(blockId);
    setSelectedBlockObj(blockItem);
    setSelectedRoomNumber('');
    setRooms([]);

    if (!blockId) return;
    try {
      setLoadingRooms(true);
      const res = await roomService.getAll({ blockId });
      const list = res.data?.data || res.data || [];
      setRooms(list);
    } catch (err) {
      console.error('Failed to load rooms', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Image Picker: Camera
  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to capture photos');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachment(result.assets[0]);
    }
  };

  // Image Picker: Library
  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Media library permission is required to choose photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachment(result.assets[0]);
    }
  };

  // Submit Complaint
  const handleSubmit = async () => {
    const blockName = selectedBlockObj?.name;
    const finalRoom = useCustomRoom ? customRoomNumber.trim() : selectedRoomNumber;

    if (!blockName) {
      Alert.alert('Missing Field', 'Please select a Block');
      return;
    }
    if (!finalRoom) {
      Alert.alert('Missing Field', 'Please select or enter a Room Number');
      return;
    }
    if (!complaintType) {
      Alert.alert('Missing Field', 'Please choose a Complaint Type');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('blockName', blockName);
      formData.append('roomNumber', finalRoom);
      formData.append('complaintType', complaintType);
      formData.append('remarks', remarks);

      if (attachment) {
        const uri = attachment.uri;
        const uriParts = uri.split('/');
        const fileName = attachment.fileName || uriParts[uriParts.length - 1] || 'photo.jpg';
        const fileType = attachment.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');

        formData.append('attachment', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: fileName,
          type: fileType,
        });
      }

      await complaintService.create(formData);

      Alert.alert('Success 🎉', 'Your complaint has been submitted successfully!', [
        {
          text: 'View My Complaints',
          onPress: () => navigation.navigate('MyComplaints'),
        },
        {
          text: 'Back to Home',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (err) {
      console.error('Complaint submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit complaint';
      Alert.alert('Submission Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="Raise Complaint"
          subtitle="Report an issue on campus"
          onBack={() => navigation.goBack()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              <GlassCard style={styles.formCard}>
                <Text style={styles.sectionTitle}>📍 Location Information</Text>

              {/* Department Picker */}
              <ModalPicker
                label="Department"
                placeholder={loadingDepts ? 'Loading departments...' : 'Select Department'}
                items={departments}
                value={selectedDeptId}
                onSelect={handleSelectDept}
                labelExtractor={(item) => `${item.name} (${item.shortName || ''})`}
                valueExtractor={(item) => item._id}
                required
              />

              {/* Block Picker */}
              <ModalPicker
                label="Block"
                placeholder={
                  !selectedDeptId
                    ? 'First select department'
                    : loadingBlocks
                    ? 'Loading blocks...'
                    : 'Select Block'
                }
                items={blocks}
                value={selectedBlockId}
                onSelect={handleSelectBlock}
                labelExtractor={(item) => item.name}
                valueExtractor={(item) => item._id}
                disabled={!selectedDeptId || loadingBlocks}
                required
              />

              {/* Room Mode Toggle */}
              <View style={styles.roomModeRow}>
                <Text style={styles.fieldLabel}>ROOM NUMBER *</Text>
                <TouchableOpacity
                  onPress={() => {
                    setUseCustomRoom(!useCustomRoom);
                    setSelectedRoomNumber('');
                    setCustomRoomNumber('');
                  }}
                >
                  <Text style={styles.roomToggleText}>
                    {useCustomRoom ? 'Select from list' : '+ Enter custom room'}
                  </Text>
                </TouchableOpacity>
              </View>

              {useCustomRoom ? (
                <TextInput
                  style={styles.input}
                  value={customRoomNumber}
                  onChangeText={setCustomRoomNumber}
                  placeholder="e.g. Lab 304, Room 12"
                  placeholderTextColor={theme.colors.textMuted}
                />
              ) : (
                <ModalPicker
                  placeholder={
                    !selectedBlockId
                      ? 'First select block'
                      : loadingRooms
                      ? 'Loading rooms...'
                      : 'Select Room Number'
                  }
                  items={rooms}
                  value={selectedRoomNumber}
                  onSelect={(val, item) => setSelectedRoomNumber(item.roomNumber || val)}
                  labelExtractor={(item) => `Room ${item.roomNumber || item.name}`}
                  valueExtractor={(item) => item.roomNumber || item.name}
                  disabled={!selectedBlockId || loadingRooms}
                />
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>🛠️ Issue Classification</Text>

              {/* Complaint Type Chips */}
              <Text style={styles.fieldLabel}>COMPLAINT TYPE *</Text>
              <View style={styles.typeChipsContainer}>
                {COMPLAINT_TYPES.map((type) => {
                  const isSelected = complaintType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        isSelected && styles.typeChipSelected,
                      ]}
                      onPress={() => setComplaintType(type)}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && styles.typeChipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description / Remarks */}
              <Text style={[styles.fieldLabel, { marginTop: theme.spacing.md }]}>
                ISSUE DESCRIPTION & REMARKS
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Describe the issue in detail (e.g., monitor display flicker, projector not turning on)..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.divider} />

              {/* Attachment Section */}
              <Text style={styles.sectionTitle}>📷 Photo Attachment (Optional)</Text>
              <Text style={styles.subtext}>
                Take a photo or upload a screenshot to assist technicians in resolving the issue faster.
              </Text>

              {attachment ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setAttachment(null)}
                  >
                    <Text style={styles.removeImageText}>✕ Remove Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.attachBtnRow}>
                  <TouchableOpacity style={styles.attachBtn} onPress={handleTakePhoto}>
                    <Text style={styles.attachBtnIcon}>📸</Text>
                    <Text style={styles.attachBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
                    <Text style={styles.attachBtnIcon}>🖼️</Text>
                    <Text style={styles.attachBtnText}>From Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Complaint Ticket →</Text>
                )}
              </TouchableOpacity>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    maxWidth: 580,
    alignSelf: 'center',
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  roomModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomToggleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 100,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: theme.spacing.lg,
  },
  typeChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  typeChipSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: theme.colors.primary,
    borderTopColor: 'rgba(6, 182, 212, 0.8)',
  },
  typeChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  typeChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  subtext: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  attachBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  attachBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachBtnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  attachBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  removeImageBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  removeImageText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
