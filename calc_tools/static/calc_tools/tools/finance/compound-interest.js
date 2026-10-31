/**
 * Compound interest with optional regular deposits.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Compounding periods per year; 0 means continuous. */
export const PERIODS = { yearly: 1, quarterly: 4, monthly: 12, daily: 365, continuous: 0 };

/**
 * Future value of a deposit and of regular deposits at the end of each period.
 * @param {{ principal: number, rate: number, years: number, periods: number, deposit: number }} plan
 *   rate in % a year; periods per year (0 = continuous; deposits then monthly)
 */
export function futureValue({ principal, rate, years, periods, deposit }) {
  const r = rate / 100;
  if (periods === 0) {
    // Continuous compounding; deposits monthly, each growing from its date
    const months = Math.round(years * 12);
    let saved = 0;
    for (let m = 1; m <= months; m++) saved += deposit * Math.exp(r * (years - m / 12));
    return { value: principal * Math.exp(r * years) + saved, deposits: deposit * months };
  }
  const n = Math.round(years * periods);
  const i = r / periods;
  const growth = (1 + i) ** n;
  const saved = i === 0 ? deposit * n : deposit * (growth - 1) / i;
  return { value: principal * growth + saved, deposits: deposit * n };
}

const inputs = [
  { id: 'principal', type: 'number', default: 100000, min: 0, max: 1e13, step: 1000, label: { cs: 'Počáteční vklad', en: 'Initial deposit' } },
  { id: 'rate', type: 'number', default: 4, min: -50, max: 100, step: 0.1, unit: { cs: '% p. a.', en: '% a year' }, label: { cs: 'Roční úroková sazba', en: 'Annual interest rate' } },
  { id: 'years', type: 'number', default: 10, min: 0, max: 100, step: 1, unit: { cs: 'let', en: 'years' }, label: { cs: 'Doba', en: 'Term' } },
  {
    id: 'compounding', type: 'select', default: 'monthly', label: { cs: 'Připisování úroků', en: 'Compounding' },
    options: [
      { value: 'yearly', label: { cs: 'ročně', en: 'yearly' } },
      { value: 'quarterly', label: { cs: 'čtvrtletně', en: 'quarterly' } },
      { value: 'monthly', label: { cs: 'měsíčně', en: 'monthly' } },
      { value: 'daily', label: { cs: 'denně', en: 'daily' } },
      { value: 'continuous', label: { cs: 'spojitě', en: 'continuously' } },
    ],
  },
  { id: 'deposit', type: 'number', default: 0, min: 0, max: 1e12, step: 100, label: { cs: 'Pravidelný vklad na konci každého období', en: 'Regular deposit at the end of each period' } },
  { id: 'tax', type: 'number', default: 15, min: 0, max: 100, step: 1, unit: '%', label: { cs: 'Daň z úroků', en: 'Tax on interest' } },
];

const money = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, precision: 2 });

const outputs = [
  money('value', 'Konečná částka před zdaněním', 'Final amount before tax'),
  money('interest', 'Úroky celkem', 'Total interest'),
  money('afterTax', 'Konečná částka po zdanění úroků', 'Final amount after tax on interest'),
  money('deposits', 'Vloženo celkem', 'Total deposited'),
  { id: 'effectiveRate', label: { cs: 'Efektivní roční sazba', en: 'Effective annual rate' }, unit: '%', precision: 3 },
];

export default {
  id: 'compound-interest',
  kind: 'calculator',
  category: 'finance',
  tags: ['finance'],
  name: { cs: 'Složené úročení', en: 'Compound interest' },
  description: {
    cs: 'Kolik naroste vklad při složeném úročení s ročním, čtvrtletním, měsíčním, denním nebo spojitým připisováním úroků, volitelně s pravidelnými vklady na konci každého období (u spojitého úročení měsíčně). Ukáže i efektivní roční sazbu a částku po zdanění úroků (v Česku 15 %).',
    en: 'How a deposit grows with compound interest credited yearly, quarterly, monthly, daily or continuously, optionally with regular deposits at the end of each period (monthly for continuous compounding). Also shows the effective annual rate and the amount after tax on interest (15 % in Czechia).',
  },
  keywords: {
    cs: ['složené úročení', 'úrok', 'spoření', 'vklad', 'zhodnocení', 'efektivní sazba', 'pravidelné spoření', 'termínovaný vklad'],
    en: ['compound interest', 'interest', 'savings', 'deposit', 'growth', 'effective rate', 'annual percentage yield', 'regular savings'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { principal, rate, years, compounding, deposit, tax } = read.values;
    const periods = PERIODS[/** @type {keyof typeof PERIODS} */ (compounding)];
    const { value, deposits } = futureValue({ principal, rate, years, periods, deposit });
    const totalIn = principal + deposits;
    const interest = value - totalIn;
    const effectiveRate = (periods === 0 ? Math.exp(rate / 100) : (1 + rate / 100 / periods) ** periods) * 100 - 100;
    return {
      values: { value, interest, afterTax: value - Math.max(0, interest) * tax / 100, deposits: totalIn, effectiveRate },
      warnings: [],
    };
  },
  references: [{ title: 'Wikipedia: Compound interest', url: 'https://en.wikipedia.org/wiki/Compound_interest' }],
};
