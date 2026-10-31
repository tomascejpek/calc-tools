/**
 * Descriptive statistics of a data set with a confidence interval of the mean.
 */

import { studentQuantile } from '../../core/special.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Numbers separated by spaces, semicolons, tabs or new lines; a comma is a decimal comma unless followed by a space. */
export const NUMBER_LIST_PATTERN = /^[-+0-9.,eE\s;]+$/;

/**
 * Parses a list of numbers. "1,5" is one number with a decimal comma,
 * "1, 5" are two numbers.
 * @param {string} text
 * @returns {number[] | null} null when a token is not a number
 */
export function parseNumbers(text) {
  const tokens = text.split(/[\s;]+|,(?=\s)/).map((token) => token.replace(/,$/, '')).filter(Boolean);
  const numbers = tokens.map((token) => {
    const normal = token.replace(',', '.');
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(normal) ? Number(normal) : NaN;
  });
  return numbers.every(Number.isFinite) ? numbers : null;
}

/**
 * Quantile by linear interpolation between order statistics (Excel
 * QUARTILE.INC, R type 7).
 * @param {number[]} sorted ascending
 * @param {number} p 0–1
 */
export function quantile(sorted, p) {
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return lower + 1 < sorted.length ? sorted[lower] + fraction * (sorted[lower + 1] - sorted[lower]) : sorted[lower];
}

/**
 * @param {number[]} data
 * @param {number} confidence 0–1
 */
export function describe(data, confidence = 0.95) {
  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);
  // Two-pass sums for accuracy
  const mean = data.reduce((sum, x) => sum + x, 0) / n;
  const squares = data.reduce((sum, x) => sum + (x - mean) ** 2, 0);
  const sampleSd = n > 1 ? Math.sqrt(squares / (n - 1)) : null;
  const standardError = sampleSd === null ? null : sampleSd / Math.sqrt(n);
  const t = n > 1 ? studentQuantile(1 - (1 - confidence) / 2, n - 1) : null;
  const margin = standardError !== null && t !== null ? t * standardError : null;
  return {
    n,
    mean,
    median: quantile(sorted, 0.5),
    min: sorted[0],
    max: sorted[n - 1],
    q1: quantile(sorted, 0.25),
    q3: quantile(sorted, 0.75),
    sum: data.reduce((sum, x) => sum + x, 0),
    sampleSd,
    populationSd: Math.sqrt(squares / n),
    variance: n > 1 ? squares / (n - 1) : null,
    standardError,
    ciLow: margin === null ? null : mean - margin,
    ciHigh: margin === null ? null : mean + margin,
  };
}

const inputs = [
  {
    id: 'data', type: 'text', default: '12,1 11,8 12,4 12,0 11,7 12,3 12,2 11,9', maxLength: 100000, pattern: NUMBER_LIST_PATTERN,
    hint: { cs: 'Čísla oddělená mezerou, středníkem nebo novým řádkem.', en: 'Numbers separated by spaces, semicolons or new lines.' },
    label: { cs: 'Data', en: 'Data' },
  },
  {
    id: 'confidence', type: 'select', default: '0.95', label: { cs: 'Spolehlivost intervalu', en: 'Confidence level' },
    options: [
      { value: '0.9', label: { cs: '90 %', en: '90 %' } },
      { value: '0.95', label: { cs: '95 %', en: '95 %' } },
      { value: '0.99', label: { cs: '99 %', en: '99 %' } },
    ],
  },
];

const number = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, significant: 8 });

const outputs = [
  { id: 'n', label: { cs: 'Počet hodnot', en: 'Count' }, precision: 0 },
  number('mean', 'Aritmetický průměr', 'Mean'),
  number('median', 'Medián', 'Median'),
  number('min', 'Minimum', 'Minimum'),
  number('max', 'Maximum', 'Maximum'),
  number('q1', 'Dolní kvartil Q1', 'Lower quartile Q1'),
  number('q3', 'Horní kvartil Q3', 'Upper quartile Q3'),
  number('sum', 'Součet', 'Sum'),
  number('sampleSd', 'Směrodatná odchylka (výběrová, n − 1)', 'Standard deviation (sample, n − 1)'),
  number('populationSd', 'Směrodatná odchylka (základního souboru, n)', 'Standard deviation (population, n)'),
  number('variance', 'Rozptyl (výběrový)', 'Variance (sample)'),
  number('standardError', 'Směrodatná chyba průměru', 'Standard error of the mean'),
  number('ciLow', 'Interval spolehlivosti průměru – dolní mez', 'Confidence interval of the mean – lower'),
  number('ciHigh', 'Interval spolehlivosti průměru – horní mez', 'Confidence interval of the mean – upper'),
];

export default {
  id: 'statistics',
  kind: 'calculator',
  category: 'math-statistics',
  tags: ['math'],
  name: { cs: 'Popisná statistika', en: 'Descriptive statistics' },
  description: {
    cs: 'Průměr, medián, kvartily, rozsah, směrodatná odchylka (výběrová i základního souboru), rozptyl, směrodatná chyba a interval spolehlivosti průměru podle Studentova t-rozdělení. Data vložte jako čísla oddělená mezerou, středníkem nebo řádkem; desetinná čárka i tečka fungují, „1, 5“ jsou dvě čísla.',
    en: 'Mean, median, quartiles, range, standard deviation (sample and population), variance, standard error and the confidence interval of the mean by Student\'s t distribution. Paste the data as numbers separated by spaces, semicolons or lines; decimal commas and points both work, "1, 5" are two numbers.',
  },
  keywords: {
    cs: ['statistika', 'průměr', 'medián', 'směrodatná odchylka', 'rozptyl', 'kvartil', 'interval spolehlivosti', 'chyba průměru'],
    en: ['statistics', 'mean', 'average', 'median', 'standard deviation', 'variance', 'quartile', 'confidence interval', 'standard error'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const data = parseNumbers(read.values.data);
    if (data === null) return emptyResult(outputs, [{ cs: 'Data obsahují něco, co není číslo.', en: 'The data contain something that is not a number.' }]);
    if (data.length > 10000) return emptyResult(outputs, [{ cs: 'Nejvýš 10 000 hodnot.', en: 'At most 10,000 values.' }]);
    const result = describe(data, Number(read.values.confidence));
    const warnings = data.length < 2
      ? [{ cs: 'Pro odchylku a interval spolehlivosti jsou potřeba aspoň dvě hodnoty.', en: 'Deviation and confidence interval need at least two values.' }]
      : [];
    return { values: result, warnings };
  },
  references: [
    { title: 'NIST/SEMATECH e-Handbook of Statistical Methods – measures of location and scale, confidence limits for the mean', url: 'https://www.itl.nist.gov/div898/handbook/' },
    { title: 'Hyndman, R. J., Fan, Y.: Sample quantiles in statistical packages. The American Statistician 50 (1996) – type 7' },
  ],
};
