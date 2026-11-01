/**
 * Paint needed for walls and ceilings.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { roundUp } from './tiles.js';

const inputs = [
  { id: 'perimeter', type: 'number', default: 16, min: 0, max: 1e5, step: 0.5, unit: 'm', label: { cs: 'Obvod místnosti (součet délek stěn)', en: 'Room perimeter (sum of wall lengths)' } },
  { id: 'height', type: 'number', default: 2.6, min: 0, max: 100, step: 0.05, unit: 'm', label: { cs: 'Výška stěn', en: 'Wall height' } },
  { id: 'openings', type: 'number', default: 4, min: 0, max: 1e5, step: 0.5, unit: 'm²', label: { cs: 'Plocha oken a dveří', en: 'Area of windows and doors' } },
  { id: 'ceiling', type: 'number', default: 16, min: 0, max: 1e5, step: 0.5, unit: 'm²', label: { cs: 'Strop (0 = nemalovat)', en: 'Ceiling (0 = not painted)' } },
  { id: 'coats', type: 'number', default: 2, min: 1, max: 10, step: 1, label: { cs: 'Počet vrstev', en: 'Coats' } },
  { id: 'coverage', type: 'number', default: 8, min: 0.5, max: 50, step: 0.5, unit: 'm²/l', label: { cs: 'Vydatnost barvy (na obalu)', en: 'Paint coverage (on the can)' } },
  { id: 'can', type: 'number', default: 5, min: 0.1, max: 100, step: 0.5, unit: 'l', label: { cs: 'Velikost balení', en: 'Can size' } },
];

const outputs = [
  { id: 'area', label: { cs: 'Malovaná plocha', en: 'Painted area' }, unit: 'm²', precision: 1 },
  { id: 'litres', label: { cs: 'Barvy', en: 'Paint' }, unit: 'l', precision: 1 },
  { id: 'cans', label: { cs: 'Balení', en: 'Cans' }, precision: 0 },
];

export default {
  id: 'paint',
  kind: 'calculator',
  category: 'eng-material',
  tags: ['engineering'],
  name: { cs: 'Spotřeba barvy', en: 'Paint calculator' },
  description: {
    cs: 'Kolik barvy na stěny a strop: plocha = obvod × výška − okna a dveře (+ strop), krát počet vrstev, děleno vydatností z obalu (interiérové barvy obvykle 6–10 m²/l na vrstvu). Savý nebo hrubý podklad spotřebuje víc, proto počítejte s rezervou nebo nejdřív penetrujte.',
    en: 'How much paint for walls and ceiling: area = perimeter × height − windows and doors (+ ceiling), times the number of coats, divided by the coverage on the can (interior paints usually 6–10 m²/l per coat). Absorbent or rough surfaces use more, so allow extra or prime first.',
  },
  keywords: {
    cs: ['barva', 'spotřeba barvy', 'malování', 'výmalba', 'stěny', 'strop', 'vydatnost', 'kolik barvy'],
    en: ['paint', 'paint calculator', 'painting', 'walls', 'ceiling', 'coverage', 'how much paint'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { perimeter, height, openings, ceiling, coats, coverage, can } = read.values;
    const walls = perimeter * height - openings;
    if (walls < 0) return emptyResult(outputs, [{ cs: 'Okna a dveře jsou větší než stěny.', en: 'Windows and doors exceed the walls.' }]);
    const area = walls + ceiling;
    const litres = area * coats / coverage;
    return { values: { area, litres, cans: roundUp(litres / can) }, warnings: [] };
  },
  references: [{ title: 'Paint manufacturers\' technical data sheets – theoretical coverage per coat' }],
};
