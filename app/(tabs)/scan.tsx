import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
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
  
  const scanLineAnimation = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const animateScanLine = () => {
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!scanned) {
          animateScanLine();
        }
      });
    };

    if (!scanned) {
      animateScanLine();
    }
  }, [scanned, scanLineAnimation]);

  const scanLineTranslateY = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.overlay}>
          <Text style={[styles.text, { color: theme.text }]}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (permission && !permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.overlay}>
          <Ionicons name="camera-outline" size={64} color={theme.danger} />
          <Text style={[styles.title, { color: theme.text }]}>Camera Access Required</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Camera access is required to scan QR codes. Please enable camera access in your device settings.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={requestPermission}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={[styles.overlaySection, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          
          {/* Middle section with scan area */}
          <View style={styles.scanContainer}>
            <View style={[styles.overlaySection, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
            
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />
              
              {/* Animated scan line */}
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { 
                    backgroundColor: theme.primary,
                    transform: [{ translateY: scanLineTranslateY }] 
                  }
                ]} 
              />
            </View>
            
            <View style={[styles.overlaySection, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          </View>
          
          {/* Bottom overlay with instructions */}
          <View style={[styles.overlaySection, styles.bottomSection, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={styles.instructionsContainer}>
              <Ionicons name="qr-code-outline" size={32} color={theme.primary} />
              <Text style={[styles.instructionTitle, { color: theme.text }]}>
                Scan QR Code
              </Text>
              <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                Position the QR code within the frame to add it to your authenticator
              </Text>
              
              {scanned && (
                <Pressable
                  style={[styles.scanAgainButton, { backgroundColor: theme.primary }]}
                  onPress={() => setScanned(false)}>
                  <Ionicons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Scan Again</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlaySection: {
    flex: 1,
  },
  scanContainer: {
    flexDirection: 'row',
    height: 280,
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: '90%',
    height: 2,
    borderRadius: 1,
  },
  bottomSection: {
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Permission request styles
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
});