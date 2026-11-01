/**
 * Hashes of a text: SHA-256, SHA-1, MD5 and CRC-32.
 */

import { crc32, md5, sha1, sha256, utf8 } from '../../core/hash.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  // Optional so that an empty text is hashed as such instead of taking the default
  { id: 'text', type: 'text', optional: true, default: 'abc', maxLength: 1000000, label: { cs: 'Text', en: 'Text' } },
  {
    id: 'case', type: 'select', default: 'lower', label: { cs: 'Písmena', en: 'Letters' },
    options: [
      { value: 'lower', label: { cs: 'malá (a–f)', en: 'lower case (a–f)' } },
      { value: 'upper', label: { cs: 'velká (A–F)', en: 'upper case (A–F)' } },
    ],
  },
];

const outputs = [
  { id: 'sha256', type: 'text', label: { cs: 'SHA-256', en: 'SHA-256' } },
  { id: 'sha1', type: 'text', label: { cs: 'SHA-1 (zastaralý)', en: 'SHA-1 (deprecated)' } },
  { id: 'md5', type: 'text', label: { cs: 'MD5 (prolomený)', en: 'MD5 (broken)' } },
  { id: 'crc32', type: 'text', label: { cs: 'CRC-32', en: 'CRC-32' } },
  { id: 'bytes', label: { cs: 'Délka v bajtech (UTF-8)', en: 'Length in bytes (UTF-8)' }, precision: 0 },
];

export default {
  id: 'hash',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'Hash textu (SHA-256, MD5, CRC-32)', en: 'Text hash (SHA-256, MD5, CRC-32)' },
  description: {
    cs: 'Kontrolní součty a otisky textu v UTF-8: SHA-256, SHA-1, MD5 a CRC-32. MD5 a SHA-1 jsou kryptograficky prolomené a hodí se jen k ověření, že se data nepoškodila; pro bezpečnost používejte SHA-256. Hesla se neukládají prostým hashem, ale funkcemi jako Argon2 nebo bcrypt. Počítá se v prohlížeči.',
    en: 'Checksums and digests of UTF-8 text: SHA-256, SHA-1, MD5 and CRC-32. MD5 and SHA-1 are cryptographically broken and only suit checking that data was not damaged; for security use SHA-256. Passwords are not stored with a plain hash but with functions such as Argon2 or bcrypt. Runs in the browser.',
  },
  keywords: {
    cs: ['hash', 'sha-256', 'sha256', 'md5', 'sha-1', 'crc32', 'kontrolní součet', 'otisk', 'checksum'],
    en: ['hash', 'sha-256', 'sha256', 'md5', 'sha-1', 'crc32', 'checksum', 'digest'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const bytes = utf8(read.values.text ?? '');
    const out = (/** @type {string} */ hex) => {
      const text = read.values.case === 'upper' ? hex.toUpperCase() : hex;
      return { cs: text, en: text };
    };
    return { values: { sha256: out(sha256(bytes)), sha1: out(sha1(bytes)), md5: out(md5(bytes)), crc32: out(crc32(bytes)), bytes: bytes.length }, warnings: [] };
  },
  references: [
    { title: 'NIST FIPS 180-4: Secure Hash Standard (SHA-1, SHA-256)', url: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final' },
    { title: 'RFC 1321: The MD5 Message-Digest Algorithm', url: 'https://www.rfc-editor.org/rfc/rfc1321' },
  ],
};
