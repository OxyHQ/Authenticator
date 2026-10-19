// Tailwind v4 + NativeWind entry. Importing it here is what makes
// react-native-css compile the utility stylesheet for the web build, so
// className layout utilities (from this app and @oxy.so/services) render on web
// instead of falling through to react-native-web's base View reset. Pairs with
// postcss.config.mjs.
import '../global.css';
import '../i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BloomProvider } from '@oxy.so/bloom/provider';
// The root entry, not the lean `@oxy.so/services/ui/client`: in services 12.2.0
// only the root entry calls `setPlatformOS(Platform.OS)`, so a native build that
// imports nothing but lean entries reports its platform to @oxy.so/core as
// 'unknown'. The cost is web first paint, which keeps the account screens.
import { OxyProvider } from '@oxy.so/services';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { API_URL, BRAND_SEED, OXY_CLIENT_ID, THEME_PERSIST_KEY } from '@/lib/config';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* BloomProvider is the outermost theming authority, so it must wrap every
            render branch. `seed` themes the whole app from Authenticator's own
            brand blue rather than a stock preset, so the tonal engine derives
            the light and dark role sets from the colour the app already had. */}
        <BloomProvider
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
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="auto" />
          </OxyProvider>
        </BloomProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
