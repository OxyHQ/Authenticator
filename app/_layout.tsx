// Tailwind v4 + NativeWind entry. Importing it here is what makes
// react-native-css compile the utility stylesheet for the web build, so
// className layout utilities (from this app and @oxy.so/services) render on web
// instead of falling through to react-native-web's base View reset. Pairs with
// postcss.config.mjs.
import '../global.css';
import '../i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BloomProvider } from '@oxy.so/bloom/provider';
import { expoRouterScrollAdapter } from '@oxy.so/bloom/scroll/expo-router';
import { OxyProvider, useAccountColor } from '@oxy.so/services/ui/client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { API_URL, BRAND_SEED, OXY_CLIENT_ID, THEME_PERSIST_KEY } from '@/lib/config';

/** Wears the signed-in account's Oxy colour; must sit below both providers. */
function AccountColor() {
  useAccountColor();
  return null;
}

export default function RootLayout() {
  // Bloom owns the theme and composition; Oxy owns the gesture and safe-area roots.
  // Keep the app's brand seed and persisted preferences at this shared root.
  return (
    <BloomProvider
      scrollAdapter={expoRouterScrollAdapter}
      seed={BRAND_SEED}
      defaultMode="system"
      persistKey={THEME_PERSIST_KEY}
      storage={AsyncStorage}
    >
      {/* The single session authority on web and native. It owns the query
              client and the Bloom surface / dialog / toast hosts, and never
              redirects to an external login page. Interactive sign-in is the
              in-app account dialog. */}
      <OxyProvider baseURL={API_URL} clientId={OXY_CLIENT_ID}>
        <AccountColor />
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </OxyProvider>
    </BloomProvider>
  );
}
