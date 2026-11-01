/**
 * Astronomical distances: km, AU, light-time, light-years and parsecs.
 */

import { unitTable } from '../../core/converter.js';
import { C_LIGHT } from '../../core/physics.js';

/** Astronomical unit, m (IAU 2012, exact). */
const AU = 149597870700;
/** Julian year, s. */
const JULIAN_YEAR = 365.25 * 86400;

const table = unitTable([
  ['km', 1000, 'km'],
  ['ls', C_LIGHT, { cs: 'světelná sekunda', en: 'light-second' }],
  ['lmin', C_LIGHT * 60, { cs: 'světelná minuta', en: 'light-minute' }],
  ['au', AU, { cs: 'astronomická jednotka (AU)', en: 'astronomical unit (AU)' }],
  ['ly', C_LIGHT * JULIAN_YEAR, { cs: 'světelný rok (ly)', en: 'light-year (ly)' }],
  ['pc', AU * 648000 / Math.PI, { cs: 'parsek (pc)', en: 'parsec (pc)' }],
  ['kpc', AU * 648000 / Math.PI * 1e3, 'kpc'],
  ['Mpc', AU * 648000 / Math.PI * 1e6, 'Mpc'],
], { defaultUnit: 'ly', defaultValue: 4.2465 });

/** Size of one unit in metres. */
export const ASTRO_METRES = table.factors;

export default {
  id: 'astro-distance',
  kind: 'converter',
  category: 'physics-astro',
  tags: ['physics'],
  name: { cs: 'Astronomické vzdálenosti (AU, ly, pc)', en: 'Astronomical distances (AU, ly, pc)' },
  description: {
    cs: 'Převod mezi kilometry, světelnými sekundami a minutami, astronomickými jednotkami (střední vzdálenost Země–Slunce, přesně 149 597 870 700 m), světelnými roky a parseky (1 pc ≈ 3,26 ly). Nejbližší hvězda Proxima Centauri je vzdálená 4,25 ly.',
    en: 'Converts between kilometres, light-seconds and light-minutes, astronomical units (mean Earth–Sun distance, exactly 149,597,870,700 m), light-years and parsecs (1 pc ≈ 3.26 ly). The nearest star, Proxima Centauri, is 4.25 ly away.',
  },
  keywords: {
    cs: ['astronomická jednotka', 'světelný rok', 'parsek', 'au', 'ly', 'pc', 'vzdálenost hvězd', 'vesmír'],
    en: ['astronomical unit', 'light-year', 'parsec', 'au', 'ly', 'pc', 'star distance', 'space'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'IAU 2012 Resolution B2 – the astronomical unit', url: 'https://www.iau.org/static/resolutions/IAU2012_English.pdf' },
    { title: 'IAU 2015 Resolution B2 – parsec and related units' },
  ],
};
