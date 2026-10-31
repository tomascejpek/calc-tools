/**
 * Temperature correction of a hydrometer reading.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { celsiusToFahrenheit, platoToSg, sgToPlato } from '../../core/units.js';

/**
 * Relative density of water at a temperature, polynomial in °F used by
 * brewing software for hydrometer correction.
 * @param {number} celsius
 */
function waterFactor(celsius) {
  const f = celsiusToFahrenheit(celsius);
  return 1.00130346 - 0.000134722124 * f + 0.00000204052596 * f ** 2 - 0.00000000232820948 * f ** 3;
}

/**
 * Hydrometer reading corrected to its calibration temperature.
 * @param {number} sg reading
 * @param {number} sampleCelsius temperature of the sample
 * @param {number} calibrationCelsius calibration temperature of the hydrometer
 */
export function correctHydrometer(sg, sampleCelsius, calibrationCelsius) {
  return sg * waterFactor(sampleCelsius) / waterFactor(calibrationCelsius);
}

const inputs = [
  scaleInput('plato'),
  { id: 'reading', type: 'number', default: 12, step: 0.1, label: { cs: 'Naměřená hodnota', en: 'Reading' } },
  { id: 'temperature', type: 'number', default: 25, min: 0, max: 70, step: 0.5, unit: '°C', label: { cs: 'Teplota vzorku', en: 'Sample temperature' } },
  { id: 'calibration', type: 'number', default: 20, min: 10, max: 30, step: 0.5, unit: '°C', label: { cs: 'Kalibrační teplota hustoměru', en: 'Hydrometer calibration temperature' } },
];

const outputs = [
  { id: 'plato', label: { cs: 'Opravená hodnota', en: 'Corrected reading' }, unit: '°P', precision: 2 },
  { id: 'sg', label: { cs: 'Opravená hodnota', en: 'Corrected reading' }, unit: 'SG', precision: 4 },
];

export default {
  id: 'hydrometer-correction',
  kind: 'calculator',
  category: 'corrections',
  tags: ['beer'],
  name: { cs: 'Korekce hustoměru na teplotu', en: 'Hydrometer temperature correction' },
  description: {
    cs: 'Oprava odečtu cukroměru nebo hustoměru, když vzorek nemá kalibrační teplotu (obvykle 20 °C, u starších a amerických 15,6 °C = 60 °F). Teplý vzorek je řidší a ukazuje méně. Nad 40 °C je oprava nepřesná; vzorek raději zchlaďte.',
    en: 'Corrects a saccharometer or hydrometer reading when the sample is not at the calibration temperature (usually 20 °C, older and US ones 15.6 °C = 60 °F). A warm sample is less dense and reads low. Above 40 °C the correction is inaccurate; cool the sample instead.',
  },
  keywords: {
    cs: ['hustoměr', 'cukroměr', 'korekce', 'teplotní korekce', 'oprava', 'teplota vzorku', 'kalibrace'],
    en: ['hydrometer', 'saccharometer', 'temperature correction', 'calibration', 'sample temperature'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['reading']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    const { temperature, calibration } = read.values;
    const sg = correctHydrometer(gravity.sg.reading, temperature, calibration);
    const warnings = temperature > 40
      ? [{ cs: 'Nad 40 °C je korekce jen orientační.', en: 'Above 40 °C the correction is only indicative.' }]
      : [];
    return { values: { plato: sgToPlato(sg), sg }, warnings };
  },
  references: [
    { title: 'Hydrometer correction: SG × w(Tsample) / w(Tcal), w(T) = 1.00130346 − 0.000134722124·T + 0.00000204052596·T² − 0.00000000232820948·T³ (T in °F), fit of the density of water' },
    { title: 'Wikipedia: Properties of water – density', url: 'https://en.wikipedia.org/wiki/Properties_of_water#Density_of_water_and_ice' },
  ],
};
