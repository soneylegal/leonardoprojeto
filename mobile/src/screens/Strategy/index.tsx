/**
 * Tela de Configuração de Estratégia
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore, getTheme } from '../../store/themeStore';
import { useStrategyStore } from '../../store/strategyStore';
import { TimeframeType, Asset } from '../../types';

const TIMEFRAMES: { label: string; value: TimeframeType }[] = [
  { label: '1M', value: '1M' },
  { label: '5M', value: '5M' },
  { label: '1H', value: '1H' },
  { label: '1D', value: '1D' },
];

export default function StrategyScreen() {
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);
  
  const {
    strategies,
    availableAssets,
    currentStrategy,
    loadStrategies,
    loadAssets,
    createStrategy,
    updateStrategy,
    setCurrentStrategy,
  } = useStrategyStore();

  const [selectedAsset, setSelectedAsset] = useState('PETR4');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('1D');
  const [maShortPeriod, setMaShortPeriod] = useState(9);
  const [maLongPeriod, setMaLongPeriod] = useState(21);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  useEffect(() => {
    loadStrategies();
    loadAssets();
  }, []);

  useEffect(() => {
    if (currentStrategy) {
      setSelectedAsset(currentStrategy.asset);
      setSelectedTimeframe(currentStrategy.timeframe);
      setMaShortPeriod(currentStrategy.ma_short_period);
      setMaLongPeriod(currentStrategy.ma_long_period);
    }
  }, [currentStrategy]);

  const handleSaveStrategy = async () => {
    try {
      if (currentStrategy) {
        await updateStrategy(currentStrategy.id, {
          asset: selectedAsset,
          timeframe: selectedTimeframe,
          ma_short_period: maShortPeriod,
          ma_long_period: maLongPeriod,
        });
        Alert.alert('Sucesso', 'Estratégia atualizada com sucesso!');
      } else {
        await createStrategy({
          name: `Estratégia ${selectedAsset}`,
          asset: selectedAsset,
          timeframe: selectedTimeframe,
          ma_short_period: maShortPeriod,
          ma_long_period: maLongPeriod,
          stop_loss_percent: 2.0,
          take_profit_percent: 4.0,
          position_size: 100,
        });
        Alert.alert('Sucesso', 'Estratégia criada com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a estratégia.');
    }
  };

  const styles = createStyles(theme);

  // Lista de ativos para o picker
  const assets: Asset[] = availableAssets.length > 0 ? availableAssets : [
    { symbol: 'PETR4', name: 'Petrobras PN' },
    { symbol: 'VALE3', name: 'Vale ON' },
    { symbol: 'ITUB4', name: 'Itaú Unibanco PN' },
    { symbol: 'BBDC4', name: 'Bradesco PN' },
    { symbol: 'ABEV3', name: 'Ambev ON' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Strategy Config</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Asset Selector */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Asset</Text>
          <TouchableOpacity
            style={[styles.assetButton, { backgroundColor: theme.card }]}
            onPress={() => setShowAssetPicker(!showAssetPicker)}
          >
            <Text style={[styles.assetText, { color: theme.text }]}>
              {selectedAsset}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {showAssetPicker && (
          <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
            <ScrollView style={styles.assetList} nestedScrollEnabled>
              {assets.map((asset) => (
                <TouchableOpacity
                  key={asset.symbol}
                  style={[
                    styles.assetItem,
                    selectedAsset === asset.symbol && styles.assetItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedAsset(asset.symbol);
                    setShowAssetPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.assetItemText,
                      { color: selectedAsset === asset.symbol ? theme.primary : theme.text },
                    ]}
                  >
                    {asset.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Timeframe Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Timeframe</Text>
        <View style={styles.timeframeContainer}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[
                styles.timeframeButton,
                {
                  backgroundColor:
                    selectedTimeframe === tf.value ? theme.card : 'transparent',
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setSelectedTimeframe(tf.value)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  {
                    color:
                      selectedTimeframe === tf.value ? theme.text : theme.textSecondary,
                  },
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* MA Short Period Slider */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>
            MA Short Period
          </Text>
          <Text style={[styles.sliderValue, { color: theme.text }]}>
            {maShortPeriod}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={50}
          step={1}
          value={maShortPeriod}
          onValueChange={setMaShortPeriod}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.text}
        />
      </View>

      {/* MA Long Period Slider */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>
            MA Long Period
          </Text>
          <Text style={[styles.sliderValue, { color: theme.text }]}>
            {maLongPeriod}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={200}
          step={1}
          value={maLongPeriod}
          onValueChange={setMaLongPeriod}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.text}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.success }]}
        onPress={handleSaveStrategy}
      >
        <Text style={styles.saveButtonText}>Save Strategy</Text>
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
    section: {
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    assetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
    },
    assetText: {
      fontSize: 16,
      fontWeight: '600',
    },
    pickerContainer: {
      marginTop: 10,
      borderRadius: 12,
      maxHeight: 200,
    },
    assetList: {
      padding: 10,
    },
    assetItem: {
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    assetItemSelected: {
      backgroundColor: 'rgba(0, 119, 255, 0.1)',
    },
    assetItemText: {
      fontSize: 16,
      textAlign: 'center',
    },
    timeframeContainer: {
      flexDirection: 'row',
      marginTop: 15,
      gap: 10,
    },
    timeframeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    timeframeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sliderValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    saveButton: {
      margin: 20,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
