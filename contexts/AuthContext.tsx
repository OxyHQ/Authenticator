import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Security settings storage keys
const SECURITY_ENABLED_KEY = 'security_enabled';
const PIN_KEY = 'security_pin';
const BIO_ENABLED_KEY = 'bio_enabled';
const LOCK_TIMEOUT_KEY = 'lock_timeout'; // in minutes

type AuthState = 'initial' | 'unauthenticated' | 'authenticated';

interface AuthContextType {
  isSecurityEnabled: boolean;
  isBiometricsEnabled: boolean;
  isBiometricsAvailable: boolean;
  biometricType: string;
  authState: AuthState;
  lockTimeout: number; // in minutes
  hasBiometricHardware: boolean;
  hasSetupPIN: boolean;
  retryCount: number;
  maxRetries: number;
  
  // Methods
  authenticateWithBiometrics: () => Promise<boolean>;
  authenticateWithPIN: (pin: string) => Promise<boolean>;
  setupPIN: (pin: string) => Promise<boolean>;
  toggleSecurity: (enabled: boolean) => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  updateLockTimeout: (minutes: number) => Promise<void>;
  lock: () => void;
  resetRetryCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [authState, setAuthState] = useState<AuthState>('initial');
  const [lockTimeout, setLockTimeout] = useState(5); // Default 5 minutes
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [hasSetupPIN, setHasSetupPIN] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(5);
  
  // Check for biometric hardware on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setHasBiometricHardware(hasHardware);
      
      if (hasHardware) {
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricsAvailable(isEnrolled);
        
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('FACE');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('FINGERPRINT');
        } else {
          setBiometricType('BIOMETRICS');
        }
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Load saved security settings
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const securityEnabled = await SecureStore.getItemAsync(SECURITY_ENABLED_KEY);
        setIsSecurityEnabled(securityEnabled === 'true');
        
        const bioEnabled = await SecureStore.getItemAsync(BIO_ENABLED_KEY);
        setIsBiometricsEnabled(bioEnabled === 'true');
        
        const savedTimeout = await SecureStore.getItemAsync(LOCK_TIMEOUT_KEY);
        if (savedTimeout) {
          setLockTimeout(parseInt(savedTimeout, 10));
        }
        
        const hasPin = await SecureStore.getItemAsync(PIN_KEY);
        setHasSetupPIN(!!hasPin);
        
        // If security is enabled but not authenticated yet
        if (securityEnabled === 'true') {
          setAuthState('unauthenticated');
        } else {
          setAuthState('authenticated');
        }
      } catch (error) {
        console.error('Error loading security settings:', error);
        setAuthState('authenticated'); // Fallback to authenticated if error
      }
    };
    
    loadSecuritySettings();
  }, []);
  
  // Authenticate with biometrics
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your accounts',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        setAuthState('authenticated');
        resetRetryCount();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };
  
  // Authenticate with PIN
  const authenticateWithPIN = async (pin: string): Promise<boolean> => {
    try {
      const savedPin = await SecureStore.getItemAsync(PIN_KEY);
      
      if (pin === savedPin) {
        setAuthState('authenticated');
        resetRetryCount();
        return true;
      } else {
        setRetryCount(prev => prev + 1);
        return false;
      }
    } catch (error) {
      console.error('PIN authentication error:', error);
      return false;
    }
  };
  
  // Setup PIN for the first time or change it
  const setupPIN = async (pin: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(PIN_KEY, pin);
      setHasSetupPIN(true);
      return true;
    } catch (error) {
      console.error('Error setting up PIN:', error);
      return false;
    }
  };
  
  // Toggle app security (enable/disable PIN/biometric protection)
  const toggleSecurity = async (enabled: boolean): Promise<void> => {
    try {
      await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, enabled.toString());
      setIsSecurityEnabled(enabled);
      
      // If disabling security, consider the app authenticated
      if (!enabled) {
        setAuthState('authenticated');
      }
    } catch (error) {
      console.error('Error toggling security:', error);
    }
  };
  
  // Toggle biometric authentication
  const toggleBiometrics = async (enabled: boolean): Promise<void> => {
    try {
      await SecureStore.setItemAsync(BIO_ENABLED_KEY, enabled.toString());
      setIsBiometricsEnabled(enabled);
    } catch (error) {
      console.error('Error toggling biometrics:', error);
    }
  };
  
  // Set the lock timeout duration
  const updateLockTimeout = async (minutes: number): Promise<void> => {
    try {
      await SecureStore.setItemAsync(LOCK_TIMEOUT_KEY, minutes.toString());
      setLockTimeout(minutes);
    } catch (error) {
      console.error('Error setting lock timeout:', error);
    }
  };
  
  // Lock the app manually
  const lock = (): void => {
    if (isSecurityEnabled) {
      setAuthState('unauthenticated');
    }
  };
  
  // Reset retry count after successful authentication
  const resetRetryCount = (): void => {
    setRetryCount(0);
  };
  
  return (
    <AuthContext.Provider
      value={{
        isSecurityEnabled,
        isBiometricsEnabled,
        isBiometricsAvailable,
        biometricType,
        authState,
        lockTimeout,
        hasBiometricHardware,
        hasSetupPIN,
        retryCount,
        maxRetries,
        authenticateWithBiometrics,
        authenticateWithPIN,
        setupPIN,
        toggleSecurity,
        toggleBiometrics,
        updateLockTimeout,
        lock,
        resetRetryCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};