import AsyncStorage from '@react-native-async-storage/async-storage';
import { alert } from '@oxyhq/bloom/dialog';
import * as Icons from '@oxyhq/bloom/icons';
import {
  SettingsListDivider,
  SettingsListGroup,
  SettingsListItem,
} from '@oxyhq/bloom/settings-list';
import { Switch } from '@oxyhq/bloom/switch';
import { useBloomTheme } from '@oxyhq/bloom/theme';
import { P } from '@oxyhq/bloom/typography';
import { useOxy } from '@oxyhq/services';
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
              <Icons.UserCircle_Stroke2_Corner0_Rounded size="lg" fill={theme.colors.primary} />
            ) : (
              <Icons.ArrowBoxLeft_Stroke2_Corner0_Rounded size="lg" fill={theme.colors.primary} />
            )
          }
          title={user?.username ?? t('signIn')}
          onPress={() => openAccountDialog()}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<Icons.Moon_Stroke2_Corner0_Rounded size="lg" fill={theme.colors.primary} />}
          title={t('darkMode')}
          // The whole row toggles, not just the switch. Tapping the label is
          // how the pre-Bloom version worked and how a settings row is expected
          // to behave.
          onPress={toggleDarkMode}
          rightElement={<Switch value={theme.isDark} onValueChange={toggleDarkMode} />}
          showChevron={false}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<Icons.Globe_Stroke2_Corner0_Rounded size="lg" fill={theme.colors.primary} />}
          title={t('language')}
          value={i18n.language === 'en' ? 'English' : 'Español'}
          onPress={toggleLanguage}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={
            <Icons.ArrowRotateClockwise_Stroke2_Corner0_Rounded
              size="lg"
              fill={theme.colors.primary}
            />
          }
          title={t('syncAccounts')}
          onPress={() => router.push('/sync')}
        />

        <SettingsListDivider />

        <SettingsListItem
          icon={<Icons.Trash_Stroke2_Corner0_Rounded size="lg" fill={theme.colors.negative} />}
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
