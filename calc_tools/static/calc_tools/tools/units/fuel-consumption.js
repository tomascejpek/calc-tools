/**
 * Fuel consumption: l/100 km ⇄ km/l ⇄ mpg (US and UK).
 */

/** l/100 km times mpg for each gallon (100 × litres per gallon / km per mile). */
const MPG_US = 100 * 3.785411784 / 1.609344;
const MPG_UK = 100 * 4.54609 / 1.609344;

/** Each unit is inversely proportional to l/100 km except l/100 km itself. */
const RECIPROCAL = { 'km-l': 100, 'mpg-us': MPG_US, 'mpg-uk': MPG_UK };

/**
 * @param {number} value
 * @param {string} unitId
 * @returns {number | null} l/100 km, or the unit from l/100 km
 */
function swap(value, unitId) {
  // Zero consumption or zero range has no counterpart in the other units
  if (!(value > 0)) return null;
  if (unitId === 'l-100km') return value;
  if (!Object.hasOwn(RECIPROCAL, unitId)) return null;
  return RECIPROCAL[/** @type {keyof typeof RECIPROCAL} */ (unitId)] / value;
}

export default {
  id: 'fuel-consumption',
  kind: 'converter',
  category: 'units-other',
  tags: [],
  name: { cs: 'Převod spotřeby paliva', en: 'Fuel consumption converter' },
  description: {
    cs: 'Převod spotřeby paliva mezi litry na 100 km, kilometry na litr a mílemi na galon (americký i britský galon). Litry na 100 km rostou se spotřebou, ostatní jednotky klesají, proto jsou navzájem převrácené a nulu převést nelze.',
    en: 'Converts fuel consumption between litres per 100 km, kilometres per litre and miles per gallon (US and imperial gallon). Litres per 100 km rise with consumption while the other units fall, so they are reciprocal and zero cannot be converted.',
  },
  keywords: {
    cs: ['spotřeba', 'spotřeba paliva', 'l/100 km', 'mpg', 'km/l', 'auto', 'benzín', 'nafta'],
    en: ['fuel consumption', 'fuel economy', 'mileage', 'mpg', 'l/100 km', 'km/l', 'car'],
  },
  units: [
    { id: 'l-100km', default: 6, label: { cs: 'l/100 km', en: 'l/100 km' }, precision: 2, min: 0 },
    { id: 'km-l', label: { cs: 'km/l', en: 'km/l' }, precision: 2, min: 0 },
    { id: 'mpg-us', label: { cs: 'mpg (US galon)', en: 'mpg (US)' }, precision: 1, min: 0 },
    { id: 'mpg-uk', label: { cs: 'mpg (UK galon)', en: 'mpg (UK)' }, precision: 1, min: 0 },
  ],
  // Base unit: l/100 km
  toBase: swap,
  fromBase: swap,
  references: [
    { title: 'NIST Handbook 44, Appendix C: General Tables of Units of Measurement', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
