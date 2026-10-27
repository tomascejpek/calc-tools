/**
 * Dissolved CO₂: volumes ⇄ grams per litre.
 */

import { CO2_G_PER_L_PER_VOLUME, co2GramsPerLitreToVolumes, co2VolumesToGramsPerLitre } from '../../core/units.js';

export { co2GramsPerLitreToVolumes, co2VolumesToGramsPerLitre };

export default {
  id: 'co2',
  kind: 'converter',
  category: 'units',
  tags: ['beer'],
  name: { cs: 'Převod obsahu CO₂', en: 'CO₂ content converter' },
  description: {
    cs: `Převod nasycení piva oxidem uhličitým mezi objemy CO₂ a gramy na litr. Jeden objem odpovídá ${String(CO2_G_PER_L_PER_VOLUME).replace('.', ',')} g/l (hustota CO₂ při 0 °C a 101,325 kPa).`,
    en: `Converts beer carbonation between volumes of CO₂ and grams per litre. One volume equals ${CO2_G_PER_L_PER_VOLUME} g/l (density of CO₂ at 0 °C and 101.325 kPa).`,
  },
  keywords: {
    cs: ['sycení', 'nasycení', 'oxid uhličitý', 'co2', 'objemy', 'perlivost', 'říz'],
    en: ['carbonation', 'co2', 'carbon dioxide', 'volumes', 'grams per litre'],
  },
  units: [
    { id: 'volumes', default: 2.5, label: { cs: 'objemy CO₂', en: 'volumes CO₂' }, precision: 2, min: 0, max: 10 },
    { id: 'g-l', label: { cs: 'g/l', en: 'g/l' }, precision: 2, min: 0, max: 20 },
  ],
  toBase(value, unitId) {
    if (unitId === 'volumes') return value;
    if (unitId === 'g-l') return co2GramsPerLitreToVolumes(value);
    return null;
  },
  fromBase(value, unitId) {
    if (unitId === 'volumes') return value;
    if (unitId === 'g-l') return co2VolumesToGramsPerLitre(value);
    return null;
  },
  references: [
    { title: 'Wikipedia: Carbon dioxide (density at STP)', url: 'https://en.wikipedia.org/wiki/Carbon_dioxide' },
  ],
};
