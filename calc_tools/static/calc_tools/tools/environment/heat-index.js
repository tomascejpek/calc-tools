/**
 * Heat index: how hot it feels with humidity (NWS, Rothfusz).
 */

import { celsiusToFahrenheit, fahrenheitToCelsius } from '../../core/units.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Heat index by the US National Weather Service algorithm, °F.
 * @param {number} t air temperature, °F
 * @param {number} rh relative humidity, %
 */
export function heatIndexF(t, rh) {
  const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + rh * 0.094);
  if ((simple + t) / 2 < 80) return simple;
  let hi = -42.379 + 2.04901523 * t + 10.14333127 * rh - 0.22475541 * t * rh - 0.00683783 * t * t
    - 0.05481717 * rh * rh + 0.00122874 * t * t * rh + 0.00085282 * t * rh * rh - 0.00000199 * t * t * rh * rh;
  if (rh < 13 && t >= 80 && t <= 112) hi -= (13 - rh) / 4 * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  else if (rh > 85 && t >= 80 && t <= 87) hi += (rh - 85) / 10 * (87 - t) / 5;
  return hi;
}

const inputs = [
  { id: 'temperature', type: 'number', default: 32, min: 20, max: 60, step: 0.5, unit: '°C', label: { cs: 'Teplota vzduchu (ve stínu)', en: 'Air temperature (in shade)' } },
  { id: 'rh', type: 'number', default: 60, min: 0, max: 100, step: 1, unit: '%', label: { cs: 'Relativní vlhkost', en: 'Relative humidity' } },
];

const outputs = [
  { id: 'heatIndex', label: { cs: 'Pocitová teplota', en: 'Heat index' }, unit: '°C', precision: 1 },
  { id: 'difference', label: { cs: 'Rozdíl proti teplotě vzduchu', en: 'Difference from the air temperature' }, unit: '°C', precision: 1 },
  { id: 'risk', type: 'text', label: { cs: 'Riziko', en: 'Risk' } },
];

export default {
  id: 'heat-index',
  kind: 'calculator',
  category: 'environment',
  tags: ['environment'],
  name: { cs: 'Pocitová teplota v horku (heat index)', en: 'Heat index' },
  description: {
    cs: 'Jak horko působí při vysoké vlhkosti, kdy se pot hůř odpařuje. Algoritmus americké meteorologické služby (Rothfuszova regrese s korekcemi) platí pro teplotu ve stínu; na přímém slunci je pocitová teplota až o 8 °C vyšší. Nad 40 °C hrozí úpal.',
    en: 'How hot it feels at high humidity, when sweat evaporates poorly. The US National Weather Service algorithm (Rothfusz regression with adjustments) holds for the temperature in shade; in full sun it feels up to 8 °C hotter. Above 40 °C heat stroke is a risk.',
  },
  keywords: {
    cs: ['pocitová teplota', 'heat index', 'horko', 'vlhkost', 'úpal', 'vedro', 'počasí'],
    en: ['heat index', 'feels like', 'heat', 'humidity', 'heat stroke', 'apparent temperature', 'weather'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { temperature, rh } = read.values;
    const hi = fahrenheitToCelsius(heatIndexF(celsiusToFahrenheit(temperature), rh));
    const risk = hi < 27 ? { cs: 'bez zvláštního rizika', en: 'no special risk' }
      : hi < 32 ? { cs: 'opatrnost, únava při dlouhé námaze', en: 'caution, fatigue with prolonged exertion' }
        : hi < 41 ? { cs: 'zvýšená opatrnost, možné křeče a vyčerpání z horka', en: 'extreme caution, heat cramps and exhaustion possible' }
          : hi < 54 ? { cs: 'nebezpečí, pravděpodobné vyčerpání, hrozí úpal', en: 'danger, heat exhaustion likely, heat stroke possible' }
            : { cs: 'extrémní nebezpečí úpalu', en: 'extreme danger of heat stroke' };
    return { values: { heatIndex: hi, difference: hi - temperature, risk }, warnings: [] };
  },
  references: [{ title: 'NOAA National Weather Service: The heat index equation', url: 'https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml' }],
};
