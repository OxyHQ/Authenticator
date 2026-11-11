import AsyncStorage from '@react-native-async-storage/async-storage';
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

const sameAccount = (a: Account, b: Account) =>
  a.secret === b.secret && a.issuer === b.issuer && a.account === b.account;

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
    const merged: Account[] = JSON.parse(secure);
    for (const account of JSON.parse(legacy) as Account[]) {
      if (!merged.some((existing) => sameAccount(existing, account))) merged.push(account);
    }
    next = JSON.stringify(merged);
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
  const stored = useSecureStore
    ? await SecureStore.getItemAsync(KEY)
    : await AsyncStorage.getItem(KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveAccounts(accounts: Account[]): Promise<void> {
  await ready();
  const value = JSON.stringify(accounts);
  if (useSecureStore) await SecureStore.setItemAsync(KEY, value);
  else await AsyncStorage.setItem(KEY, value);
}

export async function addAccount(account: Account): Promise<void> {
  await saveAccounts([...(await getAccounts()), account]);
}

export async function clearAccounts(): Promise<void> {
  await ready();
  if (useSecureStore) await SecureStore.deleteItemAsync(KEY);
  else await AsyncStorage.removeItem(KEY);
}
