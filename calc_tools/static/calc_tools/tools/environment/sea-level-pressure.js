/**
 * Station pressure reduced to sea level (and back).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Sea-level pressure from station pressure, altitude and temperature (hypsometric reduction).
 * @param {number} pressure hPa at the station
 * @param {number} altitude m
 * @param {number} celsius air temperature at the station
 */
export function seaLevelPressure(pressure, altitude, celsius) {
  return pressure * (1 - 0.0065 * altitude / (celsius + 0.0065 * altitude + 273.15)) ** -5.257;
}

const inputs = [
  {
    id: 'find', type: 'select', default: 'sea', label: { cs: 'Převést', en: 'Convert' },
    options: [
      { value: 'sea', label: { cs: 'tlak na stanici → na hladinu moře', en: 'station pressure → sea level' } },
      { value: 'station', label: { cs: 'tlak u hladiny moře → na stanici', en: 'sea-level pressure → station' } },
    ],
  },
  { id: 'pressure', type: 'number', default: 965, min: 300, max: 1100, step: 0.1, unit: 'hPa', label: { cs: 'Tlak', en: 'Pressure' } },
  { id: 'altitude', type: 'number', default: 400, min: -500, max: 9000, step: 10, unit: 'm', label: { cs: 'Nadmořská výška stanice', en: 'Station altitude' } },
  { id: 'temperature', type: 'number', default: 15, min: -60, max: 60, step: 1, unit: '°C', label: { cs: 'Teplota vzduchu na stanici', en: 'Air temperature at the station' } },
];

const outputs = [
  { id: 'sea', label: { cs: 'Tlak přepočtený na hladinu moře', en: 'Sea-level pressure' }, unit: 'hPa', precision: 1 },
  { id: 'station', label: { cs: 'Tlak na stanici', en: 'Station pressure' }, unit: 'hPa', precision: 1 },
  { id: 'difference', label: { cs: 'Rozdíl', en: 'Difference' }, unit: 'hPa', precision: 1 },
];

export default {
  id: 'sea-level-pressure',
  kind: 'calculator',
  category: 'environment',
  tags: ['environment'],
  name: { cs: 'Tlak přepočtený na hladinu moře', en: 'Sea-level pressure' },
  description: {
    cs: 'Barometr ukazuje tlak v místě (stanici), předpovědi a mapy ale tlak přepočtený na hladinu moře, aby se daly srovnat místa v různé výšce. Ve 400 m n. m. je tlak asi o 47 hPa nižší. Přepočet podle barometrické rovnice se skutečnou teplotou na stanici.',
    en: 'A barometer shows the pressure at its location (station), but forecasts and maps use pressure reduced to sea level so places at different heights compare. At 400 m the pressure is about 47 hPa lower. Reduced by the barometric equation with the actual station temperature.',
  },
  keywords: {
    cs: ['tlak vzduchu', 'barometr', 'tlak na hladině moře', 'přepočet tlaku', 'hpa', 'meteostanice', 'qnh'],
    en: ['air pressure', 'barometer', 'sea level pressure', 'pressure reduction', 'hpa', 'weather station', 'qnh'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { find, pressure, altitude, temperature } = read.values;
    const factor = seaLevelPressure(1, altitude, temperature);
    const sea = find === 'sea' ? pressure * factor : pressure;
    const station = find === 'sea' ? pressure : pressure / factor;
    return { values: { sea, station, difference: sea - station }, warnings: [] };
  },
  references: [{ title: 'WMO Guide to Instruments and Methods of Observation (WMO-No. 8), ch. 3 – reduction of pressure to sea level' }],
};
