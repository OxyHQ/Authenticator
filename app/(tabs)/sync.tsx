import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@oxyhq/bloom/button';
import { alert } from '@oxyhq/bloom/dialog';
import * as Icons from '@oxyhq/bloom/icons';
import { useBloomTheme } from '@oxyhq/bloom/theme';
import { P, Text } from '@oxyhq/bloom/typography';
import { useOxy } from '@oxyhq/services';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import SafeAreaHeader from '../../components/SafeAreaHeader';

interface Account {
  secret: string;
  issuer: string;
  account: string;
}

/**
 * Where cloud sync stores this app's account list.
 *
 * The pre-upgrade build POSTed to `/user/data/authenticator` through the SDK's
 * raw axios escape hatch. That route does not exist on the API and the escape
 * hatch is gone from the SDK, so the same payload now goes through the SDK's
 * per-user app-data store (`/users/me/app-data/:namespace/:key`). The stored
 * value is the same array of `{ secret, issuer, account }` objects as before.
 */
const APP_DATA_NAMESPACE = 'authenticator';
const APP_DATA_KEY = 'accounts';

export default function SyncScreen() {
  const { theme } = useBloomTheme();
  const { t } = useTranslation();
  const { user, openAccountDialog, oxyServices, canUsePrivateApi } = useOxy();

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Load local accounts and last sync time
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAccounts = await AsyncStorage.getItem('accounts');
        if (storedAccounts) {
          setAccounts(JSON.parse(storedAccounts));
        }

        const lastSyncTime = await AsyncStorage.getItem('lastSyncTime');
        if (lastSyncTime) {
          setLastSynced(new Date(lastSyncTime));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const markSynced = async (nextAccounts?: Account[]) => {
    if (nextAccounts) {
      await AsyncStorage.setItem('accounts', JSON.stringify(nextAccounts));
      setAccounts(nextAccounts);
    }

    const now = new Date();
    await AsyncStorage.setItem('lastSyncTime', now.toISOString());
    setLastSynced(now);
    setSyncStatus('success');
  };

  const syncToCloud = async () => {
    if (!user) {
      openAccountDialog();
      return;
    }

    setSyncStatus('syncing');
    try {
      const storedAccounts = await AsyncStorage.getItem('accounts');
      const localAccounts: Account[] = storedAccounts ? JSON.parse(storedAccounts) : [];

      await oxyServices.setAppData(APP_DATA_NAMESPACE, APP_DATA_KEY, localAccounts);
      await markSynced();

      alert(t('syncSuccessTitle'), t('syncSuccessMessage'));
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      setSyncStatus('error');
      alert(t('syncErrorTitle'), t('syncErrorMessage'));
    }
  };

  const retrieveFromCloud = async () => {
    if (!user) {
      openAccountDialog();
      return;
    }

    setSyncStatus('syncing');
    try {
      const cloudAccounts = await oxyServices.getAppData<Account[]>(
        APP_DATA_NAMESPACE,
        APP_DATA_KEY
      );

      if (!cloudAccounts || cloudAccounts.length === 0) {
        setSyncStatus('idle');
        alert(t('noCloudDataTitle'), t('noCloudDataMessage'));
        return;
      }

      const applyCloudAccounts = async () => {
        await markSynced(cloudAccounts);
        alert(t('retrieveSuccessTitle'), t('retrieveSuccessMessage'));
      };

      // Confirm overwrite if there are local accounts
      if (accounts.length > 0) {
        alert(t('retrieveConfirmTitle'), t('retrieveConfirmMessage'), [
          { text: t('cancel'), style: 'cancel', onPress: () => setSyncStatus('idle') },
          {
            text: t('confirm'),
            onPress: () => {
              applyCloudAccounts().catch((error: unknown) => {
                console.error('Error applying cloud accounts:', error);
                setSyncStatus('error');
                alert(t('retrieveErrorTitle'), t('retrieveErrorMessage'));
              });
            },
          },
        ]);
        return;
      }

      await applyCloudAccounts();
    } catch (error) {
      console.error('Error retrieving from cloud:', error);
      setSyncStatus('error');
      alert(t('retrieveErrorTitle'), t('retrieveErrorMessage'));
    }
  };

  const formatLastSynced = () => {
    if (!lastSynced) return t('neverSynced');
    return lastSynced.toLocaleString();
  };

  const isBusy = syncStatus === 'syncing' || !canUsePrivateApi;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaHeader title={t('syncAccounts')} />

      <View className="mt-5 border-y border-border bg-card">
        {!user ? (
          <View className="items-center justify-center gap-4 p-10">
            <Icons.Lock_Stroke2_Corner0_Rounded size="3xl" fill={theme.colors.textSecondary} />
            <P className="text-center text-foreground">{t('signInToSync')}</P>
            <Button onPress={() => openAccountDialog()}>{t('signIn')}</Button>
          </View>
        ) : (
          <>
            <View className="flex-row items-center p-4">
              <Icons.UserCircle_Stroke2_Corner0_Rounded size="3xl" fill={theme.colors.primary} />
              <View className="ml-3 flex-1">
                <Text className="text-xl font-semibold text-foreground">{user.username}</Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {t('lastSynced')}: {formatLastSynced()}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {t('localAccounts')}: {accounts.length}
                </Text>
              </View>
            </View>

            <View className="ml-4 h-px bg-border" />

            <View className="gap-4 p-4">
              <Button
                onPress={syncToCloud}
                disabled={isBusy}
                loading={syncStatus === 'syncing'}
                icon={
                  <Icons.ArrowTop_Stroke2_Corner0_Rounded
                    size="lg"
                    fill={theme.colors.primaryForeground}
                  />
                }
              >
                {t('syncToCloud')}
              </Button>

              <Button
                onPress={retrieveFromCloud}
                disabled={isBusy}
                loading={syncStatus === 'syncing'}
                icon={
                  <Icons.Download_Stroke2_Corner0_Rounded
                    size="lg"
                    fill={theme.colors.primaryForeground}
                  />
                }
              >
                {t('retrieveFromCloud')}
              </Button>
            </View>
          </>
        )}
      </View>

      <View className="flex-row items-center gap-2 p-4">
        <Icons.CircleInfo_Stroke2_Corner0_Rounded size="lg" fill={theme.colors.textSecondary} />
        <P className="flex-1 text-sm text-muted-foreground">{t('syncInfo')}</P>
      </View>
    </View>
  );
}
