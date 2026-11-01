/**
 * Combined gas law p₁V₁/T₁ = p₂V₂/T₂ (Boyle–Mariotte, Gay-Lussac, Charles).
 */

import { KELVIN } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'find', type: 'select', default: 'v2', label: { cs: 'Hledám', en: 'Find' },
    options: [
      { value: 'p2', label: { cs: 'konečný tlak p₂', en: 'final pressure p₂' } },
      { value: 'v2', label: { cs: 'konečný objem V₂', en: 'final volume V₂' } },
      { value: 't2', label: { cs: 'konečnou teplotu T₂', en: 'final temperature T₂' } },
    ],
  },
  { id: 'p1', type: 'number', default: 100, min: 1e-9, max: 1e9, step: 1, unit: 'kPa', label: { cs: 'Počáteční tlak p₁ (absolutní)', en: 'Initial pressure p₁ (absolute)' } },
  { id: 'v1', type: 'number', default: 10, min: 1e-12, max: 1e12, step: 0.1, unit: 'l', label: { cs: 'Počáteční objem V₁', en: 'Initial volume V₁' } },
  { id: 't1', type: 'number', default: 20, min: -273.149, max: 1e6, step: 1, unit: '°C', label: { cs: 'Počáteční teplota T₁', en: 'Initial temperature T₁' } },
  { id: 'p2', type: 'number', default: 200, min: 1e-9, max: 1e9, step: 1, unit: 'kPa', label: { cs: 'Konečný tlak p₂', en: 'Final pressure p₂' } },
  { id: 'v2', type: 'number', default: 5, min: 1e-12, max: 1e12, step: 0.1, unit: 'l', label: { cs: 'Konečný objem V₂', en: 'Final volume V₂' } },
  { id: 't2', type: 'number', default: 20, min: -273.149, max: 1e6, step: 1, unit: '°C', label: { cs: 'Konečná teplota T₂', en: 'Final temperature T₂' } },
];

const outputs = [
  { id: 'p2', label: { cs: 'Konečný tlak p₂', en: 'Final pressure p₂' }, unit: 'kPa', significant: 6 },
  { id: 'v2', label: { cs: 'Konečný objem V₂', en: 'Final volume V₂' }, unit: 'l', significant: 6 },
  { id: 't2', label: { cs: 'Konečná teplota T₂', en: 'Final temperature T₂' }, unit: '°C', significant: 6 },
];

export default {
  id: 'gas-laws',
  kind: 'calculator',
  category: 'physics-gases',
  tags: ['physics'],
  name: { cs: 'Plynové zákony (Boyle–Mariotte, Gay-Lussac)', en: 'Gas laws (Boyle, Charles, Gay-Lussac)' },
  description: {
    cs: 'Stavová změna stálého množství plynu: p₁V₁/T₁ = p₂V₂/T₂. Při stálé teplotě platí Boyleův–Mariottův zákon (dvojnásobný tlak = poloviční objem), při stálém tlaku Gay-Lussacův (objem roste s absolutní teplotou), při stálém objemu Charlesův. Vybranou hledanou hodnotu výpočet ignoruje; tlaky jsou absolutní.',
    en: 'A change of state of a fixed amount of gas: p₁V₁/T₁ = p₂V₂/T₂. At constant temperature Boyle\'s law holds (double the pressure = half the volume), at constant pressure Charles\'s law (volume grows with absolute temperature), at constant volume Gay-Lussac\'s law. The sought value in the form is ignored; pressures are absolute.',
  },
  keywords: {
    cs: ['plynové zákony', 'boyleův zákon', 'boyle mariotte', 'gay-lussac', 'charlesův zákon', 'izotermický', 'izobarický', 'izochorický'],
    en: ['gas laws', 'boyle law', 'charles law', 'gay-lussac law', 'combined gas law', 'isothermal', 'isobaric', 'isochoric'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { find, p1, v1 } = read.values;
    const t1 = read.values.t1 + KELVIN;
    let { p2, v2 } = read.values;
    let t2 = read.values.t2 + KELVIN;
    const constant = p1 * v1 / t1;
    if (find === 'p2') p2 = constant * t2 / v2;
    else if (find === 'v2') v2 = constant * t2 / p2;
    else t2 = p2 * v2 / constant;
    return { values: { p2, v2, t2: t2 - KELVIN }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – ideal gases' }],
};
