import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { decryptAead, encryptAead } from '@oxy.so/core/crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface Account {
  secret: string;
  issuer: string;
  account: string;
}

/**
 * The one place the account list (TOTP secrets) is read or written.
 *
 * Native keeps it in the OS keychain / Keystore through expo-secure-store.
 * The keychain has no web equivalent, so web keeps using AsyncStorage (which is
 * `localStorage` there), exactly as before. The key and the stored shape are
 * unchanged: a JSON array of `{ secret, issuer, account }`.
 */
const KEY = 'accounts';
const useSecureStore = Platform.OS !== 'web';

const readRaw = (key: string) =>
  useSecureStore ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
const writeRaw = (key: string, value: string) =>
  useSecureStore ? SecureStore.setItemAsync(key, value) : AsyncStorage.setItem(key, value);

/** Canonical form of a base32 secret: no spaces or padding, upper case. */
export function normalizeSecret(secret: string): string {
  return secret.replace(/[\s=]/g, '').toUpperCase();
}

export function isValidSecret(secret: string): boolean {
  return /^[A-Z2-7]+$/.test(normalizeSecret(secret));
}

const accountId = (a: Account) => `${normalizeSecret(a.secret)}\0${a.issuer}\0${a.account}`;

/** Drops repeats, keeping the first of each (same secret, issuer and account). */
export function dedupeAccounts(accounts: readonly Account[]): Account[] {
  const seen = new Set<string>();
  return accounts.filter((account) => {
    const id = accountId(account);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * Moves accounts that older builds left in plain AsyncStorage into secure
 * storage. The plaintext copy is deleted only after the secure copy has been
 * read back and verified, so a failure at any step leaves the accounts where
 * they were and the next launch retries.
 */
async function migrateLegacyAccounts(): Promise<void> {
  const legacy = await AsyncStorage.getItem(KEY);
  if (legacy === null) return;

  const secure = await SecureStore.getItemAsync(KEY);
  let next = legacy;
  if (secure !== null && secure !== legacy) {
    next = JSON.stringify(
      dedupeAccounts([...JSON.parse(secure), ...JSON.parse(legacy)] as Account[]),
    );
  }

  if (secure !== next) {
    await SecureStore.setItemAsync(KEY, next);
    if ((await SecureStore.getItemAsync(KEY)) !== next) {
      throw new Error('Secure storage did not keep the migrated accounts');
    }
  }
  await AsyncStorage.removeItem(KEY);
}

let migration: Promise<void> | undefined;

/** Runs the migration once per process; a failed run is retried by the next call. */
function ready(): Promise<void> {
  if (!useSecureStore) return Promise.resolve();
  migration ??= migrateLegacyAccounts().catch((error: unknown) => {
    migration = undefined;
    throw error;
  });
  return migration;
}

export async function getAccounts(): Promise<Account[]> {
  await ready();
  const stored = await readRaw(KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveAccounts(accounts: Account[]): Promise<void> {
  await ready();
  await writeRaw(KEY, JSON.stringify(accounts));
}

export async function addAccount(account: Account): Promise<void> {
  if (!isValidSecret(account.secret)) throw new Error('The secret is not valid base32');
  const secret = normalizeSecret(account.secret);
  await saveAccounts(dedupeAccounts([...(await getAccounts()), { ...account, secret }]));
}

export async function clearAccounts(): Promise<void> {
  await ready();
  if (useSecureStore) await SecureStore.deleteItemAsync(KEY);
  else await AsyncStorage.removeItem(KEY);
}

// ── Cloud sync ────────────────────────────────────────────────────────────
// The server must never receive a plaintext secret. Accounts are sealed on the
// device with XChaCha20-Poly1305 (`@oxy.so/core/crypto`) under a random 256-bit
// key that never leaves the device (secure storage; AsyncStorage on web). The
// Oxy SDK offers no account-derived key to this app, so a backup can only be
// opened on a device that holds the key: restoring on a different device is not
// possible, and a backup made before this build (a plaintext array) is read once
// and then replaced by the sealed form.

const SYNC_KEY = 'accounts-sync-key';
const SYNC_AAD = new TextEncoder().encode('authenticator:accounts:v1');

interface CloudEnvelope {
  v: 1;
  nonce: string;
  ciphertext: string;
}

async function syncKey(): Promise<Uint8Array> {
  const stored = await readRaw(SYNC_KEY);
  if (stored) return Buffer.from(stored, 'base64');
  const key = globalThis.crypto.getRandomValues(new Uint8Array(32));
  await writeRaw(SYNC_KEY, Buffer.from(key).toString('base64'));
  return key;
}

export async function sealAccounts(accounts: readonly Account[]): Promise<CloudEnvelope> {
  const plaintext = new TextEncoder().encode(JSON.stringify(dedupeAccounts(accounts)));
  const { nonce, ciphertext } = encryptAead(await syncKey(), plaintext, SYNC_AAD);
  return {
    v: 1,
    nonce: Buffer.from(nonce).toString('base64'),
    ciphertext: Buffer.from(ciphertext).toString('base64'),
  };
}

/**
 * Reads what the server holds under the sync key. `legacy` marks a plaintext
 * array written by an older build, which the caller must replace with a sealed
 * copy. Throws when the value is sealed under a key this device does not have.
 */
export async function openCloudAccounts(
  value: unknown,
): Promise<{ accounts: Account[]; legacy: boolean }> {
  if (Array.isArray(value)) return { accounts: dedupeAccounts(value), legacy: true };
  const envelope = value as Partial<CloudEnvelope> | null;
  if (envelope?.v !== 1 || !envelope.nonce || !envelope.ciphertext) {
    throw new Error('Unrecognised cloud backup format');
  }
  const plaintext = decryptAead(
    await syncKey(),
    Buffer.from(envelope.nonce, 'base64'),
    Buffer.from(envelope.ciphertext, 'base64'),
    SYNC_AAD,
  );
  return { accounts: JSON.parse(new TextDecoder().decode(plaintext)), legacy: false };
}
