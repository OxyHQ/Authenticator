import { PressableScale } from '@oxyhq/bloom/pressable-scale';
import { useBloomTheme } from '@oxyhq/bloom/theme';
import { toast } from '@oxyhq/bloom/toast';
import { Text } from '@oxyhq/bloom/typography';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';

import { generateTOTP } from '../utils/totp';

interface OTPCodeProps {
  secret: string;
  issuer: string;
  account: string;
}

/** TOTP period in seconds. Must match the default period `generateTOTP` uses. */
const PERIOD_SECONDS = 30;

/** Seconds remaining at which the countdown switches to the warning colour. */
const WARNING_THRESHOLD_SECONDS = 5;

export default function OTPCode({ secret, issuer, account }: OTPCodeProps) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(PERIOD_SECONDS);
  const { theme } = useBloomTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const generateCode = async () => {
      try {
        const newCode = await generateTOTP(secret);
        setCode(newCode);

        // Calculate time left until next code
        const epoch = Math.floor(Date.now() / 1000);
        setTimeLeft(PERIOD_SECONDS - (epoch % PERIOD_SECONDS));
      } catch (error) {
        console.error('Error generating TOTP:', error);
      }
    };

    generateCode();
    const interval = setInterval(generateCode, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    await Clipboard.setStringAsync(code);
    toast(t('codeCopied'));
  };

  const formattedCode = `${code.slice(0, 3)} ${code.slice(3)}`;
  const timerColor =
    timeLeft <= WARNING_THRESHOLD_SECONDS ? theme.colors.warning : theme.colors.primary;

  return (
    <PressableScale
      className="mx-4 mt-4 overflow-hidden rounded-2xl bg-card"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('copyCodeFor', { issuer, account })}
      style={{
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <View className="px-4 pb-2 pt-4">
        <View className="mb-2">
          <Text className="mb-1 text-base font-semibold text-foreground">{issuer}</Text>
          <Text className="text-sm text-muted-foreground">{account}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className="text-[32px] font-bold tracking-[2px] text-primary"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formattedCode}
          </Text>
          <View className="rounded-xl bg-muted px-2 py-1">
            <Text className="text-xs font-semibold text-muted-foreground">{timeLeft}s</Text>
          </View>
        </View>
      </View>
      {/* Width is a live fraction of the period, so it stays an inline style:
          there is no utility class for a computed percentage. */}
      <View
        className="h-[3px] rounded-sm"
        style={{ width: `${(timeLeft / PERIOD_SECONDS) * 100}%`, backgroundColor: timerColor }}
      />
    </PressableScale>
  );
}
