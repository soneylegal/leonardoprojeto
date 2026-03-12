/**
 * Tela de Logs — com auto-refresh (polling a cada 5s)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { logService } from '../../services';
import { LogEntry, LogLevel } from '../../types';

type FilterLevel = 'ALL' | LogLevel;

const FILTERS: { label: string; value: FilterLevel; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Todos',   value: 'ALL',     icon: 'layers-outline' },
  { label: 'Sucesso', value: 'SUCCESS', icon: 'checkmark-circle-outline' },
  { label: 'Info',    value: 'INFO',    icon: 'information-circle-outline' },
  { label: 'Alerta',  value: 'WARNING', icon: 'warning-outline' },
  { label: 'Erro',    value: 'ERROR',   icon: 'close-circle-outline' },
];

export default function LogsScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<FilterLevel>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newCount, setNewCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(0);

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.4, duration: 180, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim]);

  const loadLogs = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await logService.list(100);
      setLogs(data);
      setLastUpdate(new Date());
      if (data.length > prevCountRef.current) {
        const added = data.length - prevCountRef.current;
        setNewCount(added);
        pulse();
        setTimeout(() => setNewCount(0), 3000);
      }
      prevCountRef.current = data.length;
    } catch {
      // mantém dados anteriores se falhar
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [pulse]);

  // Polling a cada 5 segundos
  useEffect(() => {
    loadLogs();
    intervalRef.current = setInterval(() => loadLogs(true), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadLogs]);

  const handleClear = async () => {
    try {
      await logService.clear();
      setLogs([]);
      prevCountRef.current = 0;
    } catch {}
  };

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.level === filter);

  const levelCfg = (level: LogLevel) => {
    switch (level) {
      case 'SUCCESS': return { bg: '#0d2b1e', border: '#00d4aa', icon: 'checkmark-circle' as const, color: '#00d4aa' };
      case 'ERROR':   return { bg: '#2b0d0d', border: '#ff6b6b', icon: 'close-circle' as const,     color: '#ff6b6b' };
      case 'WARNING': return { bg: '#2b200d', border: '#ffa726', icon: 'warning' as const,           color: '#ffa726' };
      default:        return { bg: '#0d1a2b', border: '#29b6f6', icon: 'information-circle' as const, color: '#29b6f6' };
    }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const styles = createStyles(theme);

  const renderItem = ({ item }: { item: LogEntry }) => {
    const cfg = levelCfg(item.level);
    return (
      <View style={[styles.logItem, { backgroundColor: cfg.bg, borderLeftColor: cfg.border }]}>
        <Ionicons name={cfg.icon} size={18} color={cfg.color} style={styles.logIcon} />
        <View style={styles.logBody}>
          <Text style={styles.logMessage}>{item.message}</Text>
          <Text style={[styles.logTime, { color: cfg.color }]}>{formatTime(item.created_at)}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: cfg.border + '25' }]}>
          <Text style={[styles.levelText, { color: cfg.color }]}>{item.level}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>Registros do Sistema</Text>
          <View style={styles.statusRow}>
            <Animated.View style={[styles.dot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Ao vivo · {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
            {newCount > 0 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>+{newCount} novo{newCount > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleClear} style={[styles.clearBtn, { backgroundColor: theme.error + '18' }]}>
          <Ionicons name="trash-outline" size={18} color={theme.error} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={[styles.filterRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && { backgroundColor: theme.primary + '22', borderColor: theme.primary }]}
            onPress={() => setFilter(f.value)}
          >
            <Ionicons name={f.icon} size={12} color={filter === f.value ? theme.primary : theme.textSecondary} />
            <Text style={[styles.filterLabel, { color: filter === f.value ? theme.primary : theme.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contagem */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: theme.textSecondary }]}>
          {filtered.length} {filtered.length === 1 ? 'entrada' : 'entradas'}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadLogs()} tintColor={theme.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={52} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>Nenhum registro</Text>
            <Text style={[styles.emptyHint, { color: theme.border }]}>
              Inicie o bot no Dashboard para gerar eventos
            </Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 19, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00d4aa' },
  subtitle: { fontSize: 11 },
  newBadge: { backgroundColor: '#00d4aa22', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  newBadgeText: { color: '#00d4aa', fontSize: 10, fontWeight: '700' },
  clearBtn: { padding: 9, borderRadius: 10, marginLeft: 10 },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10,
    gap: 5, borderBottomWidth: 1,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'transparent',
  },
  filterLabel: { fontSize: 11, fontWeight: '600' },
  countRow: { paddingHorizontal: 16, paddingVertical: 6 },
  countText: { fontSize: 11 },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 5 },
  emptyContainer: { flex: 1 },
  logItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, padding: 12, borderLeftWidth: 3, gap: 10,
  },
  logIcon: { flexShrink: 0 },
  logBody: { flex: 1 },
  logMessage: { color: '#ffffff', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  logTime: { fontSize: 10, marginTop: 3 },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 120, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
});

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
