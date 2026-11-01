/**
 * Text encodings: Base64, URL (percent) encoding and hex bytes.
 */

import { toHex, utf8 } from '../../core/hash.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * UTF-8 text to Base64.
 * @param {string} text
 */
export function base64Encode(text) {
  let binary = '';
  for (const byte of utf8(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Base64 to UTF-8 text; throws on invalid input.
 * @param {string} text
 */
export function base64Decode(text) {
  const normal = text.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normal)) throw new Error('not Base64');
  const binary = atob(normal.padEnd(Math.ceil(normal.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/**
 * Hex bytes to UTF-8 text; throws on invalid input.
 * @param {string} text
 */
export function hexDecode(text) {
  const clean = text.replace(/[\s:]/g, '');
  if (!/^([0-9a-f]{2})*$/i.test(clean)) throw new Error('not hex');
  const bytes = Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/** Operations and their functions. */
const OPERATIONS = {
  base64Encode,
  base64Decode,
  urlEncode: (/** @type {string} */ text) => encodeURIComponent(text),
  urlDecode: (/** @type {string} */ text) => decodeURIComponent(text.replace(/\+/g, ' ')),
  hexEncode: (/** @type {string} */ text) => toHex(utf8(text)),
  hexDecode,
};

const inputs = [
  {
    id: 'operation', type: 'select', default: 'base64Encode', label: { cs: 'Operace', en: 'Operation' },
    options: [
      { value: 'base64Encode', label: { cs: 'Base64 – zakódovat', en: 'Base64 – encode' } },
      { value: 'base64Decode', label: { cs: 'Base64 – dekódovat', en: 'Base64 – decode' } },
      { value: 'urlEncode', label: { cs: 'URL – zakódovat (%20)', en: 'URL – encode (%20)' } },
      { value: 'urlDecode', label: { cs: 'URL – dekódovat', en: 'URL – decode' } },
      { value: 'hexEncode', label: { cs: 'hex – bajty textu', en: 'hex – bytes of the text' } },
      { value: 'hexDecode', label: { cs: 'hex – na text', en: 'hex – to text' } },
    ],
  },
  { id: 'text', type: 'text', optional: true, default: 'Dobrý den, světe!', maxLength: 100000, label: { cs: 'Text', en: 'Text' } },
];

const outputs = [
  { id: 'result', type: 'text', label: { cs: 'Výsledek', en: 'Result' } },
  { id: 'inputBytes', label: { cs: 'Délka vstupu v bajtech (UTF-8)', en: 'Input length in bytes (UTF-8)' }, precision: 0 },
  { id: 'outputLength', label: { cs: 'Délka výsledku ve znacích', en: 'Result length in characters' }, precision: 0 },
];

export default {
  id: 'encoding',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'Kódování textu (Base64, URL, hex)', en: 'Text encoding (Base64, URL, hex)' },
  description: {
    cs: 'Zakódování a dekódování textu v UTF-8 do Base64 (i URL-safe varianty s - a _), procentového kódování URL a šestnáctkových bajtů. Base64 není šifrování – kdokoli ho dekóduje. Počítá se v prohlížeči, text se nikam neodesílá.',
    en: 'Encodes and decodes UTF-8 text as Base64 (including the URL-safe variant with - and _), URL percent-encoding and hex bytes. Base64 is not encryption – anyone can decode it. Runs in the browser; the text is not sent anywhere.',
  },
  keywords: {
    cs: ['base64', 'url kódování', 'percent encoding', 'hex', 'kódování', 'dekódování', 'utf-8'],
    en: ['base64', 'url encode', 'url decode', 'percent encoding', 'hex', 'encoding', 'decoding', 'utf-8'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { operation } = read.values;
    const text = read.values.text ?? '';
    let result;
    try {
      result = OPERATIONS[/** @type {keyof typeof OPERATIONS} */ (operation)](text);
    } catch {
      return emptyResult(outputs, [{ cs: 'Text nelze dekódovat – není v očekávaném formátu nebo nedává platné UTF-8.', en: 'The text cannot be decoded – it is not in the expected format or not valid UTF-8.' }]);
    }
    return { values: { result: { cs: result, en: result }, inputBytes: utf8(text).length, outputLength: [...result].length }, warnings: [] };
  },
  references: [
    { title: 'RFC 4648: The Base16, Base32, and Base64 Data Encodings', url: 'https://www.rfc-editor.org/rfc/rfc4648' },
    { title: 'RFC 3986: URI Generic Syntax – percent-encoding', url: 'https://www.rfc-editor.org/rfc/rfc3986' },
  ],
};
