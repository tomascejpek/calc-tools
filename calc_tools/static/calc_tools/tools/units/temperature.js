/**
 * Temperature converter: Celsius, Fahrenheit and kelvin.
 */

export default {
  id: 'temperature',
  kind: 'converter',
  category: 'units-heat',
  tags: ['beer'],
  name: { cs: 'Převod teploty', en: 'Temperature converter' },
  description: {
    cs: 'Převod teploty mezi stupni Celsia, Fahrenheita, kelviny, stupni Rankina (absolutní stupnice s dílkem °F) a Réaumura (voda vře při 80 °Ré).',
    en: 'Converts temperature between degrees Celsius, Fahrenheit, kelvins, degrees Rankine (absolute scale in °F steps) and Réaumur (water boils at 80 °Ré).',
  },
  keywords: {
    cs: ['teplota', 'stupně', 'celsius', 'fahrenheit', 'kelvin', 'rankine', 'réaumur'],
    en: ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'rankine', 'reaumur', 'degrees'],
  },
  units: [
    { id: 'c', default: 20, label: { cs: '°C', en: '°C' }, precision: 1, min: -273.15 },
    { id: 'f', label: { cs: '°F', en: '°F' }, precision: 1, min: -459.67 },
    { id: 'k', label: { cs: 'K', en: 'K' }, precision: 2, min: 0 },
    { id: 'ra', label: { cs: '°Ra (Rankine)', en: '°Ra (Rankine)' }, precision: 2, min: 0 },
    { id: 're', label: { cs: '°Ré (Réaumur)', en: '°Ré (Réaumur)' }, precision: 1, min: -218.52 },
  ],
  // Base unit: kelvin
  toBase(value, unitId) {
    if (unitId === 'k') return value;
    if (unitId === 'c') return value + 273.15;
    if (unitId === 'f') return (value + 459.67) * 5 / 9;
    if (unitId === 'ra') return value * 5 / 9;
    if (unitId === 're') return value * 5 / 4 + 273.15;
    return null;
  },
  fromBase(value, unitId) {
    if (unitId === 'k') return value;
    if (unitId === 'c') return value - 273.15;
    if (unitId === 'f') return value * 9 / 5 - 459.67;
    if (unitId === 'ra') return value * 9 / 5;
    if (unitId === 're') return (value - 273.15) * 4 / 5;
    return null;
  },
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
