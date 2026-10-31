/**
 * Pythagorean theorem: the third side of a right triangle.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Missing side of a right triangle with legs a, b and hypotenuse c.
 * @param {{ a: number | null, b: number | null, c: number | null }} sides exactly one null
 * @returns {{ a: number, b: number, c: number } | null} null when a leg is not shorter than the hypotenuse
 */
export function pythagoras({ a, b, c }) {
  if (c === null && a !== null && b !== null) return { a, b, c: Math.hypot(a, b) };
  if (c !== null && a !== null && b === null) return a < c ? { a, b: Math.sqrt(c * c - a * a), c } : null;
  if (c !== null && b !== null && a === null) return b < c ? { a: Math.sqrt(c * c - b * b), b, c } : null;
  return null;
}

const side = (/** @type {string} */ id, /** @type {number | undefined} */ value, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', optional: true, default: value, min: 0, max: 1e12, step: 0.1, label: { cs, en },
});

const inputs = [
  side('a', 3, 'Odvěsna a', 'Leg a'),
  side('b', 4, 'Odvěsna b', 'Leg b'),
  side('c', undefined, 'Přepona c', 'Hypotenuse c'),
];

const outputs = [
  { id: 'a', label: { cs: 'Odvěsna a', en: 'Leg a' }, significant: 12 },
  { id: 'b', label: { cs: 'Odvěsna b', en: 'Leg b' }, significant: 12 },
  { id: 'c', label: { cs: 'Přepona c', en: 'Hypotenuse c' }, significant: 12 },
  { id: 'area', label: { cs: 'Obsah', en: 'Area' }, significant: 12 },
];

export default {
  id: 'pythagoras',
  kind: 'calculator',
  category: 'math-geometry',
  tags: ['math'],
  name: { cs: 'Pythagorova věta', en: 'Pythagorean theorem' },
  description: {
    cs: 'Třetí strana pravoúhlého trojúhelníku z ostatních dvou: c² = a² + b². Zadejte dvě strany a třetí nechte prázdnou; odvěsna musí být kratší než přepona.',
    en: 'The third side of a right triangle from the other two: c² = a² + b². Enter two sides and leave the third empty; a leg must be shorter than the hypotenuse.',
  },
  keywords: {
    cs: ['pythagorova věta', 'pravoúhlý trojúhelník', 'přepona', 'odvěsna', 'úhlopříčka'],
    en: ['pythagorean theorem', 'pythagoras', 'right triangle', 'hypotenuse', 'leg', 'diagonal'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const sides = /** @type {{ a: number | null, b: number | null, c: number | null }} */ (read.values);
    if (Object.values(sides).filter((x) => x !== null).length !== 2) {
      return emptyResult(outputs, [{ cs: 'Zadejte právě dvě strany.', en: 'Enter exactly two sides.' }]);
    }
    const result = pythagoras(sides);
    if (result === null) return emptyResult(outputs, [{ cs: 'Odvěsna musí být kratší než přepona.', en: 'A leg must be shorter than the hypotenuse.' }]);
    return { values: { ...result, area: result.a * result.b / 2 }, warnings: [] };
  },
  references: [{ title: 'Wikipedia: Pythagorean theorem', url: 'https://en.wikipedia.org/wiki/Pythagorean_theorem' }],
};
