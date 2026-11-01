/**
 * Orbital period by Kepler's third law.
 */

import { BODIES, BODY_OPTIONS, GRAVITATION } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { ASTRO_METRES } from './astro-distance.js';

const inputs = [
  { id: 'body', type: 'select', default: 'sun', label: { cs: 'Centrální těleso', en: 'Central body' }, options: BODY_OPTIONS },
  { id: 'mass', type: 'number', default: 1.98847e30, min: 1, max: 1e45, step: 1e28, unit: 'kg', label: { cs: 'Hmotnost (vlastní těleso)', en: 'Mass (custom body)' } },
  { id: 'axis', type: 'number', default: 1, min: 1e-9, max: 1e12, step: 0.1, label: { cs: 'Velká poloosa dráhy', en: 'Semi-major axis' } },
  {
    id: 'unit', type: 'select', default: 'au', label: { cs: 'Jednotka poloosy', en: 'Axis unit' },
    options: [
      { value: 'km', label: { cs: 'km od středu tělesa', en: 'km from the centre' } },
      { value: 'au', label: { cs: 'astronomická jednotka (AU)', en: 'astronomical unit (AU)' } },
    ],
  },
];

const outputs = [
  { id: 'days', label: { cs: 'Oběžná doba', en: 'Orbital period' }, unit: { cs: 'dní', en: 'days' }, significant: 6 },
  { id: 'hours', label: { cs: 'Oběžná doba', en: 'Orbital period' }, unit: 'h', significant: 6 },
  { id: 'years', label: { cs: 'Oběžná doba', en: 'Orbital period' }, unit: { cs: 'let', en: 'years' }, significant: 6 },
  { id: 'speed', label: { cs: 'Střední oběžná rychlost (kruhová dráha)', en: 'Mean orbital speed (circular orbit)' }, unit: 'km/s', significant: 5 },
];

export default {
  id: 'orbital-period',
  kind: 'calculator',
  category: 'physics-astro',
  tags: ['physics'],
  name: { cs: 'Oběžná doba (3. Keplerův zákon)', en: 'Orbital period (Kepler\'s third law)' },
  description: {
    cs: 'Oběžná doba T = 2π · √(a³ / GM) kolem Slunce, Země nebo jiného tělesa podle velké poloosy dráhy. Země ve vzdálenosti 1 AU oběhne Slunce za 365,25 dne, geostacionární družice ve vzdálenosti 42 164 km od středu Země za 23,93 h. Hmotnost obíhajícího tělesa se zanedbává.',
    en: 'Orbital period T = 2π · √(a³ / GM) around the Sun, Earth or another body by the semi-major axis. Earth at 1 AU orbits the Sun in 365.25 days, a geostationary satellite 42,164 km from Earth\'s centre in 23.93 h. The mass of the orbiting body is neglected.',
  },
  keywords: {
    cs: ['oběžná doba', 'keplerův zákon', 'oběžná dráha', 'družice', 'planeta', 'geostacionární', 'velká poloosa'],
    en: ['orbital period', 'kepler third law', 'orbit', 'satellite', 'planet', 'geostationary', 'semi-major axis'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { body, mass, axis, unit } = read.values;
    const gm = body === 'custom' ? GRAVITATION * mass : BODIES[/** @type {keyof typeof BODIES} */ (body)].gm;
    const a = unit === 'au' ? axis * ASTRO_METRES.au : axis * 1000;
    const seconds = 2 * Math.PI * Math.sqrt(a ** 3 / gm);
    const radius = body === 'custom' ? null : BODIES[/** @type {keyof typeof BODIES} */ (body)].radius;
    const warnings = radius !== null && a < radius ? [{ cs: 'Dráha leží uvnitř tělesa.', en: 'The orbit lies inside the body.' }] : [];
    return { values: { days: seconds / 86400, hours: seconds / 3600, years: seconds / (365.25 * 86400), speed: 2 * Math.PI * a / seconds / 1000 }, warnings };
  },
  references: [
    { title: 'NASA Planetary Fact Sheets – GM values', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
};
