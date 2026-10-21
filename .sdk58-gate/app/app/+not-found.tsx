import { Button } from '@oxy.so/bloom/button';
import { H2 } from '@oxy.so/bloom/typography';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-5">
      <H2 className="text-center text-foreground">{t('notFoundTitle')}</H2>
      <Button onPress={() => router.replace('/')}>{t('notFoundAction')}</Button>
    </View>
  );
}
