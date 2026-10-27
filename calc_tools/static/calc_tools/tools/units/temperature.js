/**
 * Temperature converter: Celsius, Fahrenheit and kelvin.
 */

export default {
  id: 'temperature',
  kind: 'converter',
  category: 'units',
  tags: [],
  name: { cs: 'Převod teploty', en: 'Temperature converter' },
  description: {
    cs: 'Převod teploty mezi stupni Celsia, Fahrenheita a kelviny.',
    en: 'Converts temperature between degrees Celsius, Fahrenheit and kelvins.',
  },
  keywords: {
    cs: ['teplota', 'stupně', 'celsius', 'fahrenheit', 'kelvin'],
    en: ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'degrees'],
  },
  units: [
    { id: 'c', default: 20, label: { cs: '°C', en: '°C' }, precision: 1, min: -273.15 },
    { id: 'f', label: { cs: '°F', en: '°F' }, precision: 1, min: -459.67 },
    { id: 'k', label: { cs: 'K', en: 'K' }, precision: 2, min: 0 },
  ],
  // Base unit: kelvin
  toBase(value, unitId) {
    if (unitId === 'k') return value;
    if (unitId === 'c') return value + 273.15;
    if (unitId === 'f') return (value + 459.67) * 5 / 9;
    return null;
  },
  fromBase(value, unitId) {
    if (unitId === 'k') return value;
    if (unitId === 'c') return value - 273.15;
    if (unitId === 'f') return value * 9 / 5 - 459.67;
    return null;
  },
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
