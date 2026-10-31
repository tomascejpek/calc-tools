import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, getTool } from '../calc_tools/static/calc_tools/index.js';
import { parseFraction } from '../calc_tools/static/calc_tools/tools/math/fractions.js';
import { roundTo } from '../calc_tools/static/calc_tools/tools/math/rounding.js';
import { factorize, isPrime } from '../calc_tools/static/calc_tools/tools/math/primes.js';
import { parseInBase } from '../calc_tools/static/calc_tools/tools/math/number-base.js';
import { fromRoman, toRoman } from '../calc_tools/static/calc_tools/tools/math/roman.js';
import { solveCubic } from '../calc_tools/static/calc_tools/tools/math/cubic.js';
import { solveTriangle } from '../calc_tools/static/calc_tools/tools/math/triangle.js';
import { segmentArea } from '../calc_tools/static/calc_tools/tools/math/tank-volume.js';
import { parseNumbers, quantile } from '../calc_tools/static/calc_tools/tools/math/statistics.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

/** @param {any} text */
const cs = (text) => (typeof text === 'string' ? text : text.cs);

describe('percentage', () => {
  test('15 % of 200 is 30; 30 of 200 is 15 %; 30 is 15 % of 200', () => {
    near(run('percentage').values.part, 30, 1e-12);
    near(run('percentage', { find: 'percent', part: 30, whole: 200 }).values.percent, 15, 1e-12);
    near(run('percentage', { find: 'whole', part: 30, percent: 15 }).values.whole, 200, 1e-12);
  });

  test('the sought value in the form is ignored', () => {
    near(run('percentage', { find: 'part', part: 999, whole: 50, percent: 10 }).values.part, 5, 1e-12);
  });

  test('zero and invalid input', () => {
    assert.equal(run('percentage', { whole: 0 }).values.part, 0);
    invalid(run('percentage', { find: 'whole', percent: 0 }));
    invalid(run('percentage', { find: 'percent', whole: 0 }));
    invalid(run('percentage', { find: 'everything' }));
  });
});

describe('percent-change', () => {
  test('80 → 100 is +25 %, 100 → 80 is −20 %', () => {
    near(run('percent-change').values.change, 25, 1e-12);
    near(run('percent-change', { from: 100, to: 80 }).values.change, -20, 1e-12);
  });

  test('interest rate 4 % → 5 %: +1 percentage point, +25 %', () => {
    const result = run('percent-change', { from: 4, to: 5 }).values;
    near(result.difference, 1, 1e-12);
    near(result.change, 25, 1e-12);
    // From a negative value the direction still follows the sign of the change
    near(run('percent-change', { from: -50, to: -25 }).values.change, 50, 1e-12);
  });

  test('zero start and invalid input', () => {
    invalid(run('percent-change', { from: 0 }));
    invalid(run('percent-change', { to: 'a lot' }));
  });
});

describe('rule-of-three', () => {
  test('direct: 3 kg for 60 → 5 kg for 100', () => {
    near(run('rule-of-three').values.b2, 100, 1e-12);
  });

  test('inverse: 3 workers 60 h → 5 workers 36 h', () => {
    near(run('rule-of-three', { kind: 'inverse' }).values.b2, 36, 1e-12);
  });

  test('zero and division by zero', () => {
    assert.equal(run('rule-of-three', { b1: 0 }).values.b2, 0);
    invalid(run('rule-of-three', { a1: 0 }));
    invalid(run('rule-of-three', { kind: 'inverse', a2: 0 }));
  });
});

describe('fractions', () => {
  test('1/2 + 1/3 = 5/6; mixed numbers and decimals', () => {
    const result = run('fractions').values;
    assert.equal(result.fraction, '5/6');
    near(result.decimal, 5 / 6, 1e-15);
    assert.equal(run('fractions', { a: '1 1/2', operation: 'multiply', b: '0,25' }).values.fraction, '3/8');
    assert.equal(run('fractions', { a: '7/2', operation: 'simplify' }).values.mixed, '3 1/2');
    assert.equal(run('fractions', { a: '-7/2', operation: 'simplify' }).values.mixed, '-3 1/2');
  });

  test('exact arithmetic with big numbers and simplification', () => {
    assert.deepEqual(parseFraction('6/8'), { n: 3n, d: 4n });
    assert.equal(run('fractions', { a: '1/3', operation: 'subtract', b: '1/3' }).values.fraction, '0');
    assert.equal(run('fractions', { a: '99999999999999/100000000000000', operation: 'add', b: '1/100000000000000' }).values.fraction, '1');
    assert.equal(run('fractions', { a: '999999999999999/2', operation: 'multiply', b: '999999999999999/3' }).values.fraction, '333333333333332666666666666667/2');
    assert.equal(run('fractions', { a: '2/3', operation: 'divide', b: '-4/9' }).values.fraction, '-3/2');
  });

  test('zero denominators, division by zero and malicious text', () => {
    invalid(run('fractions', { a: '1/0' }));
    invalid(run('fractions', { operation: 'divide', b: '0' }));
    invalid(run('fractions', { a: '<script>alert(1)</script>' }));
    invalid(run('fractions', { a: '1/2; DROP TABLE x' }));
    invalid(run('fractions', { a: `1/${'9'.repeat(50)}` }));
  });
});

describe('rounding', () => {
  test('decimal rounding without binary errors: 2.675 → 2.68, 1.005 → 1.01', () => {
    near(run('rounding').values.rounded, 2.68, 1e-15);
    assert.equal(roundTo(1.005, 2), 1.01);
    assert.equal(roundTo(1234.5, -2), 1200);
  });

  test('rules: half to even, floor, ceil, truncate, significant digits', () => {
    assert.equal(roundTo(2.665, 2, 'half-even'), 2.66);
    assert.equal(roundTo(2.5, 0, 'half-even'), 2);
    assert.equal(roundTo(-2.5, 0), -3);
    assert.equal(roundTo(-1.5, 0, 'floor'), -2);
    assert.equal(roundTo(-1.5, 0, 'ceil'), -1);
    assert.equal(roundTo(-1.7, 0, 'trunc'), -1);
    assert.equal(run('rounding', { value: 0.000123456, mode: 'significant', digits: 3 }).values.rounded, 0.000123);
    assert.equal(run('rounding', { value: 987654, mode: 'significant', digits: 2 }).values.rounded, 990000);
  });

  test('zero and invalid input', () => {
    assert.equal(run('rounding', { value: 0, mode: 'significant', digits: 3 }).values.rounded, 0);
    invalid(run('rounding', { digits: 2.5 }));
    invalid(run('rounding', { mode: 'significant', digits: 0 }));
    invalid(run('rounding', { digits: 99 }));
  });
});

describe('gcd-lcm', () => {
  test('12, 18, 30 → GCD 6, LCM 180', () => {
    const result = run('gcd-lcm').values;
    assert.equal(result.gcd, '6');
    assert.equal(result.lcm, '180');
  });

  test('big numbers stay exact; negative numbers count by their size', () => {
    assert.equal(run('gcd-lcm', { numbers: '9007199254740993 3' }).values.gcd, '3');
    assert.equal(run('gcd-lcm', { numbers: '-4; 6' }).values.lcm, '12');
    assert.equal(run('gcd-lcm', { numbers: '1000000007 998244353' }).values.lcm, String(1000000007n * 998244353n));
  });

  test('zero, one number and invalid input', () => {
    const zero = run('gcd-lcm', { numbers: '0 5' }).values;
    assert.equal(zero.gcd, '5');
    assert.equal(zero.lcm, '0');
    invalid(run('gcd-lcm', { numbers: '12' }));
    invalid(run('gcd-lcm', { numbers: '1.5 2' }));
    invalid(run('gcd-lcm', { numbers: Array.from({ length: 101 }, () => '1').join(' ') }));
  });
});

describe('primes', () => {
  test('360 = 2³ · 3² · 5 with 24 divisors; neighbours of 360', () => {
    const result = run('primes').values;
    assert.equal(cs(result.prime), 'ne');
    assert.equal(result.factors, '2³ · 3² · 5');
    assert.equal(result.divisors, 24);
    assert.equal(result.previous, '359');
    assert.equal(result.next, '367');
  });

  test('large primes and semiprimes up to 2⁵³', () => {
    assert.equal(isPrime(9007199254740881n), true);
    assert.equal(isPrime(3215031751n), false, 'strong pseudoprime to bases 2, 3, 5, 7');
    assert.deepEqual(factorize(1000003n * 1000033n), [[1000003n, 1], [1000033n, 1]]);
    assert.equal(run('primes', { n: 9007199254740991 }).values.factors, '6361 · 69431 · 20394401');
    assert.equal(cs(run('primes', { n: 2 }).values.prime), 'ano');
    assert.equal(run('primes', { n: 2 }).values.previous, '–');
  });

  test('out of range and non-integers', () => {
    invalid(run('primes', { n: 1 }));
    invalid(run('primes', { n: 2 ** 53 }));
    invalid(run('primes', { n: 10.5 }));
  });
});

describe('number-base', () => {
  test('FF₁₆ = 255 = 11111111₂ = 377₈ = 73₃₆', () => {
    const result = run('number-base').values;
    assert.equal(result.decimal, '255');
    assert.equal(result.binary, '11111111');
    assert.equal(result.octal, '377');
    assert.equal(result.target, '73');
  });

  test('prefixes, separators, signs and arbitrary length', () => {
    assert.equal(parseInBase('0x_ff', 16), 255n);
    assert.equal(run('number-base', { value: '-1010 1010', from: 2 }).values.hexadecimal, '-AA');
    const long = '123456789012345678901234567890';
    assert.equal(run('number-base', { value: long, from: 10, to: 10 }).values.target, long);
  });

  test('zero, digits outside the base and invalid input', () => {
    assert.equal(run('number-base', { value: '0', from: 10 }).values.binary, '0');
    invalid(run('number-base', { value: '12', from: 2 }));
    invalid(run('number-base', { value: 'G', from: 16 }));
    invalid(run('number-base', { from: 37 }));
    invalid(run('number-base', { value: '<img src=x>' }));
  });
});

describe('roman', () => {
  test('2026 = MMXXVI, MCMXCIV = 1994', () => {
    assert.equal(run('roman').values.roman, 'MMXXVI');
    assert.equal(run('roman', { value: 'mcmxciv' }).values.arabic, 1994);
    assert.equal(toRoman(3999), 'MMMCMXCIX');
  });

  test('every number round-trips', () => {
    for (let n = 1; n <= 3999; n++) assert.equal(fromRoman(toRoman(n)), n);
  });

  test('zero, out of range and non-standard numerals', () => {
    invalid(run('roman', { value: '0' }));
    invalid(run('roman', { value: '4000' }));
    invalid(run('roman', { value: 'IIII' }));
    invalid(run('roman', { value: 'IC' }));
    invalid(run('roman', { value: 'X;--' }));
  });
});

describe('quadratic', () => {
  test('x² − 3x + 2 = 0 → 1 and 2; vertex (1.5, −0.25)', () => {
    const result = run('quadratic').values;
    assert.equal(result.x1, 1);
    assert.equal(result.x2, 2);
    assert.equal(result.discriminant, 1);
    near(result.vertexX, 1.5, 1e-15);
    near(result.vertexY, -0.25, 1e-15);
    assert.equal(cs(result.roots), 'x₁ = 1; x₂ = 2');
  });

  test('complex roots and numerically hard cases', () => {
    const complex = run('quadratic', { a: 1, b: 2, c: 5 });
    assert.equal(complex.values.x1, null);
    assert.equal(cs(complex.values.roots), 'x₁ = -1 − 2i; x₂ = -1 + 2i');
    assert.equal(complex.values.roots.en, 'x₁ = -1 − 2i; x₂ = -1 + 2i');
    // b² ≫ 4ac: the small root would be lost to cancellation
    near(run('quadratic', { a: 1, b: 1e8, c: 1 }).values.x2, -1e-8, 1e-22);
  });

  test('linear equation and invalid input', () => {
    const linear = run('quadratic', { a: 0, b: 2, c: -4 });
    assert.equal(linear.values.x1, 2);
    assert.equal(linear.warnings.length, 1);
    invalid(run('quadratic', { a: 0, b: 0 }));
    invalid(run('quadratic', { c: 'x' }));
  });
});

describe('cubic', () => {
  test('x³ − 6x² + 11x − 6 = 0 → 1, 2, 3', () => {
    const result = run('cubic').values;
    assert.equal(result.count, 3);
    result.realRoots.forEach((root, i) => near(root, i + 1, 1e-12));
  });

  test('one real root with a complex pair; triple root', () => {
    const roots = solveCubic(1, 0, 0, -8);
    near(roots[0].re, 2, 1e-12);
    near(roots[1].re, -1, 1e-12);
    near(Math.abs(roots[1].im), Math.sqrt(3), 1e-12);
    assert.equal(run('cubic', { a: 1, b: 0, c: 0, d: -8 }).values.count, 1);
    for (const root of solveCubic(1, -3, 3, -1)) near(root.re, 1, 1e-5);
  });

  test('zero root and invalid input', () => {
    const result = run('cubic', { a: 2, b: 0, c: -2, d: 0 }).values;
    assert.deepEqual(result.realRoots.map((x) => Math.round(x * 1e9) / 1e9), [-1, 0, 1]);
    invalid(run('cubic', { a: 0 }));
    invalid(run('cubic', { d: '' + 'NaN' }));
  });
});

describe('linear-system', () => {
  test('3 equations → x = 2, y = 3, z = −1', () => {
    const result = run('linear-system').values;
    near(result.x, 2, 1e-12);
    near(result.y, 3, 1e-12);
    near(result.z, -1, 1e-12);
    near(result.determinant, -1, 1e-12);
  });

  test('2 equations: x + y = 3, x − y = 1', () => {
    const result = run('linear-system', { size: '2', a11: 1, a12: 1, b1: 3, a21: 1, a22: -1, b2: 1 }).values;
    near(result.x, 2, 1e-15);
    near(result.y, 1, 1e-15);
    assert.equal(result.z, null);
  });

  test('singular systems and invalid input', () => {
    invalid(run('linear-system', { size: '2', a11: 1, a12: 2, a21: 2, a22: 4 }));
    invalid(run('linear-system', { a11: 0, a21: 0, a31: 0 }));
    invalid(run('linear-system', { size: '4' }));
  });
});

describe('power-log', () => {
  test('8 and 2: 64, √8, log₂ 8 = 3', () => {
    const result = run('power-log').values;
    assert.equal(result.power, 64);
    near(result.root, Math.SQRT2 * 2, 1e-14);
    near(result.log, 3, 1e-14);
    near(result.ln, Math.log(8), 1e-15);
  });

  test('odd root of a negative number is real', () => {
    near(run('power-log', { x: -8, y: 3 }).values.root, -2, 1e-14);
  });

  test('values outside real numbers are empty with a warning', () => {
    const result = run('power-log', { x: -8, y: 2 });
    assert.equal(result.values.root, null);
    assert.equal(result.values.ln, null);
    assert.equal(result.warnings.length, 1);
    assert.equal(run('power-log', { x: 0, y: 0 }).values.power, 1);
    invalid(run('power-log', { y: 'two' }));
  });
});

describe('plane-shapes', () => {
  test('circle r = 1: π and 2π; 3-4-5 triangle has area 6', () => {
    const circle = run('plane-shapes').values;
    near(circle.area, Math.PI, 1e-15);
    near(circle.perimeter, 2 * Math.PI, 1e-15);
    near(run('plane-shapes', { shape: 'triangle' }).values.area, 6, 1e-12);
  });

  test('rectangle, square and ellipse (a circle when a = b)', () => {
    assert.equal(run('plane-shapes', { shape: 'rectangle' }).values.perimeter, 14);
    assert.equal(run('plane-shapes', { shape: 'square', a: 3 }).values.area, 9);
    near(run('plane-shapes', { shape: 'ellipse', a: 2, b: 2 }).values.perimeter, 4 * Math.PI, 1e-12);
    // Ellipse 3 × 1: perimeter 13.364893…
    near(run('plane-shapes', { shape: 'ellipse', a: 3, b: 1 }).values.perimeter, 13.3648932, 1e-5);
  });

  test('zero size and impossible triangles', () => {
    assert.equal(run('plane-shapes', { r: 0 }).values.area, 0);
    invalid(run('plane-shapes', { shape: 'triangle', a: 1, b: 2, c: 3 }));
    invalid(run('plane-shapes', { r: -1 }));
  });
});

describe('solids', () => {
  test('cylinder r = 1, h = 2: volume 2π, surface 6π', () => {
    const result = run('solids').values;
    near(result.volume, 2 * Math.PI, 1e-14);
    near(result.surface, 6 * Math.PI, 1e-14);
  });

  test('sphere, cone, frustum, cuboid and pyramid', () => {
    near(run('solids', { solid: 'sphere', r: 3 }).values.volume, 36 * Math.PI, 1e-12);
    near(run('solids', { solid: 'cone', r: 3, h: 4 }).values.lateral, 15 * Math.PI, 1e-12);
    // Frustum with equal radii is a cylinder; with r₂ = 0 a cone
    near(run('solids', { solid: 'frustum', r: 1, r2: 1, h: 2 }).values.volume, 2 * Math.PI, 1e-12);
    near(run('solids', { solid: 'frustum', r: 3, r2: 0, h: 4 }).values.volume, 12 * Math.PI, 1e-12);
    assert.equal(run('solids', { solid: 'cuboid', a: 2, b: 3, h: 4 }).values.surface, 52);
    near(run('solids', { solid: 'pyramid', a: 6, h: 4 }).values.surface, 36 + 60, 1e-12);
  });

  test('zero size and invalid input', () => {
    assert.equal(run('solids', { h: 0 }).values.volume, 0);
    invalid(run('solids', { solid: 'tesseract' }));
    invalid(run('solids', { r: -2 }));
  });
});

describe('triangle', () => {
  test('a = 3, b = 4, γ = 90° → c = 5, area 6', () => {
    const result = run('triangle').values;
    near(result.c, 5, 1e-12);
    near(result.alpha, 36.86989765, 1e-7);
    near(result.area, 6, 1e-12);
  });

  test('SSS, ASA and the ambiguous SSA case', () => {
    const sss = run('triangle', { a: 7, b: 8, c: 9, gamma: '' }).values;
    near(sss.alpha + sss.beta + sss.gamma, 180, 1e-10);
    const asa = run('triangle', { a: 6, b: '', alpha: 30, beta: 60, gamma: '' }).values;
    near(asa.c, 12, 1e-12);
    const ssa = run('triangle', { a: 6, b: 8, alpha: 30, gamma: '' });
    near(ssa.values.c, 11.4003, 1e-4);
    assert.equal(ssa.warnings.length, 1);
    assert.match(ssa.warnings[0].cs, /druhý trojúhelník/);
    assert.equal(solveTriangle([6, 8, null], [Math.PI / 6, null, null]).length, 2);
  });

  test('impossible triangles and wrong counts', () => {
    invalid(run('triangle', { a: 1, b: 2, c: 5, gamma: '' }));
    invalid(run('triangle', { a: 1, b: 8, alpha: 30, gamma: '' }));
    invalid(run('triangle', { a: '', b: '', alpha: 30, beta: 60, gamma: 90 }));
    invalid(run('triangle', { c: 5 }));
    invalid(run('triangle', { alpha: 100, beta: 100, b: '', gamma: '' }));
  });
});

describe('pythagoras', () => {
  test('3, 4 → 5', () => {
    near(run('pythagoras').values.c, 5, 1e-15);
    assert.equal(run('pythagoras').values.area, 6);
  });

  test('a leg from the hypotenuse', () => {
    near(run('pythagoras', { a: 5, b: '', c: 13 }).values.b, 12, 1e-12);
    near(run('pythagoras', { a: '', b: 12, c: 13 }).values.a, 5, 1e-12);
  });

  test('impossible input and wrong counts', () => {
    invalid(run('pythagoras', { a: 5, b: '', c: 4 }));
    invalid(run('pythagoras', { c: 5 }));
    invalid(run('pythagoras', { a: '', b: '' }));
  });
});

describe('tank-volume', () => {
  test('horizontal cylinder half full is half the capacity', () => {
    const result = run('tank-volume', { shape: 'horizontal', diameter: 100, length: 200, level: 50 }).values;
    near(result.percent, 50, 1e-12);
    // π · 50² · 200 cm³ = 1570.8 l
    near(result.capacity, Math.PI * 50 * 50 * 200 / 1000, 1e-9);
    near(segmentArea(1, 2), Math.PI, 1e-15);
  });

  test('cylindroconical fermenter: cone of 20 cm, filled 30 cm into the cylinder', () => {
    const result = run('tank-volume').values;
    const cone = Math.PI * 20 * 20 * 20 / 3 / 1000;
    near(result.litres, cone + Math.PI * 20 * 20 * 30 / 1000, 1e-9);
    // Halfway up the cone: (1/2)³ of its volume
    near(run('tank-volume', { level: 10 }).values.litres, cone / 8, 1e-9);
  });

  test('units, empty tank and overfilled level', () => {
    near(run('tank-volume', { shape: 'vertical', unit: 'm', diameter: 1, length: 1, level: 1 }).values.litres, 250 * Math.PI, 1e-9);
    assert.equal(run('tank-volume', { level: 0 }).values.litres, 0);
    invalid(run('tank-volume', { level: 81 }));
    invalid(run('tank-volume', { shape: 'barrel' }));
  });
});

describe('combinatorics', () => {
  test('n = 10, k = 3: 10! = 3628800, V = 720, C = 120', () => {
    const result = run('combinatorics').values;
    assert.equal(cs(result.factorial), '3628800');
    assert.equal(cs(result.variations), '720');
    assert.equal(cs(result.combinations), '120');
    assert.equal(cs(result.variationsRepeated), '1000');
    assert.equal(cs(result.combinationsRepeated), '220');
  });

  test('exact large values and scientific form', () => {
    assert.equal(cs(run('combinatorics', { n: 49, k: 6 }).values.combinations), '13983816');
    assert.equal(cs(run('combinatorics', { n: 100, k: 50 }).values.combinations), '100891344545564193334812497256');
    const huge = run('combinatorics', { n: 1000, k: 2 }).values.factorial;
    assert.equal(huge.cs, '4,0238726 · 10^2567');
    assert.equal(huge.en, '4.0238726 · 10^2567');
  });

  test('zero, k > n and invalid input', () => {
    const zero = run('combinatorics', { n: 0, k: 0 }).values;
    assert.equal(cs(zero.factorial), '1');
    assert.equal(cs(zero.combinationsRepeated), '1');
    const over = run('combinatorics', { n: 3, k: 5 });
    assert.equal(cs(over.values.combinations), '0');
    assert.equal(over.warnings.length, 1);
    invalid(run('combinatorics', { n: 2.5 }));
    invalid(run('combinatorics', { n: 20000 }));
  });
});

describe('statistics', () => {
  test('2 4 4 4 5 5 7 9: mean 5, population SD 2, median 4.5', () => {
    const result = run('statistics', { data: '2 4 4 4 5 5 7 9' }).values;
    assert.equal(result.mean, 5);
    assert.equal(result.populationSd, 2);
    assert.equal(result.median, 4.5);
    near(result.sampleSd, Math.sqrt(32 / 7), 1e-14);
    // 95 % CI: 5 ± t(0.975; 7) · s / √8 with t = 2.364624
    near(result.ciLow, 5 - 2.364624252 * Math.sqrt(32 / 7) / Math.sqrt(8), 1e-8);
  });

  test('separators, decimal commas and quartiles (type 7)', () => {
    assert.deepEqual(parseNumbers('1,5 2;3\n4, 5, 6.5'), [1.5, 2, 3, 4, 5, 6.5]);
    assert.equal(quantile([1, 2, 3, 4], 0.25), 1.75);
    const result = run('statistics').values;
    near(result.mean, 12.05, 1e-12);
    assert.equal(result.n, 8);
  });

  test('a single value, garbage and too much data', () => {
    const one = run('statistics', { data: '42' });
    assert.equal(one.values.mean, 42);
    assert.equal(one.values.sampleSd, null);
    assert.equal(one.warnings.length, 1);
    invalid(run('statistics', { data: '1 2 abc' }));
    invalid(run('statistics', { data: '1 2 1e999' }));
    invalid(run('statistics', { data: '1..2' }));
    invalid(run('statistics', { data: Array.from({ length: 10001 }, () => '1').join(' ') }));
  });
});

describe('normal-distribution', () => {
  test('z = 1.96: P(X < x) = 0.975, two-tailed p = 0.05', () => {
    const result = run('normal-distribution').values;
    near(result.below, 0.9750021048517795, 1e-14);
    near(result.twoTailed, 0.04999579029644, 1e-13);
    near(result.quantile, 1.6448536269514722, 1e-12);
  });

  test('IQ 130 with μ = 100, σ = 15', () => {
    const result = run('normal-distribution', { mean: 100, sd: 15, x: 130, p: 0.5 }).values;
    near(result.z, 2, 1e-15);
    near(result.above, 0.0227501319481792, 1e-14);
    near(result.quantile, 100, 1e-9);
  });

  test('no quantile without p; invalid input', () => {
    assert.equal(run('normal-distribution', { p: '' }).values.quantile, null);
    assert.equal(run('normal-distribution', { p: 1 }).warnings.length, 1);
    invalid(run('normal-distribution', { sd: 0 }));
    invalid(run('normal-distribution', { p: 2 }));
  });
});

describe('linear-regression', () => {
  test('perfect line y = 2x + 1', () => {
    const result = run('linear-regression', { x: '0 1 2 3', y: '1 3 5 7' }).values;
    near(result.slope, 2, 1e-14);
    near(result.intercept, 1, 1e-14);
    near(result.r2, 1, 1e-14);
    near(result.prediction, 13, 1e-12);
  });

  test('noisy data: slope 1.99, 95 % interval, R² 0.997', () => {
    const result = run('linear-regression').values;
    near(result.slope, 1.99, 1e-12);
    near(result.intercept, 0.05, 1e-12);
    assert.ok(result.slopeLow < 1.99 && result.slopeHigh > 1.99);
    near(result.r2, 0.99730533, 1e-8);
  });

  test('mismatched lengths, constant x and garbage', () => {
    invalid(run('linear-regression', { x: '1 2 3', y: '1 2' }));
    invalid(run('linear-regression', { x: '2 2 2', y: '1 2 3' }));
    invalid(run('linear-regression', { x: '1', y: '1' }));
    invalid(run('linear-regression', { x: '1 2 <b>' }));
  });
});
