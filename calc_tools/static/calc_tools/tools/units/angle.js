/**
 * Plane angle converter.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['deg', Math.PI / 180, { cs: '° (stupeň)', en: '° (degree)' }],
  ['arcmin', Math.PI / 180 / 60, { cs: '′ (úhlová minuta)', en: '′ (arcminute)' }],
  ['arcsec', Math.PI / 180 / 3600, { cs: '″ (úhlová vteřina)', en: '″ (arcsecond)' }],
  ['rad', 1, { cs: 'rad (radián)', en: 'rad (radian)' }],
  ['mrad', 1e-3, 'mrad'],
  ['grad', Math.PI / 200, { cs: 'gon (grad)', en: 'gon (grad)' }],
  ['mil', 2 * Math.PI / 6400, { cs: 'dílec NATO (1/6400)', en: 'NATO mil (1/6400)' }],
  ['turn', 2 * Math.PI, { cs: 'otáčka', en: 'turn' }],
], { defaultUnit: 'deg', defaultValue: 90, min: null });

export default {
  id: 'angle',
  kind: 'converter',
  category: 'units-other',
  tags: [],
  name: { cs: 'Převod úhlů', en: 'Angle converter' },
  description: {
    cs: 'Převod rovinného úhlu mezi stupni, úhlovými minutami a vteřinami, radiány, gony (grady, 400 na kruh), dílci NATO (6400 na kruh) a otáčkami.',
    en: 'Converts plane angle between degrees, arcminutes and arcseconds, radians, gons (grads, 400 to a circle), NATO mils (6400 to a circle) and turns.',
  },
  keywords: {
    cs: ['úhel', 'stupeň', 'radián', 'grad', 'gon', 'dílec', 'úhlová minuta', 'otáčka'],
    en: ['angle', 'degree', 'radian', 'grad', 'gon', 'gradian', 'mil', 'arcminute', 'turn'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure) – radian, degree, minute, second', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
