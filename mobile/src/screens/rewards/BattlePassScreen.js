import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import api from '../../services/api';
import ProgressRing from '../../components/ProgressRing';
import RewardCard from '../../components/RewardCard';
import ChallengeCard from '../../components/ChallengeCard';

const { width } = Dimensions.get('window');

const BattlePassScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [battlePass, setBattlePass] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [nextLevel, setNextLevel] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const loadBattlePassData = async () => {
    try {
      setLoading(true);

      // Load current battle pass
      const currentResponse = await api.get('/battle-pass/current');
      const bp = currentResponse.data.battlePass;
      setBattlePass(bp);
      setNextLevel(currentResponse.data.nextLevel);
      setProgressPercentage(currentResponse.data.progressPercentage);

      // Load all rewards
      const rewardsResponse = await api.get('/battle-pass/rewards');
      const rewardsList = rewardsResponse.data.rewards;
      setRewards(rewardsList);

      // Debug logging
      console.log('=== Battle Pass Debug ===');
      console.log('Total Savings:', bp?.total_savings);
      console.log('Current Level:', bp?.current_level);
      console.log('Rewards loaded:', rewardsList?.length);
      console.log('Reward levels and unlock status:');
      rewardsList?.forEach(reward => {
        const isUnlocked = bp && bp.total_savings >= reward.min_savings;
        console.log(`  Level ${reward.level}: min_savings=$${reward.min_savings}, unlocked=${isUnlocked}`);
      });

      // Load active challenges
      const challengesResponse = await api.get('/battle-pass/challenges');
      setChallenges(challengesResponse.data.challenges);

    } catch (error) {
      console.error('Error loading battle pass:', error);
      Alert.alert('Error', 'No se pudo cargar el Battle Pass');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBattlePassData();
    }, [])
  );

  const getCurrentMonth = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleRewardPress = (reward) => {
    const totalSavings = parseFloat(battlePass?.total_savings || 0);
    const minSavings = parseFloat(reward.min_savings || 0);
    const isUnlocked = totalSavings >= minSavings;
    navigation.navigate('RewardDetail', { reward, isUnlocked });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando Battle Pass...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.monthTitle}>{getCurrentMonth()}</Text>
          <Text style={styles.subtitle}>Tu progreso de ahorro</Text>
        </View>

        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <ProgressRing
            progress={progressPercentage}
            size={200}
            strokeWidth={20}
            current={battlePass?.total_savings || 0}
            target={nextLevel?.min_savings || 300}
          />
          
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>NIVEL {battlePass?.current_level || 0}</Text>
            <Text style={styles.progressText}>
              {formatCurrency(battlePass?.total_savings || 0)} de {formatCurrency(nextLevel?.min_savings || 300)}
            </Text>
            {nextLevel && nextLevel.min_savings && battlePass && battlePass.total_savings !== undefined && (
              <Text style={styles.nextLevelText}>
                Faltan {formatCurrency(Math.max(0, nextLevel.min_savings - battlePass.total_savings))} para el siguiente nivel
              </Text>
            )}
          </View>
        </View>

        {/* Current Reward (if unlocked) */}
        {battlePass && battlePass.current_level > 0 && rewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Recompensa Actual</Text>
            <View style={styles.currentRewardCard}>
              {(() => {
                const currentReward = rewards.find(r => r.level === battlePass.current_level);
                if (!currentReward) return null;
                
                return (
                  <>
                    <Text style={styles.currentRewardIcon}>{currentReward.icon_url}</Text>
                    <Text style={styles.currentRewardTitle}>{currentReward.reward_title}</Text>
                    <Text style={styles.currentRewardDescription}>
                      {currentReward.reward_description}
                    </Text>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => handleRewardPress(currentReward)}
                    >
                      <Text style={styles.viewDetailsButtonText}>Ver Detalles</Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </View>
          </View>
        )}

        {/* Rewards Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Recompensas</Text>
            <Text style={styles.sectionSubtitle}>
              {rewards.filter(r => {
                const totalSavings = parseFloat(battlePass?.total_savings || 0);
                const minSavings = parseFloat(r.min_savings || 0);
                return totalSavings >= minSavings;
              }).length} de {rewards.length} desbloqueadas
            </Text>
          </View>

          <View style={styles.rewardsGrid}>
            {rewards.sort((a, b) => a.level - b.level).map((reward) => {
              // A reward is unlocked if total savings >= its minimum requirement
              // Ensure numeric comparison by parsing both values
              const totalSavings = parseFloat(battlePass?.total_savings || 0);
              const minSavings = parseFloat(reward.min_savings || 0);
              const isUnlocked = totalSavings >= minSavings;

              return (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  unlocked={isUnlocked}
                  onPress={() => handleRewardPress(reward)}
                />
              );
            })}
          </View>
        </View>

        {/* Active Challenges */}
        {challenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Desafíos Activos</Text>
            <Text style={styles.sectionSubtitle}>
              Completa desafíos para ganar puntos bonus
            </Text>
            
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userProgress={challenge.userProgress}
              />
            ))}
          </View>
        )}

        {/* History Button */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('BattlePassHistory')}
        >
          <Text style={styles.historyButtonText}>📊 Ver Historial</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center'
  },
  monthTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  levelInfo: {
    alignItems: 'center',
    marginTop: SPACING.lg
  },
  levelLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.xs
  },
  progressText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  nextLevelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  section: {
    marginBottom: SPACING.xl
  },
  sectionHeader: {
    marginBottom: SPACING.md
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  currentRewardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md
  },
  currentRewardIcon: {
    fontSize: 64,
    marginBottom: SPACING.md
  },
  currentRewardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  currentRewardDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5,
    marginBottom: SPACING.lg
  },
  viewDetailsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg
  },
  viewDetailsButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs
  },
  historyButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm
  },
  historyButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text
  },
  bottomPadding: {
    height: 100
  }
});

export default BattlePassScreen;
