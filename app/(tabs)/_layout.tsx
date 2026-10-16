import { RiKey2Line } from '@oxy.so/bloom/icons/RiKey2Line';
import { RiQrCodeLine } from '@oxy.so/bloom/icons/RiQrCodeLine';
import { RiResetRightLine } from '@oxy.so/bloom/icons/RiResetRightLine';
import { RiSettings3Line } from '@oxy.so/bloom/icons/RiSettings3Line';
import { useBloomTheme } from '@oxy.so/bloom/theme';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_CONTENT_HEIGHT = 50;

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme } = useBloomTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // The navigator's own bar is not className-aware, so its chrome is
        // driven from resolved Bloom tokens rather than utility classes.
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('accounts'),
          tabBarIcon: ({ color }) => <RiKey2Line size="lg" fill={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scanQr'),
          tabBarIcon: ({ color }) => <RiQrCodeLine size="lg" fill={color} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: t('sync'),
          tabBarIcon: ({ color }) => <RiResetRightLine size="lg" fill={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <RiSettings3Line size="lg" fill={color} />,
        }}
      />
    </Tabs>
  );
}
