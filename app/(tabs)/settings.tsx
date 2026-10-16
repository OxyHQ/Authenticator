import AsyncStorage from '@react-native-async-storage/async-storage';
import { alert } from '@oxy.so/bloom/surfaces';
import { RiAccountCircleLine } from '@oxy.so/bloom/icons/RiAccountCircleLine';
import { RiDeleteBin6Line } from '@oxy.so/bloom/icons/RiDeleteBin6Line';
import { RiGlobalLine } from '@oxy.so/bloom/icons/RiGlobalLine';
import { RiLoginBoxLine } from '@oxy.so/bloom/icons/RiLoginBoxLine';
import { RiMoonLine } from '@oxy.so/bloom/icons/RiMoonLine';
import { RiResetRightLine } from '@oxy.so/bloom/icons/RiResetRightLine';
import {
  SettingsListDivider,
  SettingsListGroup,
  SettingsListItem,
} from '@oxy.so/bloom/settings-list';
import { Switch } from '@oxy.so/bloom/switch';
import { useBloomTheme } from '@oxy.so/bloom/theme';
import { P } from '@oxy.so/bloom/typography';
import { useOxy } from '@oxy.so/services';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import SafeAreaHeader from '../../components/SafeAreaHeader';
import i18n from '../../i18n';

export default function SettingsScreen() {
  const { theme, setMode } = useBloomTheme();
  const { t } = useTranslation();
  const { user, openAccountDialog } = useOxy();

  const handleClearAccounts = () => {
    alert(t('clearConfirmTitle'), t('clearConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('clear'),
        style: 'destructive',
        onPress: () => {
          AsyncStorage.removeItem('accounts').catch((error: unknown) => {
            console.error('Error clearing accounts:', error);
          });
        },
      },
    ]);
  };

  const toggleDarkMode = () => {
    setMode(theme.isDark ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaHeader title={t('settings')} />

      <SettingsListGroup>
        <SettingsListItem
          icon={
            user ? (
              <RiAccountCircleLine size="lg" fill={theme.colors.primary} />
            ) : (
              <RiLoginBoxLine size="lg" fill={theme.colors.primary} />
            )
          }
          title={user?.username ?? t('signIn')}
          onPress={() => openAccountDialog()}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<RiMoonLine size="lg" fill={theme.colors.primary} />}
          title={t('darkMode')}
          // The whole row toggles, not just the switch. Tapping the label is
          // how the pre-Bloom version worked and how a settings row is expected
          // to behave.
          onPress={toggleDarkMode}
          rightElement={<Switch checked={theme.isDark} onCheckedChange={toggleDarkMode} />}
          showChevron={false}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<RiGlobalLine size="lg" fill={theme.colors.primary} />}
          title={t('language')}
          value={i18n.language === 'en' ? 'English' : 'Español'}
          onPress={toggleLanguage}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<RiResetRightLine size="lg" fill={theme.colors.primary} />}
          title={t('syncAccounts')}
          onPress={() => router.push('/sync')}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<RiDeleteBin6Line size="lg" fill={theme.colors.negative} />}
          title={t('clearAllAccounts')}
          destructive
          onPress={handleClearAccounts}
        />
      </SettingsListGroup>

      <View className="items-center p-4">
        <P className="text-sm text-muted-foreground">
          {t('version')} {Constants.expoConfig?.version ?? ''}
        </P>
      </View>
    </View>
  );
}
