import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { StatusBadge } from './StatusBadge';
import { API_BASE_URL } from '../api/api';

export const ComplaintCard = ({
  complaint,
  onPress,
  onAssign,
  onStatusChange,
  showAdminActions = false,
}) => {
  const dateStr = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const backendHost = API_BASE_URL.replace(/\/api\/?$/, '');
  const attachmentUrl = complaint.attachment
    ? (complaint.attachment.startsWith('http')
        ? complaint.attachment
        : `${backendHost}${complaint.attachment}`)
    : null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Assigned': return '#8B5CF6';
      case 'In-Progress': return '#38BDF8';
      case 'Onhold':
      case 'On Hold': return '#64748B';
      case 'Closed':
      case 'Resolved': return '#10B981';
      default: return '#3B82F6';
    }
  };
  const statusColor = getStatusColor(complaint.status);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.cardContainer,
        { borderLeftColor: statusColor, borderLeftWidth: 4 },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeIcon}>🔧</Text>
            <Text style={styles.typeText} numberOfLines={1}>
              {complaint.complaintType || 'General'}
            </Text>
          </View>
          <StatusBadge status={complaint.status} size="small" />
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locBadge}>
            <Text style={styles.locIcon}>🏢</Text>
            <Text style={styles.locText}>
              {complaint.blockName || 'Block'} • Room {complaint.roomNumber || 'N/A'}
            </Text>
          </View>
          {dateStr ? <Text style={styles.dateText}>{dateStr}</Text> : null}
        </View>

        {complaint.remarks ? (
          <Text style={styles.remarks} numberOfLines={2}>
            {complaint.remarks}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.userInfo}>
            {complaint.createdBy ? (
              <Text style={styles.userText} numberOfLines={1}>
                By: {complaint.createdBy.username || 'User'}
              </Text>
            ) : null}
            {complaint.assignedTo ? (
              <Text style={styles.assignedText} numberOfLines={1}>
                Assigned: {complaint.assignedTo.username || 'Staff'}
              </Text>
            ) : (
              <Text style={styles.unassignedText}>Unassigned</Text>
            )}
          </View>

          {attachmentUrl ? (
            <View style={styles.attachmentBadge}>
              <Text style={styles.attachmentIcon}>📎 Photo</Text>
            </View>
          ) : null}
        </View>

        {showAdminActions && (
          <View style={styles.actionButtons}>
            {onAssign && (
              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={() => onAssign(complaint)}
              >
                <Text style={styles.actionBtnOutlineText}>
                  {complaint.assignedTo ? 'Reassign' : 'Assign Staff'}
                </Text>
              </TouchableOpacity>
            )}
            {onStatusChange && (
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => onStatusChange(complaint)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnPrimaryText}>Update Status</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1.5,
    zIndex: 2,
  },
  content: {
    padding: theme.spacing.lg,
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    maxWidth: '65%',
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  typeText: {
    ...theme.typography.captionBold,
    color: theme.colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.sm,
  },
  locBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  locText: {
    ...theme.typography.bodyBold,
    color: '#60A5FA',
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  remarks: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  userInfo: {
    flex: 1,
  },
  userText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  assignedText: {
    ...theme.typography.captionBold,
    color: theme.colors.assigned,
    marginTop: 2,
  },
  unassignedText: {
    ...theme.typography.caption,
    color: theme.colors.pending,
    fontStyle: 'italic',
    marginTop: 2,
  },
  attachmentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  attachmentIcon: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutlineText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
