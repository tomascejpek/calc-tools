/**
 * ISO 286 limits and fits for holes H, F, G and shafts f, g, h, js, k, m, n, p.
 */

import { bilingual } from '../../core/format.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Upper limits of the nominal size ranges, mm (ISO 286-1, up to 500 mm). */
const RANGES = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];

/** Standard tolerance grades IT5–IT11, µm, by range. */
const IT = {
  5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27],
  6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40],
  7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63],
  8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
  9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155],
  10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250],
  11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400],
};

/**
 * Fundamental deviations of shafts, µm: es (upper) for f, g, h; ei (lower)
 * for k, m, n, p. k applies to grades 4–7 (above it is 0).
 */
const SHAFT = {
  f: [-6, -10, -13, -16, -20, -25, -30, -36, -43, -50, -56, -62, -68],
  g: [-2, -4, -5, -6, -7, -9, -10, -12, -14, -15, -17, -18, -20],
  h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  k: [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5],
  m: [2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23],
  n: [4, 8, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40],
  p: [6, 12, 15, 18, 22, 26, 32, 37, 43, 50, 56, 62, 68],
};

/**
 * Index of the size range; ISO ranges include their upper limit.
 * @param {number} size mm
 */
export function rangeIndex(size) {
  return RANGES.findIndex((limit) => size <= limit);
}

/**
 * Limit deviations of a shaft, µm.
 * @param {string} letter f, g, h, js, k, m, n, p
 * @param {number} grade 5–11
 * @param {number} index size range index
 */
export function shaftDeviations(letter, grade, index) {
  const it = IT[/** @type {keyof typeof IT} */ (grade)][index];
  if (letter === 'js') return { upper: it / 2, lower: -it / 2 };
  if (letter === 'f' || letter === 'g' || letter === 'h') {
    const es = SHAFT[letter][index];
    return { upper: es, lower: es - it };
  }
  const ei = letter === 'k' && (grade < 4 || grade > 7) ? 0 : SHAFT[/** @type {'k' | 'm' | 'n' | 'p'} */ (letter)][index];
  return { upper: ei + it, lower: ei };
}

/**
 * Limit deviations of a hole, µm. F and G mirror the f and g shafts (general rule).
 * @param {string} letter H, F, G
 * @param {number} grade 5–11
 * @param {number} index size range index
 */
export function holeDeviations(letter, grade, index) {
  const it = IT[/** @type {keyof typeof IT} */ (grade)][index];
  const ei = letter === 'H' ? 0 : -SHAFT[/** @type {'f' | 'g'} */ (letter.toLowerCase())][index];
  return { upper: ei + it, lower: ei };
}

const gradeOptions = [5, 6, 7, 8, 9, 10, 11].map((grade) => ({ value: String(grade), label: { cs: `IT${grade}`, en: `IT${grade}` } }));

const inputs = [
  { id: 'size', type: 'number', default: 25, min: 0.001, max: 500, step: 1, unit: 'mm', label: { cs: 'Jmenovitý rozměr', en: 'Nominal size' } },
  {
    id: 'hole', type: 'select', default: 'H', label: { cs: 'Otvor', en: 'Hole' },
    options: ['H', 'G', 'F'].map((letter) => ({ value: letter, label: { cs: letter, en: letter } })),
  },
  { id: 'holeGrade', type: 'select', default: '7', label: { cs: 'Stupeň přesnosti otvoru', en: 'Hole tolerance grade' }, options: gradeOptions },
  {
    id: 'shaft', type: 'select', default: 'g', label: { cs: 'Hřídel', en: 'Shaft' },
    options: ['f', 'g', 'h', 'js', 'k', 'm', 'n', 'p'].map((letter) => ({ value: letter, label: { cs: letter, en: letter } })),
  },
  { id: 'shaftGrade', type: 'select', default: '6', label: { cs: 'Stupeň přesnosti hřídele', en: 'Shaft tolerance grade' }, options: gradeOptions },
];

const um = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, unit: 'µm', significant: 4 });
const mm = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, unit: 'mm', precision: 3 });

const outputs = [
  { id: 'fit', type: 'text', label: { cs: 'Uložení', en: 'Fit' } },
  um('holeUpper', 'Otvor – horní úchylka ES', 'Hole – upper deviation ES'),
  um('holeLower', 'Otvor – dolní úchylka EI', 'Hole – lower deviation EI'),
  um('shaftUpper', 'Hřídel – horní úchylka es', 'Shaft – upper deviation es'),
  um('shaftLower', 'Hřídel – dolní úchylka ei', 'Shaft – lower deviation ei'),
  mm('holeMax', 'Otvor největší', 'Hole maximum'),
  mm('holeMin', 'Otvor nejmenší', 'Hole minimum'),
  mm('shaftMax', 'Hřídel největší', 'Shaft maximum'),
  mm('shaftMin', 'Hřídel nejmenší', 'Shaft minimum'),
  um('maxClearance', 'Největší vůle (záporná = přesah)', 'Maximum clearance (negative = interference)'),
  um('minClearance', 'Nejmenší vůle (záporná = přesah)', 'Minimum clearance (negative = interference)'),
];

export default {
  id: 'fits',
  kind: 'calculator',
  category: 'eng-mechanical',
  tags: ['engineering'],
  name: { cs: 'Tolerance a uložení (ISO 286)', en: 'Limits and fits (ISO 286)' },
  description: {
    cs: 'Mezní úchylky otvoru a hřídele a vůle nebo přesah uložení podle ISO 286 (ČSN EN ISO 286) pro rozměry do 500 mm: otvory H, G, F a hřídele f, g, h, js, k, m, n, p ve stupních IT5–IT11. Například H7/g6 je posuvné uložení, H7/k6 přechodné a H7/p6 lisované.',
    en: 'Limit deviations of hole and shaft and the clearance or interference of the fit by ISO 286 for sizes up to 500 mm: holes H, G, F and shafts f, g, h, js, k, m, n, p in grades IT5–IT11. For example H7/g6 is a sliding fit, H7/k6 a transition fit and H7/p6 a press fit.',
  },
  keywords: {
    cs: ['tolerance', 'uložení', 'iso 286', 'h7', 'g6', 'úchylky', 'vůle', 'přesah', 'lícování', 'it7'],
    en: ['tolerance', 'fit', 'limits and fits', 'iso 286', 'h7', 'g6', 'deviation', 'clearance', 'interference'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { size, hole, shaft } = read.values;
    const index = rangeIndex(size);
    const holeLimits = holeDeviations(hole, Number(read.values.holeGrade), index);
    const shaftLimits = shaftDeviations(shaft, Number(read.values.shaftGrade), index);
    const maxClearance = holeLimits.upper - shaftLimits.lower;
    const minClearance = holeLimits.lower - shaftLimits.upper;
    const fit = minClearance >= 0
      ? { cs: 's vůlí', en: 'clearance fit' }
      : maxClearance <= 0 ? { cs: 's přesahem (lisované)', en: 'interference fit' } : { cs: 'přechodné', en: 'transition fit' };
    return {
      values: {
        fit: bilingual((lang) => `${hole}${read.values.holeGrade}/${shaft}${read.values.shaftGrade}: ${fit[lang]}`),
        holeUpper: holeLimits.upper,
        holeLower: holeLimits.lower,
        shaftUpper: shaftLimits.upper,
        shaftLower: shaftLimits.lower,
        holeMax: size + holeLimits.upper / 1000,
        holeMin: size + holeLimits.lower / 1000,
        shaftMax: size + shaftLimits.upper / 1000,
        shaftMin: size + shaftLimits.lower / 1000,
        maxClearance,
        minClearance,
      },
      warnings: [],
    };
  },
  references: [{ title: 'ISO 286-1, -2: Geometrical product specifications – ISO code system for tolerances on linear sizes' }],
};
