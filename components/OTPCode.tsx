import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  };

  const formattedCode = `${code.slice(0, 3)} ${code.slice(3)}`;

  return (
    <Pressable onPress={handlePress}>
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <View style={styles.infoContainer}>
          <View style={styles.accountInfo}>
            <Text style={[styles.issuer, { color: theme.text }]}>{issuer}</Text>
            <Text style={[styles.account, { color: theme.textSecondary }]}>{account}</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={[styles.code, { color: theme.primary }]}>{formattedCode}</Text>
          </View>
        </View>
        <View style={[styles.timer, { width: `${(timeLeft / 30) * 100}%`, backgroundColor: theme.primary }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 35,
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  accountInfo: {
  },
  issuer: {
    fontSize: 16,
    fontWeight: '600',
  },
  account: {
    fontSize: 14,
  },
  codeContainer: {
    position: 'relative',
  },
  code: {
    fontSize: 45,
    fontWeight: '900',
    letterSpacing: 2,
  },
  timer: {
    height: 3,
    borderRadius: 1.5,
  },
});