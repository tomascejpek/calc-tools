/**
 * Gravity converter: specific gravity, degrees Plato and degrees Brix.
 */

import { platoToSg, sgToPlato } from '../../core/units.js';

export { platoToSg, sgToPlato };

export default {
  id: 'gravity',
  kind: 'converter',
  category: 'units',
  tags: ['beer'],
  name: { cs: 'Převod hustoty', en: 'Gravity converter' },
  description: {
    cs: 'Převod mezi relativní hustotou (SG), stupni Plato a stupni Brix. Pro mladinu platí °Brix ≈ °P; u kvasícího piva refraktometr kvůli alkoholu ukazuje víc a je potřeba korekce.',
    en: 'Converts between specific gravity (SG), degrees Plato and degrees Brix. For wort °Brix ≈ °P; during fermentation alcohol skews refractometer readings and a correction is needed.',
  },
  keywords: {
    cs: ['stupňovitost', 'stupně', 'hustota', 'mladina', 'extrakt', 'plato', 'balling', 'cukernatost', 'hustoměr', 'refraktometr', 'desítka', 'dvanáctka'],
    en: ['specific gravity', 'sg', 'plato', 'brix', 'balling', 'wort', 'extract', 'hydrometer', 'refractometer', 'original gravity'],
  },
  units: [
    { id: 'sg', default: 1.048, label: { cs: 'SG', en: 'SG' }, precision: 3, min: 0.990, max: 1.200 },
    { id: 'plato', label: { cs: '°P', en: '°P' }, precision: 1, min: -2.6, max: 44 },
    { id: 'brix', label: { cs: '°Bx', en: '°Bx' }, precision: 1, min: -2.6, max: 44 },
  ],
  toBase(value, unitId) {
    if (unitId === 'sg') return value;
    if (unitId === 'plato' || unitId === 'brix') return platoToSg(value);
    return null;
  },
  fromBase(value, unitId) {
    if (unitId === 'sg') return value;
    if (unitId === 'plato' || unitId === 'brix') return sgToPlato(value);
    return null;
  },
  references: [
    { title: 'ASBC Methods of Analysis: Table for extract determination in wort and beer (SG ⇄ °Plato polynomial)' },
    { title: 'Wikipedia: Brix', url: 'https://en.wikipedia.org/wiki/Brix' },
  ],
};
