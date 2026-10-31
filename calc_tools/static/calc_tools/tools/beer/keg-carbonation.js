/**
 * Forced carbonation in a keg: equilibrium pressure ⇄ CO₂ volumes.
 */

import { PSI_PER_BAR, celsiusToFahrenheit, isNumber } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Equilibrium gauge pressure for given carbonation and temperature.
 * @param {number} volumes volumes of CO₂
 * @param {number} celsius beer temperature
 * @returns {number} gauge pressure, psi
 */
export function kegPressurePsi(volumes, celsius) {
  const t = celsiusToFahrenheit(celsius);
  return -16.6999 - 0.0101059 * t + 0.00116512 * t ** 2
    + 0.173354 * t * volumes + 4.24267 * volumes - 0.0684226 * volumes ** 2;
}

/**
 * Carbonation reached at a given gauge pressure and temperature; the inverse
 * of {@link kegPressurePsi}.
 * @param {number} psi gauge pressure
 * @param {number} celsius beer temperature
 * @returns {number | null} volumes of CO₂
 */
export function kegVolumes(psi, celsius) {
  const t = celsiusToFahrenheit(celsius);
  const a = -0.0684226;
  const b = 4.24267 + 0.173354 * t;
  const c = -16.6999 - 0.0101059 * t + 0.00116512 * t ** 2 - psi;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  // The physical root is the one where pressure still rises with volumes
  const root = (-b + Math.sqrt(discriminant)) / (2 * a);
  return isNumber(root) && root >= 0 ? root : null;
}

const inputs = [
  {
    id: 'mode', type: 'select', default: 'pressure', label: { cs: 'Počítám', en: 'Calculate' },
    options: [
      { value: 'pressure', label: { cs: 'tlak z nasycení', en: 'pressure from carbonation' } },
      { value: 'volumes', label: { cs: 'nasycení z tlaku', en: 'carbonation from pressure' } },
    ],
  },
  { id: 'temperature', type: 'number', default: 4, min: -2, max: 30, step: 0.5, unit: '°C', label: { cs: 'Teplota piva', en: 'Beer temperature' } },
  { id: 'volumes', type: 'number', default: 2.5, min: 0, max: 5, step: 0.1, unit: { cs: 'obj. CO₂', en: 'vol. CO₂' }, label: { cs: 'Nasycení', en: 'Carbonation' } },
  { id: 'pressure', type: 'number', default: 0.8, min: 0, max: 7, step: 0.05, unit: 'bar', label: { cs: 'Přetlak', en: 'Gauge pressure' } },
];

const outputs = [
  { id: 'pressureBar', label: { cs: 'Přetlak', en: 'Gauge pressure' }, unit: 'bar', precision: 2 },
  { id: 'pressurePsi', label: { cs: 'Přetlak', en: 'Gauge pressure' }, unit: 'psi', precision: 1 },
  { id: 'volumes', label: { cs: 'Nasycení', en: 'Carbonation' }, unit: { cs: 'obj. CO₂', en: 'vol. CO₂' }, precision: 2 },
];

export default {
  id: 'keg-carbonation',
  kind: 'calculator',
  category: 'packaging',
  tags: ['beer'],
  name: { cs: 'Sycení v sudu', en: 'Keg carbonation' },
  description: {
    cs: 'Nucené sycení piva v sudu: jaký přetlak CO₂ nastavit pro požadované nasycení při dané teplotě, nebo naopak jaké nasycení dá nastavený tlak. Tlak je přetlak proti atmosféře, jak ho ukazuje manometr.',
    en: 'Forced carbonation in a keg: which CO₂ gauge pressure gives the desired carbonation at a given temperature, or which carbonation a set pressure gives. Pressure is gauge pressure, as shown on the regulator.',
  },
  keywords: {
    cs: ['sycení', 'nucené sycení', 'sud', 'keg', 'tlak', 'přetlak', 'co2', 'redukční ventil', 'výčep'],
    en: ['keg', 'forced carbonation', 'carbonation', 'pressure', 'psi', 'co2', 'regulator'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mode, temperature } = read.values;
    if (mode === 'pressure') {
      const psi = kegPressurePsi(read.values.volumes, temperature);
      if (psi < 0) {
        return emptyResult(outputs, [{
          cs: 'Při této teplotě má pivo toto nasycení i bez přetlaku.',
          en: 'At this temperature the beer holds this carbonation without any gauge pressure.',
        }]);
      }
      return { values: { pressureBar: psi / PSI_PER_BAR, pressurePsi: psi, volumes: read.values.volumes }, warnings: [] };
    }
    const psi = read.values.pressure * PSI_PER_BAR;
    const volumes = kegVolumes(psi, temperature);
    if (volumes === null) {
      return emptyResult(outputs, [{ cs: 'Pro tyto hodnoty nelze nasycení určit.', en: 'Carbonation cannot be determined for these values.' }]);
    }
    return { values: { pressureBar: read.values.pressure, pressurePsi: psi, volumes }, warnings: [] };
  },
  references: [
    { title: 'Regression of the ASBC / Zahm & Nagel CO₂ solubility tables: P = −16.6999 − 0.0101059·T + 0.00116512·T² + 0.173354·T·V + 4.24267·V − 0.0684226·V² (P in psi gauge, T in °F)' },
  ],
};
