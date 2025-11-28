import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  interpolate
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../../utils/constants';
import { haptics } from '../../utils/haptics';

/**
 * Input Component - Reusable text input with validation and animations
 *
 * Features:
 * - Animated label
 * - Error states with shake animation
 * - Success states
 * - Clear button
 * - Show/hide password toggle
 * - Icons support
 * - Character counter
 */
const Input = ({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  error,
  success,
  helperText,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  showClearButton = false,
  showCharacterCount = false,
  style,
  inputStyle,
  containerStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Local state to track if input has content, handling both prop updates and native autofill
  const [hasContent, setHasContent] = useState(Boolean(value));
  const inputRef = useRef(null);

  const focusAnim = useSharedValue(0);
  const errorShakeAnim = useSharedValue(0);
  const labelPosition = useSharedValue(value ? 1 : 0);

  // Sync local state with prop value
  React.useEffect(() => {
    setHasContent(Boolean(value));
  }, [value]);

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    focusAnim.value = withSpring(1, { damping: 15 });
    labelPosition.value = withTiming(1, { duration: 200 });
    haptics.selection();
    onFocus && onFocus(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    focusAnim.value = withSpring(0, { damping: 15 });
    if (!hasContent) {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
    onBlur && onBlur(e);
  };

  // Shake animation on error
  React.useEffect(() => {
    if (error) {
      errorShakeAnim.value = withSpring(1, { damping: 10, stiffness: 300 }, () => {
        errorShakeAnim.value = withSpring(0, { damping: 10 });
      });
      haptics.error();
    }
  }, [error]);

  // Update label position based on content or focus
  React.useEffect(() => {
    if (hasContent || isFocused) {
      labelPosition.value = withTiming(1, { duration: 200 });
    } else {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
  }, [hasContent, isFocused]);

  // Container animated style
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [error ? COLORS.error : COLORS.border, COLORS.primary]
    );

    const translateX = errorShakeAnim.value * 10 * Math.sin(errorShakeAnim.value * 10);

    return {
      borderColor,
      transform: [{ translateX }],
      borderWidth: focusAnim.value === 1 ? 2 : 1
    };
  });

  // Label animated style
  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(labelPosition.value, [0, 1], [0, -28])
        },
        {
          scale: interpolate(labelPosition.value, [0, 1], [1, 0.85])
        }
      ],
      color: interpolateColor(
        focusAnim.value,
        [0, 1],
        [COLORS.textSecondary, COLORS.primary]
      )
    };
  });

  // Clear input
  const handleClear = () => {
    onChangeText('');
    haptics.light();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    haptics.light();
  };

  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  // Handle native change event (for autofill cases that might not trigger onChangeText immediately)
  const handleOnChange = (e) => {
    const text = e.nativeEvent.text;
    if (text && text.length > 0) {
      labelPosition.value = withTiming(1, { duration: 200 });
    }
    if (rest.onChange) {
      rest.onChange(e);
    }
  };

  // Handle selection change (backup for autofill detection)
  const handleSelectionChange = (e) => {
    const selection = e.nativeEvent.selection;
    if (selection && (selection.start > 0 || selection.end > 0)) {
      labelPosition.value = withTiming(1, { duration: 200 });
    }
    if (rest.onSelectionChange) {
      rest.onSelectionChange(e);
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label */}
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            { left: leftIcon ? SPACING.xl + 12 : SPACING.md },
            labelAnimatedStyle
          ]}
        >
          <Text
            style={[
              styles.label,
              hasError && styles.labelError,
              hasSuccess && styles.labelSuccess,
              isFocused && styles.labelFocused
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          hasError && styles.inputContainerError,
          hasSuccess && styles.inputContainerSuccess,
          disabled && styles.inputContainerDisabled,
          containerAnimatedStyle,
          style
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{leftIcon}</Text>
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showClearButton || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          onChange={handleOnChange}
          onSelectionChange={handleSelectionChange} // Added selection handler
          onFocus={handleFocus}
          onBlur={handleBlur}
          importantForAutofill="yes" // Force autofill importance
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          accessible={true}
          accessibilityLabel={label || placeholder}
          accessibilityHint={helperText}
          accessibilityState={{ disabled }}
          {...rest}
        />

        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          {/* Clear Button */}
          {showClearButton && value && !disabled && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}

          {/* Password Toggle */}
          {secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.icon}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          )}

          {/* Right Icon */}
          {rightIcon && !showClearButton && !secureTextEntry && (
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{rightIcon}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Helper Text / Error / Success / Character Count */}
      <View style={styles.footer}>
        <View style={styles.helperTextContainer}>
          {error && (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
          {!error && success && (
            <Text style={styles.successText}>{success}</Text>
          )}
          {!error && !success && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>

        {showCharacterCount && maxLength && (
          <Text style={[
            styles.characterCount,
            value?.length >= maxLength && styles.characterCountMax
          ]}>
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md
  },

  labelContainer: {
    position: 'absolute',
    top: 14,
    zIndex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.xs
  },

  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary
  },

  labelFocused: {
    color: COLORS.primary
  },

  labelError: {
    color: COLORS.error
  },

  labelSuccess: {
    color: COLORS.success
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
    ...SHADOWS.sm
  },

  inputContainerMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md
  },

  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorAlpha10
  },

  inputContainerSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successAlpha10
  },

  inputContainerDisabled: {
    backgroundColor: COLORS.backgroundDark,
    opacity: 0.6
  },

  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.regular,
    padding: 0
  },

  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: SPACING.xs
  },

  inputWithLeftIcon: {
    marginLeft: SPACING.sm
  },

  inputWithRightIcon: {
    marginRight: SPACING.sm
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  icon: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },

  actionButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center'
  },

  clearButton: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs
  },

  helperTextContainer: {
    flex: 1
  },

  helperText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.xs * 1.4
  },

  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.xs * 1.4
  },

  successText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.xs * 1.4
  },

  characterCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginLeft: SPACING.sm
  },

  characterCountMax: {
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.semibold
  }
});

export default Input;
