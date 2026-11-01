/**
 * Gear and pulley ratios, output speed and torque, belt length.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Open belt length for two pulleys, mm.
 * @param {number} d1 driver diameter
 * @param {number} d2 driven diameter
 * @param {number} centre centre distance
 */
export function beltLength(d1, d2, centre) {
  return 2 * centre + Math.PI * (d1 + d2) / 2 + (d2 - d1) ** 2 / (4 * centre);
}

const inputs = [
  {
    id: 'kind', type: 'select', default: 'pulleys', label: { cs: 'Převod', en: 'Drive' },
    options: [
      { value: 'gears', label: { cs: 'ozubená kola (počty zubů)', en: 'gears (tooth counts)' } },
      { value: 'pulleys', label: { cs: 'řemenice (průměry v mm)', en: 'pulleys (diameters in mm)' } },
    ],
  },
  { id: 'driver', type: 'number', default: 100, min: 0.01, max: 1e6, step: 1, label: { cs: 'Hnací kolo (zuby nebo průměr)', en: 'Driving wheel (teeth or diameter)' } },
  { id: 'driven', type: 'number', default: 300, min: 0.01, max: 1e6, step: 1, label: { cs: 'Hnané kolo (zuby nebo průměr)', en: 'Driven wheel (teeth or diameter)' } },
  { id: 'rpm', type: 'number', default: 1450, min: 0, max: 1e7, step: 10, unit: { cs: 'ot/min', en: 'rpm' }, label: { cs: 'Otáčky na vstupu', en: 'Input speed' } },
  { id: 'torque', type: 'number', default: 10, min: 0, max: 1e9, step: 1, unit: 'N·m', label: { cs: 'Moment na vstupu', en: 'Input torque' } },
  { id: 'efficiency', type: 'number', default: 97, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Účinnost převodu', en: 'Drive efficiency' } },
  { id: 'centre', type: 'number', default: 400, min: 1, max: 1e6, step: 5, unit: 'mm', label: { cs: 'Osová vzdálenost řemenic', en: 'Pulley centre distance' } },
];

const outputs = [
  { id: 'ratio', label: { cs: 'Převodový poměr i', en: 'Ratio i' }, significant: 5 },
  { id: 'outputRpm', label: { cs: 'Otáčky na výstupu', en: 'Output speed' }, unit: { cs: 'ot/min', en: 'rpm' }, significant: 5 },
  { id: 'outputTorque', label: { cs: 'Moment na výstupu', en: 'Output torque' }, unit: 'N·m', significant: 5 },
  { id: 'power', label: { cs: 'Přenášený výkon', en: 'Power transmitted' }, unit: 'kW', significant: 4 },
  { id: 'belt', label: { cs: 'Délka řemene (řemenice)', en: 'Belt length (pulleys)' }, unit: 'mm', precision: 0 },
];

export default {
  id: 'gear-ratio',
  kind: 'calculator',
  category: 'eng-mechanical',
  tags: ['engineering'],
  name: { cs: 'Převody (ozubená kola, řemenice)', en: 'Gear and pulley ratios' },
  description: {
    cs: 'Převodový poměr i = hnané / hnací, výstupní otáčky n₂ = n₁ / i a moment M₂ = M₁ · i · η. Co se získá na momentu, ztratí se na otáčkách; výkon zůstává až na ztráty. U řemenic spočítá i délku otevřeného řemene z průměrů a osové vzdálenosti (prokluz zanedbává).',
    en: 'Ratio i = driven / driving, output speed n₂ = n₁ / i and torque T₂ = T₁ · i · η. What is gained in torque is lost in speed; power stays the same except for losses. For pulleys it also works out the open belt length from the diameters and centre distance (slip ignored).',
  },
  keywords: {
    cs: ['převod', 'převodový poměr', 'ozubená kola', 'řemenice', 'řemen', 'otáčky', 'moment', 'délka řemene'],
    en: ['gear ratio', 'pulley ratio', 'gears', 'pulleys', 'belt', 'speed', 'torque', 'belt length'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { kind, driver, driven, rpm, torque, efficiency, centre } = read.values;
    const ratio = driven / driver;
    const warnings = kind === 'pulleys' && centre < (driver + driven) / 2
      ? [{ cs: 'Řemenice se při této osové vzdálenosti překrývají.', en: 'The pulleys overlap at this centre distance.' }]
      : [];
    return {
      values: {
        ratio,
        outputRpm: rpm / ratio,
        outputTorque: torque * ratio * efficiency / 100,
        power: torque * rpm * 2 * Math.PI / 60 / 1000,
        belt: kind === 'pulleys' ? beltLength(driver, driven, centre) : null,
      },
      warnings,
    };
  },
  references: [{ title: 'Shigley\'s Mechanical Engineering Design – gear trains and belt drives' }],
};
