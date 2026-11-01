/**
 * Fuel or electricity use and the cost of a car trip.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { EMISSION_FACTORS } from '../environment/carbon-footprint.js';

const inputs = [
  { id: 'distance', type: 'number', default: 300, min: 0, max: 1e6, step: 1, unit: 'km', label: { cs: 'Vzdálenost (jedna cesta)', en: 'Distance (one way)' } },
  {
    id: 'returnTrip', type: 'select', default: 'yes', label: { cs: 'Tam i zpět', en: 'Return trip' },
    options: [
      { value: 'yes', label: { cs: 'ano', en: 'yes' } },
      { value: 'no', label: { cs: 'ne', en: 'no' } },
    ],
  },
  {
    id: 'fuel', type: 'select', default: 'petrol', label: { cs: 'Pohon', en: 'Fuel' },
    options: [
      { value: 'petrol', label: { cs: 'benzín (l/100 km)', en: 'petrol (l/100 km)' } },
      { value: 'diesel', label: { cs: 'nafta (l/100 km)', en: 'diesel (l/100 km)' } },
      { value: 'lpg', label: { cs: 'LPG (l/100 km)', en: 'LPG (l/100 km)' } },
      { value: 'electric', label: { cs: 'elektřina (kWh/100 km)', en: 'electricity (kWh/100 km)' } },
    ],
  },
  { id: 'consumption', type: 'number', default: 6.5, min: 0, max: 200, step: 0.1, label: { cs: 'Spotřeba na 100 km', en: 'Consumption per 100 km' } },
  { id: 'price', type: 'number', default: 38, min: 0, max: 1e5, step: 0.1, label: { cs: 'Cena za litr nebo kWh', en: 'Price per litre or kWh' } },
  { id: 'tolls', type: 'number', default: 0, min: 0, max: 1e7, step: 10, label: { cs: 'Mýto, parkování a další (celkem)', en: 'Tolls, parking and other (total)' } },
  { id: 'people', type: 'number', default: 2, min: 1, max: 100, step: 1, label: { cs: 'Počet osob', en: 'People' } },
];

const outputs = [
  { id: 'energy', label: { cs: 'Spotřeba paliva nebo energie', en: 'Fuel or energy used' }, precision: 1 },
  { id: 'cost', label: { cs: 'Cena cesty', en: 'Trip cost' }, precision: 0 },
  { id: 'perPerson', label: { cs: 'Na osobu', en: 'Per person' }, precision: 0 },
  { id: 'perKm', label: { cs: 'Na kilometr', en: 'Per kilometre' }, precision: 2 },
  { id: 'co2', label: { cs: 'Emise CO₂ z paliva', en: 'CO₂ from the fuel' }, unit: 'kg', precision: 0 },
];

export default {
  id: 'trip-cost',
  kind: 'calculator',
  category: 'transport',
  tags: ['transport'],
  name: { cs: 'Spotřeba a cena cesty', en: 'Fuel use and trip cost' },
  description: {
    cs: 'Kolik paliva nebo elektřiny cesta autem spotřebuje a kolik stojí, celkem, na osobu a na kilometr, i s mýtem a parkováním. Emise CO₂ se počítají jen u spalování paliva (litr benzínu 2,31 kg); u elektromobilu závisí na zdroji elektřiny.',
    en: 'How much fuel or electricity a car trip uses and what it costs, in total, per person and per kilometre, including tolls and parking. CO₂ emissions are counted for burning fuel only (a litre of petrol 2.31 kg); for an electric car they depend on the source of the electricity.',
  },
  keywords: {
    cs: ['cena cesty', 'spotřeba paliva', 'náklady na cestu', 'benzín', 'nafta', 'elektromobil', 'cestovné', 'kolik stojí cesta'],
    en: ['trip cost', 'fuel cost', 'fuel consumption', 'petrol', 'diesel', 'electric car', 'travel cost', 'journey cost'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { distance, returnTrip, fuel, consumption, price, tolls, people } = read.values;
    const km = distance * (returnTrip === 'yes' ? 2 : 1);
    const energy = km * consumption / 100;
    const cost = energy * price + tolls;
    const co2 = fuel === 'electric' ? 0 : energy * EMISSION_FACTORS[/** @type {'petrol' | 'diesel' | 'lpg'} */ (fuel)];
    return { values: { energy, cost, perPerson: cost / people, perKm: km > 0 ? cost / km : 0, co2 }, warnings: [] };
  },
  references: [{ title: '2006 IPCC Guidelines, vol. 2, ch. 3 – mobile combustion emission factors' }],
};
