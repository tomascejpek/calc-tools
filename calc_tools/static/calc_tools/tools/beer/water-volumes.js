/**
 * Brewing water: mash and sparge volumes from the batch size and losses.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * @typedef {object} Brewhouse
 * @property {number} grain kg
 * @property {number} batch l into the fermenter
 * @property {number} boilMinutes
 * @property {number} evaporation l/h
 * @property {number} absorption l/kg of grain
 * @property {number} tunDeadSpace l
 * @property {number} kettleLoss l of trub and dead space in the kettle
 * @property {number} shrinkage % of volume lost by cooling
 * @property {number} ratio mash water, l/kg
 */

/**
 * Water volumes of a brew day, worked back from the fermenter.
 * @param {Brewhouse} brewhouse
 */
export function waterVolumes({ grain, batch, boilMinutes, evaporation, absorption, tunDeadSpace, kettleLoss, shrinkage, ratio }) {
  const postBoilCold = batch + kettleLoss;
  const postBoil = postBoilCold / (1 - shrinkage / 100);
  const boilOff = evaporation * boilMinutes / 60;
  const preBoil = postBoil + boilOff;
  const absorbed = absorption * grain;
  const total = preBoil + absorbed + tunDeadSpace;
  const mash = Math.min(ratio * grain, total);
  return { total, mash, sparge: total - mash, preBoil, postBoil, boilOff, absorbed, clamped: ratio * grain > total };
}

const inputs = [
  { id: 'batch', type: 'number', default: 20, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem do kvasné nádoby', en: 'Volume into the fermenter' } },
  { id: 'grain', type: 'number', default: 5, min: 0, max: 10000, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost sladu', en: 'Grain weight' } },
  { id: 'ratio', type: 'number', default: 3.5, min: 1, max: 10, step: 0.1, unit: 'l/kg', label: { cs: 'Poměr vystírací voda/slad', en: 'Mash water to grain ratio' } },
  { id: 'boilMinutes', type: 'number', default: 90, min: 0, max: 300, step: 5, unit: 'min', label: { cs: 'Doba chmelovaru', en: 'Boil time' } },
  { id: 'evaporation', type: 'number', default: 3, min: 0, max: 1000, step: 0.1, unit: 'l/h', label: { cs: 'Odpar', en: 'Evaporation rate' } },
  { id: 'absorption', type: 'number', default: 1.0, min: 0, max: 3, step: 0.05, unit: 'l/kg', label: { cs: 'Absorpce vody v mlátě', en: 'Grain absorption' } },
  { id: 'tunDeadSpace', type: 'number', default: 1, min: 0, max: 10000, step: 0.1, unit: 'l', label: { cs: 'Mrtvý prostor scezovací kádě', en: 'Lauter tun dead space' } },
  { id: 'kettleLoss', type: 'number', default: 1.5, min: 0, max: 10000, step: 0.1, unit: 'l', label: { cs: 'Ztráty v mladinové pánvi (kaly)', en: 'Kettle losses (trub, dead space)' } },
  { id: 'shrinkage', type: 'number', default: 4, min: 0, max: 10, step: 0.5, unit: '%', label: { cs: 'Smrštění chlazením', en: 'Cooling shrinkage' } },
];

const outputs = [
  { id: 'total', label: { cs: 'Voda celkem', en: 'Total water' }, unit: 'l', precision: 1 },
  { id: 'mash', label: { cs: 'Vystírací voda', en: 'Mash water' }, unit: 'l', precision: 1 },
  { id: 'sparge', label: { cs: 'Vyslazovací voda', en: 'Sparge water' }, unit: 'l', precision: 1 },
  { id: 'preBoil', label: { cs: 'Objem před chmelovarem', en: 'Pre-boil volume' }, unit: 'l', precision: 1 },
  { id: 'postBoil', label: { cs: 'Objem po chmelovaru (horký)', en: 'Post-boil volume (hot)' }, unit: 'l', precision: 1 },
  { id: 'boilOff', label: { cs: 'Odpaří se', en: 'Boiled off' }, unit: 'l', precision: 1 },
  { id: 'absorbed', label: { cs: 'Zůstane v mlátě', en: 'Absorbed by the grain' }, unit: 'l', precision: 1 },
  { id: 'totalRatio', label: { cs: 'Poměr voda celkem/slad', en: 'Total water to grain ratio' }, unit: 'l/kg', precision: 2 },
];

export default {
  id: 'water-volumes',
  kind: 'calculator',
  category: 'water',
  tags: ['beer'],
  name: { cs: 'Objem vystírací a vyslazovací vody', en: 'Mash and sparge water volumes' },
  description: {
    cs: 'Kolik vody připravit na várku: počítá zpět od objemu v kvasné nádobě přes ztráty v pánvi, smrštění chlazením, odpar při chmelovaru, absorpci vody v mlátě a mrtvý prostor scezovací kádě. Vystírací voda je dána poměrem voda/slad, zbytek je na vyslazování.',
    en: 'How much water to prepare for a batch: works back from the fermenter volume through kettle losses, cooling shrinkage, boil-off, grain absorption and the lauter tun dead space. Mash water follows the water to grain ratio; the rest is for sparging.',
  },
  keywords: {
    cs: ['voda', 'vystírací voda', 'vyslazovací voda', 'vyslazování', 'objem vody', 'ztráty', 'odpar', 'absorpce', 'mláto', 'mrtvý prostor', 'poměr voda slad'],
    en: ['water volume', 'mash water', 'sparge water', 'sparge', 'boil-off', 'evaporation', 'grain absorption', 'dead space', 'losses', 'water to grain ratio'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const volumes = waterVolumes(/** @type {Brewhouse} */ (read.values));
    const warnings = [];
    if (volumes.clamped) {
      warnings.push({
        cs: 'Při tomto poměru by vystírací voda přesáhla celkovou potřebu; všechna voda jde do vystírky a vyslazovat se nebude.',
        en: 'At this ratio the mash water would exceed the total; all water goes into the mash and there is no sparge.',
      });
    }
    const { grain } = read.values;
    return {
      values: {
        total: volumes.total,
        mash: volumes.mash,
        sparge: volumes.sparge,
        preBoil: volumes.preBoil,
        postBoil: volumes.postBoil,
        boilOff: volumes.boilOff,
        absorbed: volumes.absorbed,
        totalRatio: grain > 0 ? volumes.total / grain : null,
      },
      warnings,
    };
  },
  references: [
    { title: 'Palmer, J.: How to Brew, 4th ed., ch. 17 – Calculating water volumes (absorption about 1 l/kg)' },
  ],
};
