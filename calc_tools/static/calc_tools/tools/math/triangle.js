/**
 * Solving a triangle from three of its sides and angles (sine and cosine rules).
 */

import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const DEG = Math.PI / 180;

/**
 * @typedef {{ sides: number[], angles: number[] }} Triangle sides a, b, c and opposite angles α, β, γ in radians
 */

/**
 * Solves a triangle from exactly three known values, at least one a side.
 * Returns every solution: two for the ambiguous SSA case, otherwise one.
 * @param {(number | null)[]} sides a, b, c
 * @param {(number | null)[]} angles α, β, γ in radians
 * @returns {Triangle[]}
 */
export function solveTriangle(sides, angles) {
  const s = [...sides];
  const A = [...angles];
  const knownSides = s.filter((x) => x !== null).length;
  const knownAngles = A.filter((x) => x !== null).length;

  if (knownSides === 3) {
    const [a, b, c] = /** @type {number[]} */ (s);
    const angle = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z) => Math.acos(Math.max(-1, Math.min(1, (y * y + z * z - x * x) / (2 * y * z))));
    if (a + b <= c || a + c <= b || b + c <= a) return [];
    return [{ sides: [a, b, c], angles: [angle(a, b, c), angle(b, a, c), angle(c, a, b)] }];
  }

  if (knownAngles === 2) {
    const missing = A.findIndex((x) => x === null);
    A[missing] = Math.PI - /** @type {number} */ (A[(missing + 1) % 3]) - /** @type {number} */ (A[(missing + 2) % 3]);
    if (!(A[missing] > 0)) return [];
    const known = s.findIndex((x) => x !== null);
    const ratio = /** @type {number} */ (s[known]) / Math.sin(/** @type {number} */ (A[known]));
    return [{ sides: A.map((angle) => ratio * Math.sin(/** @type {number} */ (angle))), angles: /** @type {number[]} */ (A) }];
  }

  // Two sides and one angle
  const angleIndex = A.findIndex((x) => x !== null);
  const angle = /** @type {number} */ (A[angleIndex]);
  if (!(angle > 0 && angle < Math.PI)) return [];
  if (s[angleIndex] === null) {
    // SAS: the angle lies between the two known sides
    const y = /** @type {number} */ (s[(angleIndex + 1) % 3]);
    const z = /** @type {number} */ (s[(angleIndex + 2) % 3]);
    s[angleIndex] = Math.sqrt(y * y + z * z - 2 * y * z * Math.cos(angle));
    return solveTriangle(s, [null, null, null]);
  }
  // SSA: the angle is opposite a known side
  const opposite = /** @type {number} */ (s[angleIndex]);
  const otherIndex = s.findIndex((x, i) => x !== null && i !== angleIndex);
  const other = /** @type {number} */ (s[otherIndex]);
  const sine = other * Math.sin(angle) / opposite;
  if (sine > 1 + 1e-12) return [];
  const first = Math.asin(Math.min(1, sine));
  const candidates = [first, Math.PI - first].filter((value, i) => i === 0 || Math.abs(value - first) > 1e-9);
  /** @type {Triangle[]} */
  const solutions = [];
  for (const otherAngle of candidates) {
    const third = Math.PI - angle - otherAngle;
    if (!(third > 1e-12)) continue;
    const thirdIndex = 3 - angleIndex - otherIndex;
    const sidesOut = [...s];
    const anglesOut = [...A];
    anglesOut[otherIndex] = otherAngle;
    anglesOut[thirdIndex] = third;
    sidesOut[thirdIndex] = opposite / Math.sin(angle) * Math.sin(third);
    solutions.push({ sides: /** @type {number[]} */ (sidesOut), angles: /** @type {number[]} */ (anglesOut) });
  }
  return solutions;
}

const value = (/** @type {string} */ id, /** @type {number | undefined} */ fallback, /** @type {string} */ cs, /** @type {string} */ en, /** @type {string} */ unit = '') => ({
  id, type: 'number', optional: true, default: fallback, min: 0, max: id.length > 1 ? 180 : 1e12, step: id.length > 1 ? 1 : 0.1, unit: unit || undefined, label: { cs, en },
});

const inputs = [
  value('a', 3, 'Strana a', 'Side a'),
  value('b', 4, 'Strana b', 'Side b'),
  value('c', undefined, 'Strana c', 'Side c'),
  value('alpha', undefined, 'Úhel α (proti a)', 'Angle α (opposite a)', '°'),
  value('beta', undefined, 'Úhel β (proti b)', 'Angle β (opposite b)', '°'),
  value('gamma', 90, 'Úhel γ (proti c)', 'Angle γ (opposite c)', '°'),
];

const outputs = [
  { id: 'a', label: { cs: 'Strana a', en: 'Side a' }, significant: 10 },
  { id: 'b', label: { cs: 'Strana b', en: 'Side b' }, significant: 10 },
  { id: 'c', label: { cs: 'Strana c', en: 'Side c' }, significant: 10 },
  { id: 'alpha', label: { cs: 'Úhel α', en: 'Angle α' }, unit: '°', significant: 10 },
  { id: 'beta', label: { cs: 'Úhel β', en: 'Angle β' }, unit: '°', significant: 10 },
  { id: 'gamma', label: { cs: 'Úhel γ', en: 'Angle γ' }, unit: '°', significant: 10 },
  { id: 'perimeter', label: { cs: 'Obvod', en: 'Perimeter' }, significant: 10 },
  { id: 'area', label: { cs: 'Obsah', en: 'Area' }, significant: 10 },
];

export default {
  id: 'triangle',
  kind: 'calculator',
  category: 'math-geometry',
  tags: ['math'],
  name: { cs: 'Řešení trojúhelníku', en: 'Triangle solver' },
  description: {
    cs: 'Zadejte libovolné tři hodnoty z délek stran a, b, c a úhlů α, β, γ (aspoň jednu stranu) a zbytek trojúhelníku se dopočítá sinovou a kosinovou větou, včetně obvodu a obsahu. Úhel α leží proti straně a. Zadáte-li dvě strany a úhel proti jedné z nich, mohou existovat dva trojúhelníky; ukáže se ten s ostrým úhlem a druhý je ve varování.',
    en: 'Enter any three of the sides a, b, c and angles α, β, γ (at least one side) and the rest of the triangle follows from the law of sines and cosines, with perimeter and area. Angle α is opposite side a. Two sides and an angle opposite one of them may give two triangles; the one with the acute angle is shown and the other is in a warning.',
  },
  keywords: {
    cs: ['trojúhelník', 'sinová věta', 'kosinová věta', 'řešení trojúhelníku', 'úhly', 'strany', 'trigonometrie'],
    en: ['triangle', 'law of sines', 'law of cosines', 'triangle solver', 'angles', 'sides', 'trigonometry'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const v = read.values;
    const sides = [v.a, v.b, v.c].map((x) => (x === 0 ? NaN : x));
    const angles = [v.alpha, v.beta, v.gamma].map((x) => (x === null ? null : x * DEG));
    if (sides.some((x) => Number.isNaN(x))) return emptyResult(outputs, [{ cs: 'Strany musí být delší než nula.', en: 'Sides must be longer than zero.' }]);
    const known = [...sides, ...angles].filter((x) => x !== null).length;
    if (known !== 3 || sides.every((x) => x === null)) {
      return emptyResult(outputs, [{ cs: 'Zadejte právě tři hodnoty, z toho aspoň jednu stranu.', en: 'Enter exactly three values, at least one of them a side.' }]);
    }
    const solutions = solveTriangle(sides, angles);
    if (!solutions.length) return emptyResult(outputs, [{ cs: 'Takový trojúhelník neexistuje.', en: 'No such triangle exists.' }]);
    const [main, second] = solutions;
    const describe = (/** @type {Triangle} */ t) => {
      const [a, b, c] = t.sides;
      const s = (a + b + c) / 2;
      return {
        a, b, c,
        alpha: t.angles[0] / DEG, beta: t.angles[1] / DEG, gamma: t.angles[2] / DEG,
        perimeter: a + b + c,
        area: Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c))),
      };
    };
    const result = describe(main);
    const warnings = [];
    if (second) {
      const other = describe(second);
      warnings.push(bilingual((lang, number) => (lang === 'cs'
        ? `Existuje i druhý trojúhelník: a = ${number(other.a)}, b = ${number(other.b)}, c = ${number(other.c)}, α = ${number(other.alpha)}°, β = ${number(other.beta)}°, γ = ${number(other.gamma)}°.`
        : `A second triangle also exists: a = ${number(other.a)}, b = ${number(other.b)}, c = ${number(other.c)}, α = ${number(other.alpha)}°, β = ${number(other.beta)}°, γ = ${number(other.gamma)}°.`), 6));
    }
    return { values: result, warnings };
  },
  references: [
    { title: 'Wikipedia: Solution of triangles', url: 'https://en.wikipedia.org/wiki/Solution_of_triangles' },
  ],
};

