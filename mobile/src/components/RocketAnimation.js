import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Polygon, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import Particle from './Particle';
import Confetti from './Confetti';

const { width, height } = Dimensions.get('window');
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const RocketAnimation = ({
  onAnimationComplete,
  duration = 2000,
  colors = { primary: '#6B4CE6', secondary: '#00D9FF', flame: '#FF6B35' }
}) => {
  const translateY = useSharedValue(height);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const [showParticles, setShowParticles] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStarburst, setShowStarburst] = useState(false);

  useEffect(() => {
    // Show particles immediately
    setShowParticles(true);

    // Rocket rise animation
    translateY.value = withSequence(
      // Rise to top
      withTiming(height * 0.2, {
        duration: duration * 0.7,
        easing: Easing.out(Easing.cubic)
      }),
      // Small bounce
      withTiming(height * 0.25, {
        duration: duration * 0.1,
        easing: Easing.inOut(Easing.quad)
      }),
      // Final position
      withTiming(height * 0.2, {
        duration: duration * 0.1,
        easing: Easing.inOut(Easing.quad)
      })
    );

    // Slight rotation for dynamic effect
    rotate.value = withSequence(
      withTiming(-5, {
        duration: duration * 0.3,
        easing: Easing.inOut(Easing.quad)
      }),
      withTiming(5, {
        duration: duration * 0.3,
        easing: Easing.inOut(Easing.quad)
      }),
      withTiming(0, {
        duration: duration * 0.4,
        easing: Easing.inOut(Easing.quad)
      })
    );

    // Scale pulse
    scale.value = withSequence(
      withTiming(1.2, {
        duration: duration * 0.5,
        easing: Easing.out(Easing.quad)
      }),
      withTiming(1, {
        duration: duration * 0.5,
        easing: Easing.inOut(Easing.quad)
      })
    );

    // Show confetti and starburst when rocket reaches top
    setTimeout(() => {
      setShowConfetti(true);
      setShowStarburst(true);
    }, duration * 0.7);

    // Fade out and complete
    opacity.value = withDelay(
      duration * 0.8,
      withTiming(0, {
        duration: duration * 0.2,
        easing: Easing.out(Easing.quad)
      })
    );

    // Call completion callback
    setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, duration);
  }, []);

  const rocketStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value }
      ],
      opacity: opacity.value
    };
  });

  // Generate particles
  const particles = [];
  if (showParticles) {
    for (let i = 0; i < 15; i++) {
      particles.push(
        <Particle
          key={`particle-${i}`}
          delay={i * 50}
          startX={width / 2}
          startY={height - 50}
          endY={-150}
          duration={600}
        />
      );
    }
  }

  // Generate confetti
  const confettis = [];
  if (showConfetti) {
    for (let i = 0; i < 30; i++) {
      const randomX = width * 0.2 + Math.random() * width * 0.6;
      confettis.push(
        <Confetti
          key={`confetti-${i}`}
          delay={i * 30}
          startX={randomX}
          startY={height * 0.2}
          screenHeight={height}
        />
      );
    }
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Particles */}
      {particles}

      {/* Rocket */}
      <Animated.View style={[styles.rocketContainer, rocketStyle]}>
        <AnimatedSvg width={80} height={120} viewBox="0 0 80 120">
          <Defs>
            <RadialGradient id="flame" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.flame} stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFD700" stopOpacity="0.5" />
            </RadialGradient>
          </Defs>

          {/* Flame */}
          <Polygon
            points="30,80 40,100 40,110 35,105 30,110 25,105 20,110 20,100"
            fill="url(#flame)"
          />
          <Polygon
            points="50,80 60,100 60,110 55,105 50,110 45,105 40,110 40,100"
            fill="url(#flame)"
          />

          {/* Rocket body */}
          <Path
            d="M 20,80 L 20,40 Q 20,20 40,10 Q 60,20 60,40 L 60,80 Z"
            fill={colors.primary}
          />

          {/* Window */}
          <Circle cx="40" cy="35" r="12" fill={colors.secondary} />
          <Circle cx="40" cy="35" r="8" fill="#FFFFFF" opacity="0.7" />

          {/* Wings */}
          <Polygon points="20,65 5,85 20,75" fill={colors.secondary} />
          <Polygon points="60,65 75,85 60,75" fill={colors.secondary} />

          {/* Details */}
          <Circle cx="40" cy="55" r="3" fill="#FFFFFF" opacity="0.5" />
          <Circle cx="40" cy="65" r="3" fill="#FFFFFF" opacity="0.5" />
        </AnimatedSvg>
      </Animated.View>

      {/* Confetti */}
      {confettis}

      {/* Starburst effect */}
      {showStarburst && (
        <View style={[styles.starburst, { top: height * 0.2 }]}>
          {[...Array(8)].map((_, i) => (
            <View
              key={`ray-${i}`}
              style={[
                styles.ray,
                {
                  transform: [{ rotate: `${i * 45}deg` }]
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  rocketContainer: {
    position: 'absolute',
    left: width / 2 - 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  starburst: {
    position: 'absolute',
    width: 200,
    height: 200,
    left: width / 2 - 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 100,
    backgroundColor: '#FFD700',
    opacity: 0.6
  }
});

export default RocketAnimation;
