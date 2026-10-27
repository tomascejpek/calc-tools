/**
 * Beer colour converter: EBC, SRM and degrees Lovibond.
 */

import { ebcToSrm, lovibondToSrm, srmToEbc, srmToLovibond } from '../../core/units.js';

export { ebcToSrm, lovibondToSrm, srmToEbc, srmToLovibond };

export default {
  id: 'beer-color',
  kind: 'converter',
  category: 'units',
  tags: ['beer'],
  name: { cs: 'Převod barvy piva', en: 'Beer colour converter' },
  description: {
    cs: 'Převod barvy piva a sladu mezi jednotkami EBC, SRM a °Lovibond. EBC = SRM × 1,97; Lovibond se používá hlavně u sladů.',
    en: 'Converts beer and malt colour between EBC, SRM and degrees Lovibond. EBC = SRM × 1.97; Lovibond is mostly used for malts.',
  },
  keywords: {
    cs: ['barva', 'ebc', 'srm', 'lovibond', 'slad', 'světlé', 'tmavé', 'odstín'],
    en: ['color', 'colour', 'ebc', 'srm', 'lovibond', 'malt', 'beer color'],
  },
  units: [
    { id: 'ebc', default: 20, label: { cs: 'EBC', en: 'EBC' }, precision: 1, min: 0, max: 1500 },
    { id: 'srm', label: { cs: 'SRM', en: 'SRM' }, precision: 1, min: 0, max: 760 },
    { id: 'lovibond', label: { cs: '°L', en: '°L' }, precision: 1, min: 0.56, max: 562 },
  ],
  toBase(value, unitId) {
    if (unitId === 'srm') return value;
    if (unitId === 'ebc') return ebcToSrm(value);
    if (unitId === 'lovibond') return lovibondToSrm(value);
    return null;
  },
  fromBase(value, unitId) {
    if (unitId === 'srm') return value;
    if (unitId === 'ebc') return srmToEbc(value);
    if (unitId === 'lovibond') return srmToLovibond(value);
    return null;
  },
  references: [
    { title: 'Wikipedia: Standard Reference Method', url: 'https://en.wikipedia.org/wiki/Standard_Reference_Method' },
  ],
};
