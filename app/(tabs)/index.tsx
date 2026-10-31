import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@oxy.so/bloom/button';
import { P } from '@oxy.so/bloom/typography';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import OTPCode from '../../components/OTPCode';
import AppScreen from '../../components/AppScreen';

interface Account {
  secret: string;
  issuer: string;
  account: string;
}

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { t } = useTranslation();

  const loadAccounts = useCallback(async () => {
    try {
      const storedAccounts = await AsyncStorage.getItem('accounts');
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }, []);

  // Load accounts whenever the screen gains focus, the first mount included.
  // There is no separate mount effect, which is what made the pre-upgrade
  // version read storage twice on open.
  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts]),
  );

  return (
    <AppScreen title={t('authenticator')} contentContainerClassName="pb-4">
      {accounts.length === 0 ? (
        <View className="mt-[100px] flex-1 items-center justify-center gap-5 p-8">
          <P className="text-center leading-6 text-muted-foreground">{t('noAccounts')}</P>
          <Button onPress={() => router.push('/scan')}>{t('addAccount')}</Button>
        </View>
      ) : (
        accounts.map((account, index) => (
          <OTPCode
            key={index}
            secret={account.secret}
            issuer={account.issuer}
            account={account.account}
          />
        ))
      )}
    </AppScreen>
  );
}
