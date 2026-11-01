/**
 * Hydrostatic pressure at a depth.
 */

import { ATM, G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'depth', type: 'number', default: 10, min: 0, max: 20000, step: 0.5, unit: 'm', label: { cs: 'Hloubka (výška sloupce)', en: 'Depth (column height)' } },
  { id: 'density', type: 'number', default: 1000, min: 0.01, max: 25000, step: 1, unit: 'kg/m³', label: { cs: 'Hustota kapaliny', en: 'Liquid density' } },
  { id: 'surface', type: 'number', default: ATM / 1000, min: 0, max: 1e6, step: 0.1, unit: 'kPa', label: { cs: 'Tlak nad hladinou', en: 'Pressure above the surface' } },
];

const outputs = [
  { id: 'gauge', label: { cs: 'Hydrostatický tlak ρgh', en: 'Hydrostatic pressure ρgh' }, unit: 'kPa', significant: 6 },
  { id: 'gaugeBar', label: { cs: 'Hydrostatický tlak', en: 'Hydrostatic pressure' }, unit: 'bar', significant: 6 },
  { id: 'absolute', label: { cs: 'Celkový (absolutní) tlak', en: 'Total (absolute) pressure' }, unit: 'kPa', significant: 6 },
];

export default {
  id: 'hydrostatic-pressure',
  kind: 'calculator',
  category: 'physics-fluids',
  tags: ['physics'],
  name: { cs: 'Hydrostatický tlak', en: 'Hydrostatic pressure' },
  description: {
    cs: 'Tlak kapaliny v hloubce h: p = ρ·g·h, plus tlak nad hladinou (u otevřené nádoby atmosférický). Každých 10 m vody přidá asi 1 bar. Hodí se i pro tlak na dno nádrže nebo pro výšku, do které čerpadlo vytlačí kapalinu.',
    en: 'Pressure of a liquid at depth h: p = ρ·g·h, plus the pressure above the surface (atmospheric for an open vessel). Every 10 m of water adds about 1 bar. Also useful for the pressure on a tank bottom or the height a pump can push a liquid to.',
  },
  keywords: {
    cs: ['hydrostatický tlak', 'tlak v hloubce', 'vodní sloupec', 'tlak kapaliny', 'potápění', 'nádrž'],
    en: ['hydrostatic pressure', 'pressure at depth', 'water column', 'fluid pressure', 'diving', 'tank'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { depth, density, surface } = read.values;
    const gauge = density * G0 * depth / 1000;
    return { values: { gauge, gaugeBar: gauge / 100, absolute: gauge + surface }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – fluids at rest' }],
};
