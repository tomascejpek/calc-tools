/**
 * Alcohol by volume ⇄ alcohol by weight, optionally for a given beer gravity.
 */

import { ETHANOL_SG, abvToAbw, abwToAbv } from '../../core/units.js';

export { abvToAbw, abwToAbv };

const DEFAULT_SG = 1.010;

export default {
  id: 'abv-abw',
  kind: 'converter',
  category: 'units',
  tags: ['beer'],
  name: { cs: 'Převod % obj. a % hm. alkoholu', en: 'ABV ⇄ ABW converter' },
  description: {
    cs: `Převod obsahu alkoholu mezi objemovými a hmotnostními procenty: % hm. = ${String(ETHANOL_SG).replace('.', ',')} × % obj. / hustota piva. Bez zadané hustoty se počítá s typickou konečnou hustotou ${String(DEFAULT_SG).replace('.', ',')}.`,
    en: `Converts alcohol content between percent by volume and by weight: ABW = ${ETHANOL_SG} × ABV / beer gravity. Without a gravity a typical final gravity of ${DEFAULT_SG} is used.`,
  },
  keywords: {
    cs: ['alkohol', 'objemová procenta', 'hmotnostní procenta', 'obj', 'hm'],
    en: ['alcohol', 'abv', 'abw', 'alcohol by volume', 'alcohol by weight'],
  },
  units: [
    { id: 'abv', default: 5, label: { cs: '% obj.', en: '% ABV' }, precision: 2, min: 0, max: 100 },
    { id: 'abw', label: { cs: '% hm.', en: '% ABW' }, precision: 2, min: 0, max: 100 },
  ],
  params: [
    {
      id: 'sg', type: 'number', optional: true, label: { cs: 'Hustota piva', en: 'Beer gravity' },
      unit: 'SG', min: 0.780, max: 1.200, step: 0.001,
    },
  ],
  // Base unit: % ABV
  toBase(value, unitId, params = {}) {
    if (unitId === 'abv') return value;
    if (unitId === 'abw') return abwToAbv(value, params.sg ?? DEFAULT_SG);
    return null;
  },
  fromBase(value, unitId, params = {}) {
    if (unitId === 'abv') return value;
    if (unitId === 'abw') return abvToAbw(value, params.sg ?? DEFAULT_SG);
    return null;
  },
  references: [
    { title: 'Hall, M. L.: Brew by the Numbers – Add Up What\'s in Your Beer. Zymurgy, Summer 1995' },
    { title: 'Wikipedia: Alcohol by volume', url: 'https://en.wikipedia.org/wiki/Alcohol_by_volume' },
  ],
};
