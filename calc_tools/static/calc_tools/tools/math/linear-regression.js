/**
 * Simple linear regression y = a + b·x by least squares.
 */

import { studentQuantile } from '../../core/special.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { NUMBER_LIST_PATTERN, parseNumbers } from './statistics.js';

/**
 * @param {number[]} xs
 * @param {number[]} ys same length, at least 2
 */
export function linearRegression(xs, ys) {
  const n = xs.length;
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const residual = Math.max(0, syy - slope * sxy);
  const r = syy === 0 ? 1 : sxy / Math.sqrt(sxx * syy);
  const standardError = n > 2 ? Math.sqrt(residual / (n - 2)) : null;
  const slopeError = standardError === null ? null : standardError / Math.sqrt(sxx);
  return { slope, intercept, r, r2: r * r, standardError, slopeError, n, meanX, sxx };
}

const LIST = {
  type: 'text', maxLength: 100000, pattern: NUMBER_LIST_PATTERN,
  hint: { cs: 'Čísla oddělená mezerou, středníkem nebo novým řádkem.', en: 'Numbers separated by spaces, semicolons or new lines.' },
};

const inputs = [
  { id: 'x', ...LIST, default: '1 2 3 4 5', label: { cs: 'Hodnoty x', en: 'Values x' } },
  { id: 'y', ...LIST, default: '2,1 3,9 6,2 7,8 10,1', label: { cs: 'Hodnoty y', en: 'Values y' } },
  { id: 'predictAt', type: 'number', optional: true, default: 6, step: 1, label: { cs: 'Předpověď y pro x =', en: 'Predict y at x =' } },
];

const number = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, significant: 8 });

const outputs = [
  number('slope', 'Směrnice b', 'Slope b'),
  number('intercept', 'Úsek a (y při x = 0)', 'Intercept a (y at x = 0)'),
  number('r', 'Korelační koeficient r', 'Correlation coefficient r'),
  number('r2', 'Koeficient determinace R²', 'Coefficient of determination R²'),
  number('standardError', 'Směrodatná chyba odhadu', 'Standard error of the estimate'),
  number('slopeLow', 'Směrnice – 95% interval, dolní mez', 'Slope – 95 % interval, lower'),
  number('slopeHigh', 'Směrnice – 95% interval, horní mez', 'Slope – 95 % interval, upper'),
  number('prediction', 'Předpověď y', 'Predicted y'),
];

export default {
  id: 'linear-regression',
  kind: 'calculator',
  category: 'math-statistics',
  tags: ['math'],
  name: { cs: 'Lineární regrese', en: 'Linear regression' },
  description: {
    cs: 'Proložení bodů přímkou y = a + b·x metodou nejmenších čtverců: směrnice, úsek, korelační koeficient, R², směrodatná chyba, 95% interval spolehlivosti směrnice a předpověď y pro zvolené x. Hodnoty x a y zadejte ve stejném pořadí a počtu.',
    en: 'Fits the line y = a + b·x to points by least squares: slope, intercept, correlation coefficient, R², standard error, the 95 % confidence interval of the slope and a prediction of y at a chosen x. Enter the x and y values in the same order and number.',
  },
  keywords: {
    cs: ['lineární regrese', 'regrese', 'nejmenší čtverce', 'korelace', 'proložení přímkou', 'trend', 'r2'],
    en: ['linear regression', 'regression', 'least squares', 'correlation', 'line of best fit', 'trend line', 'r squared'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const xs = parseNumbers(read.values.x);
    const ys = parseNumbers(read.values.y);
    if (xs === null || ys === null) return emptyResult(outputs, [{ cs: 'Data obsahují něco, co není číslo.', en: 'The data contain something that is not a number.' }]);
    if (xs.length !== ys.length) {
      return emptyResult(outputs, [{ cs: `Počet hodnot x (${xs.length}) a y (${ys.length}) se liší.`, en: `The number of x values (${xs.length}) and y values (${ys.length}) differ.` }]);
    }
    if (xs.length < 2 || xs.length > 10000) return emptyResult(outputs, [{ cs: 'Zadejte 2 až 10 000 dvojic.', en: 'Enter 2 to 10,000 pairs.' }]);
    const fit = linearRegression(xs, ys);
    if (fit === null) return emptyResult(outputs, [{ cs: 'Všechna x jsou stejná; přímku nelze proložit.', en: 'All x values are equal; no line can be fitted.' }]);
    const t = fit.n > 2 ? studentQuantile(0.975, fit.n - 2) : null;
    const margin = t !== null && fit.slopeError !== null ? t * fit.slopeError : null;
    const { predictAt } = read.values;
    return {
      values: {
        slope: fit.slope,
        intercept: fit.intercept,
        r: fit.r,
        r2: fit.r2,
        standardError: fit.standardError,
        slopeLow: margin === null ? null : fit.slope - margin,
        slopeHigh: margin === null ? null : fit.slope + margin,
        prediction: predictAt === null ? null : fit.intercept + fit.slope * predictAt,
      },
      warnings: fit.n < 3 ? [{ cs: 'Ze dvou bodů nelze odhadnout chybu.', en: 'Two points do not allow an error estimate.' }] : [],
    };
  },
  references: [
    { title: 'NIST/SEMATECH e-Handbook of Statistical Methods – least squares fitting', url: 'https://www.itl.nist.gov/div898/handbook/' },
  ],
};
