/**
 * Volume and surface area of solids.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @param {string} solid
 * @param {{ r: number, r2: number, h: number, a: number, b: number }} size
 * @returns {{ volume: number, surface: number, lateral: number } | null}
 */
export function solidMeasures(solid, { r, r2, h, a, b }) {
  switch (solid) {
    case 'cuboid': return { volume: a * b * h, surface: 2 * (a * b + a * h + b * h), lateral: 2 * h * (a + b) };
    case 'cylinder': return { volume: Math.PI * r * r * h, surface: 2 * Math.PI * r * (r + h), lateral: 2 * Math.PI * r * h };
    case 'sphere': return { volume: 4 / 3 * Math.PI * r ** 3, surface: 4 * Math.PI * r * r, lateral: 4 * Math.PI * r * r };
    case 'cone': {
      const slant = Math.hypot(r, h);
      return { volume: Math.PI * r * r * h / 3, surface: Math.PI * r * (r + slant), lateral: Math.PI * r * slant };
    }
    case 'frustum': {
      const slant = Math.hypot(r - r2, h);
      const lateral = Math.PI * (r + r2) * slant;
      return { volume: Math.PI * h / 3 * (r * r + r * r2 + r2 * r2), surface: lateral + Math.PI * (r * r + r2 * r2), lateral };
    }
    case 'pyramid': {
      // Regular square pyramid with base side a
      const slant = Math.hypot(a / 2, h);
      return { volume: a * a * h / 3, surface: a * a + 2 * a * slant, lateral: 2 * a * slant };
    }
    default: return null;
  }
}

const size = (/** @type {string} */ id, /** @type {number} */ value, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', default: value, min: 0, max: 1e12, step: 0.1, label: { cs, en },
});

const inputs = [
  {
    id: 'solid', type: 'select', default: 'cylinder', label: { cs: 'Těleso', en: 'Solid' },
    options: [
      { value: 'cylinder', label: { cs: 'válec (r, v)', en: 'cylinder (r, h)' } },
      { value: 'sphere', label: { cs: 'koule (r)', en: 'sphere (r)' } },
      { value: 'cone', label: { cs: 'kužel (r, v)', en: 'cone (r, h)' } },
      { value: 'frustum', label: { cs: 'komolý kužel (r, r₂, v)', en: 'frustum of a cone (r, r₂, h)' } },
      { value: 'cuboid', label: { cs: 'kvádr (a, b, v)', en: 'cuboid (a, b, h)' } },
      { value: 'pyramid', label: { cs: 'pravidelný čtyřboký jehlan (a, v)', en: 'square pyramid (a, h)' } },
    ],
  },
  size('r', 1, 'Poloměr r (dolní podstava)', 'Radius r (bottom base)'),
  size('r2', 0.5, 'Poloměr r₂ (horní podstava komolého kužele)', 'Radius r₂ (top of the frustum)'),
  size('h', 2, 'Výška v', 'Height h'),
  size('a', 1, 'Hrana a', 'Edge a'),
  size('b', 1, 'Hrana b', 'Edge b'),
];

const outputs = [
  { id: 'volume', label: { cs: 'Objem', en: 'Volume' }, significant: 10 },
  { id: 'surface', label: { cs: 'Povrch', en: 'Surface area' }, significant: 10 },
  { id: 'lateral', label: { cs: 'Plášť', en: 'Lateral area' }, significant: 10 },
];

export default {
  id: 'solids',
  kind: 'calculator',
  category: 'math-geometry',
  tags: ['math'],
  name: { cs: 'Objem a povrch těles', en: 'Volume and surface of solids' },
  description: {
    cs: 'Objem, povrch a plášť válce, koule, kužele, komolého kužele, kvádru a pravidelného čtyřbokého jehlanu. Rozměry zadejte ve stejné jednotce; objem vyjde v její krychli (z centimetrů v cm³ = ml, z decimetrů v litrech).',
    en: 'Volume, surface area and lateral area of a cylinder, sphere, cone, frustum of a cone, cuboid and square pyramid. Enter sizes in the same unit; the volume comes out in its cube (from centimetres in cm³ = ml, from decimetres in litres).',
  },
  keywords: {
    cs: ['objem', 'povrch', 'plášť', 'válec', 'koule', 'kužel', 'komolý kužel', 'kvádr', 'jehlan', 'těleso'],
    en: ['volume', 'surface area', 'lateral area', 'cylinder', 'sphere', 'cone', 'frustum', 'cuboid', 'pyramid', 'solid'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const result = solidMeasures(read.values.solid, /** @type {any} */ (read.values));
    if (result === null) return emptyResult(outputs, [{ cs: 'Neznámé těleso.', en: 'Unknown solid.' }]);
    return { values: result, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Frustum', url: 'https://en.wikipedia.org/wiki/Frustum' }],
};
