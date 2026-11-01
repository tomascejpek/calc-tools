/**
 * Surface gravity, orbital and escape velocity of a body.
 */

import { BODIES, BODY_OPTIONS, GRAVITATION } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'body', type: 'select', default: 'earth', label: { cs: 'Těleso', en: 'Body' }, options: BODY_OPTIONS },
  { id: 'mass', type: 'number', default: 5.9722e24, min: 1, max: 1e45, step: 1e22, unit: 'kg', label: { cs: 'Hmotnost (vlastní těleso)', en: 'Mass (custom body)' } },
  { id: 'radius', type: 'number', default: 6371, min: 0.001, max: 1e12, step: 1, unit: 'km', label: { cs: 'Poloměr (vlastní těleso)', en: 'Radius (custom body)' } },
  { id: 'altitude', type: 'number', default: 0, min: 0, max: 1e12, step: 10, unit: 'km', label: { cs: 'Výška nad povrchem', en: 'Altitude above the surface' } },
];

const outputs = [
  { id: 'escape', label: { cs: 'Úniková rychlost (2. kosmická)', en: 'Escape velocity' }, unit: 'km/s', significant: 5 },
  { id: 'orbital', label: { cs: 'Kruhová rychlost (1. kosmická)', en: 'Circular orbital velocity' }, unit: 'km/s', significant: 5 },
  { id: 'gravity', label: { cs: 'Gravitační zrychlení', en: 'Gravitational acceleration' }, unit: 'm/s²', significant: 5 },
];

export default {
  id: 'escape-velocity',
  kind: 'calculator',
  category: 'physics-astro',
  tags: ['physics'],
  name: { cs: 'Úniková a kruhová rychlost', en: 'Escape and orbital velocity' },
  description: {
    cs: 'Úniková rychlost v = √(2GM / r), kterou těleso uletí z gravitačního pole navždy, kruhová rychlost √(GM / r) pro oběh těsně nad povrchem a gravitační zrychlení. Ze Země je to 11,2 km/s a 7,9 km/s. Zanedbává odpor atmosféry a rotaci tělesa.',
    en: 'Escape velocity v = √(2GM / r) at which a body leaves the gravitational field for good, circular velocity √(GM / r) for an orbit just above the surface, and gravitational acceleration. From Earth it is 11.2 km/s and 7.9 km/s. Air drag and the body\'s rotation are ignored.',
  },
  keywords: {
    cs: ['úniková rychlost', 'kosmická rychlost', 'kruhová rychlost', 'gravitace', 'planeta', 'oběžná dráha', 'raketa'],
    en: ['escape velocity', 'orbital velocity', 'cosmic velocity', 'gravity', 'planet', 'orbit', 'rocket'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { body, mass, radius, altitude } = read.values;
    const known = body === 'custom' ? null : BODIES[/** @type {keyof typeof BODIES} */ (body)];
    const gm = known ? known.gm : GRAVITATION * mass;
    const r = (known ? known.radius : radius * 1000) + altitude * 1000;
    return { values: { escape: Math.sqrt(2 * gm / r) / 1000, orbital: Math.sqrt(gm / r) / 1000, gravity: gm / (r * r) }, warnings: [] };
  },
  references: [
    { title: 'NASA Planetary Fact Sheets – GM and mean radius', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { title: 'IAU 2015 Resolution B3 – nominal solar values' },
  ],
};
