import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { GlassCard } from '../components/GlassCard';

export const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('superadmin');
  const [showDemo, setShowDemo] = useState(false);

  const fillDemo = (role, demoEmail, demoPass) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      console.log('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Login failed. Verify server URL & credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {/* Hero Section with Glowing Clipboard Checklist Logo */}
              <View style={styles.heroSection}>
                <View style={styles.logoBadgeContainer}>
                  <Image
                    source={require('../../assets/tms-logo.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.appTitle}>TMS MOBILE</Text>
                <Text style={styles.appSubtitle}>Enterprise Portal</Text>
              </View>

              {/* Frosted Liquid Glass Login Card */}
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Sign In</Text>
                <Text style={styles.cardSubtitle}>Access your complaint management portal</Text>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}

                {/* Glass Input Group: Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={[styles.glassInputWrapper, Platform.OS === 'web' && styles.webGlass]}>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="e.g. superadmin@example.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Glass Input Group: Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <View style={[styles.glassInputWrapper, Platform.OS === 'web' && styles.webGlass]}>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter account password"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? '👁️' : '🔒'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Executive Blue Button */}
                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.loginBtnText}>Access Dashboard →</Text>
                  )}
                </TouchableOpacity>

                {/* Demo Quick Fill Section */}
                <View style={styles.demoSection}>
                  <TouchableOpacity
                    style={styles.demoToggleBtn}
                    onPress={() => setShowDemo(!showDemo)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.demoToggleLeft}>
                      <Text style={styles.demoSectionTitle}>⚡ DEMO QUICK AUTO-FILL</Text>
                    </View>
                    <View style={styles.seeMoreBadge}>
                      <Text style={styles.seeMoreText}>
                        {showDemo ? 'See Less ▴' : 'See More ▾'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showDemo && (
                    <View style={styles.demoRoleCardsCol}>
                      {/* Demo SuperAdmin */}
                      <TouchableOpacity
                        style={[
                          styles.demoCard,
                          selectedRole === 'superadmin' && styles.demoCardActive,
                          Platform.OS === 'web' && styles.webGlass,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => fillDemo('superadmin', 'superadmin@example.com', 'SuperAdmin@123')}
                      >
                        <View style={styles.demoCardHeader}>
                          <View style={styles.demoCardIconWrap}>
                            <Text style={styles.demoCardIcon}>👑</Text>
                          </View>
                          <View style={styles.demoCardMeta}>
                            <Text style={styles.demoCardTitle}>SuperAdmin</Text>
                            <Text style={styles.demoCardRole}>Full System Administration</Text>
                            <Text style={styles.demoCredentialsText}>
                              superadmin@example.com • <Text style={styles.passSecret}>SuperAdmin@123</Text>
                            </Text>
                          </View>
                          {selectedRole === 'superadmin' ? (
                            <View style={styles.activeCheckPill}>
                              <Text style={styles.activeCheckText}>SELECTED</Text>
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>

                      {/* Demo Student / User */}
                      <TouchableOpacity
                        style={[
                          styles.demoCard,
                          selectedRole === 'user' && styles.demoCardActiveEmerald,
                          Platform.OS === 'web' && styles.webGlass,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => fillDemo('user', 'user@example.com', 'User@123')}
                      >
                        <View style={styles.demoCardHeader}>
                          <View style={[styles.demoCardIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Text style={styles.demoCardIcon}>👤</Text>
                          </View>
                          <View style={styles.demoCardMeta}>
                            <Text style={styles.demoCardTitle}>Student / User</Text>
                            <Text style={styles.demoCardRole}>Complaint Raiser & Status Tracking</Text>
                            <Text style={styles.demoCredentialsText}>
                              user@example.com • <Text style={styles.passSecret}>User@123</Text>
                            </Text>
                          </View>
                          {selectedRole === 'user' ? (
                            <View style={[styles.activeCheckPill, { backgroundColor: 'rgba(16, 185, 129, 0.25)', borderColor: '#10b981' }]}>
                              <Text style={[styles.activeCheckText, { color: '#34d399' }]}>SELECTED</Text>
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>

                      {/* Demo Staff Header */}
                      <View style={{ marginTop: 6, marginBottom: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#a5b4fc', letterSpacing: 0.8 }}>
                          🛠️ STAFF TECHNICIANS & RESOLVERS
                        </Text>
                      </View>

                      {[
                        { id: 'network', title: 'Networking Staff', role: 'Networking Staff', email: 'network@example.com', icon: '🌐' },
                        { id: 'plumber', title: 'Plumber Staff', role: 'Plumber', email: 'plumber@example.com', icon: '🔧' },
                        { id: 'electrician', title: 'Electrician Staff', role: 'Electrician', email: 'electrician@example.com', icon: '⚡' },
                        { id: 'developer', title: 'Software Developer', role: 'Software Developer', email: 'developer@example.com', icon: '💻' },
                        { id: 'hardware', title: 'PC Hardware Staff', role: 'PC Hardware', email: 'hardware@example.com', icon: '🖥️' },
                      ].map((staff) => (
                        <TouchableOpacity
                          key={staff.id}
                          style={[
                            styles.demoCard,
                            selectedRole === staff.id && styles.demoCardActivePurple,
                            Platform.OS === 'web' && styles.webGlass,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => fillDemo(staff.id, staff.email, 'User@123')}
                        >
                          <View style={styles.demoCardHeader}>
                            <View style={[styles.demoCardIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                              <Text style={styles.demoCardIcon}>{staff.icon}</Text>
                            </View>
                            <View style={styles.demoCardMeta}>
                              <Text style={styles.demoCardTitle}>{staff.title}</Text>
                              <Text style={styles.demoCardRole}>{staff.role} • Resolver</Text>
                              <Text style={styles.demoCredentialsText}>
                                {staff.email} • <Text style={styles.passSecret}>User@123</Text>
                              </Text>
                            </View>
                            {selectedRole === staff.id ? (
                              <View style={[styles.activeCheckPill, { backgroundColor: 'rgba(99, 102, 241, 0.25)', borderColor: '#6366f1' }]}>
                                <Text style={[styles.activeCheckText, { color: '#a5b4fc' }]}>SELECTED</Text>
                              </View>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </GlassCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidGlassBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  webGlass: {
    backdropFilter: 'blur(25px) saturate(160%)',
    WebkitBackdropFilter: 'blur(25px) saturate(160%)',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoBadgeContainer: {
    marginBottom: 10,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#050814',
    borderWidth: 1.2,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  appTitle: {
    ...theme.typography.h1,
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(56, 189, 248, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  appSubtitle: {
    ...theme.typography.body,
    color: '#38bdf8',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: '#ffffff',
    fontSize: 22,
  },
  cardSubtitle: {
    ...theme.typography.body,
    color: '#cbd5e1',
    marginTop: 4,
    marginBottom: theme.spacing.xl,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.captionBold,
    color: '#cbd5e1',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  glassInputWrapper: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    color: '#ffffff',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
  loginBtn: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  demoSection: {
    marginTop: theme.spacing.md,
  },
  demoToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  demoToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoSectionTitle: {
    ...theme.typography.captionBold,
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  seeMoreBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seeMoreText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  demoRoleCardsCol: {
    gap: 10,
    marginTop: 12,
  },
  demoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  demoCardActive: {
    borderColor: '#3B82F6',
    borderTopColor: '#60A5FA',
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
  },
  demoCardActiveEmerald: {
    borderColor: '#10B981',
    borderTopColor: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  demoCardActivePurple: {
    borderColor: '#6366F1',
    borderTopColor: '#818CF8',
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
  },
  demoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoCardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  demoCardIcon: {
    fontSize: 14,
  },
  demoCardMeta: {
    flex: 1,
  },
  demoCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  demoCardRole: {
    color: '#94a3b8',
    fontSize: 10,
  },
  activeCheckPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeCheckText: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoCredentialsText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  passSecret: {
    color: '#f1f5f9',
    fontWeight: '700',
  },
});
