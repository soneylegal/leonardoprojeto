/**
 * Tela de Dashboard - Visão geral do bot
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { dashboardService } from '../../services';
import { DashboardData, ChartResponseData } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);
  
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartResponseData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [dashboardData, chart] = await Promise.all([
        dashboardService.getDashboard(),
        dashboardService.getChartData('PETR4', '1D'),
      ]);
      setDashboard(dashboardData);
      setChartData(chart);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleBotToggle = async () => {
    try {
      if (dashboard?.bot_status.is_running) {
        await dashboardService.stopBot();
      } else {
        await dashboardService.startBot();
      }
      loadData();
    } catch (error) {
      console.error('Erro ao alternar bot:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const styles = createStyles(theme);

  // Preparar dados do gráfico
  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 119, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0',
    },
  };

  const chartDisplayData = {
    labels: ['', '', '', '', '', ''],
    datasets: [
      {
        data: chartData?.candles.slice(-30).map(c => c.close) || [25, 25.5, 26, 25.8, 26.2, 26.5],
        color: (opacity = 1) => theme.chartGreen,
        strokeWidth: 2,
      },
      {
        data: chartData?.ma_short.slice(-30) || [24.8, 25.2, 25.5, 25.6, 25.8, 26],
        color: (opacity = 1) => '#ffa726',
        strokeWidth: 1,
      },
      {
        data: chartData?.ma_long.slice(-30) || [24.5, 24.8, 25, 25.2, 25.4, 25.6],
        color: (opacity = 1) => '#42a5f5',
        strokeWidth: 1,
      },
    ],
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
      </View>

      {/* Gráfico */}
      <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
        <LineChart
          data={chartDisplayData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
        />
        
        {/* Volume bars simulado */}
        <View style={styles.volumeContainer}>
          {[...Array(30)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.volumeBar,
                {
                  height: Math.random() * 30 + 10,
                  backgroundColor: Math.random() > 0.5 ? theme.chartGreen : theme.chartRed,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Info Cards */}
      <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
            Bot Status:
          </Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: dashboard?.bot_status.is_running
                  ? theme.success
                  : theme.error,
              },
            ]}
          >
            {dashboard?.bot_status.status_text || 'Stopped'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
            Today's P/L:
          </Text>
          <Text
            style={[
              styles.infoValue,
              {
                color:
                  (dashboard?.todays_pnl || 0) >= 0 ? theme.success : theme.error,
              },
            ]}
          >
            {dashboard?.todays_pnl !== undefined
              ? `${dashboard.todays_pnl >= 0 ? '+' : ''}${formatCurrency(dashboard.todays_pnl)}`
              : '+R$ 0,00'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
            Last Trade:
          </Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {dashboard?.last_trade
              ? `${dashboard.last_trade.order_type} @ ${dashboard.last_trade.price.toFixed(2)}`
              : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Bot Control Button */}
      <TouchableOpacity
        style={[
          styles.botButton,
          {
            backgroundColor: dashboard?.bot_status.is_running
              ? theme.error
              : theme.success,
          },
        ]}
        onPress={handleBotToggle}
      >
        <Ionicons
          name={dashboard?.bot_status.is_running ? 'stop' : 'play'}
          size={24}
          color="#fff"
        />
        <Text style={styles.botButtonText}>
          {dashboard?.bot_status.is_running ? 'Parar Bot' : 'Iniciar Bot'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    chartContainer: {
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 10,
      overflow: 'hidden',
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    volumeContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 40,
      paddingHorizontal: 10,
    },
    volumeBar: {
      width: 6,
      borderRadius: 2,
    },
    infoCard: {
      margin: 20,
      borderRadius: 16,
      padding: 20,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    infoLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    botButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginBottom: 30,
      padding: 16,
      borderRadius: 12,
      gap: 8,
    },
    botButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
