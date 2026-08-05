# Authenticator by Oxy

A secure, open-source Two-Factor Authentication (2FA) app built with React Native and Expo. Generate TOTP codes for your accounts and sync them across devices using the Oxy platform.

## Features

- 📱 **QR Code Scanning**: Easily add 2FA accounts by scanning QR codes
- 🔒 **TOTP Code Generation**: Generate time-based one-time passwords (TOTP) for your accounts
- ☁️ **Cloud Sync**: Sync your accounts across devices using Oxy cloud services
- 🌙 **Dark/Light Theme**: Toggle between light and dark modes
- 🌍 **Internationalization**: Support for multiple languages (English, Spanish)
- 📱 **Cross-Platform**: Runs on iOS, Android, and Web

## Setup and Installation

### Prerequisites

- [Bun](https://bun.sh) 1.3 or later (this repository uses bun, never npm or yarn)
- Node.js 22 or later (the Expo CLI runs on it)
- For mobile development:
  - iOS: Xcode (macOS only)
  - Android: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OxyHQ/Authenticator.git
   cd Authenticator
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS (requires macOS and Xcode)
   bun run ios

   # Android (requires Android Studio)
   bun run android

   # Web
   bun run web
   ```

### Development Setup

1. **Check the code**
   ```bash
   bun run typecheck   # tsc --noEmit
   bun run lint        # expo lint
   bun run test        # TOTP generator against the RFC 6238 vectors
   bun run export:web  # production web bundle -> dist/
   ```

   All four run in CI on every pull request.

2. **Environment Setup**
   - The app uses Expo's development build system
   - Camera permissions are required for QR code scanning
   - Internet access is required for cloud sync features

## Usage Examples

### Adding Your First Account

1. **Open the app** and you'll see the main screen with no accounts
2. **Tap "Add Account"** or navigate to the "Scan" tab
3. **Grant camera permission** when prompted
4. **Scan a QR code** from your service provider (Google, GitHub, etc.)
5. **View your code** on the main screen - it updates every 30 seconds

### Managing Accounts

#### Viewing TOTP Codes
- **Main Screen**: All your accounts are listed with their current TOTP codes
- **Auto-refresh**: Codes automatically update every 30 seconds
- **Tap to copy**: Tap any code to copy it to your clipboard

#### Syncing Accounts
1. **Navigate to Settings** > "Sync Accounts"
2. **Sign in to Oxy** through the in-app account dialog
3. **Upload to Cloud**: Sync your local accounts to the cloud
4. **Download from Cloud**: Retrieve accounts from other devices

#### Theme and Language
- **Settings** > Toggle between light and dark themes
- **Settings** > Switch between English and Spanish languages

### Cloud Sync Setup

1. **Create an Oxy Account**: Visit [Oxy platform](https://oxy.so) to create an account
2. **Sign In**: Use the "Sync Accounts" feature in settings
3. **Sync Data**: Your accounts are stored against your Oxy account so they are available on your other devices

## Configuration Options

### App Configuration (`app.config.js`)

Expo config lives in `app.config.js`. Native and build configuration comes from
[`@oxyhq/app-preset`](https://www.npmjs.com/package/@oxyhq/app-preset) rather
than being restated here. The preset supplies the iOS deployment target, the
Android SDK and release-minification defaults, and the Metro, Babel, ESLint,
Tailwind and TypeScript bases. `metro.config.js`, `babel.config.js` and
`eslint.config.js` are each a single line that delegates to it.

### Key Configuration Options:

- **Camera Permissions**: Configured for QR code scanning
- **Scheme**: Deep linking support with `oxyauthenticator://`
- **User Interface**: Automatic light/dark mode detection
- **Orientation**: Portrait mode only for optimal mobile experience

### Environment Variables

Runtime configuration lives in `lib/config.ts`, read from `EXPO_PUBLIC_*`:

| Variable | Default | Purpose |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `https://api.oxy.so` | Oxy API base URL |
| `EXPO_PUBLIC_OXY_CLIENT_ID` | empty | The app's registered Oxy client id |

### Theme Configuration

Theming is [Bloom](https://www.npmjs.com/package/@oxyhq/bloom), seeded from the
app's own brand blue (`BRAND_SEED` in `lib/config.ts`). Bloom's tonal engine
derives the full light and dark role sets from that single colour, and
`BloomProvider` persists the user's mode choice. Components style themselves
with NativeWind classes against the role tokens (`bg-background`, `bg-card`,
`text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`)
rather than with hardcoded hex values.

### Internationalization

Translations are bundled in `i18n/index.ts` as a `resources` object with an `en`
and an `es` block.

To add a new language:
1. Add a block for it alongside `en` and `es`
2. Add translations for every key
3. Update the language toggle in `app/(tabs)/settings.tsx`

## Architecture

### Project Structure

```
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Main authenticator screen
│   │   ├── scan.tsx       # QR code scanner
│   │   ├── settings.tsx   # App settings
│   │   └── sync.tsx       # Cloud sync management
│   ├── +not-found.tsx     # Unmatched route
│   └── _layout.tsx        # Root layout and providers
├── components/            # Reusable components
│   ├── OTPCode.tsx        # TOTP code display component
│   └── SafeAreaHeader.tsx # Header component
├── lib/config.ts          # Env-backed runtime config
├── i18n/                  # Internationalization
├── utils/                 # Utility functions
│   ├── totp.ts            # TOTP generation logic
│   └── __tests__/         # RFC 6238 vector tests
└── assets/                # Static assets
```

### Key Components

- **OTPCode**: Displays TOTP codes with auto-refresh
- **SafeAreaHeader**: Consistent header across screens
- **BloomProvider**: Theme, haptics and scroll restoration
- **OxyProvider**: The single session authority, covering sign-in, the query client, and the Bloom surface, dialog and toast hosts

### Data Flow

1. **Local Storage**: Accounts stored in AsyncStorage under the `accounts` key
2. **TOTP Generation**: Time-based codes generated client-side, entirely offline
3. **Cloud Sync**: Optional, through the Oxy SDK's per-user app-data store
4. **Theme State**: Persisted by Bloom

## FAQ and Troubleshooting

### Frequently Asked Questions

**Q: Can I use this without creating an Oxy account?**
A: Absolutely! The app works perfectly as a standalone authenticator. The Oxy account is only needed for cross-device sync.

**Q: What 2FA services are supported?**
A: Any service that provides TOTP QR codes (Google, GitHub, Microsoft, AWS, etc.). The app follows the standard TOTP protocol (RFC 6238).

**Q: Can I export my accounts?**
A: Currently, accounts can be synced to Oxy cloud. Local export features may be added in future versions.

### Troubleshooting

#### Camera Not Working
- **Check permissions**: Ensure camera permissions are granted in device settings
- **Restart app**: Close and reopen the app
- **Web limitation**: QR scanning is not available on web - use mobile app instead

#### Sync Issues
- **Check internet**: Ensure stable internet connection
- **Oxy account**: Verify you're signed in to your Oxy account
- **Server status**: Check if Oxy services are operational

#### Code Generation Issues
- **Time sync**: Ensure your device time is accurate (TOTP depends on time)
- **Secret format**: Verify the QR code is a valid TOTP code
- **Re-scan**: Try scanning the QR code again

#### App Performance
- **Clear storage**: Go to Settings > Clear All Accounts (this will remove all data)
- **Restart app**: Force close and reopen the application
- **Update**: Ensure you're running the latest version

#### Build Issues
- **Dependencies**: Run `bun install` to ensure all dependencies are installed
- **Cache**: Clear Expo cache with `bunx expo start --clear`
- **Bun version**: Match the version CI pins in `.github/workflows/ci.yml`

### Getting Help

If you encounter issues not covered here:
1. Check existing [GitHub Issues](https://github.com/OxyHQ/Authenticator/issues)
2. Create a new issue with detailed information
3. Include device type, OS version, and error messages
4. For security concerns, contact the maintainers privately

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started. Engineering standards for this repository, for humans and AI agents alike, are in [AGENTS.md](AGENTS.md).

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Credits

Built with ❤️ by the Oxy team and contributors.

- **Expo**: Cross-platform development framework
- **React Native**: Mobile app development
- **Oxy Platform**: Cloud sync and authentication services
