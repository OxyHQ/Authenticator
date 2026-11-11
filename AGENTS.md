# Authenticator by Oxy

A TOTP (RFC 6238) two-factor authentication app: Expo Router on iOS, Android and web, wired to the Oxy platform SDK for sign-in and cross-device sync.

## Commands

```bash
bun install
bun run start          # Expo dev server
bun run web            # Expo dev server, web
bun run typecheck      # tsc --noEmit
bun run lint           # biome check . && expo lint .
bun run lint:fix       # biome check --write .
bun run test           # bun test: RFC 6238 vectors, cloud sync, secure-storage migration
bun run doctor:oxy     # oxy-doctor --ci: duplicate copies, Oxy releases, services' native peers
bun run export:web     # expo export --platform web -> dist/
bun run export:native  # expo export --platform android -> dist-native/
```

## Map

- `app/` expo-router routes; `components/` shared UI; `i18n/` English and Spanish resources.
- `utils/totp.ts` the TOTP generator; `lib/accounts.ts` the only reader and writer of stored accounts; `lib/config.ts` env-backed runtime config.
- `app/_layout.tsx` is the single provider tree.
- Language is whatever Oxy resolves (`OxyProvider` `language` prop); there is no in-app toggle.

## Conventions that differ from defaults

Full rationale for each is in [docs/agent-rules.md](docs/agent-rules.md).

- Account storage goes through `lib/accounts.ts` only. Native uses expo-secure-store, web uses AsyncStorage. Do not rename the `accounts` key or reshape its value without a migration, and never log an account. Why: the data is the second factor itself.
- Cloud sync uses `oxyServices.appData.get/set` under the `authenticator` namespace, never a raw HTTP client, and uploads only the sealed (XChaCha20-Poly1305) list. Why: the SDK owns auth, and plaintext secrets must never leave the device.
- One provider tree: `BloomProvider` wraps `OxyProvider` in `app/_layout.tsx`. Do not mount a second `SafeAreaProvider`, gesture root, keyboard, toast or dialog provider. Sign-in is `useOxy().openAccountDialog()`.
- Expo, Metro, Babel and tsconfig come from `@oxy.so/app-preset`; change the preset, not local copies. `app.config.js` uses only `plugin/withOxyBuildProperties`, never the full preset plugin (it adds signing-key permissions this app stays out of).
- Keep `overrides.lightningcss` in `package.json`. Why: native bundles break while the web build stays green; after touching it run `rm -rf node_modules && bun install` and `bun run export:native`.
- Lint is Biome plus a minimal ESLint for three `expo/*` env-var rules; run `expo lint .`, never bare `expo lint`. Do not add Prettier or more ESLint rules.
- Style with NativeWind classes on Bloom role tokens (`bg-background`, `text-foreground`, ...); no hardcoded hex. `useBloomTheme()` only where a class cannot apply.
- Use `alert()` from `@oxy.so/bloom/surfaces`, not React Native `Alert`. Why: `Alert` is a no-op on web.
- Package manager is bun (`bunx`, not `npx`); commit `bun.lock` with the `package.json` change that caused it.
- General code, TypeScript, React and error-handling standards: [Oxy engineering standards](https://github.com/OxyHQ/oxy/blob/main/docs/engineering/standards.md).

## Boundaries

- Never refactor `utils/totp.ts` opportunistically; a change that must move the RFC 6238 vectors in `utils/__tests__/totp.test.ts` needs its own PR and review.
- Never commit secrets or `.env`; `EXPO_PUBLIC_*` values are inlined into the client bundle and are public.
- Ask first before changing the stored account shape, the sync payload format, or the preset wiring.

## Testing

- Any change: `bun run typecheck`, `bun run lint`, `bun run test`.
- Dependency, CSS or config changes: also `bun run export:native` and `bun run export:web`.
- Account, scan, sync or storage changes: exercise manually on a device (no accounts, camera denied, invalid QR, no network).
- Done means CI (`.github/workflows/ci.yml`) is green.

## Pull requests and commits

- Imperative commit messages that say why; one logical change per commit; PR titles under 70 characters; PR bodies say what, why and how it was tested.
- Never force-push a shared branch; scope `git add` to the paths you touched.

## Secrets

The app needs none to run: `.env.example` lists only public `EXPO_PUBLIC_*` values. Never print or commit credentials.

## Links

- [docs/agent-rules.md](docs/agent-rules.md), [CONTRIBUTING.md](CONTRIBUTING.md), [README.md](README.md)
- [Lint and format](https://github.com/OxyHQ/oxy/blob/main/docs/engineering/lint-and-format.md), [npm releases](https://github.com/OxyHQ/oxy/blob/main/docs/npm-releases.md), [Bloom app conventions](https://github.com/OxyHQ/Bloom/blob/main/docs/app-conventions.mdx)

Owner: Nate Isern (OxyHQ). Last reviewed: 2026-11-11.
