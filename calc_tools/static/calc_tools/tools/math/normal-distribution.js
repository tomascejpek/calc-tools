/**
 * Normal distribution: z-score, probabilities, p-values and quantiles.
 */

import { normalCdf, normalPdf, normalQuantile } from '../../core/special.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'mean', type: 'number', default: 0, step: 0.1, label: { cs: 'Střední hodnota μ', en: 'Mean μ' } },
  { id: 'sd', type: 'number', default: 1, min: 1e-300, step: 0.1, label: { cs: 'Směrodatná odchylka σ', en: 'Standard deviation σ' } },
  { id: 'x', type: 'number', default: 1.96, step: 0.01, label: { cs: 'Hodnota x', en: 'Value x' } },
  { id: 'p', type: 'number', optional: true, default: 0.95, min: 0, max: 1, step: 0.01, label: { cs: 'Pravděpodobnost p (pro kvantil)', en: 'Probability p (for the quantile)' } },
];

const number = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, significant: 8 });

const outputs = [
  number('z', 'z-skóre (x − μ) / σ', 'z-score (x − μ) / σ'),
  number('below', 'P(X < x)', 'P(X < x)'),
  number('above', 'P(X > x)', 'P(X > x)'),
  number('twoTailed', 'Oboustranná p-hodnota 2 · P(X > |x|)', 'Two-tailed p-value 2 · P(X > |x|)'),
  number('density', 'Hustota pravděpodobnosti f(x)', 'Probability density f(x)'),
  number('quantile', 'Kvantil: x, pod kterým leží podíl p', 'Quantile: x below which a share p lies'),
];

export default {
  id: 'normal-distribution',
  kind: 'calculator',
  category: 'math-statistics',
  tags: ['math'],
  name: { cs: 'Normální rozdělení (z-skóre, p-hodnota)', en: 'Normal distribution (z-score, p-value)' },
  description: {
    cs: 'Pro normální rozdělení se střední hodnotou μ a směrodatnou odchylkou σ spočítá z-skóre hodnoty x, pravděpodobnost pod ní a nad ní, oboustrannou p-hodnotu a hustotu. Naopak k pravděpodobnosti p najde kvantil (např. p = 0,975 dává 1,96 pro standardní rozdělení). Přesnost na 14 platných číslic.',
    en: 'For a normal distribution with mean μ and standard deviation σ works out the z-score of x, the probability below and above it, the two-tailed p-value and the density. Conversely, it finds the quantile for a probability p (e.g. p = 0.975 gives 1.96 for the standard distribution). Accurate to 14 significant digits.',
  },
  keywords: {
    cs: ['normální rozdělení', 'gaussovo rozdělení', 'z-skóre', 'p-hodnota', 'kvantil', 'pravděpodobnost', 'distribuční funkce'],
    en: ['normal distribution', 'gaussian', 'z-score', 'p-value', 'quantile', 'probability', 'cdf', 'bell curve'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mean, sd, x, p } = read.values;
    if (sd <= 0) return emptyResult(outputs, [{ cs: 'Směrodatná odchylka musí být kladná.', en: 'The standard deviation must be positive.' }]);
    const z = (x - mean) / sd;
    const below = normalCdf(z);
    const above = normalCdf(-z);
    const quantile = p === null || p <= 0 || p >= 1 ? null : mean + sd * normalQuantile(p);
    return {
      values: { z, below, above, twoTailed: Math.min(1, 2 * normalCdf(-Math.abs(z))), density: normalPdf(z) / sd, quantile },
      warnings: p !== null && (p <= 0 || p >= 1) ? [{ cs: 'Kvantil existuje jen pro p mezi 0 a 1.', en: 'A quantile exists only for p between 0 and 1.' }] : [],
    };
  },
  references: [
    { title: 'Press, W. H. et al.: Numerical Recipes, 3rd ed., §6.2 – incomplete gamma function and error function' },
    { title: 'Acklam, P. J.: An algorithm for computing the inverse normal cumulative distribution function (2003)' },
  ],
};
