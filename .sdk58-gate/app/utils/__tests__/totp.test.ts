import { afterEach, describe, expect, it } from 'bun:test';

import { generateTOTP } from '../totp';

/**
 * RFC 6238 Appendix B test vectors for the SHA-1 variant.
 *
 * The RFC publishes 8-digit codes; `generateTOTP` truncates to 6, and the
 * 6-digit code is the last six digits of the 8-digit one (both are the same
 * dynamic-truncation value reduced modulo a power of ten). The shared secret is
 * the ASCII string `12345678901234567890`, which is
 * `GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ` in base32.
 *
 * This pins the generator against the standard rather than against itself, so a
 * change to the hand-rolled SHA-1 / HMAC / base32 code below cannot silently
 * start producing codes that no relying party will accept.
 */
const RFC6238_SECRET_BASE32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

const VECTORS: { unixSeconds: number; eightDigit: string }[] = [
  { unixSeconds: 59, eightDigit: '94287082' },
  { unixSeconds: 1111111109, eightDigit: '07081804' },
  { unixSeconds: 1111111111, eightDigit: '14050471' },
  { unixSeconds: 1234567890, eightDigit: '89005924' },
  { unixSeconds: 2000000000, eightDigit: '69279037' },
];

const realNow = Date.now;

afterEach(() => {
  Date.now = realNow;
});

describe('generateTOTP', () => {
  for (const { unixSeconds, eightDigit } of VECTORS) {
    it(`matches RFC 6238 at T=${unixSeconds}`, async () => {
      Date.now = () => unixSeconds * 1000;
      expect(await generateTOTP(RFC6238_SECRET_BASE32)).toBe(eightDigit.slice(-6));
    });
  }

  it('rejects a secret containing a non-base32 character', async () => {
    Date.now = () => 59_000;
    await expect(generateTOTP('ABC1')).rejects.toThrow('Invalid base32 character');
  });
});
