import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { logger } from '../../utils/logger';
import * as savingsPoolService from '../../services/savingsPoolService';
import { getStoredUser } from '../../services/authService';

const SavingsPoolScreen = ({ navigation }) => {
  const [poolMembers, setPoolMembers] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userSavings, setUserSavings] = useState(0);
  const [userId, setUserId] = useState(null);

  // Datos de ejemplo (mock data para desarrollo inicial)
  const mockPoolMembers = [
    { id: 1, name: 'María García', photo: null, totalSavings: 1500 },
    { id: 2, name: 'Juan Pérez', photo: null, totalSavings: 2300 },
    { id: 3, name: 'Ana Torres', photo: null, totalSavings: 890 }
  ];

  const mockActiveRequests = [
    {
      id: 1,
      requester: 'María García',
      amount: 500,
      currentAmount: 320,
      description: 'Ayuda para reparación de laptop',
      contributors: 2,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 días atrás
    }
  ];

  const mockCompletedRequests = [
    {
      id: 2,
      requester: 'Juan Pérez',
      amount: 300,
      description: 'Emergencia médica',
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 días atrás
    }
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadPoolData();
    }, [])
  );

  const loadPoolData = async () => {
    try {
      // Obtener el usuario actual
      const user = await getStoredUser();
      if (user && user.id) {
        setUserId(user.id);
      }

      // Cargar datos reales del API
      const poolData = await savingsPoolService.getPoolData();

      if (poolData) {
        setPoolMembers(poolData.members || mockPoolMembers);
        setActiveRequests(poolData.activeRequests || mockActiveRequests);
        setCompletedRequests(poolData.completedRequests || mockCompletedRequests);
        // Usar el valor real del API, sin valor por defecto
        setUserSavings(poolData.userSavings !== undefined ? poolData.userSavings : 0);
      } else {
        // Fallback a datos mock si no hay respuesta
        setPoolMembers(mockPoolMembers);
        setActiveRequests(mockActiveRequests);
        setCompletedRequests(mockCompletedRequests);
        setUserSavings(0);
      }
    } catch (error) {
      logger.error('Error al cargar datos del pozo:', error);
      // Usar datos mock en caso de error
      setPoolMembers(mockPoolMembers);
      setActiveRequests(mockActiveRequests);
      setCompletedRequests(mockCompletedRequests);
      setUserSavings(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPoolData();
    setRefreshing(false);
  };

  const handleCreateRequest = () => {
    navigation.navigate('CreateRequest');
  };

  const handleContribute = async (request) => {
    try {
      // Calcular contribución máxima desde el backend
      const contributionData = await savingsPoolService.calculateContribution(request.id);

      if (!contributionData || contributionData.maxPossible < 1) {
        Alert.alert(
          'No puedes contribuir',
          'No tienes suficientes ahorros para contribuir.'
        );
        return;
      }

      const maxContribution = contributionData.maxPossible;
      const suggestedAmount = contributionData.amount;
      const remaining = contributionData.remaining;

      // Mostrar prompt para ingresar monto
      Alert.prompt(
        'Contribuir al Pozo',
        `Ingresa el monto que deseas contribuir:\n\nMonto sugerido: ${formatCurrency(suggestedAmount)}\nMáximo permitido (50% de tus ahorros): ${formatCurrency(maxContribution)}\nTus ahorros: ${formatCurrency(userSavings)}\nFalta por completar: ${formatCurrency(remaining)}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Contribuir',
            onPress: async (inputAmount) => {
              try {
                const amount = parseFloat(inputAmount);

                // Validar monto
                if (isNaN(amount) || amount <= 0) {
                  Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
                  return;
                }

                if (amount > maxContribution) {
                  Alert.alert('Error', `El monto máximo que puedes contribuir es ${formatCurrency(maxContribution)} (50% de tus ahorros)`);
                  return;
                }

                if (amount > remaining) {
                  Alert.alert('Error', `El monto excede lo que falta para completar la solicitud (${formatCurrency(remaining)})`);
                  return;
                }

                // Confirmar contribución
                Alert.alert(
                  'Confirmar',
                  `¿Confirmas que deseas contribuir ${formatCurrency(amount)} a ${request.requester}?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Confirmar',
                      onPress: async () => {
                        try {
                          await savingsPoolService.contributeToRequest(request.id, amount);
                          Alert.alert('¡Éxito!', `Has contribuido ${formatCurrency(amount)} exitosamente`);
                          // Recargar datos
                          await loadPoolData();
                        } catch (error) {
                          logger.error('Error al contribuir:', error);
                          Alert.alert('Error', error.message || 'No se pudo completar la contribución');
                        }
                      }
                    }
                  ]
                );
              } catch (error) {
                logger.error('Error procesando contribución:', error);
                Alert.alert('Error', 'Monto inválido');
              }
            }
          }
        ],
        'plain-text',
        suggestedAmount.toFixed(2)
      );
    } catch (error) {
      logger.error('Error al calcular contribución:', error);
      Alert.alert('Error', 'No se pudo calcular la contribución');
    }
  };

  const handleDeleteRequest = async (request) => {
    Alert.alert(
      'Borrar Solicitud',
      `¿Estás seguro de que deseas borrar esta solicitud?\n\nSe reembolsará ${formatCurrency(request.currentAmount)} a los contribuidores.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await savingsPoolService.deleteRequest(request.id);
              Alert.alert('¡Solicitud Borrada!', 'La solicitud ha sido borrada y los fondos han sido reembolsados.');
              await loadPoolData();
            } catch (error) {
              logger.error('Error al borrar solicitud:', error);
              Alert.alert('Error', error.message || 'No se pudo borrar la solicitud');
            }
          }
        }
      ]
    );
  };

  const renderMemberCard = (member) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberSavings}>
          Ahorros: {formatCurrency(member.totalSavings)}
        </Text>
      </View>
    </View>
  );

  const renderRequestCard = (request, isCompleted = false) => {
    // Validación para prevenir división por cero
    const amount = parseFloat(request.amount) || 1;
    const currentAmount = parseFloat(request.currentAmount) || 0;
    const progress = isCompleted ? 100 : Math.min(100, (currentAmount / amount) * 100);
    const remaining = Math.max(0, amount - currentAmount);
    const isOwnRequest = request.requesterId === userId;

    return (
      <View
        key={request.id}
        style={[
          styles.requestCard,
          isCompleted && styles.requestCardCompleted
        ]}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestRequester}>
            {request.requester}{isOwnRequest ? ' (Tú)' : ''}
          </Text>
          {!isCompleted && (
            <Text style={styles.requestContributors}>
              {request.contributors} contribuyendo
            </Text>
          )}
        </View>

        <Text style={styles.requestDescription}>{request.description}</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
            {isCompleted ? 'Completado' : 'Progreso'}
          </Text>
          <Text style={styles.amountValue}>
            {formatCurrency(isCompleted ? request.amount : request.currentAmount)} / {formatCurrency(request.amount)}
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {!isCompleted && (
          <>
            <Text style={styles.remainingText}>
              Faltan {formatCurrency(remaining)}
            </Text>

            {/* Mostrar botón Contribuir solo si NO es tu solicitud */}
            {!isOwnRequest && (
              <TouchableOpacity
                style={styles.contributeButton}
                onPress={() => handleContribute(request)}
              >
                <Text style={styles.contributeButtonText}>Contribuir</Text>
              </TouchableOpacity>
            )}

            {/* Mostrar botón Borrar solo si ES tu solicitud */}
            {isOwnRequest && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRequest(request)}
              >
                <Text style={styles.deleteButtonText}>Borrar Solicitud</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {isCompleted && request.completedAt && (
          <Text style={styles.completedDate}>
            Completado hace {Math.floor((Date.now() - new Date(request.completedAt).getTime()) / (1000 * 60 * 60 * 24))} días
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con balance del usuario */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Tus Ahorros Totales</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(userSavings)}</Text>
          <Text style={styles.balanceHint}>
            Puedes contribuir hasta el 50% de tus ahorros
          </Text>
        </View>

        {/* Miembros del Pozo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miembros del Pozo ({poolMembers.length})</Text>
          <View style={styles.membersContainer}>
            {poolMembers.map(renderMemberCard)}
          </View>
        </View>

        {/* Botón de crear solicitud */}
        <TouchableOpacity
          style={styles.createRequestButton}
          onPress={handleCreateRequest}
        >
          <Text style={styles.createRequestButtonText}>✋ Solicitar Ayuda</Text>
        </TouchableOpacity>

        {/* Solicitudes Activas */}
        {activeRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes Activas</Text>
            {activeRequests.map(request => renderRequestCard(request, false))}
          </View>
        )}

        {/* Solicitudes Completadas */}
        {completedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes Completadas</Text>
            {completedRequests.map(request => renderRequestCard(request, true))}
          </View>
        )}

        {activeRequests.length === 0 && completedRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🤝</Text>
            <Text style={styles.emptyStateText}>
              No hay solicitudes aún
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Cuando alguien necesite ayuda, aparecerá aquí
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  balanceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    opacity: 0.9,
    marginBottom: SPACING.xs / 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
    letterSpacing: -1
  },
  balanceHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    opacity: 0.85,
    lineHeight: FONT_SIZES.xs * 1.4
  },
  section: {
    marginBottom: SPACING.md
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  membersContainer: {
    gap: SPACING.sm
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.sm
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textLight
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2
  },
  memberSavings: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  createRequestButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  createRequestButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textLight
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm
  },
  requestCardCompleted: {
    opacity: 0.8
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  requestRequester: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text
  },
  requestContributors: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary
  },
  requestDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  amountLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  amountValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.sm
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xs
  },
  remainingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  contributeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center'
  },
  contributeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center'
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight
  },
  completedDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginTop: SPACING.xl
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md
  },
  emptyStateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
});

export default SavingsPoolScreen;
