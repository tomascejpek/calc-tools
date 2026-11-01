/**
 * Spindle speed and feed from the cutting speed.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Typical cutting speeds, m/min, for HSS and carbide tools (starting values). */
export const CUTTING_SPEED = {
  steel: { hss: 25, carbide: 150 },
  stainless: { hss: 12, carbide: 90 },
  castIron: { hss: 20, carbide: 100 },
  aluminium: { hss: 90, carbide: 400 },
  brass: { hss: 50, carbide: 200 },
  plastic: { hss: 60, carbide: 250 },
  wood: { hss: 300, carbide: 1000 },
};

const inputs = [
  {
    id: 'material', type: 'select', default: 'steel', label: { cs: 'Obráběný materiál', en: 'Workpiece material' },
    options: [
      { value: 'steel', label: { cs: 'konstrukční ocel', en: 'mild steel' } },
      { value: 'stainless', label: { cs: 'nerezová ocel', en: 'stainless steel' } },
      { value: 'castIron', label: { cs: 'litina', en: 'cast iron' } },
      { value: 'aluminium', label: { cs: 'hliník', en: 'aluminium' } },
      { value: 'brass', label: { cs: 'mosaz, bronz', en: 'brass, bronze' } },
      { value: 'plastic', label: { cs: 'plasty', en: 'plastics' } },
      { value: 'wood', label: { cs: 'dřevo', en: 'wood' } },
      { value: 'custom', label: { cs: 'zadám řeznou rychlost', en: 'custom cutting speed' } },
    ],
  },
  {
    id: 'tool', type: 'select', default: 'hss', label: { cs: 'Nástroj', en: 'Tool' },
    options: [
      { value: 'hss', label: { cs: 'rychlořezná ocel (HSS)', en: 'high-speed steel (HSS)' } },
      { value: 'carbide', label: { cs: 'slinutý karbid', en: 'carbide' } },
    ],
  },
  { id: 'vc', type: 'number', default: 30, min: 0.1, max: 5000, step: 1, unit: 'm/min', label: { cs: 'Vlastní řezná rychlost', en: 'Custom cutting speed' } },
  { id: 'diameter', type: 'number', default: 10, min: 0.01, max: 10000, step: 0.5, unit: 'mm', label: { cs: 'Průměr nástroje nebo obrobku', en: 'Tool or workpiece diameter' } },
  { id: 'teeth', type: 'number', default: 2, min: 1, max: 500, step: 1, label: { cs: 'Počet zubů nebo břitů (vrták 2)', en: 'Number of teeth or flutes (drill 2)' } },
  { id: 'feed', type: 'number', default: 0.05, min: 0, max: 10, step: 0.01, unit: 'mm', label: { cs: 'Posuv na zub', en: 'Feed per tooth' } },
];

const outputs = [
  { id: 'rpm', label: { cs: 'Otáčky', en: 'Spindle speed' }, unit: { cs: 'ot/min', en: 'rpm' }, precision: 0 },
  { id: 'feedRate', label: { cs: 'Posuv', en: 'Feed rate' }, unit: 'mm/min', precision: 0 },
  { id: 'cuttingSpeed', label: { cs: 'Použitá řezná rychlost', en: 'Cutting speed used' }, unit: 'm/min', significant: 4 },
];

export default {
  id: 'cutting-speed',
  kind: 'calculator',
  category: 'eng-mechanical',
  tags: ['engineering'],
  name: { cs: 'Řezná rychlost a otáčky', en: 'Cutting speed and spindle speed' },
  description: {
    cs: 'Otáčky vřetena n = 1000 · vc / (π · D) a posuv stolu z posuvu na zub pro vrtání, frézování i soustružení. Řezné rychlosti jsou výchozí hodnoty pro HSS a karbid; skutečné podle nástroje, chlazení a stroje uvádí výrobce nástroje. Vrták 10 mm do oceli HSS: asi 800 ot/min.',
    en: 'Spindle speed n = 1000 · vc / (π · D) and the table feed from the feed per tooth, for drilling, milling and turning. Cutting speeds are starting values for HSS and carbide; real ones for the tool, coolant and machine come from the tool maker. A 10 mm HSS drill in steel: about 800 rpm.',
  },
  keywords: {
    cs: ['řezná rychlost', 'otáčky', 'vrtání', 'frézování', 'soustružení', 'posuv', 'otáčky vrtáku', 'obrábění'],
    en: ['cutting speed', 'spindle speed', 'rpm', 'drilling', 'milling', 'turning', 'feed rate', 'machining'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { material, tool, diameter, teeth, feed } = read.values;
    const vc = material === 'custom' ? read.values.vc : CUTTING_SPEED[/** @type {keyof typeof CUTTING_SPEED} */ (material)][/** @type {'hss' | 'carbide'} */ (tool)];
    const rpm = 1000 * vc / (Math.PI * diameter);
    return { values: { rpm, feedRate: rpm * teeth * feed, cuttingSpeed: vc }, warnings: [] };
  },
  references: [{ title: 'Machinery\'s Handbook, 31st ed. – speeds and feeds' }],
};
