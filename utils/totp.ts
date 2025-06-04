import { Buffer } from 'buffer';

function hmacSha1(key: string, message: string): ArrayBuffer {
  const keyData = base32ToBuffer(key);
  const messageData = Buffer.from(message, 'binary');
  
  // Implementation of HMAC-SHA1
  const blockSize = 64;
  const ipad = new Uint8Array(blockSize).fill(0x36);
  const opad = new Uint8Array(blockSize).fill(0x5c);
  
  // Pad key if necessary
  let keyPadded = new Uint8Array(blockSize);
  if (keyData.length > blockSize) {
    keyPadded = sha1(keyData).slice(0, blockSize);
  } else {
    keyPadded.set(keyData);
  }
  
  // XOR key with ipad and opad
  const inner = new Uint8Array(blockSize);
  const outer = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    inner[i] = keyPadded[i] ^ ipad[i];
    outer[i] = keyPadded[i] ^ opad[i];
  }
  
  // Inner hash
  const innerData = new Uint8Array(inner.length + messageData.length);
  innerData.set(inner);
  innerData.set(messageData, inner.length);
  const innerHash = sha1(innerData);
  
  // Outer hash
  const outerData = new Uint8Array(outer.length + innerHash.length);
  outerData.set(outer);
  outerData.set(innerHash, outer.length);
  return sha1(outerData).buffer;
}

// SHA-1 implementation
function sha1(data: Uint8Array): Uint8Array {
  const H = new Uint32Array([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
  const K = new Uint32Array([0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6]);
  
  // Preprocessing
  const padded = pad(data);
  const chunks = chunk(padded);
  
  // Process chunks
  for (const chunk of chunks) {
    const W = new Uint32Array(80);
    
    // Prepare message schedule
    for (let t = 0; t < 16; t++) {
      W[t] = (chunk[t * 4] << 24) | (chunk[t * 4 + 1] << 16) | 
             (chunk[t * 4 + 2] << 8) | chunk[t * 4 + 3];
    }
    for (let t = 16; t < 80; t++) {
      W[t] = rotl(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);
    }
    
    // Initialize working variables
    let [a, b, c, d, e] = H;
    
    // Main loop
    for (let t = 0; t < 80; t++) {
      const temp = (rotl(a, 5) + f(t, b, c, d) + e + K[Math.floor(t/20)] + W[t]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }
    
    // Update hash values
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
  }
  
  // Produce final hash value
  const result = new Uint8Array(20);
  for (let i = 0; i < 5; i++) {
    result[i * 4] = (H[i] >>> 24) & 0xFF;
    result[i * 4 + 1] = (H[i] >>> 16) & 0xFF;
    result[i * 4 + 2] = (H[i] >>> 8) & 0xFF;
    result[i * 4 + 3] = H[i] & 0xFF;
  }
  
  return result;
}

// Helper functions for SHA-1
function f(t: number, b: number, c: number, d: number): number {
  if (t < 20) return (b & c) | (~b & d);
  if (t < 40) return b ^ c ^ d;
  if (t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function pad(data: Uint8Array): Uint8Array {
  const l = data.length * 8;
  const k = (448 - l - 1) & 511;
  const paddedLength = Math.ceil((l + 1 + k + 64) / 8);
  
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;
  
  const view = new DataView(padded.buffer);
  if (typeof (view as any).setBigUint64 === 'function') {
    (view as any).setBigUint64(paddedLength - 8, BigInt(l), false);
  } else {
    // Fallback for environments without DataView.setBigUint64
    const bigL = BigInt(l);
    const high = Number((bigL >> 32n) & 0xffffffffn);
    const low = Number(bigL & 0xffffffffn);
    view.setUint32(paddedLength - 8, high, false);
    view.setUint32(paddedLength - 4, low, false);
  }
  
  return padded;
}

function chunk(data: Uint8Array): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += 64) {
    chunks.push(data.slice(i, i + 64));
  }
  return chunks;
}

function base32ToBuffer(base32: string): Uint8Array {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const bytes: number[] = [];

  base32 = base32.replace(/=+$/, '').toUpperCase();

  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i));
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }

  return new Uint8Array(bytes);
}

function intToBytes(num: number): Uint8Array {
  const bytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = num >> 8;
  }
  return bytes;
}

export async function generateTOTP(secret: string, period: number = 30): Promise<string> {
  // Get current time period
  const counter = Math.floor(Date.now() / 1000 / period);
  
  // Generate HMAC
  const counterBytes = intToBytes(counter);
  const hmac = hmacSha1(secret, Buffer.from(counterBytes).toString('binary'));
  
  // Get offset
  const hmacResult = new Uint8Array(hmac);
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  
  // Generate 4-byte code
  const code = (
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}
