/**
 * Factorial, permutations, variations and combinations, with and without repetition.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** @param {number} n */
export function factorialBig(n) {
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

/**
 * n! / (n − k)!
 * @param {number} n
 * @param {number} k ≤ n
 */
export function variationsBig(n, k) {
  let result = 1n;
  for (let i = BigInt(n - k + 1); i <= BigInt(n); i++) result *= i;
  return result;
}

/**
 * Binomial coefficient C(n, k).
 * @param {number} n
 * @param {number} k ≤ n
 */
export function combinationsBig(n, k) {
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i++) result = result * BigInt(n - m + i) / BigInt(i);
  return result;
}

/**
 * C(n + k − 1, k): choosing k of n kinds when kinds may repeat.
 * @param {number} n
 * @param {number} k
 */
export function combinationsWithRepetition(n, k) {
  if (k === 0) return 1n;
  if (n === 0) return 0n;
  return combinationsBig(n + k - 1, k);
}

/** Results with more digits than this are shown in scientific notation. */
const MAX_DIGITS = 40;

/**
 * Exact digits, or a rounded scientific form for huge numbers.
 * @param {bigint} value
 */
export function bigText(value) {
  const digits = value.toString();
  if (digits.length <= MAX_DIGITS) return digits;
  return `${digits[0]},${digits.slice(1, 10)} · 10^${digits.length - 1}`.replace(/,?0+ ·/, ' ·');
}

/**
 * The same in English (decimal point).
 * @param {bigint} value
 */
function bigTextEn(value) {
  return bigText(value).replace(',', '.');
}

const inputs = [
  { id: 'n', type: 'number', default: 10, min: 0, max: 10000, step: 1, label: { cs: 'Počet prvků n', en: 'Number of items n' } },
  { id: 'k', type: 'number', default: 3, min: 0, max: 10000, step: 1, label: { cs: 'Velikost výběru k', en: 'Size of the selection k' } },
];

const outputs = [
  { id: 'factorial', type: 'text', label: { cs: 'Faktoriál n! (permutace)', en: 'Factorial n! (permutations)' } },
  { id: 'variations', type: 'text', label: { cs: 'Variace V(n, k) = n! / (n − k)!', en: 'Variations V(n, k) = n! / (n − k)!' } },
  { id: 'combinations', type: 'text', label: { cs: 'Kombinace C(n, k)', en: 'Combinations C(n, k)' } },
  { id: 'variationsRepeated', type: 'text', label: { cs: 'Variace s opakováním nᵏ', en: 'Variations with repetition nᵏ' } },
  { id: 'combinationsRepeated', type: 'text', label: { cs: 'Kombinace s opakováním C(n + k − 1, k)', en: 'Combinations with repetition C(n + k − 1, k)' } },
];

export default {
  id: 'combinatorics',
  kind: 'calculator',
  category: 'math-combinatorics',
  tags: ['math'],
  name: { cs: 'Kombinatorika', en: 'Combinatorics' },
  description: {
    cs: 'Faktoriál a počet permutací n prvků, variací a kombinací k-té třídy bez opakování i s opakováním. Záleží na pořadí? Variace (např. pořadí na stupních vítězů). Nezáleží? Kombinace (např. tah loterie). Výsledky jsou přesné; čísla nad 40 číslic se ukáží zaokrouhleně v exponentovém tvaru.',
    en: 'Factorial and the number of permutations of n items, variations and combinations of k items, without and with repetition. Does order matter? Variations (e.g. a podium). Does it not? Combinations (e.g. a lottery draw). Results are exact; numbers over 40 digits are shown rounded in scientific form.',
  },
  keywords: {
    cs: ['kombinatorika', 'faktoriál', 'permutace', 'variace', 'kombinace', 'kombinační číslo', 'binomický koeficient', 's opakováním'],
    en: ['combinatorics', 'factorial', 'permutations', 'variations', 'combinations', 'binomial coefficient', 'n choose k', 'with repetition'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { n, k } = read.values;
    if (!Number.isInteger(n) || !Number.isInteger(k)) return emptyResult(outputs, [{ cs: 'n a k musí být celá čísla.', en: 'n and k must be whole numbers.' }]);
    const text = (/** @type {bigint | null} */ value) => (value === null ? null : { cs: bigText(value), en: bigTextEn(value) });
    const warnings = [];
    if (k > n) warnings.push({ cs: 'Pro k > n neexistují variace ani kombinace bez opakování.', en: 'With k > n there are no variations or combinations without repetition.' });
    return {
      values: {
        factorial: text(factorialBig(n)),
        variations: k <= n ? text(variationsBig(n, k)) : text(0n),
        combinations: k <= n ? text(combinationsBig(n, k)) : text(0n),
        variationsRepeated: text(BigInt(n) ** BigInt(k)),
        combinationsRepeated: text(combinationsWithRepetition(n, k)),
      },
      warnings,
    };
  },
  references: [{ title: 'Wikipedia: Twelvefold way', url: 'https://en.wikipedia.org/wiki/Twelvefold_way' }],
};
