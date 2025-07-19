import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import PINPad from '../components/PINPad';
import SafeAreaHeader from '../components/SafeAreaHeader';

enum SetupStep {
  INITIAL = 'initial',
  CREATE_PIN = 'create_pin',
  CONFIRM_PIN = 'confirm_pin',
  COMPLETE = 'complete',
}

export default function SecurityScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    isSecurityEnabled,
    isBiometricsEnabled,
    hasBiometricHardware,
    isBiometricsAvailable,
    biometricType,
    lockTimeout,
    toggleSecurity,
    toggleBiometrics,
    updateLockTimeout,
    setupPIN,
    hasSetupPIN,
  } = useAuth();

  const [setupStep, setSetupStep] = useState<SetupStep>(SetupStep.INITIAL);
  const [newPin, setNewPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Handle the initial security toggle
  const handleSecurityToggle = async (value: boolean) => {
    if (value && !hasSetupPIN) {
      // If enabling security and PIN not set up yet, start the setup process
      setSetupStep(SetupStep.CREATE_PIN);
    } else if (!value) {
      // Confirm before disabling security
      Alert.alert(
        t('disableSecurity'),
        t('disableSecurityConfirm'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('disable'),
            style: 'destructive',
            onPress: async () => {
              await toggleSecurity(false);
              await toggleBiometrics(false);
            },
          },
        ]
      );
    } else {
      // Just toggle security if PIN is already set up
      await toggleSecurity(value);
    }
  };

  // Handle biometric toggle
  const handleBiometricToggle = async (value: boolean) => {
    if (!isSecurityEnabled && value) {
      // Can't enable biometrics if security is disabled
      Alert.alert(
        t('enableSecurityFirst'),
        t('enableSecurityFirstDesc'),
        [{ text: t('ok') }]
      );
      return;
    }
    
    await toggleBiometrics(value);
  };

  // Handle timeout selection
  const handleTimeoutSelect = async (minutes: number) => {
    await updateLockTimeout(minutes);
  };

  // Render the PIN setup flow
  const renderPINSetup = () => {
    switch (setupStep) {
      case SetupStep.CREATE_PIN:
        return (
          <PINPad
            title={t('createPIN')}
            subtitle={t('createPINDesc')}
            error={error || undefined}
            onComplete={(pin) => {
              setNewPin(pin);
              setError(null);
              setSetupStep(SetupStep.CONFIRM_PIN);
            }}
          />
        );
      
      case SetupStep.CONFIRM_PIN:
        return (
          <PINPad
            title={t('confirmPIN')}
            subtitle={t('confirmPINDesc')}
            error={error || undefined}
            onComplete={async (pin) => {
              if (pin === newPin) {
                const success = await setupPIN(pin);
                if (success) {
                  await toggleSecurity(true);
                  setSetupStep(SetupStep.COMPLETE);
                } else {
                  setError(t('pinSetupError'));
                }
              } else {
                setError(t('pinMismatch'));
                setSetupStep(SetupStep.CREATE_PIN);
              }
            }}
          />
        );
      
      case SetupStep.COMPLETE:
        return (
          <View style={styles.setupCompleteContainer}>
            <Ionicons name="checkmark-circle" size={80} color={theme.success} />
            <Text style={[styles.setupCompleteTitle, { color: theme.text }]}>
              {t('pinSetupComplete')}
            </Text>
            <Text style={[styles.setupCompleteText, { color: theme.textSecondary }]}>
              {t('pinSetupCompleteDesc')}
            </Text>
            <Pressable
              style={[styles.setupCompleteButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setSetupStep(SetupStep.INITIAL);
              }}
            >
              <Text style={[styles.setupCompleteButtonText, { color: theme.buttonText }]}>
                {t('continue')}
              </Text>
            </Pressable>
          </View>
        );
      
      default:
        return renderSecuritySettings();
    }
  };

  // Render the main security settings screen
  const renderSecuritySettings = () => {
    const getBiometricName = () => {
      if (biometricType === 'FACE') {
        return t('faceID');
      } else if (biometricType === 'FINGERPRINT') {
        return t('fingerprint');
      }
      return t('biometrics');
    };

    return (
      <ScrollView style={styles.container}>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.optionContainer}>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                {t('appSecurity')}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                {t('appSecurityDesc')}
              </Text>
            </View>
            <Switch
              value={isSecurityEnabled}
              onValueChange={handleSecurityToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>

          {hasSetupPIN && (
            <Pressable
              style={styles.option}
              onPress={() => setSetupStep(SetupStep.CREATE_PIN)}
            >
              <View style={styles.optionContent}>
                <Ionicons name="keypad-outline" size={24} color={theme.primary} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('changePIN')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {isSecurityEnabled && hasBiometricHardware && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.optionContainer}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  {getBiometricName()}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  {isBiometricsAvailable
                    ? t('useBiometricsDesc')
                    : t('biometricsNotEnrolled')}
                </Text>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
                disabled={!isBiometricsAvailable}
              />
            </View>
          </View>
        )}

        {isSecurityEnabled && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('autoLockTimeout')}
            </Text>

            <Pressable
              style={styles.option}
              onPress={() => handleTimeoutSelect(1)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>
                {t('after1Minute')}
              </Text>
              {lockTimeout === 1 && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </Pressable>
            
            <View style={[styles.separator, { backgroundColor: theme.border }]} />

            <Pressable
              style={styles.option}
              onPress={() => handleTimeoutSelect(5)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>
                {t('after5Minutes')}
              </Text>
              {lockTimeout === 5 && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </Pressable>
            
            <View style={[styles.separator, { backgroundColor: theme.border }]} />

            <Pressable
              style={styles.option}
              onPress={() => handleTimeoutSelect(15)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>
                {t('after15Minutes')}
              </Text>
              {lockTimeout === 15 && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </Pressable>
            
            <View style={[styles.separator, { backgroundColor: theme.border }]} />

            <Pressable
              style={styles.option}
              onPress={() => handleTimeoutSelect(30)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>
                {t('after30Minutes')}
              </Text>
              {lockTimeout === 30 && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  };

  // Determine what to render based on the setup step
  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {setupStep === SetupStep.INITIAL ? (
        <SafeAreaHeader title={t('security')} showBackButton onBackPress={() => router.back()} />
      ) : (
        <Stack.Screen options={{ headerShown: false }} />
      )}
      {renderPINSetup()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    marginLeft: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
  setupCompleteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  setupCompleteTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  setupCompleteText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    marginHorizontal: 32,
  },
  setupCompleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  setupCompleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});