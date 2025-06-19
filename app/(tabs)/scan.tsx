import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Platform, Pressable, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(screenWidth * 0.7, 280);

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { theme } = useTheme();
  const html5QrcodeRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Animated scanning line effect
  useEffect(() => {
    const animateScanLine = () => {
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => animateScanLine());
    };
    animateScanLine();
  }, [scanLineAnim]);

  // Pulse animation for scan area
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  // Feedback animation
  useEffect(() => {
    if (feedback) {
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [feedback, feedbackOpacity]);

  const showFeedback = useCallback((message: string, isSuccess: boolean = false) => {
    setFeedback(message);
    setTimeout(() => {
      setFeedback(null);
      if (!isSuccess) {
        setScanned(false);
        setIsProcessing(false);
      }
    }, isSuccess ? 1500 : 3000);
  }, []);

  const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;
    
    setIsProcessing(true);
    setScanned(true);
    
    try {
      const url = new URL(data);
      if (url.protocol !== 'otpauth:') {
        showFeedback('Invalid QR code. Please scan a valid authenticator QR code.');
        return;
      }
      
      const params = new URLSearchParams(url.search);
      const secret = params.get('secret');
      const issuer = params.get('issuer') || url.hostname;
      const account = decodeURIComponent(url.pathname.substring(1));

      if (!secret) {
        showFeedback('QR code is missing required information.');
        return;
      }

      // Check for duplicates
      const existingAccounts = await AsyncStorage.getItem('accounts');
      const accounts = existingAccounts ? JSON.parse(existingAccounts) : [];
      
      const duplicate = accounts.find((acc: any) => 
        acc.secret === secret || (acc.account === account && acc.issuer === issuer)
      );
      
      if (duplicate) {
        showFeedback('This account has already been added.');
        return;
      }

      showFeedback('Account added successfully!', true);
      accounts.push({ secret, issuer, account });
      await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
      
      setTimeout(() => {
        router.replace('/');
      }, 1500);
    } catch (error) {
      console.error('Error processing QR code:', error);
      showFeedback('Failed to process QR code. Please try again.');
    }
  }, [scanned, isProcessing, showFeedback]);

  // Web QR scanner setup
  useEffect(() => {
    if (Platform.OS === 'web' && !scanned) {
      let qrCodeRef: any = null;
      
      const setupWebScanner = async () => {
        try {
          // For web platform, we'll show a placeholder message
          // The html5-qrcode library would need to be installed separately
          console.log('Web QR scanner would be initialized here');
          qrCodeRef = html5QrcodeRef.current;
        } catch (err) {
          console.error('QR scanner setup error:', err);
          showFeedback('Failed to initialize camera. Please refresh and try again.');
        }
      };

      setupWebScanner();

      return () => {
        if (qrCodeRef) {
          qrCodeRef.stop().catch(() => {});
          qrCodeRef.clear().catch(() => {});
        }
      };
    }
  }, [scanned, handleBarCodeScanned, showFeedback]);

  const resetScanner = useCallback(() => {
    setScanned(false);
    setIsProcessing(false);
    setFeedback(null);
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <View style={[styles.permissionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="camera-outline" size={64} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>Camera Access Required</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Camera access is required to scan QR codes for adding new authenticator accounts.
            </Text>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={requestPermission}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.buttonText}>Grant Camera Access</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.webContainer}>
          <View style={[styles.webScanArea, { borderColor: theme.primary }]}>
            <div id="html5qr-code" style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }} />
            <Text style={[styles.scanInstruction, { color: theme.text }]}>
              Position the QR code within the frame
            </Text>
          </View>
          {scanned && (
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
              onPress={resetScanner}>
              <Ionicons name="refresh" size={20} color={theme.primary} />
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Scan Again</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={[styles.overlay, { backgroundColor: theme.scanOverlay }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Scan QR Code
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Point your camera at a QR code to add a new account
            </Text>
          </View>

          {/* Scan Area */}
          <View style={styles.scanAreaContainer}>
            <Animated.View
              style={[
                styles.scanArea,
                {
                  borderColor: scanned ? theme.success : theme.scanBorder,
                  transform: [{ scale: pulseAnim }],
                  width: SCAN_AREA_SIZE,
                  height: SCAN_AREA_SIZE,
                },
              ]}
            >
              {/* Corner brackets */}
              <View style={[styles.cornerBracket, styles.topLeft, { borderColor: scanned ? theme.success : theme.primary }]} />
              <View style={[styles.cornerBracket, styles.topRight, { borderColor: scanned ? theme.success : theme.primary }]} />
              <View style={[styles.cornerBracket, styles.bottomLeft, { borderColor: scanned ? theme.success : theme.primary }]} />
              <View style={[styles.cornerBracket, styles.bottomRight, { borderColor: scanned ? theme.success : theme.primary }]} />
              
              {/* Animated scan line */}
              {!scanned && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      backgroundColor: theme.primary,
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, SCAN_AREA_SIZE - 4],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}

              {/* Success icon */}
              {scanned && !isProcessing && (
                <View style={styles.scanSuccess}>
                  <Ionicons name="checkmark-circle" size={48} color={theme.success} />
                </View>
              )}

              {/* Processing indicator */}
              {isProcessing && (
                <View style={styles.scanSuccess}>
                  <Ionicons name="reload-circle" size={48} color={theme.primary} />
                </View>
              )}
            </Animated.View>
          </View>

          {/* Feedback Message */}
          {feedback && (
            <Animated.View
              style={[
                styles.feedbackContainer,
                {
                  backgroundColor: feedback.includes('success') ? theme.success : theme.danger,
                  opacity: feedbackOpacity,
                },
              ]}
            >
              <Ionicons
                name={feedback.includes('success') ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color="#fff"
              />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {scanned && !feedback?.includes('success') && (
              <Pressable
                style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
                onPress={resetScanner}
              >
                <Ionicons name="refresh" size={20} color={theme.primary} />
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                  Scan Again
                </Text>
              </Pressable>
            )}
          </View>

          {/* Instructions */}
          {!scanned && !feedback && (
            <View style={styles.instructionsContainer}>
              <Text style={[styles.instructionText, { color: theme.text }]}>
                Position the QR code within the frame
              </Text>
              <Text style={[styles.instructionSubtext, { color: theme.textSecondary }]}>
                Make sure the code is well-lit and clearly visible
              </Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 320,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webScanArea: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  scanInstruction: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    borderWidth: 2,
    borderRadius: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 24,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 24,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 24,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  scanSuccess: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  actionContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  instructionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});