/**
 * Electrical converters with SI prefixes: voltage, current, resistance and
 * capacitance.
 */

import { prefixedRows, unitTable } from '../../core/converter.js';

const SI_BROCHURE = { title: 'BIPM: The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' };

/**
 * @param {{ id: string, symbol: string, prefixes: string[], defaultUnit: string, defaultValue: number, min?: number | null,
 *   name: import('../../core/i18n.js').Text, description: import('../../core/i18n.js').Text,
 *   keywords: { cs: string[], en: string[] } }} spec
 */
function electricConverter({ id, symbol, prefixes, defaultUnit, defaultValue, min = 0, name, description, keywords }) {
  const table = unitTable(prefixedRows(symbol, prefixes), { defaultUnit, defaultValue, min });
  return {
    id,
    kind: 'converter',
    category: 'units-electric',
    tags: [],
    name,
    description,
    keywords,
    units: table.units,
    toBase: table.toBase,
    fromBase: table.fromBase,
    references: [SI_BROCHURE],
  };
}

export const voltage = electricConverter({
  id: 'voltage',
  symbol: 'V',
  prefixes: ['µ', 'm', '', 'k', 'M'],
  defaultUnit: 'V',
  defaultValue: 230,
  min: null,
  name: { cs: 'Převod napětí', en: 'Voltage converter' },
  description: {
    cs: 'Převod elektrického napětí mezi mikrovolty, milivolty, volty, kilovolty a megavolty.',
    en: 'Converts voltage between microvolts, millivolts, volts, kilovolts and megavolts.',
  },
  keywords: { cs: ['napětí', 'volt', 'milivolt', 'kilovolt', 'elektřina'], en: ['voltage', 'volt', 'millivolt', 'kilovolt', 'electricity'] },
});

export const current = electricConverter({
  id: 'current',
  symbol: 'A',
  prefixes: ['n', 'µ', 'm', '', 'k'],
  defaultUnit: 'A',
  defaultValue: 1,
  min: null,
  name: { cs: 'Převod elektrického proudu', en: 'Electric current converter' },
  description: {
    cs: 'Převod elektrického proudu mezi nanoampéry, mikroampéry, miliampéry, ampéry a kiloampéry.',
    en: 'Converts electric current between nanoamperes, microamperes, milliamperes, amperes and kiloamperes.',
  },
  keywords: { cs: ['proud', 'elektrický proud', 'ampér', 'miliampér', 'elektřina'], en: ['current', 'electric current', 'ampere', 'amp', 'milliamp', 'electricity'] },
});

export const resistance = electricConverter({
  id: 'resistance',
  symbol: 'Ω',
  prefixes: ['µ', 'm', '', 'k', 'M', 'G'],
  defaultUnit: 'kΩ',
  defaultValue: 10,
  name: { cs: 'Převod elektrického odporu', en: 'Resistance converter' },
  description: {
    cs: 'Převod elektrického odporu mezi mikroohmy, miliohmy, ohmy, kiloohmy, megaohmy a gigaohmy.',
    en: 'Converts electrical resistance between microohms, milliohms, ohms, kiloohms, megaohms and gigaohms.',
  },
  keywords: { cs: ['odpor', 'elektrický odpor', 'ohm', 'kiloohm', 'megaohm', 'rezistor'], en: ['resistance', 'ohm', 'kiloohm', 'megaohm', 'resistor'] },
});

export const capacitance = electricConverter({
  id: 'capacitance',
  symbol: 'F',
  prefixes: ['p', 'n', 'µ', 'm', ''],
  defaultUnit: 'uF',
  defaultValue: 100,
  name: { cs: 'Převod kapacity kondenzátoru', en: 'Capacitance converter' },
  description: {
    cs: 'Převod elektrické kapacity mezi pikofarady, nanofarady, mikrofarady, milifarady a farady, např. při čtení značení kondenzátorů.',
    en: 'Converts capacitance between picofarads, nanofarads, microfarads, millifarads and farads, e.g. when reading capacitor markings.',
  },
  keywords: { cs: ['kapacita', 'kondenzátor', 'farad', 'mikrofarad', 'nanofarad', 'pikofarad'], en: ['capacitance', 'capacitor', 'farad', 'microfarad', 'nanofarad', 'picofarad'] },
});
