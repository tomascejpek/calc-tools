/**
 * Tiles, tile adhesive and grout for an area.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Grout per m², kg: (A + B) / (A · B) × joint width × depth × density
 * (manufacturers' formula; A, B, width and depth in mm).
 * @param {number} a tile length, mm
 * @param {number} b tile width, mm
 * @param {number} joint mm
 * @param {number} depth tile thickness, mm
 * @param {number} [density] kg/dm³
 */
export function groutPerSquareMetre(a, b, joint, depth, density = 1.6) {
  return (a + b) / (a * b) * joint * depth * density;
}

/**
 * Whole pieces needed, ignoring floating-point dust (3.0000000001 is 3).
 * @param {number} x
 */
export function roundUp(x) {
  return Math.max(0, Math.ceil(x - 1e-9));
}

const inputs = [
  { id: 'area', type: 'number', default: 12, min: 0, max: 1e6, step: 0.5, unit: 'm²', label: { cs: 'Plocha', en: 'Area' } },
  { id: 'length', type: 'number', default: 600, min: 1, max: 5000, step: 1, unit: 'mm', label: { cs: 'Délka dlaždice', en: 'Tile length' } },
  { id: 'width', type: 'number', default: 300, min: 1, max: 5000, step: 1, unit: 'mm', label: { cs: 'Šířka dlaždice', en: 'Tile width' } },
  { id: 'thickness', type: 'number', default: 9, min: 1, max: 100, step: 0.5, unit: 'mm', label: { cs: 'Tloušťka dlaždice', en: 'Tile thickness' } },
  { id: 'joint', type: 'number', default: 3, min: 0, max: 30, step: 0.5, unit: 'mm', label: { cs: 'Šířka spáry', en: 'Joint width' } },
  { id: 'waste', type: 'number', default: 10, min: 0, max: 50, step: 1, unit: '%', label: { cs: 'Prořez (rovně 5–10 %, diagonálně 15 %)', en: 'Cutting waste (straight 5–10 %, diagonal 15 %)' } },
  { id: 'box', type: 'number', default: 1.44, min: 0.01, max: 100, step: 0.01, unit: 'm²', label: { cs: 'Plocha v balení', en: 'Area per box' } },
  { id: 'adhesive', type: 'number', default: 4, min: 0, max: 20, step: 0.5, unit: 'kg/m²', label: { cs: 'Spotřeba lepidla (zub 8–10 mm ≈ 3–5)', en: 'Adhesive use (8–10 mm notch ≈ 3–5)' } },
];

const outputs = [
  { id: 'tiles', label: { cs: 'Počet dlaždic', en: 'Number of tiles' }, precision: 0 },
  { id: 'boxes', label: { cs: 'Počet balení', en: 'Number of boxes' }, precision: 0 },
  { id: 'adhesive', label: { cs: 'Lepidlo', en: 'Adhesive' }, unit: 'kg', precision: 1 },
  { id: 'grout', label: { cs: 'Spárovací hmota', en: 'Grout' }, unit: 'kg', precision: 1 },
];

export default {
  id: 'tiles',
  kind: 'calculator',
  category: 'eng-material',
  tags: ['engineering'],
  name: { cs: 'Spotřeba obkladu a dlažby', en: 'Tiles, adhesive and grout' },
  description: {
    cs: 'Kolik dlaždic a balení na plochu včetně prořezu, kolik lepidla a spárovací hmoty. Spárovačka se počítá vzorcem výrobců (A + B) / (A · B) × šířka spáry × hloubka × 1,6 kg/dm³. Malé dlaždice a široké spáry spotřebují spárovačky výrazně víc.',
    en: 'How many tiles and boxes for an area including cutting waste, and how much adhesive and grout. Grout uses the manufacturers\' formula (A + B) / (A · B) × joint width × depth × 1.6 kg/dm³. Small tiles and wide joints use far more grout.',
  },
  keywords: {
    cs: ['obklad', 'dlažba', 'dlaždice', 'spotřeba obkladu', 'lepidlo', 'spárovačka', 'spárovací hmota', 'koupelna'],
    en: ['tiles', 'tiling', 'floor tiles', 'wall tiles', 'tile adhesive', 'grout', 'bathroom'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { area, length, width, thickness, joint, waste, box, adhesive } = read.values;
    const withWaste = area * (1 + waste / 100);
    const tileArea = (length + joint) * (width + joint) / 1e6;
    return {
      values: {
        tiles: roundUp(withWaste / tileArea),
        boxes: roundUp(withWaste / box),
        adhesive: area * adhesive,
        grout: area * groutPerSquareMetre(length, width, joint, thickness),
      },
      warnings: [],
    };
  },
  references: [{ title: 'Tile adhesive and grout manufacturers\' consumption formula (e.g. Mapei, Ceresit technical sheets)' }],
};
