/**
 * Special functions for statistics: log-gamma, regularised incomplete gamma
 * and beta functions, the normal and Student t distributions and their
 * inverses. Algorithms after Numerical Recipes (Press et al.) and Acklam.
 * @module core/special
 */

const EPS = 1e-15;
const MAX_ITERATIONS = 1000;
const TINY = 1e-300;

/** Lanczos coefficients (g = 7, n = 9). */
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/**
 * Natural logarithm of the gamma function, for x > 0.
 * @param {number} x
 */
export function lnGamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const z = x - 1;
  let sum = LANCZOS[0];
  for (let i = 1; i < LANCZOS.length; i++) sum += LANCZOS[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum);
}

/**
 * Regularised lower incomplete gamma function P(a, x).
 * @param {number} a > 0
 * @param {number} x ≥ 0
 */
export function gammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    // Series
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n < MAX_ITERATIONS; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * EPS) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  return 1 - gammaQ(a, x);
}

/**
 * Regularised upper incomplete gamma function Q(a, x) = 1 − P(a, x).
 * @param {number} a > 0
 * @param {number} x ≥ 0
 */
export function gammaQ(a, x) {
  if (x < a + 1) return 1 - gammaP(a, x);
  // Continued fraction (modified Lentz)
  let b = x + 1 - a;
  let c = 1 / TINY;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < MAX_ITERATIONS; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}

/**
 * Continued fraction of the incomplete beta function.
 * @param {number} a
 * @param {number} b
 * @param {number} x
 */
function betaFraction(a, b, x) {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m < MAX_ITERATIONS; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPS) break;
  }
  return h;
}

/**
 * Regularised incomplete beta function I_x(a, b).
 * @param {number} x 0–1
 * @param {number} a > 0
 * @param {number} b > 0
 */
export function betaI(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return front * betaFraction(a, b, x) / a;
  return 1 - front * betaFraction(b, a, 1 - x) / b;
}

/**
 * Cumulative distribution function of the standard normal distribution.
 * @param {number} z
 */
export function normalCdf(z) {
  // Φ(z) = erfc(−z/√2) / 2 and erfc(x) = Q(1/2, x²) for x ≥ 0
  const x = z / Math.SQRT2;
  if (x >= 0) return 1 - gammaQ(0.5, x * x) / 2;
  return gammaQ(0.5, x * x) / 2;
}

/**
 * Probability density of the standard normal distribution.
 * @param {number} z
 */
export function normalPdf(z) {
  return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * Quantile of the standard normal distribution (Acklam's approximation
 * refined by one Halley step).
 * @param {number} p 0–1, exclusive
 * @returns {number}
 */
export function normalQuantile(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-7.784894002430293e-3, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const low = 0.02425;
  let x;
  if (p < low) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - low) {
    const q = p - 0.5;
    const r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const e = normalCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}

/**
 * Cumulative distribution function of Student's t distribution.
 * @param {number} t
 * @param {number} df degrees of freedom > 0
 */
export function studentCdf(t, df) {
  const tail = betaI(df / (df + t * t), df / 2, 0.5) / 2;
  return t > 0 ? 1 - tail : tail;
}

/**
 * Quantile of Student's t distribution, by bisection on the CDF.
 * @param {number} p 0–1, exclusive
 * @param {number} df degrees of freedom > 0
 */
export function studentQuantile(p, df) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  let lo = -1;
  let hi = 1;
  while (studentCdf(lo, df) > p) lo *= 2;
  while (studentCdf(hi, df) < p) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (studentCdf(mid, df) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-13 * Math.max(1, Math.abs(mid))) break;
  }
  return (lo + hi) / 2;
}
