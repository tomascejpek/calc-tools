/**
 * Colour contrast ratio by WCAG 2.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { COLOR_INPUT, parseColor } from './color.js';

/**
 * Relative luminance of an sRGB colour (WCAG 2).
 * @param {[number, number, number]} rgb 0–255
 */
export function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Contrast ratio, 1–21.
 * @param {[number, number, number]} a
 * @param {[number, number, number]} b
 */
export function contrastRatio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const inputs = [
  { id: 'text', ...COLOR_INPUT, default: '#767676', label: { cs: 'Barva textu', en: 'Text colour' } },
  { id: 'background', ...COLOR_INPUT, default: '#ffffff', label: { cs: 'Barva pozadí', en: 'Background colour' } },
];

const outputs = [
  { id: 'ratio', label: { cs: 'Kontrastní poměr', en: 'Contrast ratio' }, unit: ': 1', precision: 2 },
  { id: 'normal', type: 'text', label: { cs: 'Běžný text', en: 'Normal text' } },
  { id: 'large', type: 'text', label: { cs: 'Velký text (od 24 px, tučný od 18,7 px)', en: 'Large text (24 px, bold 18.7 px)' } },
  { id: 'graphics', type: 'text', label: { cs: 'Grafika a ovládací prvky', en: 'Graphics and controls' } },
];

/**
 * @param {number} ratio
 * @param {number} aa threshold for AA
 * @param {number | null} aaa threshold for AAA
 */
function verdict(ratio, aa, aaa) {
  if (aaa !== null && ratio >= aaa) return { cs: 'splňuje AAA', en: 'passes AAA' };
  if (ratio >= aa) return aaa === null ? { cs: 'splňuje AA', en: 'passes AA' } : { cs: 'splňuje AA, ne AAA', en: 'passes AA, not AAA' };
  return { cs: 'nesplňuje AA', en: 'fails AA' };
}

export default {
  id: 'contrast',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'Kontrast barev (WCAG)', en: 'Colour contrast (WCAG)' },
  description: {
    cs: 'Kontrastní poměr textu a pozadí podle WCAG 2.1 a zda splňuje úroveň AA (běžný text 4,5 : 1, velký text a grafika 3 : 1) a AAA (7 : 1 a 4,5 : 1). Šedá #767676 na bílé je nejsvětlejší šedá, která ještě splní AA. Kontrast se počítá z relativní jasnosti v sRGB.',
    en: 'The contrast ratio of text and background by WCAG 2.1 and whether it meets level AA (normal text 4.5 : 1, large text and graphics 3 : 1) and AAA (7 : 1 and 4.5 : 1). Grey #767676 on white is the lightest grey that still meets AA. Contrast comes from the relative luminance in sRGB.',
  },
  keywords: {
    cs: ['kontrast', 'wcag', 'přístupnost', 'barva textu', 'čitelnost', 'kontrastní poměr', 'aa', 'aaa'],
    en: ['contrast', 'wcag', 'accessibility', 'a11y', 'text colour', 'readability', 'contrast ratio', 'aa', 'aaa'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const text = parseColor(read.values.text);
    const background = parseColor(read.values.background);
    if (text === null || background === null) return emptyResult(outputs, [{ cs: 'Složky barvy jsou mimo rozsah.', en: 'Colour components are out of range.' }]);
    // WCAG compares the ratio unrounded
    const ratio = contrastRatio(text, background);
    return {
      values: {
        ratio,
        normal: verdict(ratio, 4.5, 7),
        large: verdict(ratio, 3, 4.5),
        graphics: verdict(ratio, 3, null),
      },
      warnings: [],
    };
  },
  references: [{ title: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.1 – 1.4.3, 1.4.6, 1.4.11 and relative luminance', url: 'https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio' }],
};
