/**
 * Tela de Configurações
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { settingsService } from '../../services';
import { Settings } from '../../types';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = getTheme(isDarkMode);
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [paperTradingEnabled, setPaperTradingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
      setPaperTradingEnabled(data.paper_trading_enabled);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveAndTest = async () => {
    setSaving(true);
    try {
      await settingsService.update({
        paper_trading_enabled: paperTradingEnabled,
        dark_mode_enabled: isDarkMode,
        api_key: apiKey || undefined,
        api_secret: apiSecret || undefined,
      });

      if (apiKey && apiSecret) {
        const result = await settingsService.testConnection();
        Alert.alert('Sucesso', result.message);
      } else {
        Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
      }
      
      loadSettings();
      setApiKey('');
      setApiSecret('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* API Key Input */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>API Key</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder={settings?.api_key_masked || '**********************'}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* API Secret Input */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>API Secret</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={apiSecret}
          onChangeText={setApiSecret}
          placeholder="**********************"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Save & Test Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={handleSaveAndTest}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save & Test Connection</Text>
        )}
      </TouchableOpacity>

      {/* Switches Section */}
      <View style={styles.switchSection}>
        {/* Paper Trading Toggle */}
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            Enable Paper Trading
          </Text>
          <Switch
            value={paperTradingEnabled}
            onValueChange={setPaperTradingEnabled}
            trackColor={{ false: theme.border, true: theme.success }}
            thumbColor="#fff"
          />
        </View>

        {/* Dark Mode Toggle */}
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.success }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Balance Info */}
      {settings && (
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
            Simulated Balance
          </Text>
          <Text style={[styles.balanceValue, { color: theme.text }]}>
            R$ {settings.simulated_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: theme.primary }]}
            onPress={async () => {
              try {
                await settingsService.resetBalance();
                loadSettings();
                Alert.alert('Sucesso', 'Saldo resetado para R$ 10.000,00');
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível resetar o saldo.');
              }
            }}
          >
            <Text style={[styles.resetButtonText, { color: theme.primary }]}>
              Reset Balance
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingTop: 60,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      fontSize: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
    },
    saveButton: {
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    switchSection: {
      marginTop: 30,
      paddingHorizontal: 20,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    balanceCard: {
      margin: 20,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: 14,
      marginBottom: 5,
    },
    balanceValue: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    resetButton: {
      borderWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    resetButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
