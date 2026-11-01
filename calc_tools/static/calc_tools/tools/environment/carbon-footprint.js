/**
 * Carbon footprint of energy use and travel.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Emission factors, kg CO₂ per unit. Fuels: direct combustion (IPCC 2006
 * defaults); flights per passenger-km including the climate effect of
 * high-altitude emissions (UK DESNZ factors); electricity set by the user.
 */
export const EMISSION_FACTORS = {
  naturalGas: 1.98,
  petrol: 2.31,
  diesel: 2.68,
  lpg: 1.61,
  heatingOil: 2.68,
  coal: 2.42,
  brownCoal: 1.1,
  flight: 0.15,
};

const inputs = [
  {
    id: 'items', type: 'list', min: 1, max: 20, label: { cs: 'Položka', en: 'Item' },
    fields: [
      {
        id: 'activity', type: 'select', default: 'electricity', label: { cs: 'Činnost', en: 'Activity' },
        options: [
          { value: 'electricity', label: { cs: 'elektřina (kWh)', en: 'electricity (kWh)' } },
          { value: 'naturalGas', label: { cs: 'zemní plyn (m³)', en: 'natural gas (m³)' } },
          { value: 'petrol', label: { cs: 'benzín (l)', en: 'petrol (l)' } },
          { value: 'diesel', label: { cs: 'nafta (l)', en: 'diesel (l)' } },
          { value: 'lpg', label: { cs: 'LPG (l)', en: 'LPG (l)' } },
          { value: 'heatingOil', label: { cs: 'topný olej (l)', en: 'heating oil (l)' } },
          { value: 'coal', label: { cs: 'černé uhlí (kg)', en: 'hard coal (kg)' } },
          { value: 'brownCoal', label: { cs: 'hnědé uhlí (kg)', en: 'brown coal (kg)' } },
          { value: 'flight', label: { cs: 'let letadlem (km na osobu)', en: 'flight (km per passenger)' } },
        ],
      },
      { id: 'amount', type: 'number', default: 3000, min: 0, max: 1e9, step: 1, label: { cs: 'Množství', en: 'Amount' } },
    ],
  },
  { id: 'electricity', type: 'number', default: 0.45, min: 0, max: 2, step: 0.01, unit: 'kg/kWh', label: { cs: 'Emise elektřiny (ČR ≈ 0,4–0,5; obnovitelná ≈ 0)', en: 'Electricity emissions (Czechia ≈ 0.4–0.5; renewable ≈ 0)' } },
];

const outputs = [
  { id: 'total', label: { cs: 'Emise CO₂ celkem', en: 'Total CO₂ emissions' }, unit: 'kg', precision: 0 },
  { id: 'tonnes', label: { cs: 'Emise CO₂ celkem', en: 'Total CO₂ emissions' }, unit: 't', precision: 2 },
  { id: 'items', type: 'list', label: { cs: 'Emise položky', en: 'Emissions of item' }, unit: 'kg', precision: 0 },
  { id: 'trees', label: { cs: 'Stromů na vyrovnání za rok (≈ 22 kg CO₂ na strom)', en: 'Trees to offset in a year (≈ 22 kg CO₂ per tree)' }, precision: 0 },
];

export default {
  id: 'carbon-footprint',
  kind: 'calculator',
  category: 'environment',
  tags: ['environment'],
  name: { cs: 'Uhlíková stopa (spotřeba → CO₂)', en: 'Carbon footprint (use → CO₂)' },
  description: {
    cs: 'Kolik CO₂ vznikne spotřebou elektřiny, plynu, paliv a uhlí nebo letem letadlem. Paliva podle emisních faktorů spalování IPCC (litr benzínu 2,31 kg, nafty 2,68 kg CO₂), elektřinu podle zadaného faktoru – česká síť má asi 0,4–0,5 kg/kWh, s obnovitelnými zdroji téměř nulu. Nezahrnuje těžbu a dopravu paliv ani jiné skleníkové plyny.',
    en: 'How much CO₂ comes from using electricity, gas, fuels and coal or from flying. Fuels by IPCC combustion emission factors (a litre of petrol 2.31 kg, of diesel 2.68 kg CO₂), electricity by the factor you set – the Czech grid is about 0.4–0.5 kg/kWh, renewables close to zero. Extraction and transport of fuels and other greenhouse gases are not included.',
  },
  keywords: {
    cs: ['uhlíková stopa', 'co2', 'emise', 'oxid uhličitý', 'skleníkové plyny', 'spotřeba', 'benzín', 'elektřina', 'let'],
    en: ['carbon footprint', 'co2', 'emissions', 'carbon dioxide', 'greenhouse gases', 'fuel', 'electricity', 'flight'],
  },
  inputs,
  outputs,
  compute(values) {
    const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
    const read = readInputs(inputs, { ...source, items: Object.hasOwn(source, 'items') && source.items != null ? source.items : [{}] });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { items, electricity } = read.values;
    const emissions = items.map((/** @type {any} */ item) => item.amount
      * (item.activity === 'electricity' ? electricity : EMISSION_FACTORS[/** @type {keyof typeof EMISSION_FACTORS} */ (item.activity)]));
    const total = emissions.reduce((/** @type {number} */ sum, /** @type {number} */ value) => sum + value, 0);
    return { values: { total, tonnes: total / 1000, items: emissions, trees: total / 22 }, warnings: [] };
  },
  references: [
    { title: '2006 IPCC Guidelines for National Greenhouse Gas Inventories, vol. 2 – stationary and mobile combustion', url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html' },
    { title: 'UK DESNZ: Greenhouse gas reporting – conversion factors (business travel, air)', url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting' },
  ],
};
