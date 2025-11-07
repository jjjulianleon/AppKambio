import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import api from '../../services/api';

const RewardDetailScreen = ({ route, navigation }) => {
  const { reward, isUnlocked } = route.params;
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [rewardCode, setRewardCode] = useState(null);

  const handleRedeem = async () => {
    try {
      setRedeeming(true);
      const response = await api.post(`/battle-pass/redeem/${reward.id}`);
      
      setRewardCode(response.data.userReward.redemption_code);
      setRedeemed(true);
      
      Alert.alert(
        '¡Recompensa Canjeada!',
        `Tu código es: ${response.data.userReward.redemption_code}`,
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      console.error('Error redeeming reward:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo canjear la recompensa'
      );
    } finally {
      setRedeeming(false);
    }
  };

  const getCategoryColor = () => {
    switch (reward.reward_category) {
      case 'DISCOUNT': return COLORS.primary;
      case 'POINTS': return '#FFD700';
      case 'BADGE': return COLORS.success;
      case 'UNLOCK': return COLORS.secondary;
      case 'EXPERIENCE': return COLORS.accent;
      default: return COLORS.primary;
    }
  };

  const getCategoryLabel = () => {
    switch (reward.reward_category) {
      case 'DISCOUNT': return 'Descuento';
      case 'POINTS': return 'Puntos';
      case 'BADGE': return 'Badge';
      case 'UNLOCK': return 'Desbloqueo';
      case 'EXPERIENCE': return 'Experiencia';
      default: return 'Recompensa';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getCategoryColor() + '20' }
          ]}>
            <Text style={styles.icon}>{reward.icon_url}</Text>
          </View>
          
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor() }
          ]}>
            <Text style={styles.categoryText}>{getCategoryLabel()}</Text>
          </View>
        </View>

        {/* Title and Level */}
        <View style={styles.titleSection}>
          <Text style={styles.levelLabel}>NIVEL {reward.level}</Text>
          <Text style={styles.title}>{reward.reward_title}</Text>
          <Text style={styles.requirement}>
            Requerido: {formatCurrency(reward.min_savings)}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Descripción</Text>
          <Text style={styles.description}>{reward.reward_description}</Text>
        </View>

        {/* Reward Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Detalles de la Recompensa</Text>
          <View style={styles.detailsCard}>
            {(() => {
              try {
                const rewardValue = JSON.parse(reward.reward_value);
                return (
                  <>
                    {rewardValue.percentage && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Descuento:</Text>
                        <Text style={styles.detailValue}>{rewardValue.percentage}%</Text>
                      </View>
                    )}
                    {rewardValue.category && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Categoría:</Text>
                        <Text style={styles.detailValue}>
                          {rewardValue.category === 'cinema' && 'Cine'}
                          {rewardValue.category === 'restaurant' && 'Restaurante'}
                          {rewardValue.category === 'travel' && 'Viajes'}
                        </Text>
                      </View>
                    )}
                    {rewardValue.validity_days && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Validez:</Text>
                        <Text style={styles.detailValue}>{rewardValue.validity_days} días</Text>
                      </View>
                    )}
                    {rewardValue.max_amount && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Máximo:</Text>
                        <Text style={styles.detailValue}>{formatCurrency(rewardValue.max_amount)}</Text>
                      </View>
                    )}
                  </>
                );
              } catch (e) {
                return <Text style={styles.detailValue}>Detalles no disponibles</Text>;
              }
            })()}
          </View>
        </View>

        {/* Redemption Code (if redeemed) */}
        {rewardCode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎟️ Tu Código</Text>
            <View style={styles.codeCard}>
              <Text style={styles.codeText}>{rewardCode}</Text>
              <Text style={styles.codeHint}>
                Presenta este código para reclamar tu recompensa
              </Text>
            </View>
          </View>
        )}

        {/* How to Use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Cómo Usar</Text>
          <View style={styles.howToCard}>
            <Text style={styles.howToText}>
              1. Canjea tu recompensa para obtener un código{'\n'}
              2. Presenta el código en el establecimiento{'\n'}
              3. ¡Disfruta tu descuento o beneficio!
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {isUnlocked && !redeemed && (
          <TouchableOpacity
            style={[
              styles.redeemButton,
              redeeming && styles.redeemButtonDisabled
            ]}
            onPress={handleRedeem}
            disabled={redeeming}
          >
            {redeeming ? (
              <ActivityIndicator color={COLORS.textLight} />
            ) : (
              <Text style={styles.redeemButtonText}>Canjear Recompensa</Text>
            )}
          </TouchableOpacity>
        )}

        {!isUnlocked && (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedIcon}>🔒</Text>
            <Text style={styles.lockedText}>
              Sigue ahorrando para desbloquear esta recompensa
            </Text>
          </View>
        )}

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
  scrollContent: {
    paddingHorizontal: SPACING.lg
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    position: 'relative'
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg
  },
  icon: {
    fontSize: 64
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textLight
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  levelLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.xs
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  requirement: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  section: {
    marginBottom: SPACING.xl
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.6
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '700'
  },
  codeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md
  },
  codeText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 4,
    marginBottom: SPACING.sm
  },
  codeHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    opacity: 0.9
  },
  howToCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm
  },
  howToText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.8
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.lg
  },
  redeemButtonDisabled: {
    backgroundColor: COLORS.disabled
  },
  redeemButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  },
  lockedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: SPACING.md
  },
  lockedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5
  },
  bottomPadding: {
    height: SPACING.xl
  }
});

export default RewardDetailScreen;
