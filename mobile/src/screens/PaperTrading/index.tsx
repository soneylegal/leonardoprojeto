/**
 * Tela de Paper Trading
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { tradeService, dashboardService } from '../../services';
import { Trade, Position } from '../../types';

export default function PaperTradingScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);
  
  const [currentPrice, setCurrentPrice] = useState(25.50);
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [asset] = useState('PETR4');

  const loadData = useCallback(async () => {
    try {
      const [balanceData, positionsData, tradesData, dashboardData] = await Promise.all([
        tradeService.getBalance(),
        tradeService.getPositions(),
        tradeService.list(10),
        dashboardService.getDashboard(),
      ]);
      
      setBalance(balanceData.simulated_balance);
      setPositions(positionsData);
      setRecentTrades(tradesData);
      setCurrentPrice(dashboardData.current_price);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
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

  const handleTrade = async (orderType: 'BUY' | 'SELL') => {
    const quantity = 100; // Quantidade padrão
    
    Alert.alert(
      `Confirmar ${orderType}`,
      `Deseja ${orderType === 'BUY' ? 'comprar' : 'vender'} ${quantity} ${asset} @ R$ ${currentPrice.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await tradeService.executePaperTrade(
                asset,
                orderType,
                quantity,
                currentPrice
              );
              Alert.alert('Sucesso', `Ordem de ${orderType} executada!`);
              loadData();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.detail || 'Erro ao executar ordem');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' - ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = createStyles(theme);

  // Posição atual no ativo
  const currentPosition = positions.find(p => p.asset === asset);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Paper Trading</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Paper Trading Mode Banner */}
      <View style={styles.modeBanner}>
        <Text style={styles.modeBannerText}>PAPER TRADING MODE</Text>
      </View>

      {/* Current Price */}
      <View style={styles.priceContainer}>
        <Text style={[styles.assetLabel, { color: theme.textSecondary }]}>
          {asset}
        </Text>
        <Text style={[styles.priceText, { color: theme.text }]}>
          R$ {currentPrice.toFixed(2)}
        </Text>
      </View>

      {/* Buy/Sell Buttons */}
      <View style={styles.tradeButtonsContainer}>
        <TouchableOpacity
          style={[styles.tradeButton, styles.buyButton]}
          onPress={() => handleTrade('BUY')}
        >
          <Text style={styles.tradeButtonText}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tradeButton, styles.sellButton]}
          onPress={() => handleTrade('SELL')}
        >
          <Text style={styles.tradeButtonText}>SELL</Text>
        </TouchableOpacity>
      </View>

      {/* Account Info */}
      <View style={[styles.accountCard, { backgroundColor: theme.card }]}>
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>
            Simulated Balance:
          </Text>
          <Text style={[styles.accountValue, { color: theme.text }]}>
            {formatCurrency(balance)}
          </Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>
            Open Position:
          </Text>
          <Text style={[styles.accountValue, { color: theme.text }]}>
            {currentPosition ? `${currentPosition.quantity} ${asset}` : 'Nenhuma'}
          </Text>
        </View>
      </View>

      {/* Recent Trades */}
      <View style={styles.tradesSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Simulated Orders
        </Text>
        
        {recentTrades.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhuma ordem recente
            </Text>
          </View>
        ) : (
          recentTrades.slice(0, 5).map((trade) => (
            <TouchableOpacity
              key={trade.id}
              style={[styles.tradeCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.tradeInfo}>
                <Text style={[styles.tradeTitle, { color: theme.text }]}>
                  {trade.asset} simulated Order
                </Text>
                <Text style={[styles.tradeDate, { color: theme.textSecondary }]}>
                  {formatDate(trade.executed_at)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
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
    modeBanner: {
      backgroundColor: '#ffa726',
      paddingVertical: 10,
      alignItems: 'center',
      marginHorizontal: 20,
      borderRadius: 8,
    },
    modeBannerText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    priceContainer: {
      alignItems: 'center',
      marginVertical: 30,
    },
    assetLabel: {
      fontSize: 16,
      marginBottom: 5,
    },
    priceText: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    tradeButtonsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 15,
    },
    tradeButton: {
      flex: 1,
      paddingVertical: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    buyButton: {
      backgroundColor: '#00d4aa',
    },
    sellButton: {
      backgroundColor: '#ff6b6b',
    },
    tradeButtonText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    accountCard: {
      margin: 20,
      padding: 20,
      borderRadius: 12,
    },
    accountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    accountLabel: {
      fontSize: 14,
    },
    accountValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    tradesSection: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    tradeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
    },
    tradeInfo: {
      flex: 1,
    },
    tradeTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    tradeDate: {
      fontSize: 12,
    },
    emptyCard: {
      padding: 30,
      borderRadius: 12,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
    },
  });
