/**
 * Thermal expansion of solids (linear) and of water (from its density).
 */

import { KELL, waterDensity } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Linear expansion coefficients, 1/K. */
export const LINEAR_EXPANSION = {
  steel: 16e-6,
  carbonSteel: 12e-6,
  aluminium: 23e-6,
  copper: 17e-6,
  glass: 9e-6,
  borosilicate: 3.3e-6,
  pvc: 80e-6,
};

const inputs = [
  {
    id: 'material', type: 'select', default: 'water', label: { cs: 'Látka', en: 'Material' },
    options: [
      { value: 'water', label: { cs: 'voda (objem, přesně podle hustoty)', en: 'water (volume, exactly from density)' } },
      { value: 'steel', label: { cs: 'nerezová ocel (16 · 10⁻⁶ /K)', en: 'stainless steel (16 · 10⁻⁶ /K)' } },
      { value: 'carbonSteel', label: { cs: 'uhlíková ocel (12 · 10⁻⁶ /K)', en: 'carbon steel (12 · 10⁻⁶ /K)' } },
      { value: 'aluminium', label: { cs: 'hliník (23 · 10⁻⁶ /K)', en: 'aluminium (23 · 10⁻⁶ /K)' } },
      { value: 'copper', label: { cs: 'měď (17 · 10⁻⁶ /K)', en: 'copper (17 · 10⁻⁶ /K)' } },
      { value: 'glass', label: { cs: 'sklo (9 · 10⁻⁶ /K)', en: 'glass (9 · 10⁻⁶ /K)' } },
      { value: 'borosilicate', label: { cs: 'borosilikátové sklo (3,3 · 10⁻⁶ /K)', en: 'borosilicate glass (3.3 · 10⁻⁶ /K)' } },
      { value: 'pvc', label: { cs: 'PVC (80 · 10⁻⁶ /K)', en: 'PVC (80 · 10⁻⁶ /K)' } },
      { value: 'custom', label: { cs: 'vlastní délková roztažnost', en: 'custom linear coefficient' } },
    ],
  },
  { id: 'alpha', type: 'number', default: 12, min: 0, max: 10000, step: 0.1, unit: '10⁻⁶ /K', label: { cs: 'Vlastní součinitel délkové roztažnosti', en: 'Custom linear expansion coefficient' } },
  { id: 'size', type: 'number', default: 25, min: 0, max: 1e9, step: 0.5, label: { cs: 'Rozměr (délka, u vody objem v l)', en: 'Size (length; for water volume in l)' } },
  { id: 'from', type: 'number', default: 100, min: -100, max: 1000, step: 1, unit: '°C', label: { cs: 'Počáteční teplota', en: 'Initial temperature' } },
  { id: 'to', type: 'number', default: 20, min: -100, max: 1000, step: 1, unit: '°C', label: { cs: 'Konečná teplota', en: 'Final temperature' } },
];

const outputs = [
  { id: 'size', label: { cs: 'Nový rozměr', en: 'New size' }, significant: 8 },
  { id: 'change', label: { cs: 'Změna', en: 'Change' }, significant: 6 },
  { id: 'percent', label: { cs: 'Změna', en: 'Change' }, unit: '%', significant: 4 },
];

export default {
  id: 'thermal-expansion',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics', 'beer'],
  name: { cs: 'Teplotní roztažnost', en: 'Thermal expansion' },
  description: {
    cs: 'Změna délky pevných látek ΔL = α·L·ΔT a změna objemu vody podle její hustoty (Kell, 0–150 °C), protože roztažnost vody s teplotou silně roste. Mladina se z varu na 20 °C smrští asi o 4 % – proto se objem po chmelovaru měří až vychladlý.',
    en: 'Length change of solids ΔL = α·L·ΔT, and volume change of water from its density (Kell, 0–150 °C), as the expansion of water grows strongly with temperature. Wort shrinks by about 4 % from the boil to 20 °C – which is why the post-boil volume is measured cold.',
  },
  keywords: {
    cs: ['teplotní roztažnost', 'délková roztažnost', 'objemová roztažnost', 'smrštění', 'dilatace', 'smrštění mladiny'],
    en: ['thermal expansion', 'linear expansion', 'volumetric expansion', 'shrinkage', 'cooling shrinkage', 'expansion coefficient'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { material, alpha, size, from, to } = read.values;
    let next;
    if (material === 'water') {
      if (from < 0 || from > 150 || to < 0 || to > 150) {
        return emptyResult(outputs, [{ cs: 'Pro vodu platí výpočet jen od 0 do 150 °C.', en: 'For water the calculation holds only from 0 to 150 °C.' }]);
      }
      next = size * waterDensity(from) / waterDensity(to);
    } else {
      const coefficient = material === 'custom' ? alpha * 1e-6 : LINEAR_EXPANSION[/** @type {keyof typeof LINEAR_EXPANSION} */ (material)];
      next = size * (1 + coefficient * (to - from));
    }
    return { values: { size: next, change: next - size, percent: size > 0 ? (next / size - 1) * 100 : 0 }, warnings: [] };
  },
  references: [
    KELL,
    { title: 'Engineering ToolBox: Thermal expansion – linear expansion coefficients', url: 'https://www.engineeringtoolbox.com/linear-expansion-coefficients-d_95.html' },
  ],
};
