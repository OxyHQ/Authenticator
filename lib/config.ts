/** Runtime configuration, read from `EXPO_PUBLIC_*` env vars. */

/** Oxy API base URL. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.oxy.so';

/**
 * The app's registered Oxy client id (an `ApplicationCredential` publicKey,
 * `oxy_dk_…`). Authenticator does not have one registered yet, so this is empty
 * by default: the in-app account dialog still signs in from an existing device
 * session, but the cross-device Commons/QR sign-in route cannot start without a
 * real client id. Set `EXPO_PUBLIC_OXY_CLIENT_ID` once the app is registered in
 * the Oxy console.
 */
export const OXY_CLIENT_ID = process.env.EXPO_PUBLIC_OXY_CLIENT_ID ?? '';

/**
 * Brand seed for the Bloom theme. This is the app's own primary blue, kept
 * verbatim from the palette it shipped with. Bloom's tonal engine derives the
 * full light/dark role set from it, so the identity survives the move to Bloom
 * instead of being replaced by a generic preset.
 */
export const BRAND_SEED = '#1a73e8';

/** Storage key under which Bloom persists the theme mode + colour preset. */
export const THEME_PERSIST_KEY = 'authenticator.theme';
