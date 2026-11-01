/**
 * Salting and curing: salt by percentage, dry or equilibrium, and nitrite curing salt.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Sodium nitrite in curing salts, as a share. */
export const CURING_SALTS = { eu: 0.006, prague1: 0.0625 };

const inputs = [
  {
    id: 'method', type: 'select', default: 'dry', label: { cs: 'Způsob', en: 'Method' },
    options: [
      { value: 'dry', label: { cs: 'nasucho (sůl na hmotnost suroviny)', en: 'dry (salt on the weight of the food)' } },
      { value: 'equilibrium', label: { cs: 'rovnovážné (surovina + voda)', en: 'equilibrium (food + water)' } },
    ],
  },
  { id: 'food', type: 'number', default: 1000, min: 0, max: 1e7, step: 10, unit: 'g', label: { cs: 'Hmotnost suroviny', en: 'Weight of the food' } },
  { id: 'water', type: 'number', default: 0, min: 0, max: 1e7, step: 10, unit: 'g', label: { cs: 'Voda (rovnovážné solení)', en: 'Water (equilibrium method)' } },
  { id: 'percent', type: 'number', default: 2, min: 0, max: 30, step: 0.1, unit: '%', label: { cs: 'Obsah soli', en: 'Salt content' } },
  {
    id: 'curing', type: 'select', default: 'none', label: { cs: 'Solicí směs s dusitanem', en: 'Nitrite curing salt' },
    options: [
      { value: 'none', label: { cs: 'bez dusitanu (jen kuchyňská sůl)', en: 'none (table salt only)' } },
      { value: 'eu', label: { cs: 'dusitanová solicí směs (0,6 % NaNO₂) – místo soli', en: 'nitrite curing salt (0.6 % NaNO₂) – instead of salt' } },
      { value: 'prague1', label: { cs: 'Prague Powder #1 (6,25 % NaNO₂) – přidat k soli', en: 'Prague Powder #1 (6.25 % NaNO₂) – added to salt' } },
    ],
  },
  { id: 'nitrite', type: 'number', default: 120, min: 0, max: 200, step: 5, unit: 'mg/kg', label: { cs: 'Cílový dusitan (Prague Powder)', en: 'Target nitrite (Prague Powder)' } },
];

const outputs = [
  { id: 'salt', label: { cs: 'Kuchyňské soli', en: 'Table salt' }, unit: 'g', precision: 1 },
  { id: 'curingSalt', label: { cs: 'Solicí směsi', en: 'Curing salt' }, unit: 'g', precision: 2 },
  { id: 'nitritePpm', label: { cs: 'Dusitan sodný v hotovém výrobku', en: 'Sodium nitrite in the product' }, unit: 'mg/kg', precision: 0 },
];

export default {
  id: 'salting',
  kind: 'calculator',
  category: 'food-preserving',
  tags: ['food'],
  name: { cs: 'Solení a nakládání (% soli)', en: 'Salting and curing (% salt)' },
  description: {
    cs: 'Kolik soli na danou slanost. Nasucho se sůl počítá z hmotnosti suroviny (maso na uzení obvykle 2–3 %), rovnovážně ze suroviny i vody, ve které se nakládá – výsledek pak nemůže přesolit. Dusitanová solicí směs (0,6 %) nahrazuje sůl; Prague Powder #1 se dávkuje zvlášť na cílový obsah dusitanu (EU povoluje u masných výrobků nejvýš 150 mg/kg). Dusitany jsou ve větším množství jedovaté – važte přesně.',
    en: 'How much salt for a given saltiness. Dry salting counts the salt on the weight of the food (meat for smoking usually 2–3 %), equilibrium salting on both the food and the water it sits in – it then cannot over-salt. Nitrite curing salt (0.6 %) replaces the salt; Prague Powder #1 is dosed separately for a target nitrite level (the EU allows at most 150 mg/kg in meat products). Nitrites are toxic in larger amounts – weigh precisely.',
  },
  keywords: {
    cs: ['solení', 'nakládání', 'sůl', 'procento soli', 'rovnovážné solení', 'dusitanová solicí směs', 'uzení', 'nasolení masa'],
    en: ['salting', 'curing', 'salt percentage', 'equilibrium brine', 'curing salt', 'prague powder', 'pink salt', 'nitrite'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { method, food, water, percent, curing, nitrite } = read.values;
    const base = method === 'equilibrium' ? food + water : food;
    const totalSalt = base * percent / 100;
    let salt = totalSalt;
    let curingSalt = 0;
    let nitritePpm = 0;
    if (curing === 'eu') {
      curingSalt = totalSalt;
      salt = 0;
      nitritePpm = curingSalt * CURING_SALTS.eu / base * 1e6;
    } else if (curing === 'prague1') {
      curingSalt = base * nitrite / 1e6 / CURING_SALTS.prague1;
      nitritePpm = nitrite;
    }
    const warnings = nitritePpm > 150
      ? [{ cs: 'Dusitan přesahuje 150 mg/kg, nejvyšší množství povolené v EU.', en: 'Nitrite exceeds 150 mg/kg, the EU maximum.' }]
      : [];
    return { values: { salt, curingSalt, nitritePpm }, warnings };
  },
  references: [
    { title: 'Commission Regulation (EU) No 1129/2011 – E 250 sodium nitrite in meat products (max. 150 mg/kg)', url: 'https://eur-lex.europa.eu/eli/reg/2011/1129/oj' },
    { title: 'USDA FSIS: Processing inspectors\' calculations handbook – curing agents' },
  ],
};
