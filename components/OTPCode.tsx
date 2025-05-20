import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { generateTOTP } from '../utils/totp';
import { useTheme } from '../contexts/ThemeContext';

interface OTPCodeProps {
  secret: string;
  issuer: string;
  account: string;
}

export default function OTPCode({ secret, issuer, account }: OTPCodeProps) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const { theme } = useTheme();
  const [pressAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const generateCode = async () => {
      try {
        const newCode = await generateTOTP(secret);
        setCode(newCode);
        
        // Calculate time left until next code
        const epoch = Math.floor(Date.now() / 1000);
        setTimeLeft(30 - (epoch % 30));
      } catch (error) {
        console.error('Error generating TOTP:', error);
      }
    };

    generateCode();
    const interval = setInterval(generateCode, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    await Clipboard.setStringAsync(code);

    // Animate press
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formattedCode = `${code.slice(0, 3)} ${code.slice(3)}`;
  const timerColor = timeLeft <= 5 ? theme.warning : theme.primary;

  return (
    <Animated.View style={[
      styles.wrapper,
      { 
        transform: [{ scale: pressAnim }],
        shadowColor: theme.cardShadow,
      }
    ]}>
      <Pressable onPress={handlePress}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.infoContainer}>
            <View style={styles.accountInfo}>
              <Text style={[styles.issuer, { color: theme.text }]}>{issuer}</Text>
              <Text style={[styles.account, { color: theme.textSecondary }]}>{account}</Text>
            </View>
            <View style={styles.codeContainer}>
              <Text style={[styles.code, { color: theme.primary }]}>{formattedCode}</Text>
              <View style={[styles.timeLeftBadge, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.timeLeftText, { color: theme.textSecondary }]}>{timeLeft}s</Text>
              </View>
            </View>
          </View>
          <View
            style={[styles.timer, { width: `${(timeLeft / 30) * 100}%`, backgroundColor: timerColor }]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  accountInfo: {
    marginBottom: 8,
  },
  issuer: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  account: {
    fontSize: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timeLeftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeLeftText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timer: {
    height: 3,
    borderRadius: 1.5,
  },
});