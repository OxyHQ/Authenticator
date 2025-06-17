# Authenticator by Oxy

A secure, open-source Two-Factor Authentication (2FA) app built with React Native and Expo. Generate TOTP codes for your accounts and sync them across devices using the Oxy platform.

## Features

- 📱 **QR Code Scanning**: Easily add 2FA accounts by scanning QR codes
- 🔒 **TOTP Code Generation**: Generate time-based one-time passwords (TOTP) for your accounts
- ☁️ **Cloud Sync**: Sync your accounts across devices using Oxy cloud services
- 🌙 **Dark/Light Theme**: Toggle between light and dark modes
- 🌍 **Internationalization**: Support for multiple languages (English, Spanish)
- 📱 **Cross-Platform**: Runs on iOS, Android, and Web
- 🔐 **Secure Storage**: Local storage with encryption support

## Setup and Installation

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
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
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS (requires macOS and Xcode)
   npm run ios
   
   # Android (requires Android Studio)
   npm run android
   
   # Web
   npm run web
   ```

### Development Setup

1. **Lint the code**
   ```bash
   npm run lint
   ```

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
2. **Sign in to Oxy** using your credentials
3. **Upload to Cloud**: Sync your local accounts to the cloud
4. **Download from Cloud**: Retrieve accounts from other devices

#### Theme and Language
- **Settings** > Toggle between light and dark themes
- **Settings** > Switch between English and Spanish languages

### Cloud Sync Setup

1. **Create an Oxy Account**: Visit [Oxy platform](https://oxy.so) to create an account
2. **Sign In**: Use the "Sync Accounts" feature in settings
3. **Sync Data**: Your accounts will be encrypted and stored securely

## Configuration Options

### App Configuration (`app.json`)

The app can be configured through the `app.json` file:

```json
{
  "expo": {
    "name": "Authenticator by Oxy",
    "slug": "oxy-authenticator",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic"
  }
}
```

### Key Configuration Options:

- **Camera Permissions**: Configured for QR code scanning
- **Scheme**: Deep linking support with `myapp://` scheme
- **User Interface**: Automatic light/dark mode detection
- **Orientation**: Portrait mode only for optimal mobile experience

### Environment Variables

The app connects to Oxy services using:
- **Base URL**: `https://api.oxy.so` (configured in `_layout.tsx`)
- **Storage Prefix**: `oxy_example` for authentication tokens

### Theme Configuration

Themes are configured in `contexts/ThemeContext.tsx`:

```typescript
// Light theme colors
const lightTheme = {
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#202124',
  primary: '#1a73e8',
  // ... more colors
}

// Dark theme colors
const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  primary: '#8ab4f8',
  // ... more colors
}
```

### Internationalization

Languages are configured in the `i18n/` directory:
- `en.json`: English translations
- `es.json`: Spanish translations

To add a new language:
1. Create a new JSON file in `i18n/`
2. Add translations for all keys
3. Update the language toggle in `settings.tsx`

## Architecture

### Project Structure

```
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Main authenticator screen
│   │   ├── scan.tsx       # QR code scanner
│   │   ├── settings.tsx   # App settings
│   │   └── sync.tsx       # Cloud sync management
│   └── _layout.tsx        # Root layout and providers
├── components/            # Reusable components
│   ├── OTPCode.tsx       # TOTP code display component
│   └── SafeAreaHeader.tsx # Header component
├── contexts/             # React contexts
│   └── ThemeContext.tsx  # Theme management
├── i18n/                 # Internationalization
├── utils/                # Utility functions
│   └── totp.ts          # TOTP generation logic
└── assets/              # Static assets
```

### Key Components

- **OTPCode**: Displays TOTP codes with auto-refresh
- **ThemeProvider**: Manages light/dark theme state
- **SafeAreaHeader**: Consistent header across screens
- **Oxy Integration**: Cloud sync and authentication

### Data Flow

1. **Local Storage**: Accounts stored in AsyncStorage
2. **TOTP Generation**: Time-based codes generated client-side
3. **Cloud Sync**: Optional backup to Oxy platform
4. **Theme State**: Persisted user preferences

## FAQ and Troubleshooting

### Frequently Asked Questions

**Q: Is this app secure?**
A: Yes, the app stores your secrets locally on your device using AsyncStorage. Cloud sync is optional and uses encrypted storage through the Oxy platform.

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
- **Dependencies**: Run `npm install` to ensure all dependencies are installed
- **Cache**: Clear Expo cache with `npx expo start --clear`
- **Node version**: Ensure you're using Node.js v18 or later

### Getting Help

If you encounter issues not covered here:
1. Check existing [GitHub Issues](https://github.com/OxyHQ/Authenticator/issues)
2. Create a new issue with detailed information
3. Include device type, OS version, and error messages
4. For security concerns, contact the maintainers privately

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## License

This project is open source. Please check the repository for license information.

## Credits

Built with ❤️ by the Oxy team and contributors.

- **Expo**: Cross-platform development framework
- **React Native**: Mobile app development
- **Oxy Platform**: Cloud sync and authentication services
