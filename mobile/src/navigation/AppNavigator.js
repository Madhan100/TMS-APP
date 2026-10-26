import React, { useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { UserHomeScreen } from '../screens/UserHomeScreen';
import { NewComplaintScreen } from '../screens/NewComplaintScreen';
import { MyComplaintsScreen } from '../screens/MyComplaintsScreen';
import { AllComplaintsScreen } from '../screens/AllComplaintsScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { MastersScreen } from '../screens/MastersScreen';
import { MasterListScreen } from '../screens/MasterListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ icon, focused }) => (
  <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
    <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>{icon}</Text>
  </View>
);

const AppTabs = () => {
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isStaff = user?.role && !['User'].includes(user?.role);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={isSuperAdmin ? HomeScreen : UserHomeScreen}
        options={{
          tabBarLabel: isSuperAdmin ? 'Dashboard' : 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={isSuperAdmin ? '🏛️' : '🏠'} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="ComplaintsTab"
        component={isSuperAdmin || isStaff ? AllComplaintsScreen : MyComplaintsScreen}
        options={{
          tabBarLabel: 'Tickets',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📋" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="NewComplaintTab"
        component={NewComplaintScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.centerFabContainer}
              activeOpacity={0.85}
            >
              <View style={styles.centerFab}>
                <Text style={styles.centerFabIcon}>＋</Text>
              </View>
              <Text style={styles.centerFabLabel}>Raise</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {isSuperAdmin ? (
        <Tab.Screen
          name="MastersTab"
          component={MastersScreen}
          options={{
            tabBarLabel: 'Masters',
            tabBarIcon: ({ focused }) => <TabBarIcon icon="⚙️" focused={focused} />,
          }}
        />
      ) : isStaff ? (
        <Tab.Screen
          name="ReportsTab"
          component={ReportsScreen}
          options={{
            tabBarLabel: 'Reports',
            tabBarIcon: ({ focused }) => <TabBarIcon icon="📊" focused={focused} />,
          }}
        />
      ) : null}

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#060913', '#0a0f24', '#050711']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingLogoBadge}>
          <Image
            source={require('../../assets/tms-logo.png')}
            style={styles.loadingLogoImage}
            resizeMode="cover"
          />
        </View>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loadingSubtext}>Loading Workspace...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={AppTabs} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="NewComplaint" component={NewComplaintScreen} />
            <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} />
            <Stack.Screen name="AllComplaints" component={AllComplaintsScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Masters" component={MastersScreen} />
            <Stack.Screen name="MasterList" component={MasterListScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogoBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#070C1B',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  loadingLogoImage: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  loadingSubtext: {
    color: theme.colors.textSecondary,
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabBar: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    elevation: 12,
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  tabIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  tabIconText: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabIconTextActive: {
    opacity: 1,
  },
  centerFabContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  centerFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  centerFabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: -2,
  },
  centerFabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
});
