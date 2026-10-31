/**
 * Perimeter and area of plane shapes.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Perimeter and area; for a triangle the three sides a, b, c (Heron).
 * @param {string} shape
 * @param {{ a: number, b: number, c: number, r: number }} size
 * @returns {{ perimeter: number, area: number } | null} null for an impossible triangle
 */
export function planeShape(shape, { a, b, c, r }) {
  switch (shape) {
    case 'circle': return { perimeter: 2 * Math.PI * r, area: Math.PI * r * r };
    case 'square': return { perimeter: 4 * a, area: a * a };
    case 'rectangle': return { perimeter: 2 * (a + b), area: a * b };
    case 'triangle': {
      const s = (a + b + c) / 2;
      const product = s * (s - a) * (s - b) * (s - c);
      if (!(product > 0)) return null;
      return { perimeter: a + b + c, area: Math.sqrt(product) };
    }
    case 'ellipse': {
      // Ramanujan's second approximation of the perimeter, semi-axes a and b
      const h = ((a - b) / (a + b)) ** 2;
      return { perimeter: Math.PI * (a + b) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h))), area: Math.PI * a * b };
    }
    default: return null;
  }
}

const size = (/** @type {string} */ id, /** @type {number} */ value, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', default: value, min: 0, max: 1e12, step: 0.1, label: { cs, en },
});

const inputs = [
  {
    id: 'shape', type: 'select', default: 'circle', label: { cs: 'Obrazec', en: 'Shape' },
    options: [
      { value: 'circle', label: { cs: 'kruh (poloměr r)', en: 'circle (radius r)' } },
      { value: 'square', label: { cs: 'čtverec (strana a)', en: 'square (side a)' } },
      { value: 'rectangle', label: { cs: 'obdélník (strany a, b)', en: 'rectangle (sides a, b)' } },
      { value: 'triangle', label: { cs: 'trojúhelník (strany a, b, c)', en: 'triangle (sides a, b, c)' } },
      { value: 'ellipse', label: { cs: 'elipsa (poloosy a, b)', en: 'ellipse (semi-axes a, b)' } },
    ],
  },
  size('r', 1, 'Poloměr r', 'Radius r'),
  size('a', 3, 'Strana nebo poloosa a', 'Side or semi-axis a'),
  size('b', 4, 'Strana nebo poloosa b', 'Side or semi-axis b'),
  size('c', 5, 'Strana c', 'Side c'),
];

const outputs = [
  { id: 'perimeter', label: { cs: 'Obvod', en: 'Perimeter' }, significant: 10 },
  { id: 'area', label: { cs: 'Obsah', en: 'Area' }, significant: 10 },
];

export default {
  id: 'plane-shapes',
  kind: 'calculator',
  category: 'math-geometry',
  tags: ['math'],
  name: { cs: 'Obvod a obsah obrazců', en: 'Perimeter and area of shapes' },
  description: {
    cs: 'Obvod a obsah kruhu, čtverce, obdélníku, trojúhelníku ze tří stran (Heronův vzorec) a elipsy (obvod Ramanujanovou aproximací, přesnou na miliontiny). Všechny rozměry zadejte ve stejné jednotce; obsah vyjde v jejím čtverci.',
    en: 'Perimeter and area of a circle, square, rectangle, triangle from three sides (Heron\'s formula) and ellipse (perimeter by Ramanujan\'s approximation, accurate to millionths). Enter all sizes in the same unit; the area comes out in its square.',
  },
  keywords: {
    cs: ['obvod', 'obsah', 'plocha', 'kruh', 'čtverec', 'obdélník', 'trojúhelník', 'heronův vzorec', 'elipsa'],
    en: ['perimeter', 'circumference', 'area', 'circle', 'square', 'rectangle', 'triangle', 'heron', 'ellipse'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const result = planeShape(read.values.shape, /** @type {any} */ (read.values));
    if (result === null) {
      return emptyResult(outputs, [{ cs: 'Z těchto stran trojúhelník nesestavíte (každá musí být kratší než součet zbylých).', en: 'These sides do not form a triangle (each must be shorter than the sum of the others).' }]);
    }
    return { values: result, warnings: [] };
  },
  references: [
    { title: 'Wikipedia: Heron\'s formula', url: 'https://en.wikipedia.org/wiki/Heron%27s_formula' },
    { title: 'Wikipedia: Ellipse – circumference (Ramanujan)', url: 'https://en.wikipedia.org/wiki/Ellipse#Circumference' },
  ],
};
