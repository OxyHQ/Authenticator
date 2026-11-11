import { beforeEach, expect, mock, test } from 'bun:test';

const plain = new Map<string, string>();
const secure = new Map<string, string>();
let failSecureWrite = false;

mock.module('react-native', () => ({ Platform: { OS: 'ios' } }));
mock.module('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => plain.get(key) ?? null,
    setItem: async (key: string, value: string) => void plain.set(key, value),
    removeItem: async (key: string) => void plain.delete(key),
  },
}));
mock.module('expo-secure-store', () => ({
  getItemAsync: async (key: string) => secure.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => {
    if (failSecureWrite) throw new Error('keychain unavailable');
    secure.set(key, value);
  },
  deleteItemAsync: async (key: string) => void secure.delete(key),
}));

const { addAccount, getAccounts } = await import('../accounts');

const legacy = [{ secret: 'AAAA', issuer: 'Legacy', account: 'a' }];

beforeEach(() => {
  plain.clear();
  secure.clear();
  failSecureWrite = false;
});

test('a failed migration keeps the plaintext accounts and the next read retries it', async () => {
  plain.set('accounts', JSON.stringify(legacy));
  failSecureWrite = true;
  await expect(getAccounts()).rejects.toThrow('keychain unavailable');
  expect(plain.get('accounts')).toBe(JSON.stringify(legacy));

  failSecureWrite = false;
  expect(await getAccounts()).toEqual(legacy);
  expect(plain.has('accounts')).toBe(false);
  expect(JSON.parse(secure.get('accounts') ?? '')).toEqual(legacy);
});

test('new accounts are written to secure storage only', async () => {
  await addAccount({ secret: 'BBBB', issuer: 'New', account: 'b' });
  expect(plain.has('accounts')).toBe(false);
  expect(await getAccounts()).toEqual([{ secret: 'BBBB', issuer: 'New', account: 'b' }]);
});

test('cloud backups are sealed on the device, plaintext ones are flagged, wrong keys fail', async () => {
  const { dedupeAccounts, isValidSecret, openCloudAccounts, sealAccounts } = await import(
    '../accounts'
  );
  const sealed = await sealAccounts([...legacy, ...legacy]);
  expect(JSON.stringify(sealed)).not.toContain('AAAA');
  expect(await openCloudAccounts(sealed)).toEqual({ accounts: legacy, legacy: false });
  expect(await openCloudAccounts(legacy)).toEqual({ accounts: legacy, legacy: true });

  secure.set('accounts-sync-key', Buffer.alloc(32, 1).toString('base64'));
  await expect(openCloudAccounts(sealed)).rejects.toThrow();

  expect(isValidSecret('jbsw y3dp=')).toBe(true);
  expect(isValidSecret('not base32!')).toBe(false);
  expect(dedupeAccounts([legacy[0], { ...legacy[0], secret: 'aaaa' }])).toHaveLength(1);
});

test('a scanned secret that is not base32 is rejected', async () => {
  await expect(addAccount({ secret: '8!', issuer: 'x', account: 'y' })).rejects.toThrow();
  expect(plain.has('accounts')).toBe(false);
  expect(secure.has('accounts')).toBe(false);
});
