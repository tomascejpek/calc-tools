/**
 * Air humidity: relative ⇄ absolute humidity, dew point, mixing ratio.
 */

import { KELVIN } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Saturation vapour pressure over water, hPa (Magnus formula, Sonntag 1990
 * constants, −45 to +60 °C).
 * @param {number} celsius
 */
export function saturationPressure(celsius) {
  return 6.112 * Math.exp(17.62 * celsius / (243.12 + celsius));
}

/**
 * Dew point from temperature and relative humidity, °C.
 * @param {number} celsius
 * @param {number} rh %
 */
export function dewPoint(celsius, rh) {
  const gamma = Math.log(rh / 100) + 17.62 * celsius / (243.12 + celsius);
  return 243.12 * gamma / (17.62 - gamma);
}

/**
 * Absolute humidity, g of water per m³ of air.
 * @param {number} vapourHpa partial pressure of water vapour
 * @param {number} celsius
 */
export function absoluteHumidity(vapourHpa, celsius) {
  return vapourHpa * 100 / (461.5 * (celsius + KELVIN)) * 1000;
}

const inputs = [
  { id: 'temperature', type: 'number', default: 22, min: -45, max: 60, step: 0.5, unit: '°C', label: { cs: 'Teplota vzduchu', en: 'Air temperature' } },
  {
    id: 'known', type: 'select', default: 'rh', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'rh', label: { cs: 'relativní vlhkost', en: 'relative humidity' } },
      { value: 'dew', label: { cs: 'rosný bod', en: 'dew point' } },
    ],
  },
  { id: 'rh', type: 'number', default: 50, min: 0.1, max: 100, step: 1, unit: '%', label: { cs: 'Relativní vlhkost', en: 'Relative humidity' } },
  { id: 'dew', type: 'number', default: 11, min: -60, max: 60, step: 0.5, unit: '°C', label: { cs: 'Rosný bod', en: 'Dew point' } },
  { id: 'pressure', type: 'number', default: 1013.25, min: 300, max: 1100, step: 1, unit: 'hPa', label: { cs: 'Tlak vzduchu', en: 'Air pressure' } },
];

const outputs = [
  { id: 'rh', label: { cs: 'Relativní vlhkost', en: 'Relative humidity' }, unit: '%', precision: 1 },
  { id: 'dewPoint', label: { cs: 'Rosný bod', en: 'Dew point' }, unit: '°C', precision: 1 },
  { id: 'absolute', label: { cs: 'Absolutní vlhkost', en: 'Absolute humidity' }, unit: 'g/m³', precision: 2 },
  { id: 'mixingRatio', label: { cs: 'Měrná vlhkost (směšovací poměr)', en: 'Mixing ratio' }, unit: 'g/kg', precision: 2 },
  { id: 'vapourPressure', label: { cs: 'Parciální tlak vodní páry', en: 'Vapour pressure' }, unit: 'hPa', precision: 2 },
];

export default {
  id: 'humidity',
  kind: 'calculator',
  category: 'eng-air',
  tags: ['engineering'],
  name: { cs: 'Vlhkost vzduchu a rosný bod', en: 'Air humidity and dew point' },
  description: {
    cs: 'Převod relativní vlhkosti na absolutní (g vody v m³ vzduchu), rosný bod a měrnou vlhkost, nebo z rosného bodu zpět na relativní vlhkost. Tlak nasycených par podle Magnusova vzorce (přesnost asi ±0,1 °C od −45 do +60 °C). Pod rosným bodem se na studených plochách sráží voda.',
    en: 'Converts relative humidity to absolute humidity (g of water per m³ of air), dew point and mixing ratio, or back from the dew point to relative humidity. Saturation vapour pressure by the Magnus formula (about ±0.1 °C from −45 to +60 °C). Below the dew point water condenses on cold surfaces.',
  },
  keywords: {
    cs: ['vlhkost vzduchu', 'relativní vlhkost', 'absolutní vlhkost', 'rosný bod', 'kondenzace', 'vlhkoměr', 'magnus'],
    en: ['humidity', 'relative humidity', 'absolute humidity', 'dew point', 'condensation', 'hygrometer', 'magnus'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { temperature, known, pressure } = read.values;
    const saturation = saturationPressure(temperature);
    let vapour;
    if (known === 'dew') {
      if (read.values.dew > temperature) return emptyResult(outputs, [{ cs: 'Rosný bod nemůže být vyšší než teplota vzduchu.', en: 'The dew point cannot be above the air temperature.' }]);
      vapour = saturationPressure(read.values.dew);
    } else {
      vapour = saturation * read.values.rh / 100;
    }
    const rh = vapour / saturation * 100;
    return {
      values: {
        rh,
        dewPoint: dewPoint(temperature, rh),
        absolute: absoluteHumidity(vapour, temperature),
        mixingRatio: 621.98 * vapour / (pressure - vapour),
        vapourPressure: vapour,
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Sonntag, D.: Important new values of the physical constants of 1986, vapour pressure formulations… Z. Meteorol. 70 (1990)' },
    { title: 'WMO Guide to Instruments and Methods of Observation (WMO-No. 8), Annex 4.B – humidity formulae' },
  ],
};
