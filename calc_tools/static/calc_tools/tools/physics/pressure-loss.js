/**
 * Pressure loss in a pipe by Darcy–Weisbach with the Colebrook friction factor.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Darcy friction factor: 64 / Re for laminar flow, Colebrook–White otherwise.
 * @param {number} reynolds
 * @param {number} relativeRoughness ε / D
 */
export function frictionFactor(reynolds, relativeRoughness) {
  if (reynolds < 2300) return 64 / reynolds;
  // Swamee–Jain as the start, then fixed-point iteration of Colebrook
  let f = 0.25 / Math.log10(relativeRoughness / 3.7 + 5.74 / reynolds ** 0.9) ** 2;
  for (let i = 0; i < 50; i++) {
    const next = (-2 * Math.log10(relativeRoughness / 3.7 + 2.51 / (reynolds * Math.sqrt(f)))) ** -2;
    if (Math.abs(next - f) < 1e-14) return next;
    f = next;
  }
  return f;
}

const inputs = [
  { id: 'flow', type: 'number', default: 15, min: 0.0001, max: 1e9, step: 0.5, unit: 'l/min', label: { cs: 'Průtok', en: 'Flow rate' } },
  { id: 'diameter', type: 'number', default: 12, min: 0.1, max: 1e5, step: 0.5, unit: 'mm', label: { cs: 'Vnitřní průměr', en: 'Inner diameter' } },
  { id: 'length', type: 'number', default: 5, min: 0, max: 1e7, step: 0.5, unit: 'm', label: { cs: 'Délka potrubí', en: 'Pipe length' } },
  { id: 'roughness', type: 'number', default: 0.0015, min: 0, max: 10, step: 0.001, unit: 'mm', label: { cs: 'Drsnost stěny (nerez, plast ≈ 0,0015; ocel ≈ 0,045)', en: 'Wall roughness (stainless, plastic ≈ 0.0015; steel ≈ 0.045)' } },
  { id: 'density', type: 'number', default: 998, min: 0.01, max: 25000, step: 1, unit: 'kg/m³', label: { cs: 'Hustota kapaliny', en: 'Liquid density' } },
  { id: 'viscosity', type: 'number', default: 1.0, min: 0.001, max: 1e6, step: 0.1, unit: 'mPa·s', label: { cs: 'Dynamická viskozita (voda 20 °C ≈ 1,0)', en: 'Dynamic viscosity (water at 20 °C ≈ 1.0)' } },
];

const outputs = [
  { id: 'loss', label: { cs: 'Tlaková ztráta', en: 'Pressure loss' }, unit: 'kPa', significant: 5 },
  { id: 'lossBar', label: { cs: 'Tlaková ztráta', en: 'Pressure loss' }, unit: 'bar', significant: 5 },
  { id: 'head', label: { cs: 'Ztrátová výška', en: 'Head loss' }, unit: 'm', significant: 5 },
  { id: 'speed', label: { cs: 'Rychlost proudění', en: 'Flow speed' }, unit: 'm/s', significant: 5 },
  { id: 'reynolds', label: { cs: 'Reynoldsovo číslo', en: 'Reynolds number' }, significant: 5 },
  { id: 'friction', label: { cs: 'Součinitel tření λ', en: 'Friction factor f' }, significant: 5 },
];

export default {
  id: 'pressure-loss',
  kind: 'calculator',
  category: 'physics-fluids',
  tags: ['physics'],
  name: { cs: 'Tlaková ztráta v potrubí (Darcy–Weisbach)', en: 'Pipe pressure loss (Darcy–Weisbach)' },
  description: {
    cs: 'Tlaková ztráta třením v rovném potrubí: Δp = λ · (L / D) · ρv² / 2. Součinitel tření λ je 64 / Re při laminárním proudění, v turbulentním se řeší Colebrookova rovnice. Nezahrnuje ztráty v kolenech, ventilech a armaturách; mezi Re 2300 a 4000 je výsledek nejistý.',
    en: 'Friction pressure loss in a straight pipe: Δp = f · (L / D) · ρv² / 2. The friction factor f is 64 / Re in laminar flow; in turbulent flow the Colebrook equation is solved. Losses in bends, valves and fittings are not included; between Re 2300 and 4000 the result is uncertain.',
  },
  keywords: {
    cs: ['tlaková ztráta', 'darcy weisbach', 'potrubí', 'reynoldsovo číslo', 'colebrook', 'tření', 'čerpadlo', 'hadice'],
    en: ['pressure loss', 'pressure drop', 'darcy weisbach', 'pipe', 'reynolds number', 'colebrook', 'friction factor', 'pump'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { flow, diameter, length, roughness, density, viscosity } = read.values;
    const d = diameter / 1000;
    const speed = flow / 1000 / 60 / (Math.PI * d * d / 4);
    const reynolds = density * speed * d / (viscosity / 1000);
    const friction = frictionFactor(reynolds, roughness / diameter);
    const loss = friction * length / d * density * speed * speed / 2;
    const warnings = reynolds >= 2300 && reynolds < 4000
      ? [{ cs: 'Přechodová oblast mezi laminárním a turbulentním prouděním; ztráta je jen orientační.', en: 'Transitional flow between laminar and turbulent; the loss is only indicative.' }]
      : [];
    return { values: { loss: loss / 1000, lossBar: loss / 1e5, head: loss / (density * G0), speed, reynolds, friction }, warnings };
  },
  references: [
    { title: 'Colebrook, C. F.: Turbulent flow in pipes. J. Inst. Civil Eng. 11 (1939)' },
    { title: 'Swamee, P. K., Jain, A. K.: Explicit equations for pipe-flow problems. J. Hydraul. Div. 102 (1976)' },
    { title: 'Wikipedia: Darcy–Weisbach equation', url: 'https://en.wikipedia.org/wiki/Darcy%E2%80%93Weisbach_equation' },
  ],
};
