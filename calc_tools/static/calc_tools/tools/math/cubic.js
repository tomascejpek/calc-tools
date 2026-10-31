/**
 * Cubic equation ax³ + bx² + cx + d = 0.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { rootsText, solveQuadratic } from './quadratic.js';

/** @typedef {import('./quadratic.js').Complex} Complex */

/**
 * Roots of ax³ + bx² + cx + d = 0, a ≠ 0: real roots first, ascending.
 * Trigonometric method for three real roots, Cardano otherwise; each real
 * root is polished by Newton's method.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @returns {Complex[]}
 */
export function solveCubic(a, b, c, d) {
  const B = b / a;
  const C = c / a;
  const D = d / a;
  // x = t − B/3: t³ + pt + q = 0
  const p = C - B * B / 3;
  const q = 2 * B ** 3 / 27 - B * C / 3 + D;
  const shift = -B / 3;
  const polish = (/** @type {number} */ x) => {
    let root = x;
    for (let i = 0; i < 4; i++) {
      const f = ((a * root + b) * root + c) * root + d;
      const df = (3 * a * root + 2 * b) * root + c;
      if (df === 0) break;
      const next = root - f / df;
      if (!Number.isFinite(next)) break;
      root = next;
    }
    return root + 0;
  };
  const discriminant = (q / 2) ** 2 + (p / 3) ** 3;
  const scale = Math.max(1, Math.abs(p) ** 1.5, Math.abs(q));
  if (discriminant < -1e-14 * scale * scale) {
    const m = 2 * Math.sqrt(-p / 3);
    const theta = Math.acos(Math.max(-1, Math.min(1, 3 * q / (p * m)))) / 3;
    const roots = [0, 1, 2].map((k) => polish(m * Math.cos(theta - 2 * Math.PI * k / 3) + shift));
    return roots.sort((x, y) => x - y).map((re) => ({ re, im: 0 }));
  }
  const root = Math.sqrt(Math.max(0, discriminant));
  const u = Math.cbrt(-q / 2 + root);
  const v = Math.cbrt(-q / 2 - root);
  const real = polish(u + v + shift);
  // Divide out the real root: ax² + (b + a·r)x + (c + (b + a·r)·r)
  const b2 = b + a * real;
  const c2 = c + b2 * real;
  const rest = solveQuadratic(a, b2, c2).roots;
  const all = [{ re: real, im: 0 }, ...rest.map((z) => (z.im === 0 ? { re: polish(z.re), im: 0 } : z))];
  return all.sort((x, y) => (x.im === 0 ? 0 : 1) - (y.im === 0 ? 0 : 1) || x.re - y.re || x.im - y.im);
}

const inputs = [
  { id: 'a', type: 'number', default: 1, step: 1, label: { cs: 'a (u x³)', en: 'a (of x³)' } },
  { id: 'b', type: 'number', default: -6, step: 1, label: { cs: 'b (u x²)', en: 'b (of x²)' } },
  { id: 'c', type: 'number', default: 11, step: 1, label: { cs: 'c (u x)', en: 'c (of x)' } },
  { id: 'd', type: 'number', default: -6, step: 1, label: { cs: 'd (absolutní člen)', en: 'd (constant)' } },
];

const outputs = [
  { id: 'roots', type: 'text', label: { cs: 'Kořeny', en: 'Roots' } },
  { id: 'realRoots', type: 'list', label: { cs: 'Reálný kořen', en: 'Real root' }, significant: 12 },
  { id: 'count', label: { cs: 'Počet reálných kořenů', en: 'Number of real roots' }, precision: 0 },
];

export default {
  id: 'cubic',
  kind: 'calculator',
  category: 'math-algebra',
  tags: ['math'],
  name: { cs: 'Kubická rovnice', en: 'Cubic equation' },
  description: {
    cs: 'Řešení rovnice ax³ + bx² + cx + d = 0: tři reálné kořeny, nebo jeden reálný a dva komplexně sdružené. Používá goniometrické řešení a Cardanovy vzorce, kořeny zpřesní Newtonovou metodou. Násobné kořeny se vypíší vícekrát.',
    en: 'Solves ax³ + bx² + cx + d = 0: three real roots, or one real and two complex conjugate ones. Uses the trigonometric solution and Cardano\'s formulas and refines the roots by Newton\'s method. Repeated roots are listed more than once.',
  },
  keywords: {
    cs: ['kubická rovnice', 'rovnice třetího stupně', 'cardanovy vzorce', 'kořeny', 'polynom'],
    en: ['cubic equation', 'third degree equation', 'cardano', 'roots', 'polynomial'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { a, b, c, d } = read.values;
    if (a === 0) {
      return emptyResult(outputs, [{ cs: 'Pro a = 0 nejde o kubickou rovnici; použijte kvadratickou.', en: 'With a = 0 this is not a cubic; use the quadratic equation.' }]);
    }
    const roots = solveCubic(a, b, c, d);
    const realRoots = roots.filter((root) => root.im === 0).map((root) => root.re);
    return { values: { roots: rootsText(roots), realRoots, count: realRoots.length }, warnings: [] };
  },
  references: [
    { title: 'Press, W. H. et al.: Numerical Recipes, 3rd ed., §5.6 – Quadratic and cubic equations' },
    { title: 'Wikipedia: Cubic equation – trigonometric solution', url: 'https://en.wikipedia.org/wiki/Cubic_equation' },
  ],
};
