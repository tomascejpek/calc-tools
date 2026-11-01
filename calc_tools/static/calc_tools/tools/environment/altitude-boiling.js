/**
 * Altitude ⇄ air pressure (International Standard Atmosphere) and the
 * boiling point of water.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** ISA sea-level pressure (hPa) and temperature (K), lapse rate (K/m). */
const P0 = 1013.25;
const T0 = 288.15;
const LAPSE = 0.0065;
/** g·M / (R·L) for dry air. */
const EXPONENT = 5.25588;

/**
 * Pressure at an altitude in the troposphere (up to 11 km), hPa.
 * @param {number} metres
 * @param {number} [seaLevel] hPa
 */
export function pressureAtAltitude(metres, seaLevel = P0) {
  return seaLevel * (1 - LAPSE * metres / T0) ** EXPONENT;
}

/**
 * Altitude for a pressure, m.
 * @param {number} hpa
 * @param {number} [seaLevel] hPa
 */
export function altitudeAtPressure(hpa, seaLevel = P0) {
  return T0 / LAPSE * (1 - (hpa / seaLevel) ** (1 / EXPONENT));
}

/** IAPWS-IF97 region 4 coefficients n1–n10. */
const N = [
  0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.12020824702470e5, -0.32325550322333e7,
  0.14915108613530e2, -0.48232657361591e4, 0.40511340542057e6, -0.23855557567849, 0.65017534844798e3,
];

/**
 * Boiling (saturation) temperature of pure water, °C, by the IAPWS-IF97
 * backward equation of region 4 (611 Pa to 22 MPa).
 * @param {number} hpa
 */
export function boilingPoint(hpa) {
  const beta = (hpa / 1e4) ** 0.25;
  const e = beta * beta + N[2] * beta + N[5];
  const f = N[0] * beta * beta + N[3] * beta + N[6];
  const g = N[1] * beta * beta + N[4] * beta + N[7];
  const d = 2 * g / (-f - Math.sqrt(f * f - 4 * e * g));
  const kelvin = (N[9] + d - Math.sqrt((N[9] + d) ** 2 - 4 * (N[8] + N[9] * d))) / 2;
  return kelvin - 273.15;
}

const inputs = [
  {
    id: 'known', type: 'select', default: 'altitude', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'altitude', label: { cs: 'nadmořskou výšku', en: 'the altitude' } },
      { value: 'pressure', label: { cs: 'tlak vzduchu (na místě, ne přepočtený)', en: 'the air pressure (local, not reduced)' } },
    ],
  },
  { id: 'altitude', type: 'number', default: 1000, min: -400, max: 11000, step: 10, unit: 'm', label: { cs: 'Nadmořská výška', en: 'Altitude' } },
  { id: 'pressure', type: 'number', default: 900, min: 220, max: 1100, step: 1, unit: 'hPa', label: { cs: 'Tlak vzduchu', en: 'Air pressure' } },
  { id: 'seaLevel', type: 'number', default: 1013.25, min: 900, max: 1100, step: 0.5, unit: 'hPa', label: { cs: 'Tlak u hladiny moře (dnešní, výchozí standardní)', en: 'Sea-level pressure (today, default standard)' } },
];

const outputs = [
  { id: 'altitude', label: { cs: 'Nadmořská výška', en: 'Altitude' }, unit: 'm', precision: 0 },
  { id: 'pressure', label: { cs: 'Tlak vzduchu', en: 'Air pressure' }, unit: 'hPa', precision: 1 },
  { id: 'boiling', label: { cs: 'Bod varu vody', en: 'Boiling point of water' }, unit: '°C', precision: 1 },
  { id: 'share', label: { cs: 'Tlak proti hladině moře', en: 'Pressure relative to sea level' }, unit: '%', precision: 1 },
];

export default {
  id: 'altitude-boiling',
  kind: 'calculator',
  category: 'environment',
  tags: ['environment', 'beer', 'food'],
  name: { cs: 'Výška podle tlaku a bod varu vody', en: 'Altitude from pressure and boiling point' },
  description: {
    cs: 'Barometrická rovnice standardní atmosféry: tlak v dané nadmořské výšce nebo výška podle tlaku (do 11 km) a bod varu vody při tomto tlaku. Každých asi 300 m výšky sníží bod varu o 1 °C: na Sněžce (1603 m) voda vře při 94,6 °C. Při vaření a chmelovaru na horách trvá vše déle a chmel se izomerizuje pomaleji.',
    en: 'The barometric equation of the standard atmosphere: the pressure at an altitude or the altitude from a pressure (up to 11 km), and the boiling point of water at that pressure. Every 300 m or so lowers the boiling point by 1 °C: at 1603 m water boils at about 94.6 °C. Cooking and boiling wort in the mountains takes longer and hops isomerise more slowly.',
  },
  keywords: {
    cs: ['nadmořská výška', 'barometrická rovnice', 'tlak vzduchu', 'bod varu', 'var vody na horách', 'výškoměr', 'atmosféra'],
    en: ['altitude', 'barometric formula', 'air pressure', 'boiling point', 'boiling at altitude', 'altimeter', 'standard atmosphere'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { known, seaLevel } = read.values;
    const pressure = known === 'altitude' ? pressureAtAltitude(read.values.altitude, seaLevel) : read.values.pressure;
    const altitude = known === 'altitude' ? read.values.altitude : altitudeAtPressure(pressure, seaLevel);
    if (altitude > 11000) return emptyResult(outputs, [{ cs: 'Vzorec platí jen v troposféře do 11 km.', en: 'The formula holds only in the troposphere up to 11 km.' }]);
    return { values: { altitude, pressure, boiling: boilingPoint(pressure), share: pressure / seaLevel * 100 }, warnings: [] };
  },
  references: [
    { title: 'ISO 2533: Standard Atmosphere' },
    { title: 'IAPWS R7-97(2012): Revised Release on the IAPWS Industrial Formulation 1997 – saturation temperature equation', url: 'http://www.iapws.org/relguide/IF97-Rev.html' },
  ],
};
