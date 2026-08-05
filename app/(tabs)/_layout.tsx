import * as Icons from '@oxyhq/bloom/icons';
import { useBloomTheme } from '@oxyhq/bloom/theme';
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('accounts'),
          tabBarIcon: ({ color }) => <Icons.Key_Stroke2_Corner2_Rounded size="lg" fill={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scanQr'),
          tabBarIcon: ({ color }) => <Icons.QrCode_Stroke2_Corner0_Rounded size="lg" fill={color} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: t('sync'),
          tabBarIcon: ({ color }) => (
            <Icons.ArrowRotateClockwise_Stroke2_Corner0_Rounded size="lg" fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => (
            <Icons.SettingsGear2_Stroke2_Corner0_Rounded size="lg" fill={color} />
          ),
        }}
      />
    </Tabs>
  );
}
