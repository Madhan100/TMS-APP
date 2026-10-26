import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

export const ModalPicker = ({
  label,
  placeholder = 'Select option',
  items = [],
  value,
  onSelect,
  keyExtractor = (item) => item.value || item._id || item.id,
  labelExtractor = (item) => item.label || item.name || String(item),
  valueExtractor = (item) => item.value || item._id || item.id || item,
  disabled = false,
  required = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find((item) => valueExtractor(item) === value);
  const displayLabel = selectedItem ? labelExtractor(selectedItem) : '';

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const text = labelExtractor(item).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.fieldLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.75}
        onPress={() => !disabled && setVisible(true)}
        style={[
          styles.trigger,
          disabled && styles.triggerDisabled,
          !displayLabel && styles.triggerPlaceholder,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            !displayLabel && { color: theme.colors.textMuted },
            disabled && { color: theme.colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {displayLabel || placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {items.length > 6 && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search options..."
                placeholderTextColor={theme.colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            )}

            <FlatList
              data={filteredItems}
              keyExtractor={(item, idx) => String(keyExtractor(item) || idx)}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const itemVal = valueExtractor(item);
                const isSelected = itemVal === value;
                const itemText = labelExtractor(item);

                return (
                  <TouchableOpacity
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                    onPress={() => {
                      onSelect(itemVal, item);
                      setVisible(false);
                      setSearch('');
                    }}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        isSelected && styles.itemTextSelected,
                      ]}
                    >
                      {itemText}
                    </Text>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: theme.colors.danger,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerPlaceholder: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  triggerText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '80%',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#090D1A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    margin: theme.spacing.md,
    fontSize: 14,
  },
  list: {
    maxHeight: 380,
    zIndex: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  itemRowSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  itemText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  itemTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  checkMark: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  empty: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
