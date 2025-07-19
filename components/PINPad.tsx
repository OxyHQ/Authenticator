import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface PINPadProps {
  onComplete: (pin: string) => void;
  pinLength?: number;
  title?: string;
  subtitle?: string;
  error?: string;
  onBiometricPress?: () => void;
  showBiometricButton?: boolean;
}

const PINPad: React.FC<PINPadProps> = ({
  onComplete,
  pinLength = 4,
  title = 'Enter PIN',
  subtitle,
  error,
  onBiometricPress,
  showBiometricButton = false,
}) => {
  const [pin, setPin] = useState<string>('');
  const { theme } = useTheme();

  // When PIN is complete, call the onComplete callback
  useEffect(() => {
    if (pin.length === pinLength) {
      onComplete(pin);
    }
  }, [pin, pinLength, onComplete]);

  const handlePress = (digit: string) => {
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    // Don't add more digits if we've reached the maximum
    if (pin.length < pinLength) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setPin(prev => prev.slice(0, -1));
  };

  const handleBiometricPress = () => {
    if (onBiometricPress) {
      onBiometricPress();
    }
  };

  // Render PIN indicators (filled or empty circles)
  const renderPinIndicators = () => {
    const indicators = [];
    for (let i = 0; i < pinLength; i++) {
      indicators.push(
        <View
          key={i}
          style={[
            styles.pinIndicator,
            {
              backgroundColor: i < pin.length ? theme.primary : 'transparent',
              borderColor: theme.border,
            },
          ]}
        />
      );
    }
    return <View style={styles.pinIndicatorsContainer}>{indicators}</View>;
  };

  // Generate keypad buttons (1-9, 0, delete)
  const renderKeypad = () => {
    const keypadNumbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [
        showBiometricButton ? (
          <Pressable
            key="biometric-button"
            style={styles.keypadButtonContainer}
            onPress={handleBiometricPress}
          >
            <Ionicons name="finger-print" size={28} color={theme.primary} />
          </Pressable>
        ) : (
          <View key="empty-button" />
        ),
        '0',
        <Pressable key="delete-button" style={styles.keypadButtonContainer} onPress={handleDelete}>
          <Ionicons name="backspace" size={24} color={theme.text} />
        </Pressable>,
      ],
    ];

    return (
      <View style={styles.keypadContainer}>
        {keypadNumbers.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((item, colIndex) => {
              if (typeof item === 'string') {
                return (
                  <Pressable
                    key={`btn-${rowIndex}-${colIndex}`}
                    style={[
                      styles.keypadButtonContainer,
                      { backgroundColor: theme.surface },
                    ]}
                    onPress={() => handlePress(item)}
                  >
                    <Text style={[styles.keypadButtonText, { color: theme.text }]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              } else {
                return item;
              }
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {renderPinIndicators()}

      {error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {error}
        </Text>
      )}

      {renderKeypad()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 24,
  },
  pinIndicatorsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  pinIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    margin: 8,
  },
  keypadContainer: {
    width: '80%',
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keypadButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: '500',
  },
  errorText: {
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PINPad;