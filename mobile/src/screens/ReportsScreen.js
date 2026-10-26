import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import {
  complaintService,
  departmentService,
  programmeService,
  userService,
} from '../api/api';
import { Header } from '../components/Header';
import { ModalPicker } from '../components/ModalPicker';
import { ComplaintCard } from '../components/ComplaintCard';
import { StatCard } from '../components/StatCard';
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

const STATUS_LIST = ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];

export const ReportsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    department: '',
    programme: '',
    complaintType: '',
    status: '',
    assignee: '',
  });

  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRunQuery, setHasRunQuery] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadFiltersData = async () => {
      try {
        const [dRes, pRes, uRes] = await Promise.all([
          departmentService.getAll(),
          programmeService.getAll(),
          userService.getAll(),
        ]);
        setDepartments(dRes.data?.data || dRes.data || []);
        setProgrammes(pRes.data?.data || pRes.data || []);
        setUsers(uRes.data?.data || uRes.data || []);
      } catch (err) {
        console.warn('Failed to load filter metadata', err);
      }
    };
    loadFiltersData();
  }, [user]);

  const runReport = async () => {
    setLoading(true);
    setHasRunQuery(true);
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });

      const res = await complaintService.report(params);
      const data = res.data?.data || res.data || [];
      setResults(data);
      setShowFilterPanel(false);
    } catch (err) {
      console.error('Failed to generate report:', err);
      Alert.alert('Report Error', err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      department: '',
      programme: '',
      complaintType: '',
      status: '',
      assignee: '',
    });
    setResults([]);
    setHasRunQuery(false);
  };

  const resolvedCount = results.filter((r) => r.status === 'Closed' || r.status === 'Resolved').length;
  const pendingCount = results.filter((r) => r.status === 'Pending').length;

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="Reports & Analytics"
          subtitle="Filter complaints by department & status"
          rightAction={
            <TouchableOpacity
              style={styles.filterToggleBtn}
              onPress={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Text style={styles.filterToggleText}>
                {showFilterPanel ? 'Hide Filters' : '🔍 Filters'}
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.contentWrapper}>
            {/* Glass Filter Panel */}
            {showFilterPanel && (
              <GlassCard style={styles.filterCard}>
                <Text style={styles.filterCardTitle}>📊 Custom Criteria</Text>

              <ModalPicker
                label="Department"
                placeholder="All Departments"
                items={[{ _id: '', name: 'All Departments' }, ...departments]}
                value={filters.department}
                onSelect={(val) => setFilters({ ...filters, department: val })}
                labelExtractor={(d) => d.name}
                valueExtractor={(d) => d._id}
              />

              <ModalPicker
                label="Programme"
                placeholder="All Programmes"
                items={[{ _id: '', name: 'All Programmes' }, ...programmes]}
                value={filters.programme}
                onSelect={(val) => setFilters({ ...filters, programme: val })}
                labelExtractor={(p) => p.name}
                valueExtractor={(p) => p._id}
              />

              <ModalPicker
                label="Complaint Type"
                placeholder="All Types"
                items={['All Types', ...COMPLAINT_TYPES]}
                value={filters.complaintType}
                onSelect={(val) => setFilters({ ...filters, complaintType: val === 'All Types' ? '' : val })}
                labelExtractor={(t) => t}
                valueExtractor={(t) => t}
              />

              <ModalPicker
                label="Status"
                placeholder="All Statuses"
                items={['All Statuses', ...STATUS_LIST]}
                value={filters.status}
                onSelect={(val) => setFilters({ ...filters, status: val === 'All Statuses' ? '' : val })}
                labelExtractor={(s) => s}
                valueExtractor={(s) => s}
              />

              <ModalPicker
                label="Assigned Staff"
                placeholder="All Assignees"
                items={[{ _id: '', username: 'All Assignees' }, ...users]}
                value={filters.assignee}
                onSelect={(val) => setFilters({ ...filters, assignee: val })}
                labelExtractor={(u) => u.username}
                valueExtractor={(u) => u._id}
              />

              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                  <Text style={styles.resetBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.applyBtn, loading && { opacity: 0.6 }]}
                  onPress={runReport}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.applyBtnText}>Generate Report →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {/* Results Summary */}
          {hasRunQuery && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Report Results ({results.length})</Text>
              
              <View style={styles.summaryStatsRow}>
                <StatCard
                  label="Total Matched"
                  value={results.length}
                  icon="📊"
                  color={theme.colors.primary}
                />
                <StatCard
                  label="Resolved"
                  value={resolvedCount}
                  icon="✅"
                  color={theme.colors.closed}
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  icon="⏳"
                  color={theme.colors.pending}
                />
              </View>
            </View>
          )}

          {/* Result Items */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.loadingText}>Generating liquid report analysis...</Text>
            </View>
          ) : (
            results.map((item) => (
              <ComplaintCard key={item._id} complaint={item} />
            ))
          )}

          {hasRunQuery && results.length === 0 && !loading && (
            <View style={styles.emptyResults}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No complaints matched criteria</Text>
              <Text style={styles.emptySubtitle}>Try broadening your selected filters</Text>
            </View>
            )}
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
    maxWidth: 600,
    alignSelf: 'center',
  },
  filterToggleBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterToggleText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  filterCard: {
    marginBottom: theme.spacing.xl,
  },
  filterCardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.sm,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  summarySection: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: 10,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});
