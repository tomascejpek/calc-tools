/**
 * BU:GU – balance of bitterness against original gravity.
 */

import { readGravities, scaleInput } from '../../core/gravity.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { gravityPoints } from '../../core/units.js';

/**
 * @param {number} ibu
 * @param {number} og SG
 * @returns {number | null}
 */
export function buGu(ibu, og) {
  const points = gravityPoints(og);
  return points > 0 ? ibu / points : null;
}

const inputs = [
  { id: 'ibu', type: 'number', default: 35, min: 0, max: 200, step: 1, unit: 'IBU', label: { cs: 'Hořkost', en: 'Bitterness' } },
  scaleInput('plato'),
  { id: 'og', type: 'number', default: 12, step: 0.1, label: { cs: 'Původní hustota', en: 'Original gravity' } },
];

const outputs = [
  { id: 'ratio', label: { cs: 'Poměr BU:GU', en: 'BU:GU ratio' }, unit: '', precision: 2 },
  { id: 'points', label: { cs: 'Body hustoty (GU)', en: 'Gravity units (GU)' }, unit: '', precision: 1 },
];

export default {
  id: 'bu-gu',
  kind: 'calculator',
  category: 'hops',
  tags: ['beer'],
  name: { cs: 'Poměr BU:GU', en: 'BU:GU ratio' },
  description: {
    cs: 'Poměr IBU k bodům původní hustoty (OG 1,048 = 48 bodů). Kolem 0,5 je pivo vyvážené, pod 0,4 převažuje sladkost (bock, weizen), nad 0,7 hořkost (IPA, český ležák bývá kolem 0,8).',
    en: 'IBU divided by the points of original gravity (OG 1.048 = 48 points). Around 0.5 the beer is balanced, below 0.4 it is malty (bock, weizen), above 0.7 bitter (IPA; Czech pale lager is around 0.8).',
  },
  keywords: {
    cs: ['bu:gu', 'bu/gu', 'vyváženost', 'balance', 'ibu', 'sladkost'],
    en: ['bu:gu', 'bu/gu', 'balance', 'bitterness ratio', 'ibu', 'gravity units'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const gravity = readGravities(inputs, read.values, ['og']);
    if (gravity.warnings.length) return emptyResult(outputs, gravity.warnings);
    // The ASBC polynomial maps 0 °P to SG 1.0000116, so check the degree too
    const ratio = gravity.plato.og > 0 ? buGu(read.values.ibu, gravity.sg.og) : null;
    if (ratio === null) {
      return emptyResult(outputs, [{ cs: 'Původní hustota musí být vyšší než hustota vody.', en: 'The original gravity must be above that of water.' }]);
    }
    return { values: { ratio, points: gravityPoints(gravity.sg.og) }, warnings: [] };
  },
  references: [
    { title: 'Daniels, R.: Designing Great Beers. Brewers Publications, 1996 – BU:GU ratio' },
  ],
};
