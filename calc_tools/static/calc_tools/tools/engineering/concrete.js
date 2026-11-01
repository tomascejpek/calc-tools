/**
 * Concrete volume and materials for slabs, footings and columns.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Typical cement content, kg per m³ of concrete, by strength class (orientation values). */
export const CEMENT_PER_M3 = { c12: 270, c16: 300, c20: 330, c25: 360, c30: 390 };

const inputs = [
  {
    id: 'shape', type: 'select', default: 'slab', label: { cs: 'Prvek', en: 'Element' },
    options: [
      { value: 'slab', label: { cs: 'deska, pas, základ (délka × šířka × výška)', en: 'slab, strip, footing (length × width × depth)' } },
      { value: 'column', label: { cs: 'kruhový sloup nebo patka (průměr × výška)', en: 'round column or pier (diameter × height)' } },
    ],
  },
  { id: 'length', type: 'number', default: 5, min: 0, max: 1e5, step: 0.1, unit: 'm', label: { cs: 'Délka', en: 'Length' } },
  { id: 'width', type: 'number', default: 4, min: 0, max: 1e5, step: 0.1, unit: 'm', label: { cs: 'Šířka (nebo průměr sloupu)', en: 'Width (or column diameter)' } },
  { id: 'depth', type: 'number', default: 0.15, min: 0, max: 1e4, step: 0.01, unit: 'm', label: { cs: 'Tloušťka nebo výška', en: 'Thickness or height' } },
  { id: 'count', type: 'number', default: 1, min: 0, max: 1e5, step: 1, label: { cs: 'Počet kusů', en: 'Pieces' } },
  { id: 'waste', type: 'number', default: 5, min: 0, max: 50, step: 1, unit: '%', label: { cs: 'Rezerva na ztráty', en: 'Waste allowance' } },
  {
    id: 'grade', type: 'select', default: 'c20', label: { cs: 'Pevnostní třída', en: 'Strength class' },
    options: [
      { value: 'c12', label: { cs: 'C12/15 – podkladní beton', en: 'C12/15 – blinding' } },
      { value: 'c16', label: { cs: 'C16/20 – základy', en: 'C16/20 – footings' } },
      { value: 'c20', label: { cs: 'C20/25 – desky, podlahy', en: 'C20/25 – slabs, floors' } },
      { value: 'c25', label: { cs: 'C25/30 – nosné konstrukce', en: 'C25/30 – structural' } },
      { value: 'c30', label: { cs: 'C30/37 – venkovní, namáhané', en: 'C30/37 – exterior, heavy duty' } },
    ],
  },
];

const outputs = [
  { id: 'volume', label: { cs: 'Objem betonu', en: 'Concrete volume' }, unit: 'm³', precision: 2 },
  { id: 'cement', label: { cs: 'Cement', en: 'Cement' }, unit: 'kg', precision: 0 },
  { id: 'bags', label: { cs: 'Pytlů cementu po 25 kg', en: '25 kg bags of cement' }, precision: 0 },
  { id: 'aggregate', label: { cs: 'Kamenivo (písek a štěrk)', en: 'Aggregate (sand and gravel)' }, unit: 't', precision: 2 },
  { id: 'water', label: { cs: 'Voda', en: 'Water' }, unit: 'l', precision: 0 },
];

export default {
  id: 'concrete',
  kind: 'calculator',
  category: 'eng-material',
  tags: ['engineering'],
  name: { cs: 'Spotřeba betonu', en: 'Concrete calculator' },
  description: {
    cs: 'Objem betonu pro desku, základový pas nebo sloup s rezervou na ztráty a orientační spotřeba cementu, kameniva a vody pro míchání na stavbě (asi 1900 kg kameniva a vodní součinitel 0,5 na m³). Skutečnou recepturu určuje betonárna nebo statik; transportbeton se objednává v m³.',
    en: 'Concrete volume for a slab, strip footing or column with a waste allowance, and the approximate cement, aggregate and water for site mixing (about 1900 kg of aggregate and a water–cement ratio of 0.5 per m³). The real mix is set by the batching plant or the structural engineer; ready-mix is ordered in m³.',
  },
  keywords: {
    cs: ['beton', 'spotřeba betonu', 'základová deska', 'základy', 'cement', 'štěrk', 'písek', 'm3 betonu', 'kubík'],
    en: ['concrete', 'concrete calculator', 'slab', 'footing', 'cement', 'gravel', 'sand', 'cubic metres'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { shape, length, width, depth, count, waste, grade } = read.values;
    const net = shape === 'slab' ? length * width * depth : Math.PI * width * width / 4 * depth;
    const volume = net * count * (1 + waste / 100);
    const cement = volume * CEMENT_PER_M3[/** @type {keyof typeof CEMENT_PER_M3} */ (grade)];
    return { values: { volume, cement, bags: Math.ceil(cement / 25), aggregate: volume * 1.9, water: cement * 0.5 }, warnings: [] };
  },
  references: [
    { title: 'ČSN EN 206+A2: Beton – specifikace, vlastnosti, výroba a shoda' },
    { title: 'Neville, A. M.: Properties of Concrete – mix proportions' },
  ],
};
