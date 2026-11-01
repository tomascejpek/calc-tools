/**
 * Rough heating and cooling power for a room.
 */

import { BTU } from '../units/energy.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Heat loss per m³ of room at the design outdoor temperature, W/m³. */
export const HEATING_PER_M3 = { passive: 10, new: 20, renovated: 30, old: 45, uninsulated: 60 };
/** Cooling load per m² of floor, W/m², by sun exposure. */
export const COOLING_PER_M2 = { shaded: 70, normal: 90, sunny: 120 };

const inputs = [
  { id: 'area', type: 'number', default: 20, min: 0.1, max: 1e5, step: 0.5, unit: 'm²', label: { cs: 'Podlahová plocha', en: 'Floor area' } },
  { id: 'height', type: 'number', default: 2.6, min: 1.5, max: 20, step: 0.1, unit: 'm', label: { cs: 'Výška místnosti', en: 'Room height' } },
  {
    id: 'building', type: 'select', default: 'renovated', label: { cs: 'Stav budovy', en: 'Building' },
    options: [
      { value: 'passive', label: { cs: 'pasivní dům (≈ 10 W/m³)', en: 'passive house (≈ 10 W/m³)' } },
      { value: 'new', label: { cs: 'novostavba, dobře zateplená (≈ 20 W/m³)', en: 'new, well insulated (≈ 20 W/m³)' } },
      { value: 'renovated', label: { cs: 'zateplený starší dům (≈ 30 W/m³)', en: 'older, insulated (≈ 30 W/m³)' } },
      { value: 'old', label: { cs: 'starší dům, původní okna (≈ 45 W/m³)', en: 'older, original windows (≈ 45 W/m³)' } },
      { value: 'uninsulated', label: { cs: 'nezateplený (≈ 60 W/m³)', en: 'uninsulated (≈ 60 W/m³)' } },
    ],
  },
  {
    id: 'sun', type: 'select', default: 'normal', label: { cs: 'Oslunění (pro chlazení)', en: 'Sun exposure (for cooling)' },
    options: [
      { value: 'shaded', label: { cs: 'stín, sever', en: 'shaded, north' } },
      { value: 'normal', label: { cs: 'běžné', en: 'normal' } },
      { value: 'sunny', label: { cs: 'velká okna na jih nebo západ, podkroví', en: 'large south or west windows, attic' } },
    ],
  },
  { id: 'people', type: 'number', default: 2, min: 0, max: 1000, step: 1, label: { cs: 'Počet osob (chlazení +100 W na osobu)', en: 'People (cooling +100 W each)' } },
  { id: 'appliances', type: 'number', default: 200, min: 0, max: 1e6, step: 50, unit: 'W', label: { cs: 'Spotřebiče a osvětlení (chlazení)', en: 'Appliances and lighting (cooling)' } },
];

const outputs = [
  { id: 'heating', label: { cs: 'Potřebný výkon topení', en: 'Heating power needed' }, unit: 'kW', precision: 2 },
  { id: 'cooling', label: { cs: 'Potřebný výkon klimatizace', en: 'Cooling power needed' }, unit: 'kW', precision: 2 },
  { id: 'coolingBtu', label: { cs: 'Výkon klimatizace', en: 'Cooling power' }, unit: 'BTU/h', precision: 0 },
  { id: 'volume', label: { cs: 'Objem místnosti', en: 'Room volume' }, unit: 'm³', precision: 1 },
];

export default {
  id: 'room-climate',
  kind: 'calculator',
  category: 'eng-air',
  tags: ['engineering'],
  name: { cs: 'Výkon topení a klimatizace pro místnost', en: 'Heating and cooling power for a room' },
  description: {
    cs: 'Hrubý odhad výkonu topení podle objemu místnosti a stavu budovy a výkonu klimatizace podle plochy, oslunění, počtu osob a spotřebičů. Jde o praktická pravidla pro výběr spotřebiče; skutečnou tepelnou ztrátu stanoví výpočet podle ČSN EN 12831. Klimatizace se často prodávají podle BTU/h (9000 BTU/h ≈ 2,6 kW).',
    en: 'A rough estimate of heating power by room volume and building standard, and of cooling power by floor area, sun, people and appliances. These are rules of thumb for choosing a unit; the real heat loss comes from a calculation by EN 12831. Air conditioners are often sold by BTU/h (9000 BTU/h ≈ 2.6 kW).',
  },
  keywords: {
    cs: ['výkon topení', 'klimatizace', 'tepelná ztráta', 'radiátor', 'tepelné čerpadlo', 'btu', 'chladicí výkon', 'místnost'],
    en: ['heating power', 'air conditioning', 'cooling load', 'heat loss', 'radiator', 'heat pump', 'btu', 'room'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { area, height, building, sun, people, appliances } = read.values;
    const volume = area * height;
    const heating = volume * HEATING_PER_M3[/** @type {keyof typeof HEATING_PER_M3} */ (building)] / 1000;
    const cooling = (area * COOLING_PER_M2[/** @type {keyof typeof COOLING_PER_M2} */ (sun)] + people * 100 + appliances) / 1000;
    return { values: { heating, cooling, coolingBtu: cooling * 1000 * 3600 / BTU, volume }, warnings: [] };
  },
  references: [
    { title: 'ČSN EN 12831-1: Energetická náročnost budov – Výpočet tepelného výkonu' },
    { title: 'ASHRAE Handbook – Fundamentals: rules of thumb for cooling loads' },
  ],
};
