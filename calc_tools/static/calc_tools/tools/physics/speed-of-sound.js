/**
 * Speed of sound in air and water by temperature.
 */

import { KELVIN } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Speed of sound in dry air, m/s.
 * @param {number} celsius
 */
export function soundInAir(celsius) {
  return 331.3 * Math.sqrt(1 + celsius / KELVIN);
}

/**
 * Speed of sound in pure water at 0–95 °C, m/s (Marczak 1997).
 * @param {number} celsius
 */
export function soundInWater(celsius) {
  const t = celsius;
  return 1.402385e3 + 5.038813 * t - 5.799136e-2 * t ** 2 + 3.287156e-4 * t ** 3 - 1.398845e-6 * t ** 4 + 2.787860e-9 * t ** 5;
}

const inputs = [
  {
    id: 'medium', type: 'select', default: 'air', label: { cs: 'Prostředí', en: 'Medium' },
    options: [
      { value: 'air', label: { cs: 'suchý vzduch', en: 'dry air' } },
      { value: 'water', label: { cs: 'voda (0–95 °C)', en: 'water (0–95 °C)' } },
    ],
  },
  { id: 'temperature', type: 'number', default: 20, min: -100, max: 1000, step: 1, unit: '°C', label: { cs: 'Teplota', en: 'Temperature' } },
  { id: 'frequency', type: 'number', default: 440, min: 0.001, max: 1e12, step: 1, unit: 'Hz', label: { cs: 'Frekvence (pro vlnovou délku)', en: 'Frequency (for the wavelength)' } },
];

const outputs = [
  { id: 'speed', label: { cs: 'Rychlost zvuku', en: 'Speed of sound' }, unit: 'm/s', significant: 6 },
  { id: 'speedKmh', label: { cs: 'Rychlost zvuku', en: 'Speed of sound' }, unit: 'km/h', significant: 6 },
  { id: 'wavelength', label: { cs: 'Vlnová délka', en: 'Wavelength' }, unit: 'm', significant: 6 },
  { id: 'delayPerKm', label: { cs: 'Doba průchodu 1 km (např. hrom po blesku)', en: 'Time to travel 1 km (e.g. thunder after lightning)' }, unit: 's', significant: 4 },
];

export default {
  id: 'speed-of-sound',
  kind: 'calculator',
  category: 'physics-waves',
  tags: ['physics'],
  name: { cs: 'Rychlost zvuku podle teploty', en: 'Speed of sound by temperature' },
  description: {
    cs: 'Rychlost zvuku v suchém vzduchu c = 331,3 · √(1 + t / 273,15) m/s (při 20 °C asi 343 m/s) nebo ve vodě podle Marczaka (při 20 °C asi 1482 m/s) a vlnová délka zvuku dané frekvence. Vlhkost vzduchu rychlost mírně zvyšuje.',
    en: 'Speed of sound in dry air c = 331.3 · √(1 + t / 273.15) m/s (about 343 m/s at 20 °C) or in water after Marczak (about 1482 m/s at 20 °C), and the wavelength of a sound of a given frequency. Humidity raises the speed slightly.',
  },
  keywords: {
    cs: ['rychlost zvuku', 'zvuk', 'vlnová délka', 'teplota', 'akustika', 'blesk hrom', 'mach'],
    en: ['speed of sound', 'sound', 'wavelength', 'temperature', 'acoustics', 'thunder', 'mach'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { medium, temperature, frequency } = read.values;
    if (medium === 'water' && (temperature < 0 || temperature > 95)) {
      return emptyResult(outputs, [{ cs: 'Pro vodu platí vzorec jen od 0 do 95 °C.', en: 'For water the formula holds only from 0 to 95 °C.' }]);
    }
    if (medium === 'air' && temperature <= -KELVIN) return emptyResult(outputs, [{ cs: 'Teplota pod absolutní nulou.', en: 'Temperature below absolute zero.' }]);
    const speed = medium === 'water' ? soundInWater(temperature) : soundInAir(temperature);
    return { values: { speed, speedKmh: speed * 3.6, wavelength: speed / frequency, delayPerKm: 1000 / speed }, warnings: [] };
  },
  references: [
    { title: 'Marczak, W.: Water as a standard in the measurements of speed of sound in liquids. J. Acoust. Soc. Am. 102 (1997)' },
    { title: 'Wikipedia: Speed of sound – dependence on temperature', url: 'https://en.wikipedia.org/wiki/Speed_of_sound' },
  ],
};
