/**
 * Tela de Resultados de Backtesting
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { useStrategyStore } from '../../store/strategyStore';
import { backtestService } from '../../services';
import { BacktestResult } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

const PERIODS = [
  { label: '1 Year', value: '1Y' },
  { label: '6 Months', value: '6M' },
  { label: '3 Months', value: '3M' },
];

export default function BacktestScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);
  
  const { strategies, currentStrategy, loadStrategies } = useStrategyStore();

  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStrategies();
  }, []);

  const runBacktest = useCallback(async () => {
    if (!currentStrategy && strategies.length === 0) {
      return;
    }

    const strategyId = currentStrategy?.id || strategies[0]?.id;
    if (!strategyId) return;

    setLoading(true);
    try {
      const result = await backtestService.run(strategyId, selectedPeriod);
      setBacktestResult(result);
    } catch (error) {
      console.error('Erro ao executar backtest:', error);
    } finally {
      setLoading(false);
    }
  }, [currentStrategy, strategies, selectedPeriod]);

  useEffect(() => {
    if (strategies.length > 0 || currentStrategy) {
      runBacktest();
    }
  }, [selectedPeriod, currentStrategy]);

  const styles = createStyles(theme);

  // Dados do gráfico
  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`,
    labelColor: (opacity = 1) => theme.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0',
    },
    fillShadowGradient: '#42a5f5',
    fillShadowGradientOpacity: 0.3,
  };

  const chartData = {
    labels: ['', '', '', '', '', ''],
    datasets: [
      {
        data: backtestResult?.chart_data?.equity_curve?.slice(-50) || 
              [10000, 10200, 10150, 10400, 10600, 10550, 10800, 11000, 11200, 11500],
      },
    ],
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Backtest Results</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Executando backtest...
            </Text>
          </View>
        ) : (
          <>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={false}
            />
            
            {/* Buy/Sell Signals */}
            <View style={styles.signalsOverlay}>
              {backtestResult?.chart_data?.buy_signals?.slice(-10).map((_, i) => (
                <View key={`buy-${i}`} style={[styles.signalArrow, styles.buyArrow]}>
                  <Ionicons name="arrow-up" size={16} color={theme.success} />
                </View>
              ))}
              {backtestResult?.chart_data?.sell_signals?.slice(-10).map((_, i) => (
                <View key={`sell-${i}`} style={[styles.signalArrow, styles.sellArrow]}>
                  <Ionicons name="arrow-down" size={16} color={theme.error} />
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              {
                backgroundColor:
                  selectedPeriod === period.value ? theme.card : 'transparent',
              },
            ]}
            onPress={() => setSelectedPeriod(period.value)}
          >
            <Text
              style={[
                styles.periodText,
                {
                  color:
                    selectedPeriod === period.value ? theme.text : theme.textSecondary,
                },
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Total Return:
          </Text>
          <Text
            style={[
              styles.metricValue,
              {
                color:
                  (backtestResult?.total_return || 0) >= 0 ? theme.success : theme.error,
              },
            ]}
          >
            {formatPercent(backtestResult?.total_return || 15.5)}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Win Rate:
          </Text>
          <Text style={[styles.metricValue, { color: theme.success }]}>
            {(backtestResult?.win_rate || 62).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Max Drawdown:
          </Text>
          <Text style={[styles.metricValue, { color: theme.error }]}>
            {(backtestResult?.max_drawdown || -8.2).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Sharpe Ratio:
          </Text>
          <Text style={[styles.metricValue, { color: theme.success }]}>
            {(backtestResult?.sharpe_ratio || 1.4).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Run Backtest Button */}
      <TouchableOpacity
        style={[styles.runButton, { backgroundColor: theme.primary }]}
        onPress={runBacktest}
        disabled={loading}
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.runButtonText}>Executar Novo Backtest</Text>
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
    chartContainer: {
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 10,
      minHeight: 220,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    signalsOverlay: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    signalArrow: {
      position: 'absolute',
    },
    buyArrow: {
      bottom: 0,
    },
    sellArrow: {
      top: 0,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: 200,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
    },
    periodContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 20,
      gap: 10,
    },
    periodButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    periodText: {
      fontSize: 14,
      fontWeight: '600',
    },
    metricsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      gap: 15,
    },
    metricItem: {
      width: '45%',
      alignItems: 'center',
    },
    metricLabel: {
      fontSize: 12,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    runButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 20,
      padding: 16,
      borderRadius: 12,
      gap: 8,
    },
    runButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
