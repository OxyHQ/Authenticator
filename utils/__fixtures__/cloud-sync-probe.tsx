import { mock } from 'bun:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { OxyServices } from '@oxy.so/core';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const local = [{ secret: 'fixture-local', issuer: 'Local', account: 'local' }];
const cloud = [{ secret: 'fixture-cloud', issuer: 'Cloud', account: 'cloud' }];
const storage = new Map([['accounts', JSON.stringify(local)]]);
let holdRead: (() => Promise<void>) | undefined;
let writes = 0;
mock.module('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => {
      await holdRead?.();
      return storage.get(key) ?? null;
    },
    setItem: async (key: string, value: string) => {
      writes++;
      storage.set(key, value);
    },
  },
}));
mock.module('react-native', () => ({ View: 'view' }));
mock.module('@oxy.so/bloom/button', () => ({ Button: 'button' }));
mock.module('@oxy.so/bloom/typography', () => ({ P: 'text', Text: 'text' }));
mock.module('@oxy.so/bloom/theme', () => ({ useBloomTheme: () => ({ theme: { colors: {} } }) }));
for (const icon of [
  'RiAccountCircleLine',
  'RiArrowUpLine',
  'RiDownload2Line',
  'RiInformationLine',
  'RiLockLine',
]) {
  mock.module(`@oxy.so/bloom/icons/${icon}`, () => ({ [icon]: () => null }));
}
mock.module('../../components/AppScreen', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
mock.module('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
type Action = { text: string; onPress?: () => void };
let confirmation: Action[] | undefined;
mock.module('@oxy.so/bloom/surfaces', () => ({
  alert: (_title: string, _text: string, actions?: Action[]) => {
    if (actions) confirmation = actions;
  },
}));
const oxy = new OxyServices({ baseURL: 'http://127.0.0.1:9' });
const token = (id: string) =>
  `e30.${Buffer.from(JSON.stringify({ userId: id, sessionId: id, exp: 2_000_000_000 })).toString('base64url')}.sig`;
oxy.session.setAccessToken(token('A'));
let cloudWrites = 0;
oxy.appData.get = async () => cloud as never;
oxy.appData.set = async <T,>(_namespace: string, _key: string, value: T) => {
  cloudWrites++;
  return value;
};
mock.module('@oxy.so/services/ui/client', () => ({
  useOxy: () => ({
    user: { id: 'A', username: 'A' },
    oxyServices: oxy,
    canUsePrivateApi: true,
    openAccountDialog: () => undefined,
  }),
}));
const { default: SyncScreen } = await import('../../app/(tabs)/sync');
const realError = console.error;
const errors: unknown[][] = [];
console.error = (...args: unknown[]) => {
  if (String(args[0]).startsWith('react-test-renderer is deprecated')) return;
  errors.push(args);
};
let renderer: TestRenderer.ReactTestRenderer | undefined;
try {
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(SyncScreen));
  });
  assert.ok(renderer);
  const press = (text: string) => {
    const button = renderer?.root
      .findAllByType('button')
      .find((entry) => entry.props.children === text);
    assert.ok(button);
    return button.props.onPress();
  };
  await act(async () => {
    await press('retrieveFromCloud');
  });
  assert.ok(confirmation);
  oxy.session.setAccessToken(token('B'));
  await act(async () => {
    confirmation?.find(({ text }) => text === 'confirm')?.onPress?.();
  });
  assert.equal(writes, 0);
  assert.deepEqual(JSON.parse(storage.get('accounts') ?? ''), local);
  assert.equal(errors.length, 1);
  assert.match(String(errors[0]?.[1]), /account changed/);
  errors.length = 0;

  let release: (() => void) | undefined;
  let entered: (() => void) | undefined;
  const ready = new Promise<void>((resolve) => {
    entered = resolve;
  });
  holdRead = () =>
    new Promise<void>((resolve) => {
      release = resolve;
      entered?.();
    });
  await act(async () => {
    const upload = press('syncToCloud');
    await ready;
    oxy.session.setAccessToken(token('C'));
    release?.();
    await upload;
  });
  assert.equal(cloudWrites, 0);
  assert.equal(errors.length, 1);
  assert.match(String(errors[0]?.[1]), /account changed/);
  errors.length = 0;
  holdRead = undefined;

  await act(async () => {
    await press('retrieveFromCloud');
  });
  await act(async () => {
    confirmation?.find(({ text }) => text === 'confirm')?.onPress?.();
  });
  assert.deepEqual(JSON.parse(storage.get('accounts') ?? ''), cloud);
  assert.equal(errors.length, 0);
  process.stdout.write('AUTHENTICATOR_SYNC_OK\n');
} finally {
  await act(async () => {
    renderer?.unmount();
  });
  console.error = realError;
  oxy.dispose();
}
