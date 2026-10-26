import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';

export const MastersScreen = ({ navigation }) => {
  const masterModules = [
    {
      type: 'departments',
      title: 'Departments',
      desc: 'Academic & administrative divisions',
      icon: '🏢',
      color: '#06b6d4',
    },
    {
      type: 'programmes',
      title: 'Programmes',
      desc: 'Academic courses & degrees',
      icon: '🎓',
      color: '#a855f7',
    },
    {
      type: 'blocks',
      title: 'Campus Blocks',
      desc: 'Buildings & physical structures',
      icon: '🧱',
      color: '#f97316',
    },
    {
      type: 'rooms',
      title: 'Rooms & Labs',
      desc: 'Individual classrooms, offices & halls',
      icon: '🚪',
      color: '#10b981',
    },
    {
      type: 'roles',
      title: 'User Roles',
      desc: 'Access permissions & privileges',
      icon: '🔑',
      color: '#fbbf24',
    },
    {
      type: 'users',
      title: 'System Users',
      desc: 'Staff, technicians, faculty & students',
      icon: '👥',
      color: '#38bdf8',
    },
  ];

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="Masters Directory"
          subtitle="Configure campus infrastructure & access"
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentWrapper}>
            <Text style={styles.sectionHeader}>Campus Data Configuration</Text>
            <Text style={styles.subtext}>
              Manage essential master records used across complaint reporting and assignment.
            </Text>

            <View style={styles.grid}>
              {masterModules.map((item) => (
                <GlassCard
                  key={item.type}
                  style={[styles.card, { borderLeftColor: item.color, borderLeftWidth: 4 }]}
                  onPress={() => navigation.navigate('MasterList', { moduleType: item.type, title: item.title })}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: `${item.color}25`, borderColor: `${item.color}50` }]}>
                      <Text style={styles.icon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </GlassCard>
              ))}
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
    maxWidth: 600,
    alignSelf: 'center',
  },
  sectionHeader: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtext: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: theme.spacing.xl,
  },
  grid: {
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  cardDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
