import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@oxyhq/bloom/button';
import * as Icons from '@oxyhq/bloom/icons';
import { useBloomTheme } from '@oxyhq/bloom/theme';
import { H3, P } from '@oxyhq/bloom/typography';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Vertical travel of the scan line, in dp, measured from the frame centre. */
const SCAN_LINE_TRAVEL = 120;

/** Duration of one leg of the scan-line sweep, in ms. */
const SCAN_LINE_DURATION = 2000;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { theme } = useBloomTheme();
  const { t } = useTranslation();

  const scanLineAnimation = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const animateScanLine = () => {
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: SCAN_LINE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: SCAN_LINE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !scanned) {
          animateScanLine();
        }
      });
    };

    if (!scanned) {
      animateScanLine();
    }

    return () => {
      scanLineAnimation.stopAnimation();
    };
  }, [scanned, scanLineAnimation]);

  const scanLineTranslateY = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCAN_LINE_TRAVEL, SCAN_LINE_TRAVEL],
  });

  // otpauth:// parsing and the shape written to storage are deliberately
  // unchanged from the pre-upgrade implementation.
  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    try {
      const url = new URL(data);
      if (url.protocol !== 'otpauth:') {
        setScanned(false);
        return;
      }

      const params = new URLSearchParams(url.search);
      const secret = params.get('secret');
      const issuer = params.get('issuer') || url.hostname;
      const account = decodeURIComponent(url.pathname.substring(1));

      if (!secret) {
        setScanned(false);
        return;
      }

      const existingAccounts = await AsyncStorage.getItem('accounts');
      const accounts = existingAccounts ? JSON.parse(existingAccounts) : [];
      accounts.push({ secret, issuer, account });
      await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
      router.replace('/');
    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanned(false);
    }
  }

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-8">
          <P className="text-center text-foreground">{t('cameraRequesting')}</P>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-4 p-8">
          <Icons.Camera_Stroke2_Corner0_Rounded size="3xl" fill={theme.colors.negative} />
          <H3 className="text-center text-foreground">{t('cameraRequiredTitle')}</H3>
          <P className="text-center text-muted-foreground">{t('cameraRequiredMessage')}</P>
          <Button onPress={requestPermission}>{t('cameraGrant')}</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View className="flex-1">
          {/* Top overlay */}
          <View className="flex-1 bg-black/60" />

          {/* Middle section with scan area */}
          <View className="h-[280px] flex-row">
            <View className="flex-1 bg-black/60" />

            <View className="relative h-[280px] w-[280px] items-center justify-center">
              {/* Corner indicators */}
              <View
                className="absolute left-0 top-0 h-[30px] w-[30px] rounded-tl-lg border-4 border-b-0 border-r-0"
                style={{ borderColor: theme.colors.primary }}
              />
              <View
                className="absolute right-0 top-0 h-[30px] w-[30px] rounded-tr-lg border-4 border-b-0 border-l-0"
                style={{ borderColor: theme.colors.primary }}
              />
              <View
                className="absolute bottom-0 left-0 h-[30px] w-[30px] rounded-bl-lg border-4 border-r-0 border-t-0"
                style={{ borderColor: theme.colors.primary }}
              />
              <View
                className="absolute bottom-0 right-0 h-[30px] w-[30px] rounded-br-lg border-4 border-l-0 border-t-0"
                style={{ borderColor: theme.colors.primary }}
              />

              {/* Animated scan line */}
              <Animated.View
                className="absolute h-0.5 w-[90%] rounded-sm"
                style={{
                  backgroundColor: theme.colors.primary,
                  transform: [{ translateY: scanLineTranslateY }],
                }}
              />
            </View>

            <View className="flex-1 bg-black/60" />
          </View>

          {/* Bottom overlay with instructions */}
          <View className="flex-1 justify-end bg-black/60 pb-[60px]">
            <View className="mx-5 items-center gap-3 rounded-2xl bg-white/10 px-8 py-6">
              <Icons.QrCode_Stroke2_Corner0_Rounded size="2xl" fill={theme.colors.primary} />
              <H3 className="text-center text-foreground">{t('scanTitle')}</H3>
              <P className="text-center text-muted-foreground">{t('scanInstructions')}</P>

              {scanned && (
                <Button
                  onPress={() => setScanned(false)}
                  icon={
                    <Icons.ArrowRotateClockwise_Stroke2_Corner0_Rounded
                      size="sm"
                      fill={theme.colors.primaryForeground}
                    />
                  }
                >
                  {t('scanAgain')}
                </Button>
              )}
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
