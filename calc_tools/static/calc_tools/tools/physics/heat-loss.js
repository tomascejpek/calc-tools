/**
 * Heat loss through insulation: flat wall or cylindrical vessel.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Conductive heat flow, W.
 * @param {'flat' | 'cylinder'} shape
 * @param {{ area: number, thickness: number, lambda: number, delta: number, radius: number, height: number }} wall
 *   area m², thickness mm, λ W/(m·K), ΔT K, radius (inner, of the insulation) mm, height m
 */
export function conductiveLoss(shape, { area, thickness, lambda, delta, radius, height }) {
  const d = thickness / 1000;
  if (shape === 'flat') return lambda * area * delta / d;
  const r1 = radius / 1000;
  return 2 * Math.PI * lambda * height * delta / Math.log((r1 + d) / r1);
}

const inputs = [
  {
    id: 'shape', type: 'select', default: 'cylinder', label: { cs: 'Tvar', en: 'Shape' },
    options: [
      { value: 'flat', label: { cs: 'rovná stěna (plocha)', en: 'flat wall (area)' } },
      { value: 'cylinder', label: { cs: 'válcová nádoba nebo trubka (plášť)', en: 'cylindrical vessel or pipe (wall)' } },
    ],
  },
  { id: 'lambda', type: 'number', default: 0.035, min: 0.001, max: 500, step: 0.001, unit: 'W/(m·K)', label: { cs: 'Tepelná vodivost izolace λ (minerální vata, polystyren ≈ 0,035)', en: 'Insulation conductivity λ (mineral wool, polystyrene ≈ 0.035)' } },
  { id: 'thickness', type: 'number', default: 20, min: 0.1, max: 10000, step: 1, unit: 'mm', label: { cs: 'Tloušťka izolace', en: 'Insulation thickness' } },
  { id: 'delta', type: 'number', default: 45, min: 0, max: 2000, step: 1, unit: 'K', label: { cs: 'Rozdíl teplot uvnitř a venku', en: 'Temperature difference inside and outside' } },
  { id: 'area', type: 'number', default: 1, min: 0, max: 1e7, step: 0.1, unit: 'm²', label: { cs: 'Plocha (rovná stěna)', en: 'Area (flat wall)' } },
  { id: 'radius', type: 'number', default: 200, min: 1, max: 1e6, step: 5, unit: 'mm', label: { cs: 'Vnější poloměr nádoby (válec)', en: 'Outer radius of the vessel (cylinder)' } },
  { id: 'height', type: 'number', default: 0.6, min: 0, max: 1e4, step: 0.1, unit: 'm', label: { cs: 'Výška nádoby (válec)', en: 'Height of the vessel (cylinder)' } },
];

const outputs = [
  { id: 'watts', label: { cs: 'Tepelná ztráta', en: 'Heat loss' }, unit: 'W', significant: 4 },
  { id: 'kwhDay', label: { cs: 'Ztráta za den', en: 'Loss per day' }, unit: 'kWh', significant: 4 },
  { id: 'perKelvin', label: { cs: 'Ztráta na 1 K rozdílu', en: 'Loss per 1 K of difference' }, unit: 'W/K', significant: 4 },
];

export default {
  id: 'heat-loss',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics'],
  name: { cs: 'Tepelné ztráty a tloušťka izolace', en: 'Heat loss and insulation thickness' },
  description: {
    cs: 'Tepelný tok vedením izolací: rovnou stěnou Q = λ·S·ΔT / d, pláštěm válce Q = 2π·λ·h·ΔT / ln(r₂ / r₁). Pomůže rozhodnout, jak silnou izolaci dát na rmutovací káď nebo zásobník horké vody. Počítá jen vedení izolací; ztráty víkem, dnem a přestupem tepla na povrchu přidejte zvlášť, takže skutečné ztráty bývají vyšší.',
    en: 'Heat flow by conduction through insulation: a flat wall Q = λ·A·ΔT / d, a cylinder wall Q = 2π·λ·h·ΔT / ln(r₂ / r₁). Helps decide how thick to insulate a mash tun or a hot water tank. Only conduction through the insulation is counted; lid, bottom and surface heat transfer come on top, so real losses tend to be higher.',
  },
  keywords: {
    cs: ['tepelná ztráta', 'izolace', 'tloušťka izolace', 'tepelná vodivost', 'zateplení', 'rmutovací káď', 'bojler'],
    en: ['heat loss', 'insulation', 'insulation thickness', 'thermal conductivity', 'lagging', 'mash tun', 'hot water tank'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const watts = conductiveLoss(read.values.shape, /** @type {any} */ (read.values));
    const { delta } = read.values;
    return { values: { watts, kwhDay: watts * 24 / 1000, perKelvin: delta > 0 ? watts / delta : null }, warnings: [] };
  },
  references: [{ title: 'Incropera, F. P., DeWitt, D. P.: Fundamentals of Heat and Mass Transfer – conduction in plane and cylindrical walls' }],
};
