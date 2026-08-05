// Dynamic Expo config. A development build can sit next to the production app
// on the same device via APP_VARIANT=development (distinct id + name).
const IS_DEV = process.env.APP_VARIANT === 'development';

const APP_ID = IS_DEV ? 'so.oxy.authenticator.dev' : 'so.oxy.authenticator';
const APP_NAME = IS_DEV ? 'Authenticator by Oxy (Dev)' : 'Authenticator by Oxy';

module.exports = {
  expo: {
    name: APP_NAME,
    slug: 'oxy-authenticator',
    scheme: 'oxyauthenticator',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: APP_ID,
    },
    android: {
      package: APP_ID,
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera to scan authenticator QR codes',
          recordAudioAndroid: false,
        },
      ],
      // Shared Oxy native config. The shared-identity pieces are deliberately
      // OFF for this app: `android:sharedUserId` would put a TOTP vault in the
      // same Linux UID as every other Oxy app, where an in-place install of any
      // sibling can invalidate keystore-backed entries, and it would bind every
      // release build to the shared ecosystem keystore. Authenticator signs in
      // through the SDK's per-origin device-first flow, which needs neither.
      // What is kept is the shared build configuration: iOS deployment target
      // 16.4 and the Android SDK / release-minification defaults.
      [
        '@oxyhq/app-preset',
        {
          sharedUserId: false,
          keychainGroup: false,
          sharedIdentityReader: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
