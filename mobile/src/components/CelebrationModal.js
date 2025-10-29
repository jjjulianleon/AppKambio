import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const CelebrationModal = ({
  visible,
  onClose,
  title = '¡Felicidades!',
  message,
  emoji = '🎉',
  type = 'kambio' // 'kambio' or 'goal'
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 15 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0)
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Main modal animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      // Confetti animations
      confettiAnims.forEach((anim, index) => {
        const delay = index * 50;
        const randomX = (Math.random() - 0.5) * width;
        const randomRotation = Math.random() * 720 - 360;

        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.x, {
              toValue: randomX,
              duration: 2000,
              useNativeDriver: true
            }),
            Animated.timing(anim.y, {
              toValue: height,
              duration: 2000,
              useNativeDriver: true
            }),
            Animated.timing(anim.rotate, {
              toValue: randomRotation,
              duration: 2000,
              useNativeDriver: true
            }),
            Animated.sequence([
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
              }),
              Animated.timing(anim.scale, {
                toValue: 0,
                duration: 300,
                delay: 1400,
                useNativeDriver: true
              })
            ])
          ])
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnims.forEach(anim => {
        anim.x.setValue(0);
        anim.y.setValue(0);
        anim.rotate.setValue(0);
        anim.scale.setValue(0);
      });
    }
  }, [visible]);

  const getColorForType = () => {
    if (type === 'goal') return COLORS.success;
    return COLORS.primary;
  };

  const getEmojiForType = () => {
    if (type === 'goal') return '🏆';
    return emoji;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti particles */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: [
                  COLORS.primary,
                  COLORS.secondary,
                  COLORS.success,
                  COLORS.warning,
                  '#FFD700'
                ][index % 5],
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  })},
                  { scale: anim.scale }
                ]
              }
            ]}
          />
        ))}

        {/* Main celebration card */}
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.emojiContainer, { backgroundColor: getColorForType() + '20' }]}>
            <Text style={styles.emoji}>{getEmojiForType()}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          {message && (
            <Text style={styles.message}>{message}</Text>
          )}

          <View style={styles.stars}>
            <Text style={styles.star}>✨</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>✨</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getColorForType() }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>¡Continuar!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl
  },
  confetti: {
    position: 'absolute',
    top: -20,
    left: width / 2,
    width: 10,
    height: 10,
    borderRadius: 2
  },
  celebrationCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.xl
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  emoji: {
    fontSize: 72
  },
  title: {
    fontSize: FONT_SIZES.xxxl * 1.2,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: -0.5
  },
  message: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.lg * 1.5,
    marginBottom: SPACING.lg
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.md
  },
  star: {
    fontSize: 32
  },
  button: {
    width: '100%',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  }
});

export default CelebrationModal;
