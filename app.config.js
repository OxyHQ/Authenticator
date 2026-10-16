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
          cameraPermission:
            'Allow $(PRODUCT_NAME) to access your camera to scan authenticator QR codes',
          recordAudioAndroid: false,
        },
      ],
      // Only the shared Oxy build defaults (iOS deployment target 16.4, the
      // Android SDK and release-minification knobs), NOT the full
      // `@oxy.so/app-preset` plugin. The preset always applies
      // `withOxySharedPermissions`, which declares and requests the signature
      // permissions `so.oxy.permission.IDENTITY` and `DEVICE_SESSION`. A TOTP
      // vault stays out of the ecosystem's identity IPC: on a device that
      // already has another Oxy app, Android refuses a differently signed app
      // declaring those permissions (INSTALL_FAILED_DUPLICATE_PERMISSION), so
      // they would bind every release build to the shared ecosystem key.
      // Authenticator is not on Commons' caller allow-list either, so the
      // permissions would grant nothing. It signs in through the SDK's per-origin
      // device-first flow and the in-app account dialog, which need neither the
      // permissions nor the iOS keychain group.
      '@oxy.so/app-preset/plugin/withOxyBuildProperties',
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
