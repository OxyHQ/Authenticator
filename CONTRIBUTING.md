# Contributing to Authenticator

Thank you for your interest in contributing to Authenticator! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing](#testing)
- [Security](#security)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members
- Be collaborative and helpful

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js (v18 or later)
- npm or yarn
- Git
- Expo CLI (`npm install -g @expo/cli`)
- A GitHub account

### Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Authenticator.git
   cd Authenticator
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/OxyHQ/Authenticator.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   npm start
   ```

## Development Setup

### Project Structure

Understanding the codebase structure:

```
├── app/                    # Application screens and routing
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout and providers
├── components/            # Reusable UI components
├── contexts/             # React contexts (theme, etc.)
├── i18n/                 # Internationalization files
├── utils/                # Utility functions
└── assets/              # Static assets
```

### Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Linting
npm run lint

# Clear cache (if needed)
npx expo start --clear
```

## Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Check existing issues before creating new ones
- Comment on issues you want to work on
- Wait for maintainer assignment before starting work

### 2. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Follow our [Code Style](#code-style) guidelines
- Write clear, commented code
- Test your changes thoroughly
- Update documentation if needed

### 4. Commit Changes

Use conventional commit messages:

```bash
# Examples
git commit -m "feat: add biometric authentication"
git commit -m "fix: resolve QR scanner crash on Android"
git commit -m "docs: update installation instructions"
git commit -m "refactor: improve TOTP generation performance"
```

### Commit Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Code Style

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable and function names
- Add type annotations for public APIs

```typescript
// Good
interface Account {
  secret: string;
  issuer: string;
  account: string;
}

const generateTOTP = (secret: string): string => {
  // Implementation
};

// Avoid
const func = (s: any) => {
  // Implementation
};
```

### React Native/Expo

- Use functional components with hooks
- Follow React Native best practices
- Use StyleSheet for styling
- Implement responsive design principles

```typescript
// Good
const AccountsList: React.FC = () => {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Component content */}
    </View>
  );
};
```

### Styling

- Use the existing theme system
- Follow consistent spacing and sizing
- Implement both light and dark theme support
- Use semantic color names

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});
```

### File Organization

- Group related files in appropriate directories
- Use clear, descriptive file names
- Export components and utilities properly
- Maintain consistent import order

```typescript
// Import order
import React from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../contexts/ThemeContext';
import CustomComponent from '../components/CustomComponent';
```

## Pull Request Process

### Before Submitting

1. **Test thoroughly**:
   - Test on multiple platforms (iOS, Android, Web if applicable)
   - Verify existing functionality still works
   - Test edge cases

2. **Code quality**:
   - Run `npm run lint` and fix any issues
   - Ensure TypeScript compilation passes
   - Follow the code style guidelines

3. **Documentation**:
   - Update README if needed
   - Add inline comments for complex logic
   - Update type definitions

### Submitting Your PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**:
   - Use the GitHub web interface
   - Fill out the PR template completely
   - Link related issues with "Fixes #123"

3. **PR Title Format**:
   ```
   feat: add biometric authentication support
   fix: resolve QR scanner camera permission issue
   docs: improve setup instructions
   ```

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web (if applicable)
- [ ] All existing tests pass

## Screenshots/Videos
Include screenshots or videos demonstrating the changes.

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer review required
3. **Testing**: Maintainers may test on different devices
4. **Approval**: PR will be merged after approval

## Issue Guidelines

### Before Creating an Issue

- Search existing issues for duplicates
- Check if it's already fixed in the latest version
- Gather relevant information (device, OS version, error logs)

### Bug Reports

Include:
- **Device information**: OS, device model, app version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots/videos**: Visual evidence when helpful
- **Error logs**: Console output or crash logs

### Feature Requests

Include:
- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought of
- **Additional context**: Any other relevant information

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `documentation`: Improvements to documentation
- `question`: Further information is requested

## Testing

### Manual Testing

1. **Core functionality**:
   - QR code scanning
   - TOTP code generation
   - Account management
   - Cloud sync features

2. **Platform testing**:
   - Test on iOS simulator/device
   - Test on Android emulator/device
   - Test web version (limited functionality expected)

3. **Edge cases**:
   - No accounts state
   - Network connectivity issues
   - Camera permission denied
   - Invalid QR codes

### Testing Checklist

- [ ] App starts without errors
- [ ] QR scanning works correctly
- [ ] TOTP codes generate and update
- [ ] Theme switching works
- [ ] Language switching works
- [ ] Settings persist across app restarts
- [ ] Cloud sync functions (if signed in)
- [ ] No memory leaks or performance issues

## Security

### Security Considerations

- **Never commit secrets**: No API keys, tokens, or sensitive data
- **Report vulnerabilities privately**: Email maintainers for security issues
- **Follow secure coding practices**: Input validation, proper error handling
- **Dependency security**: Keep dependencies updated

### Reporting Security Issues

For security vulnerabilities:
1. **Do not** create public GitHub issues
2. Email the maintainers directly
3. Include detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

## Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: Ask questions in PR comments

### Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RFC 6238 (TOTP)](https://tools.ietf.org/html/rfc6238)

## Recognition

Contributors are recognized in:
- GitHub contribution graph
- Release notes for significant contributions
- Special thanks in project documentation

Thank you for contributing to Authenticator! 🚀