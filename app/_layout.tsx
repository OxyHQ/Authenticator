import { useEffect } from 'react';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import '../i18n';
import { OxyServices, OxyProvider } from "@oxyhq/services";

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

function AppLayout() {
  const { isDark } = useTheme();
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
        <Slot />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </OxyProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}
