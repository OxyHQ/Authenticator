import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('sync refuses stale account confirmations and never uploads after an account switch', () => {
  const result = spawnSync(
    'bun',
    [fileURLToPath(new URL('../__fixtures__/cloud-sync-probe.tsx', import.meta.url).href)],
    {
      encoding: 'utf8',
      timeout: 15000,
      env: process.env,
    },
  );
  expect({ status: result.status, stderr: result.stderr }).toEqual({ status: 0, stderr: '' });
  expect(result.stdout).toBe('AUTHENTICATOR_SYNC_OK\n');
}, 20000);
