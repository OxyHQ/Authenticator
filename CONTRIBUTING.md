# Contributing to Authenticator

Authenticator by Oxy is an open source two factor authentication app: scan a QR code, generate TOTP codes, and sync accounts across devices through the Oxy platform. It runs on iOS, Android and the web.

**The contribution process lives in the [Oxy organisation CONTRIBUTING guide](https://github.com/OxyHQ/.github/blob/main/CONTRIBUTING.md)**: the code of conduct, reporting an issue, filing a feature request, opening a pull request, code review, and licensing. It applies here unchanged, and reporting a security vulnerability is covered by the organisation `SECURITY.md`. This file layers on top of all of that and carries only what is different about this repository.

## Authenticator is not a monorepo

Every other Oxy application repository is a bun workspaces monorepo with a `packages/` directory. This one is a **single Expo app at the repository root**: no workspaces, no backend, no shared types package. There is nothing to filter and no package to select, so commands are plain root commands.

## Prerequisites

- **Bun.** The package manager for every Oxy repository, never npm or yarn.
- **Node.js 20 or newer**, which Expo needs. Nothing in the repository pins a version.
- No Expo CLI install. The CLI comes with the project; reach it with `bunx expo <command>`. Do not install `@expo/cli` globally, a global copy will drift from the version the project resolves.
- **Xcode** for the iOS simulator or **Android Studio** for the Android emulator, if you are not testing on a physical device through Expo Go.

## Setup

```bash
git clone https://github.com/OxyHQ/Authenticator.git && cd Authenticator
bun install
bun start          # Expo dev server; press i, a or w to open a platform
```

There is no `.env` file to copy. The app talks to Oxy through `@oxyhq/services` and needs no local secrets to boot.

Platform shortcuts and linting:

```bash
bun run ios        # iOS simulator
bun run android    # Android emulator
bun run web        # browser
bun run lint       # expo lint
bunx expo start --clear   # when Metro serves something stale
```

### This repository still carries `package-lock.json`

It predates the organisation standard on bun and has not been migrated, so there is no `bun.lock` yet. Use bun anyway, as above. Until somebody does the migration deliberately, in its own pull request, **do not commit a `bun.lock` that appeared as a side effect of your install**, and do not update `package-lock.json` either. A dependency change belongs in a pull request that is about the dependency change.

## Layout

```
app/            Screens and routing (expo-router; app/(tabs)/ is the tab navigator,
                app/_layout.tsx is the root layout and provider stack)
components/     Reusable UI components
contexts/       React contexts (theme and friends)
i18n/           Translations; English and Spanish today
utils/          Helpers, including TOTP generation
assets/         Fonts and images
```

`package.json` also declares a `reset-project` script pointing at `scripts/reset-project.js`. That file is not in the repository, left over from the Expo starter template, so the script fails. Do not use it, and do not treat its absence as a bug in your checkout.

## Testing

**There is no automated test suite and no CI job that would catch a regression.** The only workflow in `.github/workflows/` adds new issues to the Oxy roadmap. That makes manual testing the actual gate, so please do it properly and say in your pull request what you covered.

The core paths, all of which are easy to break from unrelated changes:

- Scanning a QR code adds an account
- TOTP codes generate, and roll over on the period boundary
- Codes survive an app restart, and settings persist
- Theme switching, light and dark
- Language switching
- Cloud sync, when signed in to Oxy

Worth exercising deliberately, because they are where the crashes have been: no accounts at all, camera permission denied, an invalid or non-TOTP QR code, and no network. Test on iOS and Android; the web build works but the camera path is limited there.

## Working on a 2FA app

The one convention that is specific to this repository rather than to Oxy in general: **the data this app holds is the second factor itself.** A TOTP secret is not user content, it is a credential.

- Never log a secret, a generated code, or a full `otpauth://` URI, not even behind a debug flag. A log line outlives the debugging session.
- Never add a dependency that could reach account data without a clear reason it must, and say why in the pull request.
- Keep secrets out of anything that leaves the device except the existing Oxy sync path.

## A note on shared instruction files

Oxy repositories carry an `AGENTS.md` holding the standards they inherit, plus a `CLAUDE.md` whose only line imports it, both read directly by Claude Code, Codex, Cursor and Copilot. **This repository has neither yet.** Until it does, this file and the organisation guide are the whole of the written convention here. Adding them is a welcome contribution; the organisation guide explains how the layering works.
