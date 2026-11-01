/**
 * Wind chill temperature (Environment Canada / NWS 2001).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Wind chill index, °C, for air at most 10 °C and wind at least 4.8 km/h.
 * @param {number} celsius
 * @param {number} kmh wind speed at 10 m
 */
export function windChill(celsius, kmh) {
  const v = kmh ** 0.16;
  return 13.12 + 0.6215 * celsius - 11.37 * v + 0.3965 * celsius * v;
}

const inputs = [
  { id: 'temperature', type: 'number', default: -5, min: -60, max: 10, step: 1, unit: '°C', label: { cs: 'Teplota vzduchu', en: 'Air temperature' } },
  { id: 'wind', type: 'number', default: 30, min: 4.8, max: 200, step: 1, unit: 'km/h', label: { cs: 'Rychlost větru (ve výšce 10 m)', en: 'Wind speed (at 10 m)' } },
];

const outputs = [
  { id: 'windChill', label: { cs: 'Pocitová teplota', en: 'Wind chill' }, unit: '°C', precision: 1 },
  { id: 'difference', label: { cs: 'Rozdíl proti teplotě vzduchu', en: 'Difference from the air temperature' }, unit: '°C', precision: 1 },
  { id: 'risk', type: 'text', label: { cs: 'Riziko omrzlin', en: 'Frostbite risk' } },
];

export default {
  id: 'wind-chill',
  kind: 'calculator',
  category: 'environment',
  tags: ['environment'],
  name: { cs: 'Pocitová teplota ve větru (wind chill)', en: 'Wind chill' },
  description: {
    cs: 'Jak studeně je ve větru: teplota, při které by bez větru odcházelo z kůže stejně tepla. Vzorec kanadské a americké meteorologické služby (2001) platí pro teploty do 10 °C a vítr od 4,8 km/h. Pod −28 °C pocitové teploty hrozí omrzliny odkryté kůže do 30 minut.',
    en: 'How cold it feels in the wind: the temperature at which the skin would lose the same heat without wind. The Canadian and US weather service formula (2001) holds for temperatures up to 10 °C and wind from 4.8 km/h. Below a wind chill of −28 °C exposed skin can freeze within 30 minutes.',
  },
  keywords: {
    cs: ['pocitová teplota', 'wind chill', 'vítr', 'chlad', 'omrzliny', 'zima', 'počasí'],
    en: ['wind chill', 'feels like', 'wind', 'cold', 'frostbite', 'winter', 'weather'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { temperature, wind } = read.values;
    const chill = windChill(temperature, wind);
    const risk = chill > -10 ? { cs: 'nízké', en: 'low' }
      : chill > -28 ? { cs: 'mírné, chraňte obličej a ruce', en: 'moderate, cover face and hands' }
        : chill > -40 ? { cs: 'vysoké, omrzliny do 10–30 minut', en: 'high, frostbite within 10–30 minutes' }
          : { cs: 'velmi vysoké, omrzliny do 10 minut', en: 'very high, frostbite within 10 minutes' };
    return { values: { windChill: chill, difference: chill - temperature, risk }, warnings: [] };
  },
  references: [{ title: 'Environment and Climate Change Canada: Wind chill index', url: 'https://www.canada.ca/en/environment-climate-change/services/weather-health/wind-chill-cold-weather/wind-chill-index.html' }],
};
