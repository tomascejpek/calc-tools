/**
 * Buoyancy by Archimedes' principle.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'volume', type: 'number', default: 10, min: 0, max: 1e12, step: 0.1, unit: 'l', label: { cs: 'Objem tělesa', en: 'Body volume' } },
  { id: 'mass', type: 'number', default: 7, min: 0, max: 1e12, step: 0.1, unit: 'kg', label: { cs: 'Hmotnost tělesa', en: 'Body mass' } },
  { id: 'density', type: 'number', default: 1000, min: 0.01, max: 25000, step: 1, unit: 'kg/m³', label: { cs: 'Hustota kapaliny', en: 'Liquid density' } },
];

const outputs = [
  { id: 'buoyancy', label: { cs: 'Vztlaková síla při úplném ponoření', en: 'Buoyant force when fully submerged' }, unit: 'N', significant: 6 },
  { id: 'weight', label: { cs: 'Tíha tělesa', en: 'Weight of the body' }, unit: 'N', significant: 6 },
  { id: 'net', label: { cs: 'Výsledná síla ve vodě (+ nahoru)', en: 'Net force when submerged (+ up)' }, unit: 'N', significant: 6 },
  { id: 'submerged', label: { cs: 'Ponořený podíl při plování', en: 'Submerged share when floating' }, unit: '%', significant: 4 },
  { id: 'bodyDensity', label: { cs: 'Hustota tělesa', en: 'Density of the body' }, unit: 'kg/m³', significant: 6 },
];

export default {
  id: 'buoyancy',
  kind: 'calculator',
  category: 'physics-fluids',
  tags: ['physics'],
  name: { cs: 'Vztlak (Archimédův zákon)', en: 'Buoyancy (Archimedes\' principle)' },
  description: {
    cs: 'Vztlaková síla se rovná tíze kapaliny tělesem vytlačené: Fvz = V·ρ·g. Je-li těleso lehčí než stejný objem kapaliny, plove a ponoří se jen jeho část; jinak klesne a ve vodě „váží“ méně o vztlak.',
    en: 'The buoyant force equals the weight of the liquid the body displaces: Fb = V·ρ·g. If the body is lighter than the same volume of liquid it floats with only part of it submerged; otherwise it sinks and "weighs" less by the buoyancy.',
  },
  keywords: {
    cs: ['vztlak', 'archimédův zákon', 'vztlaková síla', 'plování', 'ponoření', 'hustota'],
    en: ['buoyancy', 'archimedes principle', 'buoyant force', 'floating', 'sinking', 'density'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, mass, density } = read.values;
    if (volume === 0) return emptyResult(outputs, [{ cs: 'Objem tělesa musí být větší než nula.', en: 'The body volume must be above zero.' }]);
    const buoyancy = volume / 1000 * density * G0;
    const weight = mass * G0;
    const bodyDensity = mass / (volume / 1000);
    return {
      values: { buoyancy, weight, net: buoyancy - weight, submerged: Math.min(100, bodyDensity / density * 100), bodyDensity },
      warnings: bodyDensity > density ? [{ cs: 'Těleso je hustší než kapalina a klesne ke dnu.', en: 'The body is denser than the liquid and sinks.' }] : [],
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – Archimedes\' principle' }],
};
