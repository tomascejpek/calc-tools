/**
 * Special relativity: time dilation and length contraction.
 */

import { C_LIGHT } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'speed', type: 'number', default: 90, min: 0, max: 99.9999999, step: 1, unit: { cs: '% c', en: '% of c' }, label: { cs: 'Rychlost v procentech rychlosti světla', en: 'Speed as a percentage of light speed' } },
  { id: 'time', type: 'number', default: 10, min: 0, max: 1e12, step: 1, unit: { cs: 'let', en: 'years' }, label: { cs: 'Doba pro pozorovatele v klidu', en: 'Time for an observer at rest' } },
];

const outputs = [
  { id: 'gamma', label: { cs: 'Lorentzův faktor γ', en: 'Lorentz factor γ' }, significant: 8 },
  { id: 'properTime', label: { cs: 'Doba na palubě', en: 'Time on board' }, unit: { cs: 'let', en: 'years' }, significant: 6 },
  { id: 'length', label: { cs: 'Zkrácení délky (1 m se jeví jako)', en: 'Length contraction (1 m appears as)' }, unit: 'm', significant: 6 },
  { id: 'speedKms', label: { cs: 'Rychlost', en: 'Speed' }, unit: 'km/s', significant: 6 },
];

export default {
  id: 'time-dilation',
  kind: 'calculator',
  category: 'physics-astro',
  tags: ['physics'],
  name: { cs: 'Dilatace času (speciální relativita)', en: 'Time dilation (special relativity)' },
  description: {
    cs: 'Při rychlosti v plyne čas na pohybující se lodi pomaleji: γ = 1 / √(1 − v²/c²). Při 90 % rychlosti světla uplyne na palubě za 10 pozemských let jen asi 4,4 roku a délky ve směru pohybu se zkrátí stejným faktorem. Gravitační dilataci (obecná relativita) nezahrnuje.',
    en: 'At speed v time on a moving ship passes more slowly: γ = 1 / √(1 − v²/c²). At 90 % of the speed of light only about 4.4 years pass on board during 10 Earth years, and lengths along the motion shrink by the same factor. Gravitational dilation (general relativity) is not included.',
  },
  keywords: {
    cs: ['dilatace času', 'relativita', 'speciální teorie relativity', 'lorentzův faktor', 'kontrakce délek', 'rychlost světla', 'paradox dvojčat'],
    en: ['time dilation', 'relativity', 'special relativity', 'lorentz factor', 'length contraction', 'speed of light', 'twin paradox'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const beta = read.values.speed / 100;
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    return { values: { gamma, properTime: read.values.time / gamma, length: 1 / gamma, speedKms: beta * C_LIGHT / 1000 }, warnings: [] };
  },
  references: [{ title: 'Taylor, E. F., Wheeler, J. A.: Spacetime Physics, 2nd ed.' }],
};
