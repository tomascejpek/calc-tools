/**
 * Cooling wort with a heat exchanger: cooling water needed and time.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Specific heat of water, kJ/(kg·K). */
const WATER_C = 4.186;

const inputs = [
  { id: 'volume', type: 'number', default: 25, min: 0.1, max: 1e7, step: 0.5, unit: 'l', label: { cs: 'Objem mladiny', en: 'Wort volume' } },
  { id: 'from', type: 'number', default: 100, min: 0, max: 110, step: 1, unit: '°C', label: { cs: 'Teplota mladiny na začátku', en: 'Wort temperature at the start' } },
  { id: 'to', type: 'number', default: 20, min: 0, max: 100, step: 1, unit: '°C', label: { cs: 'Cílová teplota mladiny', en: 'Target wort temperature' } },
  { id: 'waterIn', type: 'number', default: 12, min: 0, max: 100, step: 1, unit: '°C', label: { cs: 'Teplota chladicí vody na vstupu', en: 'Cooling water inlet temperature' } },
  { id: 'waterOut', type: 'number', default: 40, min: 0, max: 110, step: 1, unit: '°C', label: { cs: 'Průměrná teplota vody na výstupu', en: 'Average cooling water outlet temperature' } },
  { id: 'flow', type: 'number', default: 8, min: 0.01, max: 1e6, step: 0.5, unit: 'l/min', label: { cs: 'Průtok chladicí vody', en: 'Cooling water flow' } },
  { id: 'specificHeat', type: 'number', default: 4.0, min: 1, max: 5, step: 0.05, unit: 'kJ/(kg·K)', label: { cs: 'Měrná tepelná kapacita mladiny', en: 'Specific heat of the wort' } },
  { id: 'density', type: 'number', default: 1.05, min: 0.9, max: 1.3, step: 0.01, unit: 'kg/l', label: { cs: 'Hustota mladiny', en: 'Wort density' } },
];

const outputs = [
  { id: 'water', label: { cs: 'Spotřeba chladicí vody', en: 'Cooling water needed' }, unit: 'l', precision: 0 },
  { id: 'minutes', label: { cs: 'Doba chlazení', en: 'Cooling time' }, unit: 'min', precision: 0 },
  { id: 'heat', label: { cs: 'Odvedené teplo', en: 'Heat removed' }, unit: 'kWh', precision: 2 },
  { id: 'power', label: { cs: 'Průměrný chladicí výkon', en: 'Average cooling power' }, unit: 'kW', precision: 1 },
];

export default {
  id: 'wort-cooling',
  kind: 'calculator',
  category: 'physics-thermal',
  tags: ['physics', 'beer'],
  name: { cs: 'Chlazení mladiny (spotřeba vody)', en: 'Wort cooling (water needed)' },
  description: {
    cs: 'Kolik chladicí vody a času spotřebuje ochlazení mladiny ve výměníku (protiproudém, deskovém nebo ponorném). Teplo odevzdané mladinou se rovná teplu přijatému vodou, takže čím teplejší voda z výměníku odchází, tím méně jí stačí. Protiproudý výměník umí vodu ohřát skoro na teplotu horké mladiny, ponorný chladič jen o pár stupňů nad mladinu.',
    en: 'How much cooling water and time cooling the wort in a heat exchanger takes (counterflow, plate or immersion). The heat given off by the wort equals the heat taken up by the water, so the warmer the water leaves the exchanger, the less is needed. A counterflow chiller can warm the water almost to the hot wort temperature, an immersion chiller only a few degrees above the wort.',
  },
  keywords: {
    cs: ['chlazení mladiny', 'chladič', 'výměník', 'deskový výměník', 'protiproudý chladič', 'ponorný chladič', 'chladicí voda', 'spotřeba vody'],
    en: ['wort cooling', 'wort chiller', 'heat exchanger', 'plate chiller', 'counterflow chiller', 'immersion chiller', 'cooling water'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume, from, to, waterIn, waterOut, flow, specificHeat, density } = read.values;
    if (to >= from) return emptyResult(outputs, [{ cs: 'Cílová teplota musí být nižší než počáteční.', en: 'The target must be colder than the start.' }]);
    if (waterIn >= to) return emptyResult(outputs, [{ cs: 'Chladicí voda musí být studenější než cílová teplota mladiny.', en: 'The cooling water must be colder than the target wort temperature.' }]);
    if (waterOut <= waterIn) return emptyResult(outputs, [{ cs: 'Voda se ve výměníku musí ohřát.', en: 'The water must warm up in the exchanger.' }]);
    const heat = volume * density * specificHeat * (from - to);
    const water = heat / (WATER_C * (waterOut - waterIn));
    const minutes = water / flow;
    const warnings = waterOut > from
      ? [{ cs: 'Voda nemůže odcházet teplejší než horká mladina.', en: 'The water cannot leave warmer than the hot wort.' }]
      : [];
    return { values: { water, minutes, heat: heat / 3600, power: heat / (minutes * 60) }, warnings };
  },
  references: [{ title: 'Kunze, W.: Technology Brewing and Malting – wort cooling and heat recovery' }],
};
