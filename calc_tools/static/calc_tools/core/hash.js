/**
 * Synchronous hash functions and byte helpers in plain JavaScript: MD5,
 * SHA-1, SHA-256 and CRC-32 of UTF-8 text.
 * @module core/hash
 */

/**
 * UTF-8 bytes of a text.
 * @param {string} text
 */
export function utf8(text) {
  return new TextEncoder().encode(text);
}

/**
 * Lower-case hex of bytes.
 * @param {Uint8Array} bytes
 */
export function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const rotl = (/** @type {number} */ x, /** @type {number} */ n) => (x << n) | (x >>> (32 - n));
const rotr = (/** @type {number} */ x, /** @type {number} */ n) => (x >>> n) | (x << (32 - n));

/**
 * Message padded to 64-byte blocks with its bit length.
 * @param {Uint8Array} bytes
 * @param {boolean} littleEndian length byte order (MD5) or big-endian (SHA)
 */
function pad(bytes, littleEndian) {
  const length = bytes.length;
  const total = Math.ceil((length + 9) / 64) * 64;
  const out = new Uint8Array(total);
  out.set(bytes);
  out[length] = 0x80;
  const view = new DataView(out.buffer);
  const bits = length * 8;
  const high = Math.floor(bits / 2 ** 32);
  const low = bits >>> 0;
  if (littleEndian) {
    view.setUint32(total - 8, low, true);
    view.setUint32(total - 4, high, true);
  } else {
    view.setUint32(total - 8, high, false);
    view.setUint32(total - 4, low, false);
  }
  return view;
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * SHA-256 (FIPS 180-4) as hex.
 * @param {Uint8Array} bytes
 */
export function sha256(bytes) {
  const view = pad(bytes, false);
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  for (let offset = 0; offset < view.byteLength; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + SHA256_K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      [hh, g, f, e, d, c, b, a] = [g, f, e, (d + t1) >>> 0, c, b, a, (t1 + t2) >>> 0];
    }
    [a, b, c, d, e, f, g, hh].forEach((value, i) => { h[i] = (h[i] + value) >>> 0; });
  }
  return h.map((value) => value.toString(16).padStart(8, '0')).join('');
}

/**
 * SHA-1 (FIPS 180-4) as hex. Not collision resistant; for checksums only.
 * @param {Uint8Array} bytes
 */
export function sha1(bytes) {
  const view = pad(bytes, false);
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Uint32Array(80);
  for (let offset = 0; offset < view.byteLength; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 80; i++) w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1) >>> 0;
    let [a, b, c, d, e] = h;
    for (let i = 0; i < 80; i++) {
      const [f, k] = i < 20 ? [(b & c) | (~b & d), 0x5a827999]
        : i < 40 ? [b ^ c ^ d, 0x6ed9eba1]
          : i < 60 ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc]
            : [b ^ c ^ d, 0xca62c1d6];
      const temp = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
      [e, d, c, b, a] = [d, c, rotl(b, 30) >>> 0, a, temp];
    }
    [a, b, c, d, e].forEach((value, i) => { h[i] = (h[i] + value) >>> 0; });
  }
  return h.map((value) => value.toString(16).padStart(8, '0')).join('');
}

const MD5_S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);

/**
 * MD5 (RFC 1321) as hex. Broken for security; for checksums only.
 * @param {Uint8Array} bytes
 */
export function md5(bytes) {
  const view = pad(bytes, true);
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const m = new Uint32Array(16);
  for (let offset = 0; offset < view.byteLength; offset += 64) {
    for (let i = 0; i < 16; i++) m[i] = view.getUint32(offset + i * 4, true);
    let [a, b, c, d] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let f;
      let g;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const sum = (a + f + MD5_K[i] + m[g]) >>> 0;
      [a, d, c] = [d, c, b];
      b = (b + rotl(sum, MD5_S[i])) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }
  const out = new DataView(new ArrayBuffer(16));
  [a0, b0, c0, d0].forEach((value, i) => out.setUint32(i * 4, value, true));
  return toHex(new Uint8Array(out.buffer));
}

/** @type {Uint32Array | null} */
let crcTable = null;

/**
 * CRC-32 (IEEE 802.3, as in ZIP and PNG) as hex.
 * @param {Uint8Array} bytes
 */
export function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}
