/**
 * Tela de Logs e Notificações
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { logService } from '../../services';
import { LogEntry, LogLevel } from '../../types';

export default function LogsScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const data = await logService.list(100);
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      // Dados simulados para demonstração
      setLogs([
        {
          id: 1,
          level: 'SUCCESS',
          message: 'BUY Order Executed: PETR4 @ 25.50',
          created_at: '2024-01-15T10:30:15Z',
        },
        {
          id: 2,
          level: 'SUCCESS',
          message: 'BUY Order Executed: PETR4 @ 25.50',
          created_at: '2024-01-15T10:30:15Z',
        },
        {
          id: 3,
          level: 'ERROR',
          message: 'Connection lost to exchange',
          created_at: '2024-01-15T10:29:45Z',
        },
        {
          id: 4,
          level: 'INFO',
          message: 'System: Strategy parameters updated',
          created_at: '2024-01-15T10:29:30Z',
        },
        {
          id: 5,
          level: 'ERROR',
          message: 'Connection lost to exchange',
          created_at: '2024-01-15T10:29:45Z',
        },
        {
          id: 6,
          level: 'SUCCESS',
          message: 'BUY Order Executed: PETR4 @ 25.50',
          created_at: '2024-01-15T10:30:15Z',
        },
        {
          id: 7,
          level: 'INFO',
          message: 'System: Strategy parameters updated',
          created_at: '2024-01-15T10:29:30Z',
        },
        {
          id: 8,
          level: 'SUCCESS',
          message: 'BUY Order Executed: PETR4 @ 25.50',
          created_at: '2024-01-15T10:30:15Z',
        },
        {
          id: 9,
          level: 'INFO',
          message: 'System: Strategy parameters updated',
          created_at: '2024-01-15T10:29:30Z',
        },
      ]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs();
  }, [loadLogs]);

  const getLogStyle = (level: LogLevel) => {
    switch (level) {
      case 'SUCCESS':
        return {
          backgroundColor: theme.success,
          icon: 'checkmark-circle' as const,
          iconColor: '#fff',
        };
      case 'ERROR':
        return {
          backgroundColor: '#8b0000',
          icon: 'close-circle' as const,
          iconColor: '#fff',
        };
      case 'WARNING':
        return {
          backgroundColor: theme.warning,
          icon: 'warning' as const,
          iconColor: '#fff',
        };
      case 'INFO':
      default:
        return {
          backgroundColor: '#4a4a4a',
          icon: 'information-circle' as const,
          iconColor: '#fff',
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => {
    const logStyle = getLogStyle(item.level);
    
    return (
      <View style={[styles.logItem, { backgroundColor: logStyle.backgroundColor }]}>
        <Ionicons
          name={logStyle.icon}
          size={24}
          color={logStyle.iconColor}
          style={styles.logIcon}
        />
        <View style={styles.logContent}>
          <Text style={styles.logMessage}>
            {formatTime(item.created_at)} - {item.message}
          </Text>
        </View>
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Logs</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              await logService.clear();
              setLogs([]);
            } catch (error) {
              console.error('Erro ao limpar logs:', error);
            }
          }}
        >
          <Ionicons name="trash-outline" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>

      {/* Log List */}
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhum log disponível
            </Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
    listContent: {
      paddingBottom: 20,
    },
    logItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
    },
    logIcon: {
      marginRight: 12,
    },
    logContent: {
      flex: 1,
    },
    logMessage: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
    },
    separator: {
      height: 1,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      marginTop: 10,
      fontSize: 16,
    },
  });
