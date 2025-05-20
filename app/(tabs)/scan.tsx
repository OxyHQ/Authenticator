import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../contexts/ThemeContext';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { theme } = useTheme();

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.webMessage}>
          <Text style={[styles.text, { color: theme.text }]}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.webMessage}>
          <Ionicons name="camera-outline" size={64} color={theme.danger} />
          <Text style={[styles.title, { color: theme.text }]}>Camera Access Required</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Camera access is required to scan QR codes. Please enable camera access in your device settings.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.webMessage}>
          <Ionicons name="qr-code-outline" size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>QR Code Scanner</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            QR code scanning is not available on web platforms. Please use the mobile app.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
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
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <View style={[styles.overlay, { backgroundColor: theme.scanOverlay }]}>
          <View style={[styles.scanArea, { borderColor: theme.scanBorder }]} />
          <Text style={[styles.scanText, { color: theme.text }]}>
            Position the QR code within the frame
          </Text>
          {scanned && (
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </Pressable>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  scanText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});