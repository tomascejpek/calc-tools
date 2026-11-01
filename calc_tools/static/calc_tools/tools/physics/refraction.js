/**
 * Snell's law of refraction and total internal reflection.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const DEG = Math.PI / 180;

const inputs = [
  { id: 'n1', type: 'number', default: 1.333, min: 1, max: 5, step: 0.001, label: { cs: 'Index lomu prostředí 1 (vzduch 1,000, voda 1,333)', en: 'Refractive index of medium 1 (air 1.000, water 1.333)' } },
  { id: 'n2', type: 'number', default: 1.0, min: 1, max: 5, step: 0.001, label: { cs: 'Index lomu prostředí 2 (sklo ≈ 1,5, diamant 2,42)', en: 'Refractive index of medium 2 (glass ≈ 1.5, diamond 2.42)' } },
  { id: 'angle', type: 'number', default: 30, min: 0, max: 90, step: 1, unit: '°', label: { cs: 'Úhel dopadu (od kolmice)', en: 'Angle of incidence (from the normal)' } },
];

const outputs = [
  { id: 'refracted', label: { cs: 'Úhel lomu', en: 'Angle of refraction' }, unit: '°', significant: 6 },
  { id: 'critical', label: { cs: 'Mezní úhel úplného odrazu', en: 'Critical angle of total internal reflection' }, unit: '°', significant: 6 },
  { id: 'reflectance', label: { cs: 'Odražený podíl světla (nepolarizované)', en: 'Reflected share of light (unpolarised)' }, unit: '%', significant: 4 },
];

export default {
  id: 'refraction',
  kind: 'calculator',
  category: 'physics-waves',
  tags: ['physics'],
  name: { cs: 'Zákon lomu (Snellův zákon)', en: 'Refraction (Snell\'s law)' },
  description: {
    cs: 'Úhel lomu paprsku na rozhraní dvou prostředí: n₁·sin α = n₂·sin β. Při přechodu do opticky řidšího prostředí nad mezním úhlem nastává úplný odraz. Podíl odraženého světla počítá z Fresnelových vztahů.',
    en: 'Angle of a ray refracted at the boundary of two media: n₁·sin α = n₂·sin β. Going into an optically less dense medium beyond the critical angle the light is totally reflected. The reflected share comes from the Fresnel equations.',
  },
  keywords: {
    cs: ['zákon lomu', 'snellův zákon', 'lom světla', 'index lomu', 'úplný odraz', 'mezní úhel', 'optika'],
    en: ['snell law', 'refraction', 'refractive index', 'total internal reflection', 'critical angle', 'optics', 'fresnel'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { n1, n2, angle } = read.values;
    const sine = n1 / n2 * Math.sin(angle * DEG);
    // Total internal reflection exists only towards an optically less dense medium
    const critical = n1 > n2 ? Math.asin(n2 / n1) / DEG : null;
    if (sine > 1) {
      return { values: { refracted: null, critical, reflectance: 100 }, warnings: [{ cs: 'Úplný odraz: paprsek do druhého prostředí neprojde.', en: 'Total internal reflection: the ray does not enter the second medium.' }] };
    }
    const a = angle * DEG;
    const b = Math.asin(sine);
    const cosA = Math.cos(a);
    const cosB = Math.cos(b);
    const rs = ((n1 * cosA - n2 * cosB) / (n1 * cosA + n2 * cosB)) ** 2;
    const rp = ((n1 * cosB - n2 * cosA) / (n1 * cosB + n2 * cosA)) ** 2;
    return { values: { refracted: b / DEG, critical, reflectance: (rs + rp) / 2 * 100 }, warnings: [] };
  },
  references: [{ title: 'Hecht, E.: Optics, 5th ed. – refraction and the Fresnel equations' }],
};
