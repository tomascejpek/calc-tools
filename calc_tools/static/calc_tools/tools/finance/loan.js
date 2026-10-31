/**
 * Annuity loan: the regular payment and an overview of the repayment.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Annuity payment for a loan repaid in equal instalments.
 * @param {number} principal
 * @param {number} rate % a year
 * @param {number} payments total number of payments
 * @param {number} perYear payments a year
 */
export function annuityPayment(principal, rate, payments, perYear = 12) {
  const i = rate / 100 / perYear;
  if (i === 0) return principal / payments;
  return principal * i / (1 - (1 + i) ** -payments);
}

const inputs = [
  { id: 'principal', type: 'number', default: 3000000, min: 0.01, max: 1e13, step: 10000, label: { cs: 'Výše úvěru', en: 'Loan amount' } },
  { id: 'rate', type: 'number', default: 4.9, min: 0, max: 100, step: 0.1, unit: { cs: '% p. a.', en: '% a year' }, label: { cs: 'Roční úroková sazba', en: 'Annual interest rate' } },
  { id: 'years', type: 'number', default: 30, min: 0.0833, max: 100, step: 1, unit: { cs: 'let', en: 'years' }, label: { cs: 'Doba splácení', en: 'Term' } },
  {
    id: 'frequency', type: 'select', default: '12', label: { cs: 'Splátky', en: 'Payments' },
    options: [
      { value: '12', label: { cs: 'měsíčně', en: 'monthly' } },
      { value: '4', label: { cs: 'čtvrtletně', en: 'quarterly' } },
      { value: '1', label: { cs: 'ročně', en: 'yearly' } },
    ],
  },
];

const money = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, precision: 2 });

const outputs = [
  money('payment', 'Splátka', 'Payment'),
  money('total', 'Zaplaceno celkem', 'Total paid'),
  money('interest', 'Úroky celkem', 'Total interest'),
  money('firstInterest', 'Úrok v první splátce', 'Interest in the first payment'),
  money('firstPrincipal', 'Jistina v první splátce', 'Principal in the first payment'),
  { id: 'payments', label: { cs: 'Počet splátek', en: 'Number of payments' }, precision: 0 },
];

export default {
  id: 'loan',
  kind: 'calculator',
  category: 'finance',
  tags: ['finance'],
  name: { cs: 'Splátka úvěru (anuita)', en: 'Loan payment (annuity)' },
  description: {
    cs: 'Výše pravidelné splátky úvěru nebo hypotéky splácené anuitně (stejnými splátkami), kolik se celkem zaplatí a kolik z toho jsou úroky. Ukáže i rozdělení první splátky na úrok a jistinu. Nezahrnuje poplatky ani pojištění; ty zohledňuje RPSN.',
    en: 'The regular payment of a loan or mortgage repaid as an annuity (equal payments), the total paid and how much of it is interest. Also splits the first payment into interest and principal. Fees and insurance are not included; the APR accounts for them.',
  },
  keywords: {
    cs: ['úvěr', 'půjčka', 'hypotéka', 'splátka', 'anuita', 'anuitní splátka', 'úrok', 'jistina'],
    en: ['loan', 'mortgage', 'payment', 'annuity', 'instalment', 'interest', 'principal', 'amortization'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { principal, rate, years } = read.values;
    const perYear = Number(read.values.frequency);
    const payments = Math.round(years * perYear);
    if (payments < 1) return emptyResult(outputs, [{ cs: 'Doba splácení je kratší než jedna splátka.', en: 'The term is shorter than one payment.' }]);
    const payment = annuityPayment(principal, rate, payments, perYear);
    const firstInterest = principal * rate / 100 / perYear;
    return {
      values: {
        payment,
        total: payment * payments,
        interest: payment * payments - principal,
        firstInterest,
        firstPrincipal: payment - firstInterest,
        payments,
      },
      warnings: [],
    };
  },
  references: [{ title: 'Wikipedia: Annuity – loan amortisation', url: 'https://en.wikipedia.org/wiki/Amortizing_loan' }],
};
