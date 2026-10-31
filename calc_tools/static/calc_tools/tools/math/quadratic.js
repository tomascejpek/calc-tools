/**
 * Quadratic equation ax² + bx + c = 0 with real or complex roots.
 */

import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @typedef {{ re: number, im: number }} Complex
 */

/**
 * Roots of ax² + bx + c = 0, a ≠ 0, computed without cancellation.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {{ roots: Complex[], discriminant: number }}
 */
export function solveQuadratic(a, b, c) {
  const discriminant = b * b - 4 * a * c;
  if (discriminant >= 0) {
    const root = Math.sqrt(discriminant);
    const q = -(b + (b >= 0 ? root : -root)) / 2;
    const x1 = q / a;
    const x2 = q !== 0 ? c / q : x1;
    const sorted = [x1, x2].sort((m, n) => m - n);
    return { roots: sorted.map((re) => ({ re: re + 0, im: 0 })), discriminant };
  }
  const re = -b / (2 * a) + 0;
  const im = Math.sqrt(-discriminant) / (2 * Math.abs(a));
  return { roots: [{ re, im: -im }, { re, im }], discriminant };
}

/**
 * A complex number as text, e.g. "1,5 + 2i".
 * @param {Complex} z
 * @param {'cs' | 'en'} lang
 * @param {(value: number) => string} number
 */
export function complexText({ re, im }, lang, number) {
  if (Math.abs(im) < 1e-12 * Math.max(1, Math.abs(re))) return number(re);
  const imaginary = `${number(Math.abs(im))}i`;
  if (Math.abs(re) < 1e-12 * Math.abs(im)) return `${im < 0 ? '−' : ''}${imaginary}`;
  return `${number(re)} ${im < 0 ? '−' : '+'} ${imaginary}`;
}

/**
 * Roots joined into one text per language.
 * @param {Complex[]} roots
 */
export function rootsText(roots) {
  return bilingual((lang, number) => roots.map((root, index) => `x${'₁₂₃'[index]} = ${complexText(root, lang, number)}`).join(lang === 'cs' ? '; ' : '; '));
}

const inputs = [
  { id: 'a', type: 'number', default: 1, step: 1, label: { cs: 'a (u x²)', en: 'a (of x²)' } },
  { id: 'b', type: 'number', default: -3, step: 1, label: { cs: 'b (u x)', en: 'b (of x)' } },
  { id: 'c', type: 'number', default: 2, step: 1, label: { cs: 'c (absolutní člen)', en: 'c (constant)' } },
];

const outputs = [
  { id: 'roots', type: 'text', label: { cs: 'Kořeny', en: 'Roots' } },
  { id: 'x1', label: { cs: 'x₁ (reálný, menší)', en: 'x₁ (real, smaller)' }, significant: 12 },
  { id: 'x2', label: { cs: 'x₂ (reálný, větší)', en: 'x₂ (real, larger)' }, significant: 12 },
  { id: 'discriminant', label: { cs: 'Diskriminant D = b² − 4ac', en: 'Discriminant D = b² − 4ac' }, significant: 12 },
  { id: 'vertexX', label: { cs: 'Vrchol paraboly – x', en: 'Vertex of the parabola – x' }, significant: 12 },
  { id: 'vertexY', label: { cs: 'Vrchol paraboly – y', en: 'Vertex of the parabola – y' }, significant: 12 },
];

export default {
  id: 'quadratic',
  kind: 'calculator',
  category: 'math-algebra',
  tags: ['math'],
  name: { cs: 'Kvadratická rovnice', en: 'Quadratic equation' },
  description: {
    cs: 'Řešení rovnice ax² + bx + c = 0: kořeny reálné i komplexní (při záporném diskriminantu), diskriminant a vrchol paraboly. Kořeny se počítají numericky stabilně, takže nevznikají chyby odečítáním podobných čísel. Při a = 0 jde o lineární rovnici.',
    en: 'Solves ax² + bx + c = 0: real or complex roots (for a negative discriminant), the discriminant and the vertex of the parabola. Roots are computed in a numerically stable way, avoiding cancellation. With a = 0 the equation is linear.',
  },
  keywords: {
    cs: ['kvadratická rovnice', 'diskriminant', 'kořeny', 'parabola', 'vrchol', 'komplexní kořeny', 'rovnice'],
    en: ['quadratic equation', 'discriminant', 'roots', 'parabola', 'vertex', 'complex roots', 'equation'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { a, b, c } = read.values;
    if (a === 0) {
      if (b === 0) return emptyResult(outputs, [{ cs: 'Pro a = b = 0 nejde o rovnici s neznámou.', en: 'With a = b = 0 there is no unknown to solve for.' }]);
      const x = -c / b + 0;
      return {
        values: { roots: bilingual((lang, number) => `x = ${number(x)}`), x1: x, x2: x, discriminant: null, vertexX: null, vertexY: null },
        warnings: [{ cs: 'Pro a = 0 je rovnice lineární a má jeden kořen.', en: 'With a = 0 the equation is linear and has one root.' }],
      };
    }
    const { roots, discriminant } = solveQuadratic(a, b, c);
    const real = discriminant >= 0;
    const vertexX = -b / (2 * a) + 0;
    return {
      values: {
        roots: rootsText(roots),
        x1: real ? roots[0].re : null,
        x2: real ? roots[1].re : null,
        discriminant,
        vertexX,
        vertexY: a * vertexX * vertexX + b * vertexX + c + 0,
      },
      warnings: real ? [] : [{ cs: 'Diskriminant je záporný, kořeny jsou komplexní.', en: 'The discriminant is negative; the roots are complex.' }],
    };
  },
  references: [
    { title: 'Press, W. H. et al.: Numerical Recipes, 3rd ed., §5.6 – Quadratic and cubic equations' },
  ],
};
