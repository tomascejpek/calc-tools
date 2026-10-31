/**
 * Decoction: how much mash to pull, boil and return to reach the next rest.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { GRAIN_VOLUME } from './strike-water.js';

/**
 * Fraction of the mash to decoct. Heat balance between the boiled part and
 * the rest, with the same heat capacity per litre:
 * f · (Td − T2) = (1 − f) · (T2 − T1).
 * @param {number} from current mash temperature, °C
 * @param {number} to target temperature, °C
 * @param {number} decoction temperature of the returned decoction, °C
 */
export function decoctionFraction(from, to, decoction) {
  return (to - from) / (decoction - from);
}

const inputs = [
  { id: 'grain', type: 'number', default: 5, min: 0, max: 10000, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost sladu', en: 'Grain weight' } },
  { id: 'water', type: 'number', default: 17.5, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Voda ve rmutu', en: 'Water in the mash' } },
  { id: 'from', type: 'number', default: 52, min: 20, max: 80, step: 0.5, unit: '°C', label: { cs: 'Současná teplota rmutu', en: 'Current mash temperature' } },
  { id: 'to', type: 'number', default: 63, min: 20, max: 80, step: 0.5, unit: '°C', label: { cs: 'Teplota další prodlevy', en: 'Next rest temperature' } },
  { id: 'decoction', type: 'number', default: 100, min: 60, max: 102, step: 0.5, unit: '°C', label: { cs: 'Teplota vráceného rmutu', en: 'Temperature of the returned decoction' } },
];

const outputs = [
  { id: 'volume', label: { cs: 'Odebrat rmutu', en: 'Mash to pull' }, unit: 'l', precision: 1 },
  { id: 'fraction', label: { cs: 'Podíl rmutu', en: 'Share of the mash' }, unit: '%', precision: 0 },
  { id: 'mashVolume', label: { cs: 'Objem rmutu', en: 'Mash volume' }, unit: 'l', precision: 1 },
];

export default {
  id: 'decoction',
  kind: 'calculator',
  category: 'mash',
  tags: ['beer'],
  name: { cs: 'Dekokce (rmutovací povar)', en: 'Decoction' },
  description: {
    cs: 'Kolik rmutu odebrat do rmutovací pánve, povařit a vrátit, aby celý rmut dosáhl další prodlevy. Objem rmutu je voda plus 0,67 l na kg sladu. Hustý rmut a ztráty tepla při přečerpání vyžadují v praxi o něco víc, proto odeberte raději víc a zbytek vracejte postupně.',
    en: 'How much mash to pull, boil and return so that the whole mash reaches the next rest. The mash volume is the water plus 0.67 l per kg of grain. A thick decoction and heat lost while transferring need a little more in practice, so pull extra and return it gradually.',
  },
  keywords: {
    cs: ['dekokce', 'dekokční rmutování', 'rmutovací povar', 'povar', 'rmut', 'rmutování', 'odebrat rmut', 'dvourmut', 'trojrmut'],
    en: ['decoction', 'decoction mash', 'pull', 'mash', 'double decoction', 'triple decoction'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { grain, water, from, to, decoction } = read.values;
    if (to <= from) {
      return emptyResult(outputs, [{ cs: 'Další prodleva musí být teplejší než současný rmut.', en: 'The next rest must be warmer than the current mash.' }]);
    }
    if (decoction <= to) {
      return emptyResult(outputs, [{ cs: 'Vrácený rmut musí být teplejší než cílová prodleva.', en: 'The returned decoction must be hotter than the target rest.' }]);
    }
    const fraction = decoctionFraction(from, to, decoction);
    const mashVolume = water + grain * GRAIN_VOLUME;
    const warnings = fraction > 0.5
      ? [{ cs: 'Více než polovinu rmutu je lepší rozdělit do dvou povarů.', en: 'More than half of the mash is better split into two decoctions.' }]
      : [];
    return { values: { volume: fraction * mashVolume, fraction: fraction * 100, mashVolume }, warnings };
  },
  references: [
    { title: 'Palmer, J.: How to Brew, 4th ed., ch. 16 – Decoction mashing', url: 'https://howtobrew.com/book/section-3/the-methods-of-mashing/decoction-mashing' },
    { title: 'Kunze, W.: Technology Brewing and Malting – decoction methods' },
  ],
};
