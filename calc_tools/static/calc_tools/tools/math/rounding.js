/**
 * Rounding to decimal places or significant digits by several rules.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * x × 10^n without the binary error of multiplying (1.005 × 100 = 100.49999…).
 * @param {number} x
 * @param {number} n
 */
function shift(x, n) {
  const [mantissa, exponent = '0'] = String(x).split('e');
  return Number(`${mantissa}e${Number(exponent) + n}`);
}

/**
 * Rounds to a number of decimal places (negative rounds to tens, hundreds…).
 * @param {number} x
 * @param {number} places
 * @param {'half-up' | 'half-even' | 'floor' | 'ceil' | 'trunc'} method
 */
export function roundTo(x, places, method = 'half-up') {
  const scaled = shift(x, places);
  let rounded;
  if (method === 'floor') rounded = Math.floor(scaled);
  else if (method === 'ceil') rounded = Math.ceil(scaled);
  else if (method === 'trunc') rounded = Math.trunc(scaled);
  else {
    const abs = Math.abs(scaled);
    const whole = Math.floor(abs);
    const isHalf = abs - whole === 0.5;
    let magnitude = Math.round(abs);
    if (isHalf && method === 'half-even') magnitude = whole % 2 === 0 ? whole : whole + 1;
    rounded = Math.sign(scaled) * magnitude;
  }
  return shift(rounded, -places) + 0;
}

/**
 * Decimal places that keep a number of significant digits of x.
 * @param {number} x
 * @param {number} digits
 */
export function placesForSignificant(x, digits) {
  if (x === 0) return digits - 1;
  return digits - 1 - Math.floor(Math.log10(Math.abs(x)));
}

const inputs = [
  { id: 'value', type: 'number', default: 2.675, step: 0.001, label: { cs: 'Číslo', en: 'Number' } },
  {
    id: 'mode', type: 'select', default: 'places', label: { cs: 'Zaokrouhlit na', en: 'Round to' },
    options: [
      { value: 'places', label: { cs: 'desetinná místa', en: 'decimal places' } },
      { value: 'significant', label: { cs: 'platné číslice', en: 'significant digits' } },
    ],
  },
  { id: 'digits', type: 'number', default: 2, min: -15, max: 15, step: 1, label: { cs: 'Počet míst nebo číslic', en: 'Places or digits' } },
  {
    id: 'method', type: 'select', default: 'half-up', label: { cs: 'Pravidlo', en: 'Rule' },
    options: [
      { value: 'half-up', label: { cs: 'matematicky (5 nahoru)', en: 'half up (5 rounds up)' } },
      { value: 'half-even', label: { cs: 'bankovní (5 k sudé)', en: 'half to even (banker\'s)' } },
      { value: 'floor', label: { cs: 'dolů (k −∞)', en: 'down (towards −∞)' } },
      { value: 'ceil', label: { cs: 'nahoru (k +∞)', en: 'up (towards +∞)' } },
      { value: 'trunc', label: { cs: 'useknout (k nule)', en: 'truncate (towards zero)' } },
    ],
  },
];

const outputs = [
  { id: 'rounded', label: { cs: 'Zaokrouhleno', en: 'Rounded' }, significant: 15 },
  { id: 'difference', label: { cs: 'Rozdíl od původního', en: 'Difference from the original' }, significant: 6 },
];

export default {
  id: 'rounding',
  kind: 'calculator',
  category: 'math-arithmetic',
  tags: ['math'],
  name: { cs: 'Zaokrouhlování a platné číslice', en: 'Rounding and significant digits' },
  description: {
    cs: 'Zaokrouhlení na zadaný počet desetinných míst (záporný počet zaokrouhlí na desítky, stovky…) nebo platných číslic. Pravidla: matematické (2,675 → 2,68), bankovní k sudé číslici (2,665 → 2,66), dolů, nahoru a useknutí. Počítá s desítkovým zápisem čísla, takže 2,675 se zaokrouhlí správně nahoru.',
    en: 'Rounds to a number of decimal places (a negative number rounds to tens, hundreds…) or significant digits. Rules: half up (2.675 → 2.68), half to even (2.665 → 2.66), down, up and truncation. Works on the decimal form of the number, so 2.675 correctly rounds up.',
  },
  keywords: {
    cs: ['zaokrouhlení', 'zaokrouhlit', 'platné číslice', 'desetinná místa', 'bankovní zaokrouhlení', 'useknutí'],
    en: ['rounding', 'round', 'significant digits', 'significant figures', 'decimal places', 'bankers rounding', 'truncate'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { value, mode, digits, method } = read.values;
    if (!Number.isInteger(digits)) return emptyResult(outputs, [{ cs: 'Počet míst musí být celé číslo.', en: 'The number of places must be a whole number.' }]);
    if (mode === 'significant' && digits < 1) {
      return emptyResult(outputs, [{ cs: 'Platných číslic musí být aspoň 1.', en: 'There must be at least 1 significant digit.' }]);
    }
    const places = mode === 'significant' ? placesForSignificant(value, digits) : digits;
    const rounded = roundTo(value, places, method);
    return { values: { rounded, difference: rounded - value }, warnings: [] };
  },
  references: [
    { title: 'Wikipedia: Rounding', url: 'https://en.wikipedia.org/wiki/Rounding' },
    { title: 'ČSN 01 1010 / ISO 80000-1, annex B – rounding of numbers' },
  ],
};
