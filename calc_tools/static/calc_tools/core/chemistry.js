/**
 * Chemical formulas and equations: atomic weights, parsing formulas with
 * groups and hydrates, molar mass and balancing equations exactly.
 * @module core/chemistry
 */

import { gcdBig, reduce } from '../tools/math/fractions.js';

/** Avogadro constant, 1/mol (exact). */
export const AVOGADRO = 6.02214076e23;

/**
 * Standard atomic weights (IUPAC, abridged to 4–5 significant digits); for
 * elements without stable isotopes the mass number of the longest-lived one.
 */
export const ATOMIC_WEIGHTS = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
  Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.95, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
  Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
  Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04,
  Pa: 231.04, U: 238.03, Np: 237, Pu: 244, Am: 243, Cm: 247, Bk: 247, Cf: 251, Es: 252, Fm: 257,
  Md: 258, No: 259, Lr: 262, Rf: 267, Db: 268, Sg: 269, Bh: 270, Hs: 269, Mt: 278, Ds: 281,
  Rg: 282, Cn: 285, Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294,
};

/** A formula: letters, digits, (), [], hydrate dots (·, *, .) and an optional phase such as (aq). */
export const FORMULA_PATTERN = /^[A-Za-z0-9()[\]{}·*.\s]+$/;

/** Removes a trailing phase label: (s), (l), (g), (aq). */
export function stripPhase(/** @type {string} */ text) {
  return text.replace(/\((s|l|g|aq)\)\s*$/i, '').trim();
}

/**
 * Parses a formula into element counts. Hydrates and adducts are separated
 * by ·, * or . with an optional count: CuSO4·5H2O.
 * @param {string} text
 * @returns {Map<string, number>} throws on an unknown element or bad syntax
 */
export function parseFormula(text) {
  const source = stripPhase(text).replace(/\s+/g, '');
  if (!source) throw new Error('empty formula');
  /** @type {Map<string, number>} */
  const total = new Map();
  for (const piece of source.split(/[·*.]/)) {
    if (!piece) throw new Error('empty part');
    const match = piece.match(/^(\d+)(.*)$/);
    const multiplier = match && match[2] ? Number(match[1]) : 1;
    const body = match && match[2] ? match[2] : piece;
    let position = 0;
    const group = () => {
      /** @type {Map<string, number>} */
      const counts = new Map();
      while (position < body.length) {
        const char = body[position];
        if (char === ')' || char === ']' || char === '}') break;
        /** @type {Map<string, number>} */
        let inner;
        if (char === '(' || char === '[' || char === '{') {
          position++;
          inner = group();
          if (!/[)\]}]/.test(body[position] ?? '')) throw new Error('unclosed bracket');
          position++;
        } else {
          const element = body.slice(position).match(/^[A-Z][a-z]?/);
          if (!element || !Object.hasOwn(ATOMIC_WEIGHTS, element[0])) throw new Error(`unknown element at ${position}`);
          position += element[0].length;
          inner = new Map([[element[0], 1]]);
        }
        const count = body.slice(position).match(/^\d+/);
        const times = count ? Number(count[0]) : 1;
        if (count) position += count[0].length;
        if (times === 0) throw new Error('zero count');
        for (const [element, n] of inner) counts.set(element, (counts.get(element) ?? 0) + n * times);
      }
      return counts;
    };
    const counts = group();
    if (position !== body.length || counts.size === 0) throw new Error('unexpected character');
    for (const [element, n] of counts) total.set(element, (total.get(element) ?? 0) + n * multiplier);
  }
  return total;
}

/**
 * Molar mass, g/mol.
 * @param {Map<string, number>} counts
 */
export function molarMass(counts) {
  let mass = 0;
  for (const [element, n] of counts) mass += ATOMIC_WEIGHTS[/** @type {keyof typeof ATOMIC_WEIGHTS} */ (element)] * n;
  return mass;
}

/**
 * Molar mass of a formula, or null when it cannot be parsed.
 * @param {string} text
 */
export function formulaMass(text) {
  try {
    return molarMass(parseFormula(text));
  } catch {
    return null;
  }
}

/**
 * Canonical composition key, e.g. "C2H6O" for C2H5OH (Hill order).
 * @param {Map<string, number>} counts
 */
export function hillKey(counts) {
  const elements = [...counts.keys()].sort();
  const ordered = counts.has('C')
    ? ['C', ...(counts.has('H') ? ['H'] : []), ...elements.filter((e) => e !== 'C' && e !== 'H')]
    : elements;
  return ordered.map((e) => `${e}${counts.get(e) === 1 ? '' : counts.get(e)}`).join('');
}

/** Arrows between the two sides of an equation. */
const ARROW = /\s*(?:<=>|<->|⇌|→|->|=)\s*/;

/**
 * Splits an equation into species. Coefficients written in front of
 * species are ignored.
 * @param {string} text
 * @returns {{ reactants: string[], products: string[] } | null}
 */
export function parseEquation(text) {
  const sides = text.split(ARROW);
  if (sides.length !== 2) return null;
  const species = (/** @type {string} */ side) => side.split('+').map((part) => part.trim().replace(/^\d+\s*(?=[A-Z([{])/, '')).filter(Boolean);
  const reactants = species(sides[0]);
  const products = species(sides[1]);
  if (!reactants.length || !products.length) return null;
  return { reactants, products };
}

/**
 * Smallest whole coefficients balancing the equation, found as the null
 * space of the element matrix with exact rational arithmetic.
 * @param {string[]} reactants
 * @param {string[]} products
 * @returns {{ coefficients: bigint[] | null, reason?: 'unknown' | 'none' | 'many' }}
 */
export function balance(reactants, products) {
  /** @type {Map<string, number>[]} */
  let parsed;
  try {
    parsed = [...reactants, ...products].map(parseFormula);
  } catch {
    return { coefficients: null, reason: 'unknown' };
  }
  const elements = [...new Set(parsed.flatMap((counts) => [...counts.keys()]))];
  const columns = parsed.length;
  // Rows: elements; columns: species (products negative)
  const matrix = elements.map((element) => parsed.map((counts, j) => {
    const n = BigInt(counts.get(element) ?? 0);
    return { n: j < reactants.length ? n : -n, d: 1n };
  }));
  const sub = (/** @type {{ n: bigint, d: bigint }} */ a, /** @type {{ n: bigint, d: bigint }} */ b) => reduce(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (/** @type {{ n: bigint, d: bigint }} */ a, /** @type {{ n: bigint, d: bigint }} */ b) => reduce(a.n * b.n, a.d * b.d);
  const div = (/** @type {{ n: bigint, d: bigint }} */ a, /** @type {{ n: bigint, d: bigint }} */ b) => reduce(a.n * b.d, a.d * b.n);
  /** @type {number[]} */
  const pivots = [];
  let row = 0;
  for (let col = 0; col < columns && row < matrix.length; col++) {
    const pivot = matrix.findIndex((r, i) => i >= row && r[col].n !== 0n);
    if (pivot < 0) continue;
    [matrix[row], matrix[pivot]] = [matrix[pivot], matrix[row]];
    const lead = matrix[row][col];
    matrix[row] = matrix[row].map((value) => div(value, lead));
    for (let i = 0; i < matrix.length; i++) {
      if (i === row || matrix[i][col].n === 0n) continue;
      const factor = matrix[i][col];
      matrix[i] = matrix[i].map((value, k) => sub(value, mul(factor, matrix[row][k])));
    }
    pivots.push(col);
    row++;
  }
  const free = [...Array(columns).keys()].filter((col) => !pivots.includes(col));
  if (free.length === 0) return { coefficients: null, reason: 'none' };
  if (free.length > 1) return { coefficients: null, reason: 'many' };
  const freeCol = free[0];
  /** @type {{ n: bigint, d: bigint }[]} */
  const solution = Array.from({ length: columns }, () => ({ n: 0n, d: 1n }));
  solution[freeCol] = { n: 1n, d: 1n };
  pivots.forEach((col, i) => { solution[col] = reduce(-matrix[i][freeCol].n, matrix[i][freeCol].d); });
  const lcm = solution.reduce((acc, value) => acc / gcdBig(acc, value.d) * value.d, 1n);
  let integers = solution.map((value) => value.n * (lcm / value.d));
  const g = integers.reduce((acc, value) => gcdBig(acc, value), 0n);
  integers = integers.map((value) => value / g);
  if (integers.every((value) => value < 0n)) integers = integers.map((value) => -value);
  if (integers.some((value) => value <= 0n)) return { coefficients: null, reason: 'none' };
  return { coefficients: integers };
}

/**
 * The balanced equation as text.
 * @param {string[]} reactants
 * @param {string[]} products
 * @param {bigint[]} coefficients
 */
export function equationText(reactants, products, coefficients) {
  const side = (/** @type {string[]} */ list, /** @type {number} */ offset) => list
    .map((species, i) => `${coefficients[offset + i] === 1n ? '' : `${coefficients[offset + i]} `}${species}`).join(' + ');
  return `${side(reactants, 0)} → ${side(products, reactants.length)}`;
}

/** Shared references. */
export const IUPAC_WEIGHTS = { title: 'IUPAC Commission on Isotopic Abundances and Atomic Weights: Standard atomic weights (abridged)', url: 'https://iupac.qmul.ac.uk/AtWt/' };
