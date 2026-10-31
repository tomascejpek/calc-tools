/**
 * Annual percentage rate of charge (RPSN) of a consumer loan.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { annuityPayment } from './loan.js';

/**
 * APR X solving Σ drawdowns · (1 + X)^−t = Σ payments · (1 + X)^−t
 * (Directive 2008/48/EC, annex I; t in years, a month = 1/12 year).
 * @param {number} received amount paid out at t = 0
 * @param {number} payment regular monthly payment including fees
 * @param {number} months
 * @returns {number | null} % a year
 */
export function annualPercentageRate(received, payment, months) {
  const present = (/** @type {number} */ x) => {
    let sum = 0;
    for (let k = 1; k <= months; k++) sum += payment * (1 + x) ** (-k / 12);
    return sum;
  };
  // present() falls as x rises; find x where present(x) = received
  let lo = -0.99;
  let hi = 1;
  while (present(hi) > received && hi < 1e6) hi *= 2;
  if (present(lo) < received || present(hi) > received) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (present(mid) > received) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-12) break;
  }
  return (lo + hi) / 2 * 100;
}

const inputs = [
  { id: 'principal', type: 'number', default: 200000, min: 1, max: 1e12, step: 1000, label: { cs: 'Výše úvěru', en: 'Loan amount' } },
  { id: 'rate', type: 'number', default: 8.9, min: 0, max: 200, step: 0.1, unit: { cs: '% p. a.', en: '% a year' }, label: { cs: 'Roční úroková sazba', en: 'Annual interest rate' } },
  { id: 'months', type: 'number', default: 60, min: 1, max: 600, step: 1, label: { cs: 'Počet měsíčních splátek', en: 'Number of monthly payments' } },
  { id: 'upfrontFee', type: 'number', default: 2000, min: 0, max: 1e12, step: 100, label: { cs: 'Poplatek za poskytnutí (stržený předem)', en: 'Arrangement fee (deducted upfront)' } },
  { id: 'monthlyFee', type: 'number', default: 50, min: 0, max: 1e9, step: 10, label: { cs: 'Měsíční poplatek (vedení účtu, pojištění)', en: 'Monthly fee (account, insurance)' } },
];

const outputs = [
  { id: 'apr', label: { cs: 'RPSN', en: 'APR' }, unit: '%', precision: 2 },
  { id: 'payment', label: { cs: 'Měsíční splátka včetně poplatků', en: 'Monthly payment including fees' }, precision: 2 },
  { id: 'total', label: { cs: 'Zaplaceno celkem', en: 'Total paid' }, precision: 2 },
  { id: 'cost', label: { cs: 'Přeplatek (náklady úvěru)', en: 'Total cost of credit' }, precision: 2 },
];

export default {
  id: 'apr',
  kind: 'calculator',
  category: 'finance',
  tags: ['finance'],
  name: { cs: 'RPSN úvěru', en: 'Annual percentage rate (APR)' },
  description: {
    cs: 'Roční procentní sazba nákladů (RPSN) spotřebitelského úvěru podle evropské směrnice: zahrnuje úrok i poplatky a umožňuje srovnat nabídky. Počítá s anuitními měsíčními splátkami, poplatkem strženým při poskytnutí a měsíčním poplatkem.',
    en: 'Annual percentage rate of charge (APR) of a consumer loan by the EU directive: it includes interest and fees and allows offers to be compared. Assumes monthly annuity payments, a fee deducted when the loan is paid out and a monthly fee.',
  },
  keywords: {
    cs: ['rpsn', 'roční procentní sazba nákladů', 'úvěr', 'půjčka', 'poplatky', 'spotřebitelský úvěr', 'srovnání úvěrů'],
    en: ['apr', 'annual percentage rate', 'loan', 'credit', 'fees', 'consumer credit', 'compare loans'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { principal, rate, upfrontFee, monthlyFee } = read.values;
    const months = Math.round(read.values.months);
    if (upfrontFee >= principal) return emptyResult(outputs, [{ cs: 'Poplatek nesmí být vyšší než úvěr.', en: 'The fee must be lower than the loan.' }]);
    const payment = annuityPayment(principal, rate, months) + monthlyFee;
    const apr = annualPercentageRate(principal - upfrontFee, payment, months);
    if (apr === null) return emptyResult(outputs, [{ cs: 'RPSN se nepodařilo spočítat.', en: 'The APR could not be calculated.' }]);
    const total = payment * months + upfrontFee;
    return { values: { apr, payment, total, cost: total - principal }, warnings: [] };
  },
  references: [
    { title: 'Directive 2008/48/EC on credit agreements for consumers, annex I – APR formula', url: 'https://eur-lex.europa.eu/eli/dir/2008/48/oj' },
    { title: 'Zákon č. 257/2016 Sb., o spotřebitelském úvěru, příloha 5 – výpočet RPSN' },
  ],
};
