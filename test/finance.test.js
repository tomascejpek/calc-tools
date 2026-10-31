import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, getTool } from '../calc_tools/static/calc_tools/index.js';
import { futureValue } from '../calc_tools/static/calc_tools/tools/finance/compound-interest.js';
import { annuityPayment } from '../calc_tools/static/calc_tools/tools/finance/loan.js';
import { annualPercentageRate } from '../calc_tools/static/calc_tools/tools/finance/apr.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

describe('compound-interest', () => {
  test('1000 at 5 % for 10 years, yearly: 1628.89', () => {
    const result = run('compound-interest', { principal: 1000, rate: 5, years: 10, compounding: 'yearly', tax: 0 }).values;
    near(result.value, 1000 * 1.05 ** 10, 1e-9);
    near(result.value, 1628.89, 0.005);
    near(result.effectiveRate, 5, 1e-12);
  });

  test('monthly and continuous compounding, regular deposits and tax', () => {
    near(run('compound-interest', { rate: 12, compounding: 'monthly', years: 1, principal: 100, tax: 0 }).values.effectiveRate, 12.6825030, 1e-6);
    near(run('compound-interest', { rate: 5, compounding: 'continuous', years: 1, principal: 100, tax: 0 }).values.value, 100 * Math.exp(0.05), 1e-9);
    // 12 × 1000 deposited monthly at 0 %: exactly 12 000
    near(futureValue({ principal: 0, rate: 0, years: 1, periods: 12, deposit: 1000 }).value, 12000, 1e-9);
    const taxed = run('compound-interest', { principal: 1000, rate: 10, years: 1, compounding: 'yearly', tax: 15 }).values;
    near(taxed.afterTax, 1000 + 100 * 0.85, 1e-9);
  });

  test('zero rate, negative rate and invalid input', () => {
    near(run('compound-interest', { rate: 0, deposit: 500, years: 2 }).values.value, 100000 + 500 * 24, 1e-9);
    assert.ok(run('compound-interest', { rate: -1 }).values.value < 100000);
    invalid(run('compound-interest', { principal: -1 }));
    invalid(run('compound-interest', { compounding: 'hourly' }));
  });
});

describe('loan', () => {
  test('3 000 000 at 4.9 % for 30 years: 15 921.80 a month', () => {
    const result = run('loan').values;
    near(result.payment, 15921.80, 0.005);
    near(result.firstInterest, 3000000 * 0.049 / 12, 1e-9);
    near(result.firstPrincipal + result.firstInterest, result.payment, 1e-9);
    assert.equal(result.payments, 360);
  });

  test('interest-free loan and yearly payments', () => {
    near(annuityPayment(12000, 0, 12), 1000, 1e-12);
    near(run('loan', { principal: 100000, rate: 10, years: 2, frequency: '1' }).values.payment, 57619.0476, 1e-4);
  });

  test('too short a term and invalid input', () => {
    invalid(run('loan', { years: 0.4, frequency: '1' }));
    invalid(run('loan', { principal: 0 }));
    invalid(run('loan', { frequency: '52' }));
  });
});

describe('apr', () => {
  test('without fees the APR is the effective rate: 12 % nominal → 12.68 %', () => {
    near(run('apr', { rate: 12, upfrontFee: 0, monthlyFee: 0 }).values.apr, 12.6825030, 1e-6);
  });

  test('fees raise the APR; payments discounted at the APR repay what was received', () => {
    const result = run('apr').values;
    assert.ok(result.apr > 10 && result.apr < 11, `apr ${result.apr}`);
    const x = result.apr / 100;
    let present = 0;
    for (let k = 1; k <= 60; k++) present += result.payment * (1 + x) ** (-k / 12);
    near(present, 200000 - 2000, 1e-4);
    near(result.cost, result.total - 200000, 1e-9);
  });

  test('zero rate with no fees, impossible fees and invalid input', () => {
    near(annualPercentageRate(1200, 100, 12), 0, 1e-8);
    invalid(run('apr', { upfrontFee: 300000 }));
    invalid(run('apr', { months: 0 }));
    invalid(run('apr', { rate: 'cheap' }));
  });
});

describe('vat', () => {
  test('1000 without VAT at 21 % → 1210', () => {
    const result = run('vat').values;
    near(result.gross, 1210, 1e-9);
    near(result.vat, 210, 1e-9);
  });

  test('back from the price with VAT; reduced and custom rates', () => {
    const back = run('vat', { amount: 1120, direction: 'with', rate: '12' }).values;
    near(back.net, 1000, 1e-9);
    near(run('vat', { rate: 'custom', customRate: 19 }).values.gross, 1190, 1e-9);
  });

  test('zero rate, refunds and invalid input', () => {
    assert.equal(run('vat', { rate: '0' }).values.vat, 0);
    near(run('vat', { amount: -100 }).values.gross, -121, 1e-9);
    invalid(run('vat', { rate: '15' }));
    invalid(run('vat', { direction: 'both' }));
  });
});

describe('margin', () => {
  test('bought for 80, sold for 100: margin 20 %, markup 25 %', () => {
    const result = run('margin').values;
    near(result.margin, 20, 1e-12);
    near(result.markup, 25, 1e-12);
    near(result.profit, 20, 1e-12);
  });

  test('price from a margin or a markup', () => {
    near(run('margin', { given: 'margin', cost: 80, percent: 20 }).values.price, 100, 1e-9);
    near(run('margin', { given: 'markup', cost: 80, percent: 25 }).values.price, 100, 1e-9);
  });

  test('zero cost, a margin of 100 % and invalid input', () => {
    const free = run('margin', { cost: 0, price: 50 });
    assert.equal(free.values.markup, null);
    assert.equal(free.warnings.length, 1);
    invalid(run('margin', { given: 'margin', percent: 100 }));
    invalid(run('margin', { cost: -5 }));
  });
});
