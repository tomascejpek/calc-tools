import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { readInputs } from '../calc_tools/static/calc_tools/core/tool.js';
import { bilingual, formatNumber } from '../calc_tools/static/calc_tools/core/format.js';
import {
  betaI, gammaP, gammaQ, lnGamma, normalCdf, normalPdf, normalQuantile, studentCdf, studentQuantile,
} from '../calc_tools/static/calc_tools/core/special.js';
import { near } from './helpers.js';

const TEXT = [{
  id: 't', type: 'text', default: 'abc', maxLength: 5, pattern: /^[a-z]+$/,
  hint: { cs: 'Jen malá písmena.', en: 'Lower-case letters only.' }, label: { cs: 'Text', en: 'Text' },
}];

describe('readInputs – text', () => {
  test('default, trimming and numbers given as text', () => {
    assert.equal(readInputs(TEXT, {}).values.t, 'abc');
    assert.equal(readInputs(TEXT, { t: '  xyz ' }).values.t, 'xyz');
    const numeric = readInputs([{ id: 'n', type: 'text', label: { cs: 'N', en: 'N' } }], { n: 42 });
    assert.equal(numeric.values.n, '42');
  });

  test('pattern, length and type are enforced, with the hint in the warning', () => {
    const bad = readInputs(TEXT, { t: 'ABC' });
    assert.equal(bad.ok, false);
    assert.match(bad.warnings[0].cs, /neplatný formát\. Jen malá písmena\./);
    assert.match(bad.warnings[0].en, /invalid format\. Lower-case letters only\./);
    assert.equal(readInputs(TEXT, { t: 'abcdef' }).ok, false);
    assert.equal(readInputs(TEXT, { t: 'abcdef' }).values.t, null);
    assert.equal(readInputs(TEXT, { t: { toString: () => 'abc' } }).ok, false);
    assert.equal(readInputs(TEXT, { t: ['abc'] }).ok, false);
  });

  test('empty text: required gives a warning, optional gives null', () => {
    const required = readInputs([{ id: 't', type: 'text', label: { cs: 'T', en: 'T' } }], { t: '   ' });
    assert.equal(required.ok, false);
    const optional = readInputs([{ id: 't', type: 'text', optional: true, label: { cs: 'T', en: 'T' } }], { t: '' });
    assert.equal(optional.ok, true);
    assert.equal(optional.values.t, null);
  });

  test('a huge text is rejected by length before the pattern runs', () => {
    const big = 'a'.repeat(1_000_000);
    const started = Date.now();
    assert.equal(readInputs([{ id: 't', type: 'text', pattern: /^(a+)+$/, label: { cs: 'T', en: 'T' } }], { t: `${big}!` }).ok, false);
    assert.ok(Date.now() - started < 1000);
  });
});

describe('readInputs – optional inputs with a default', () => {
  const inputs = [{ id: 'x', type: 'number', optional: true, default: 5, label: { cs: 'X', en: 'X' } }];

  test('a missing value takes the default, as a form shows it', () => {
    assert.equal(readInputs(inputs, {}).values.x, 5);
  });

  test('a cleared value is empty', () => {
    assert.equal(readInputs(inputs, { x: '' }).values.x, null);
    assert.equal(readInputs(inputs, { x: null }).values.x, null);
  });

  test('an entered value wins and inherited values are ignored', () => {
    assert.equal(readInputs(inputs, { x: '7,5' }).values.x, 7.5);
    assert.equal(readInputs(inputs, Object.create({ x: 9 })).values.x, 5);
  });
});

describe('format', () => {
  test('decimal comma in Czech, no trailing zeros, no negative zero', () => {
    assert.equal(formatNumber(1.5, 'cs'), '1,5');
    assert.equal(formatNumber(1.5, 'en'), '1.5');
    assert.equal(formatNumber(0.1 + 0.2, 'en'), '0.3');
    assert.equal(formatNumber(-0, 'cs'), '0');
    assert.equal(formatNumber(Infinity, 'cs'), '–');
  });

  test('bilingual builds both texts', () => {
    assert.deepEqual(bilingual((lang, number) => `x = ${number(2.25)}`), { cs: 'x = 2,25', en: 'x = 2.25' });
  });

  test('significant digits', () => {
    assert.equal(formatNumber(Math.PI, 'en', 3), '3.14');
    assert.equal(formatNumber(123456789, 'en', 2), '120000000');
  });
});

describe('special functions', () => {
  test('log-gamma: Γ(10) = 9!, Γ(1/2) = √π', () => {
    near(lnGamma(10), Math.log(362880), 1e-12);
    near(lnGamma(0.5), Math.log(Math.sqrt(Math.PI)), 1e-12);
    near(lnGamma(1), 0, 1e-13);
  });

  test('incomplete gamma and beta', () => {
    // P(1, x) = 1 − e^−x
    near(gammaP(1, 2), 1 - Math.exp(-2), 1e-14);
    near(gammaP(3, 50) + gammaQ(3, 50), 1, 1e-14);
    // I_x(1, 1) = x; I_x(a, b) = 1 − I_(1−x)(b, a)
    near(betaI(0.3, 1, 1), 0.3, 1e-14);
    near(betaI(0.3, 2, 5), 1 - betaI(0.7, 5, 2), 1e-14);
  });

  test('normal distribution against tables', () => {
    near(normalCdf(1.96), 0.9750021048517795, 1e-14);
    near(normalCdf(-3), 0.0013498980316301, 1e-14);
    near(normalCdf(0), 0.5, 1e-15);
    near(normalPdf(0), 1 / Math.sqrt(2 * Math.PI), 1e-15);
    near(normalQuantile(0.975), 1.959963984540054, 1e-12);
    near(normalQuantile(1e-10), -6.361340902404056, 1e-9);
    assert.equal(normalQuantile(0), -Infinity);
  });

  test('Student t against tables', () => {
    near(studentQuantile(0.975, 1), 12.706204736174, 1e-8);
    near(studentQuantile(0.975, 10), 2.228138851986, 1e-9);
    near(studentQuantile(0.995, 30), 2.749995653567, 1e-9);
    near(studentCdf(0, 5), 0.5, 1e-15);
    // Large df approaches the normal distribution
    near(studentQuantile(0.975, 1e6), 1.959963984540054, 1e-5);
  });
});
