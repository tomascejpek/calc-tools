/**
 * Liquid in a cylindrical vessel by the level: upright, cylindroconical or
 * horizontal tank.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Size of one unit in decimetres (1 dm³ = 1 l). */
export const DECIMETRES = { mm: 0.01, cm: 0.1, m: 10 };

/**
 * Area of the circular segment filled to height h in a circle of radius r.
 * @param {number} r
 * @param {number} h 0–2r
 */
export function segmentArea(r, h) {
  const level = Math.max(0, Math.min(2 * r, h));
  return r * r * Math.acos((r - level) / r) - (r - level) * Math.sqrt(Math.max(0, 2 * r * level - level * level));
}

/**
 * Volume of liquid and capacity, in cubic units of the inputs.
 * @param {'vertical' | 'conical' | 'horizontal'} shape
 * @param {{ diameter: number, length: number, cone: number, level: number }} size
 *   length = height of the cylindrical part (vertical) or its length (horizontal);
 *   cone = height of the conical bottom; level from the lowest point
 */
export function tankVolume(shape, { diameter, length, cone, level }) {
  const r = diameter / 2;
  const base = Math.PI * r * r;
  if (shape === 'horizontal') return { volume: segmentArea(r, level) * length, capacity: base * length, maxLevel: diameter };
  if (shape === 'vertical') return { volume: base * Math.min(level, length), capacity: base * length, maxLevel: length };
  const coneVolume = base * cone / 3;
  const volume = level <= cone
    ? Math.PI * (r * level / cone) ** 2 * level / 3
    : coneVolume + base * Math.min(level - cone, length);
  return { volume, capacity: coneVolume + base * length, maxLevel: cone + length };
}

const inputs = [
  {
    id: 'shape', type: 'select', default: 'conical', label: { cs: 'Nádoba', en: 'Vessel' },
    options: [
      { value: 'vertical', label: { cs: 'stojatý válec s rovným dnem', en: 'upright cylinder, flat bottom' } },
      { value: 'conical', label: { cs: 'cylindrokónická (kuželové dno)', en: 'cylindroconical (cone bottom)' } },
      { value: 'horizontal', label: { cs: 'ležatý válec s rovnými čely', en: 'horizontal cylinder, flat ends' } },
    ],
  },
  {
    id: 'unit', type: 'select', default: 'cm', label: { cs: 'Rozměry v', en: 'Sizes in' },
    options: [
      { value: 'mm', label: { cs: 'mm', en: 'mm' } },
      { value: 'cm', label: { cs: 'cm', en: 'cm' } },
      { value: 'm', label: { cs: 'm', en: 'm' } },
    ],
  },
  { id: 'diameter', type: 'number', default: 40, min: 0.001, max: 1e6, step: 0.5, label: { cs: 'Vnitřní průměr', en: 'Inner diameter' } },
  { id: 'length', type: 'number', default: 60, min: 0, max: 1e6, step: 0.5, label: { cs: 'Výška válcové části (ležatý: délka)', en: 'Height of the cylindrical part (horizontal: length)' } },
  { id: 'cone', type: 'number', default: 20, min: 0.001, max: 1e6, step: 0.5, label: { cs: 'Výška kuželového dna', en: 'Height of the cone bottom' } },
  { id: 'level', type: 'number', default: 50, min: 0, max: 1e6, step: 0.5, label: { cs: 'Výška hladiny od nejnižšího bodu', en: 'Liquid level from the lowest point' } },
];

const outputs = [
  { id: 'litres', label: { cs: 'Objem kapaliny', en: 'Liquid volume' }, unit: 'l', precision: 1 },
  { id: 'capacity', label: { cs: 'Celkový objem nádoby', en: 'Vessel capacity' }, unit: 'l', precision: 1 },
  { id: 'percent', label: { cs: 'Naplnění', en: 'Fill level' }, unit: '%', precision: 1 },
  { id: 'headspace', label: { cs: 'Volný prostor', en: 'Headspace' }, unit: 'l', precision: 1 },
];

export default {
  id: 'tank-volume',
  kind: 'calculator',
  category: 'math-geometry',
  tags: ['math', 'beer'],
  name: { cs: 'Objem nádoby podle výšky hladiny', en: 'Tank volume by liquid level' },
  description: {
    cs: 'Kolik litrů je v kvasné nádobě, cylindrokónickém tanku nebo ležatém sudu podle výšky hladiny. Hladinu měřte od nejnižšího bodu (špička kuželového dna, spodní okraj ležatého válce). Ležatý válec počítá s rovnými čely; vypouklá čela přidávají objem navíc.',
    en: 'How many litres are in a fermenter, cylindroconical tank or horizontal tank by the liquid level. Measure the level from the lowest point (tip of the cone bottom, bottom edge of a horizontal cylinder). The horizontal cylinder has flat ends; dished ends add extra volume.',
  },
  keywords: {
    cs: ['objem nádoby', 'výška hladiny', 'kvasná nádoba', 'cylindrokónický tank', 'ležatý tank', 'cisterna', 'sud', 'litry', 'válec'],
    en: ['tank volume', 'liquid level', 'fermenter', 'cylindroconical', 'horizontal tank', 'cistern', 'vessel', 'litres', 'cylinder'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { shape, unit } = read.values;
    const { volume, capacity, maxLevel } = tankVolume(shape, /** @type {any} */ (read.values));
    if (read.values.level > maxLevel * (1 + 1e-12)) {
      return emptyResult(outputs, [{ cs: 'Hladina je výš, než nádoba sahá.', en: 'The level is higher than the vessel.' }]);
    }
    if (capacity <= 0) return emptyResult(outputs, [{ cs: 'Nádoba má nulový objem.', en: 'The vessel has no volume.' }]);
    const toLitres = DECIMETRES[/** @type {keyof typeof DECIMETRES} */ (unit)] ** 3;
    return {
      values: { litres: volume * toLitres, capacity: capacity * toLitres, percent: volume / capacity * 100, headspace: (capacity - volume) * toLitres },
      warnings: [],
    };
  },
  references: [
    { title: 'Wikipedia: Circular segment – area', url: 'https://en.wikipedia.org/wiki/Circular_segment' },
    { title: 'Wikipedia: Cone – volume', url: 'https://en.wikipedia.org/wiki/Cone' },
  ],
};
