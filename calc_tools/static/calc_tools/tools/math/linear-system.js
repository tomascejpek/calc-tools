/**
 * Systems of 2 or 3 linear equations.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Solves A·x = b by Gaussian elimination with partial pivoting.
 * @param {number[][]} matrix n × n
 * @param {number[]} rhs
 * @returns {{ solution: number[] | null, determinant: number }} solution null when singular
 */
export function solveLinear(matrix, rhs) {
  const n = matrix.length;
  const m = matrix.map((row, i) => [...row, rhs[i]]);
  const scale = Math.max(...matrix.flat().map(Math.abs), 1e-300);
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    if (Math.abs(m[pivot][col]) <= 1e-12 * scale) return { solution: null, determinant: 0 };
    if (pivot !== col) {
      [m[pivot], m[col]] = [m[col], m[pivot]];
      determinant = -determinant;
    }
    determinant *= m[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = m[row][col] / m[col][col];
      for (let k = col; k <= n; k++) m[row][k] -= factor * m[col][k];
    }
  }
  const solution = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = m[row][n];
    for (let k = row + 1; k < n; k++) sum -= m[row][k] * solution[k];
    solution[row] = sum / m[row][row] + 0;
  }
  return { solution, determinant: determinant + 0 };
}

const SUB = '₀₁₂₃';
const VARIABLE = ['x', 'y', 'z'];

/**
 * Coefficient a_rc (column 1–3) or right side b_r (column 0) of equation r.
 * @param {number} row 1–3
 * @param {number} column 0 for the right side
 * @param {number} value default
 */
function coefficient(row, column, value) {
  const id = column ? `a${row}${column}` : `b${row}`;
  const symbol = column ? `a${SUB[row]}${SUB[column]}` : `b${SUB[row]}`;
  return {
    id, type: 'number', default: value, step: 1,
    label: column
      ? { cs: `${symbol} (${VARIABLE[column - 1]} v ${row}. rovnici)`, en: `${symbol} (${VARIABLE[column - 1]} in equation ${row})` }
      : { cs: `${symbol} (pravá strana ${row}. rovnice)`, en: `${symbol} (right side of equation ${row})` },
  };
}

/** Default system with the solution x = 2, y = 3, z = −1. */
const DEFAULTS = [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]];

const inputs = [
  {
    id: 'size', type: 'select', default: '3', label: { cs: 'Počet rovnic', en: 'Number of equations' },
    options: [
      { value: '2', label: { cs: '2 rovnice (x, y)', en: '2 equations (x, y)' } },
      { value: '3', label: { cs: '3 rovnice (x, y, z)', en: '3 equations (x, y, z)' } },
    ],
  },
  ...DEFAULTS.flatMap((row, r) => [1, 2, 3, 0].map((column) => coefficient(r + 1, column, row[column ? column - 1 : 3]))),
];

const outputs = [
  { id: 'x', label: { cs: 'x', en: 'x' }, significant: 12 },
  { id: 'y', label: { cs: 'y', en: 'y' }, significant: 12 },
  { id: 'z', label: { cs: 'z (jen u 3 rovnic)', en: 'z (3 equations only)' }, significant: 12 },
  { id: 'determinant', label: { cs: 'Determinant', en: 'Determinant' }, significant: 12 },
];

export default {
  id: 'linear-system',
  kind: 'calculator',
  category: 'math-algebra',
  tags: ['math'],
  name: { cs: 'Soustava lineárních rovnic', en: 'System of linear equations' },
  description: {
    cs: 'Řešení soustavy dvou nebo tří lineárních rovnic a₁₁x + a₁₂y + a₁₃z = b₁ … Gaussovou eliminací s výběrem hlavního prvku. Je-li determinant nulový, soustava nemá jediné řešení (žádné nebo nekonečně mnoho). U dvou rovnic se třetí řádek a sloupec z ignorují.',
    en: 'Solves a system of two or three linear equations a₁₁x + a₁₂y + a₁₃z = b₁ … by Gaussian elimination with partial pivoting. If the determinant is zero, there is no unique solution (none or infinitely many). With two equations the third row and the z column are ignored.',
  },
  keywords: {
    cs: ['soustava rovnic', 'lineární rovnice', 'gaussova eliminace', 'determinant', 'matice', 'dvě neznámé', 'tři neznámé'],
    en: ['system of equations', 'linear equations', 'gaussian elimination', 'determinant', 'matrix', 'simultaneous equations'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const v = read.values;
    const three = v.size === '3';
    const matrix = three
      ? [[v.a11, v.a12, v.a13], [v.a21, v.a22, v.a23], [v.a31, v.a32, v.a33]]
      : [[v.a11, v.a12], [v.a21, v.a22]];
    const rhs = three ? [v.b1, v.b2, v.b3] : [v.b1, v.b2];
    const { solution, determinant } = solveLinear(matrix, rhs);
    if (solution === null) {
      return emptyResult(outputs, [{ cs: 'Determinant je nulový: soustava nemá jediné řešení.', en: 'The determinant is zero: the system has no unique solution.' }]);
    }
    return { values: { x: solution[0], y: solution[1], z: three ? solution[2] : null, determinant }, warnings: [] };
  },
  references: [{ title: 'Press, W. H. et al.: Numerical Recipes, 3rd ed., §2.2 – Gaussian elimination with pivoting' }],
};
