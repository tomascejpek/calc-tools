/**
 * Colours: HEX ⇄ RGB ⇄ HSL ⇄ HSV ⇄ CMYK.
 */

import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Accepted colour notations: #rgb, #rrggbb, rgb(r, g, b), hsl(h, s%, l%). */
export const COLOR_PATTERN = /^(#?[0-9a-f]{3}|#?[0-9a-f]{6}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|hsl\(\s*\d{1,3}(\.\d+)?\s*,\s*\d{1,3}(\.\d+)?%\s*,\s*\d{1,3}(\.\d+)?%\s*\))$/i;

/**
 * @param {number} h 0–360
 * @param {number} s 0–1
 * @param {number} l 0–1
 * @returns {[number, number, number]} 0–255
 */
export function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return /** @type {[number, number, number]} */ ([r, g, b].map((value) => Math.round((value + m) * 255)));
}

/**
 * @param {number} r 0–255
 * @param {number} g 0–255
 * @param {number} b 0–255
 * @returns {{ h: number, s: number, l: number, v: number, sv: number }} h in degrees, others 0–1 (sv = HSV saturation)
 */
export function rgbToHsl(r, g, b) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  return { h: (h + 360) % 360, s, l, v: max, sv: max === 0 ? 0 : d / max };
}

/**
 * Parses a colour into RGB 0–255, or null.
 * @param {string} text
 * @returns {[number, number, number] | null}
 */
export function parseColor(text) {
  const value = text.trim().toLowerCase();
  const hex = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].split('').map((d) => d + d).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
  }
  const rgb = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb) {
    const channels = rgb.slice(1).map(Number);
    return channels.every((c) => c <= 255) ? /** @type {[number, number, number]} */ (channels) : null;
  }
  const hsl = value.match(/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
  if (hsl) {
    const [h, s, l] = hsl.slice(1).map(Number);
    return h <= 360 && s <= 100 && l <= 100 ? hslToRgb(h % 360, s / 100, l / 100) : null;
  }
  return null;
}

/** @param {[number, number, number]} rgb */
export function hexText([r, g, b]) {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** The colour input shared by colour tools. */
export const COLOR_INPUT = {
  type: 'text', maxLength: 40, pattern: COLOR_PATTERN,
  hint: { cs: 'Např. #3366cc, #36c, rgb(51, 102, 204) nebo hsl(220, 60%, 50%).', en: 'E.g. #3366cc, #36c, rgb(51, 102, 204) or hsl(220, 60%, 50%).' },
};

const inputs = [
  { id: 'color', ...COLOR_INPUT, default: '#3366cc', label: { cs: 'Barva', en: 'Colour' } },
];

const outputs = [
  { id: 'hex', type: 'text', label: { cs: 'HEX', en: 'HEX' } },
  { id: 'rgb', type: 'text', label: { cs: 'RGB', en: 'RGB' } },
  { id: 'hsl', type: 'text', label: { cs: 'HSL', en: 'HSL' } },
  { id: 'hsv', type: 'text', label: { cs: 'HSV (HSB)', en: 'HSV (HSB)' } },
  { id: 'cmyk', type: 'text', label: { cs: 'CMYK (bez barevného profilu)', en: 'CMYK (without a colour profile)' } },
];

export default {
  id: 'color',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'Převod barev (HEX ⇄ RGB ⇄ HSL)', en: 'Colour converter (HEX ⇄ RGB ⇄ HSL)' },
  description: {
    cs: 'Převod barvy mezi zápisy HEX (#3366cc), RGB, HSL, HSV a CMYK. Zadat lze kterýkoli z prvních tří. CMYK je jen přímý přepočet bez barevného profilu; pro tisk ho určuje tiskový profil (např. FOGRA39).',
    en: 'Converts a colour between HEX (#3366cc), RGB, HSL, HSV and CMYK notation. Any of the first three can be entered. CMYK is a plain conversion without a colour profile; for print it is set by the print profile (e.g. FOGRA39).',
  },
  keywords: {
    cs: ['barva', 'hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'převod barev', 'barevný kód', 'css'],
    en: ['colour', 'color', 'hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'colour converter', 'css'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const rgb = parseColor(read.values.color);
    if (rgb === null) return emptyResult(outputs, [{ cs: 'Složky barvy jsou mimo rozsah (RGB 0–255, HSL 0–360 a 0–100 %).', en: 'Colour components are out of range (RGB 0–255, HSL 0–360 and 0–100 %).' }]);
    const [r, g, b] = rgb;
    const { h, s, l, v, sv } = rgbToHsl(r, g, b);
    const k = 1 - Math.max(r, g, b) / 255;
    const cmy = [r, g, b].map((c) => (k === 1 ? 0 : (1 - c / 255 - k) / (1 - k)));
    const pct = (/** @type {number} */ x) => Math.round(x * 100);
    const plain = (/** @type {string} */ text) => ({ cs: text, en: text });
    return {
      values: {
        hex: plain(hexText(rgb)),
        rgb: plain(`rgb(${r}, ${g}, ${b})`),
        hsl: plain(`hsl(${Math.round(h)}, ${pct(s)}%, ${pct(l)}%)`),
        hsv: plain(`${Math.round(h)}°, ${pct(sv)} %, ${pct(v)} %`),
        cmyk: bilingual(() => `${cmy.map(pct).join(' %, ')} %, ${pct(k)} %`),
      },
      warnings: [],
    };
  },
  references: [{ title: 'W3C CSS Color Module Level 4 – sRGB, HSL', url: 'https://www.w3.org/TR/css-color-4/' }],
};
