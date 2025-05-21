import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import PINPad from './PINPad';
import { Ionicons } from '@expo/vector-icons';

interface AuthModalProps {
  visible: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    authState,
    isBiometricsEnabled,
    isBiometricsAvailable,
    biometricType,
    authenticateWithBiometrics,
    authenticateWithPIN,
    retryCount,
    maxRetries,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);

  // Try biometric authentication when the modal becomes visible
  useEffect(() => {
    if (visible && isBiometricsEnabled && isBiometricsAvailable && authState === 'unauthenticated') {
      handleBiometricAuth();
    }
  }, [visible, isBiometricsEnabled, isBiometricsAvailable, authState, handleBiometricAuth]);

  // Show biometric button if available but not auto-triggered
  useEffect(() => {
    setShowBiometric(isBiometricsEnabled && isBiometricsAvailable);
  }, [isBiometricsEnabled, isBiometricsAvailable]);

  const handleBiometricAuth = async () => {
    setError(null);
    const success = await authenticateWithBiometrics();
    if (!success) {
      setError(t('biometricError'));
    }
  };

  const handlePinComplete = async (pin: string) => {
    setError(null);
    const success = await authenticateWithPIN(pin);
    if (!success) {
      setError(t('incorrectPin'));
    }
  };

  // Show nothing if already authenticated or if security is not enabled
  if (authState !== 'unauthenticated') {
    return null;
  }

  // Retry attempts handling - show a different message if too many attempts
  const tooManyAttempts = retryCount >= maxRetries;
  
  // This will be shown if too many failed attempts
  if (tooManyAttempts) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: theme.surface }]}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('tooManyAttempts')}
            </Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              {t('tryAgainLater')}
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleBiometricAuth}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                {t('useBiometrics')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={theme.primary} />
        </View>

        <PINPad
          title={t('enterPIN')}
          subtitle={t('enterPINDesc')}
          error={error || undefined}
          onComplete={handlePinComplete}
          pinLength={4}
          showBiometricButton={showBiometric}
          onBiometricPress={handleBiometricAuth}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AuthModal;