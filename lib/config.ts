/** Runtime configuration, read from `EXPO_PUBLIC_*` env vars. */

/** Oxy API base URL. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.oxy.so';

/** Registered public client; the id identifies Authenticator and is not a secret. */
export const OXY_CLIENT_ID =
  process.env.EXPO_PUBLIC_OXY_CLIENT_ID ??
  'oxy_dk_db94c11af984e6ea963ca1581ed13708bcf061b422b92907';

/**
 * Brand seed for the Bloom theme. This is the app's own primary blue, kept
 * verbatim from the palette it shipped with. Bloom's tonal engine derives the
 * full light/dark role set from it, so the identity survives the move to Bloom
 * instead of being replaced by a generic preset.
 */
export const BRAND_SEED = '#1a73e8';

/** Storage key under which Bloom persists the theme mode + colour preset. */
export const THEME_PERSIST_KEY = 'authenticator.theme';
