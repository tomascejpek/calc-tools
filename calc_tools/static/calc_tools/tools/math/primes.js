/**
 * Primality test, prime factorisation, divisors and neighbouring primes.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Largest number accepted: 2⁵³ − 1. */
export const MAX_INTEGER = Number.MAX_SAFE_INTEGER;
/** Trial division goes up to this divisor; larger cofactors are split by Pollard's rho. */
const TRIAL_LIMIT = 10_000n;

/**
 * (base ^ exponent) mod modulus.
 * @param {bigint} base
 * @param {bigint} exponent
 * @param {bigint} modulus
 */
function powMod(base, exponent, modulus) {
  let result = 1n;
  let b = base % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) result = result * b % modulus;
    b = b * b % modulus;
    e >>= 1n;
  }
  return result;
}

/**
 * Deterministic Miller–Rabin test, exact for all n < 3.3·10²⁴.
 * @param {bigint} n
 */
export function isPrime(n) {
  if (n < 2n) return false;
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    let x = powMod(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let i = 1; i < s; i++) {
      x = x * x % n;
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/**
 * A non-trivial divisor of an odd composite n by Pollard's rho (Brent's
 * variant), trying further constants when one fails.
 * @param {bigint} n
 * @returns {bigint}
 */
export function pollardRho(n) {
  const gcd = (/** @type {bigint} */ a, /** @type {bigint} */ b) => {
    let x = a < 0n ? -a : a;
    let y = b;
    while (y) [x, y] = [y, x % y];
    return x;
  };
  for (let c = 1n; c < 100n; c++) {
    const f = (/** @type {bigint} */ x) => (x * x + c) % n;
    let y = 2n;
    let r = 1;
    let q = 1n;
    let g = 1n;
    let x = y;
    let ys = y;
    while (g === 1n) {
      x = y;
      for (let i = 0; i < r; i++) y = f(y);
      for (let k = 0; k < r && g === 1n; k += 64) {
        ys = y;
        for (let i = 0; i < Math.min(64, r - k); i++) {
          y = f(y);
          q = q * (x > y ? x - y : y - x) % n;
        }
        g = gcd(q, n);
      }
      r *= 2;
    }
    if (g === n) {
      do {
        ys = f(ys);
        g = gcd(x > ys ? x - ys : ys - x, n);
      } while (g === 1n);
    }
    if (g !== n) return g;
  }
  throw new Error('Pollard rho failed');
}

/**
 * Prime factors with exponents, smallest first.
 * @param {bigint} n ≥ 2
 * @returns {[bigint, number][]}
 */
export function factorize(n) {
  /** @type {[bigint, number][]} */
  const factors = [];
  let rest = n;
  const take = (/** @type {bigint} */ p) => {
    let count = 0;
    while (rest % p === 0n) {
      rest /= p;
      count++;
    }
    if (count) factors.push([p, count]);
  };
  take(2n);
  take(3n);
  for (let p = 5n; p <= TRIAL_LIMIT && p * p <= rest; p += 6n) {
    take(p);
    take(p + 2n);
  }
  /** @type {bigint[]} */
  const large = [];
  const split = (/** @type {bigint} */ m) => {
    if (m === 1n) return;
    if (isPrime(m)) {
      large.push(m);
      return;
    }
    const divisor = pollardRho(m);
    split(divisor);
    split(m / divisor);
  };
  split(rest);
  large.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const p of large) {
    const last = factors[factors.length - 1];
    if (last && last[0] === p) last[1]++;
    else factors.push([p, 1]);
  }
  return factors;
}

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** @param {[bigint, number][]} factors */
export function factorText(factors) {
  return factors.map(([p, e]) => (e === 1 ? String(p) : `${p}${String(e).split('').map((digit) => SUPERSCRIPT[Number(digit)]).join('')}`)).join(' · ');
}

/** @param {[bigint, number][]} factors */
export function divisorCount(factors) {
  return factors.reduce((count, [, e]) => count * (e + 1), 1);
}

/**
 * @param {bigint} n
 * @param {1n | -1n} direction
 * @returns {bigint | null}
 */
export function neighbourPrime(n, direction) {
  let candidate = n + direction;
  while (candidate >= 2n && candidate <= BigInt(MAX_INTEGER)) {
    if (isPrime(candidate)) return candidate;
    candidate += direction;
  }
  return null;
}

const inputs = [
  { id: 'n', type: 'number', default: 360, min: 2, max: MAX_INTEGER, step: 1, label: { cs: 'Celé číslo', en: 'Whole number' } },
];

const outputs = [
  { id: 'prime', type: 'text', label: { cs: 'Je prvočíslo', en: 'Is prime' } },
  { id: 'factors', type: 'text', label: { cs: 'Rozklad na prvočísla', en: 'Prime factorisation' } },
  { id: 'divisors', label: { cs: 'Počet dělitelů', en: 'Number of divisors' }, precision: 0 },
  { id: 'previous', type: 'text', label: { cs: 'Předchozí prvočíslo', en: 'Previous prime' } },
  { id: 'next', type: 'text', label: { cs: 'Následující prvočíslo', en: 'Next prime' } },
];

export default {
  id: 'primes',
  kind: 'calculator',
  category: 'math-numbers',
  tags: ['math'],
  name: { cs: 'Prvočísla a rozklad na prvočinitele', en: 'Primes and prime factorisation' },
  description: {
    cs: 'Zjistí, zda je číslo prvočíslo (deterministický Millerův–Rabinův test), rozloží ho na prvočinitele (360 = 2³ · 3² · 5; zkusmým dělením a Pollardovou metodou rho), spočítá počet dělitelů a najde sousední prvočísla. Pracuje s celými čísly do 2⁵³ − 1 ≈ 9 · 10¹⁵.',
    en: 'Tells whether a number is prime (deterministic Miller–Rabin test), factorises it (360 = 2³ · 3² · 5; by trial division and Pollard\'s rho), counts its divisors and finds the neighbouring primes. Works with whole numbers up to 2⁵³ − 1 ≈ 9 · 10¹⁵.',
  },
  keywords: {
    cs: ['prvočíslo', 'prvočísla', 'rozklad na prvočinitele', 'prvočinitel', 'dělitelé', 'test prvočíselnosti', 'faktorizace'],
    en: ['prime', 'primes', 'prime factorisation', 'prime factorization', 'factors', 'divisors', 'primality test'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    if (!Number.isInteger(read.values.n)) return emptyResult(outputs, [{ cs: 'Zadejte celé číslo.', en: 'Enter a whole number.' }]);
    const n = BigInt(read.values.n);
    const prime = isPrime(n);
    const factors = factorize(n);
    const previous = neighbourPrime(n, -1n);
    const next = neighbourPrime(n, 1n);
    return {
      values: {
        prime: prime ? { cs: 'ano', en: 'yes' } : { cs: 'ne', en: 'no' },
        factors: factorText(factors),
        divisors: divisorCount(factors),
        previous: previous === null ? '–' : String(previous),
        next: next === null ? '–' : String(next),
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Wikipedia: Miller–Rabin primality test – deterministic bases', url: 'https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test' },
    { title: 'Brent, R. P.: An improved Monte Carlo factorization algorithm. BIT 20 (1980) – Pollard\'s rho', url: 'https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm' },
  ],
};
