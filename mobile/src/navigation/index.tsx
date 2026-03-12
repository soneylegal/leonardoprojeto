/**
 * Navegação Principal do Aplicativo
 */
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import {
  DashboardScreen,
  StrategyScreen,
  BacktestScreen,
  LogsScreen,
  SettingsScreen,
  PaperTradingScreen,
} from '../screens';

import { useThemeStore, getTheme } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { MainTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Navigator - Navegação Principal
function MainTabs() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Strategy':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Backtest':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Trades':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Logs':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Strategy" 
        component={StrategyScreen}
        options={{ title: 'Estratégia' }}
      />
      <Tab.Screen 
        name="Backtest" 
        component={BacktestScreen}
        options={{ title: 'Backtest' }}
      />
      <Tab.Screen 
        name="Trades" 
        component={PaperTradingScreen}
        options={{ title: 'Trades' }}
      />
      <Tab.Screen 
        name="Logs" 
        component={LogsScreen}
        options={{ title: 'Logs' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
    </Tab.Navigator>
  );
}

// Componente Principal de Navegação
export default function Navigation() {
  const { isDarkMode, loadTheme } = useThemeStore();
  const { isAuthenticated, loadToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    const init = async () => {
      await loadTheme();
      await loadToken();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Por enquanto, vamos direto para as tabs (sem autenticação obrigatória)
  // Em produção, você pode descomentar a verificação de autenticação
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
