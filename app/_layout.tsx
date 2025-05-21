import { useEffect, useState } from 'react';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../i18n';
import { OxyServices, OxyProvider } from "@oxyhq/services";
import AuthModal from '../components/AuthModal';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

function AppContent() {
  const { isDark, theme } = useTheme();
  const { authState, isSecurityEnabled, lockTimeout, lock } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [lastActive, setLastActive] = useState(Date.now());
  
  // Initialize OxyServices
  const oxyServices = new OxyServices({
    baseURL: 'https://api.oxy.so',
  });

  // Handle user authentication - no hooks here
  const handleAuthenticated = (user: any) => {
    console.log('User authenticated:', user);
    // We'll just log the authentication event here
    // The bottom sheet will be closed by the OxyProvider internally
  };

  // Listen for app state changes to handle app lock
  useEffect(() => {
    if (!isSecurityEnabled) return;
    
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground
        const inactiveTime = Date.now() - lastActive;
        const timeoutMs = lockTimeout * 60 * 1000; // convert minutes to ms
        
        if (inactiveTime > timeoutMs) {
          // Lock the app if it's been inactive for longer than the timeout
          lock();
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background, update last active time
        setLastActive(Date.now());
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isSecurityEnabled, lockTimeout, lastActive, lock]);

  // Show auth modal if security is enabled and not authenticated
  useEffect(() => {
    setShowAuth(isSecurityEnabled && authState === 'unauthenticated');
  }, [isSecurityEnabled, authState]);

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <>
      <OxyProvider
        oxyServices={oxyServices}
        initialScreen="SignIn"
        autoPresent={false} // Don't auto-present, we'll control it with the button
        onClose={() => console.log('Sheet closed')}
        onAuthenticated={handleAuthenticated}
        onAuthStateChange={(user) => console.log('Auth state changed:', user?.username || 'logged out')}
        storageKeyPrefix="oxy_example" // Prefix for stored auth tokens
        theme="light"
      >
        <SafeAreaProvider style={{ backgroundColor: theme.background }}>
          <Slot />
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthModal visible={showAuth} />
        </SafeAreaProvider>
      </OxyProvider>
    </>
  );
}

function AppLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}
