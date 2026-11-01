/**
 * Pasteurization units (PU) of beer and other drinks.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Pasteurization units: minutes at the temperature, scaled to 60 °C.
 * 1 PU = 1 min at 60 °C; z = 6.94 K for beer (Del Vecchio).
 * @param {number} celsius
 * @param {number} minutes
 * @param {number} [z]
 * @param {number} [reference]
 */
export function pasteurizationUnits(celsius, minutes, z = 6.94, reference = 60) {
  return minutes * 10 ** ((celsius - reference) / z);
}

const inputs = [
  {
    id: 'find', type: 'select', default: 'pu', label: { cs: 'Počítám', en: 'Calculate' },
    options: [
      { value: 'pu', label: { cs: 'PU z teploty a doby', en: 'PU from temperature and time' } },
      { value: 'time', label: { cs: 'dobu pro cílové PU', en: 'time for a target PU' } },
    ],
  },
  { id: 'temperature', type: 'number', default: 62, min: 40, max: 100, step: 0.5, unit: '°C', label: { cs: 'Teplota v jádru lahve', en: 'Temperature at the bottle core' } },
  { id: 'minutes', type: 'number', default: 10, min: 0, max: 1e5, step: 0.5, unit: 'min', label: { cs: 'Doba na této teplotě', en: 'Time at that temperature' } },
  { id: 'target', type: 'number', default: 20, min: 0.01, max: 1e5, step: 1, unit: 'PU', label: { cs: 'Cílové PU', en: 'Target PU' } },
  { id: 'z', type: 'number', default: 6.94, min: 1, max: 50, step: 0.1, unit: 'K', label: { cs: 'Hodnota z (pivo 6,94)', en: 'z-value (beer 6.94)' } },
];

const outputs = [
  { id: 'pu', label: { cs: 'Pasterizační jednotky', en: 'Pasteurization units' }, unit: 'PU', significant: 4 },
  { id: 'minutes', label: { cs: 'Potřebná doba', en: 'Time needed' }, unit: 'min', significant: 4 },
  { id: 'perMinute', label: { cs: 'PU za minutu při této teplotě', en: 'PU per minute at this temperature' }, unit: 'PU/min', significant: 4 },
];

export default {
  id: 'pasteurization',
  kind: 'calculator',
  category: 'food-preserving',
  tags: ['food', 'beer'],
  name: { cs: 'Pasterizační jednotky (PU)', en: 'Pasteurization units (PU)' },
  description: {
    cs: 'Pasterizační účinek: 1 PU je 1 minuta při 60 °C a každých 6,94 °C navíc účinek zdesateronásobí (PU = t · 10^((T − 60)/6,94)). Ležáky se pasterují na 15–25 PU, nealkoholická, ovocná a slazená piva a cidery víc (50–200 PU). Rozhoduje teplota v jádru lahve, ne v lázni. Přepasterování dává pivu pečivovou pachuť.',
    en: 'Pasteurization effect: 1 PU is 1 minute at 60 °C and every 6.94 °C more multiplies the effect tenfold (PU = t · 10^((T − 60)/6.94)). Lagers get 15–25 PU, alcohol-free, fruit and sweetened beers and ciders more (50–200 PU). The temperature at the bottle core counts, not the bath. Over-pasteurization gives beer a bready off-flavour.',
  },
  keywords: {
    cs: ['pasterace', 'pasterizace', 'pasterizační jednotky', 'pu', 'pivo', 'cider', 'trvanlivost', 'lahve'],
    en: ['pasteurization', 'pasteurisation units', 'pu', 'beer', 'cider', 'tunnel pasteurizer', 'shelf life'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { find, temperature, minutes, target, z } = read.values;
    const perMinute = pasteurizationUnits(temperature, 1, z);
    const time = find === 'time' ? target / perMinute : minutes;
    return { values: { pu: perMinute * time, minutes: time, perMinute }, warnings: [] };
  },
  references: [
    { title: 'Del Vecchio, H. W. et al.: Thermal death time studies on beer spoilage organisms. Proc. ASBC (1951) – PU, z = 6.94' },
    { title: 'Kunze, W.: Technology Brewing and Malting – pasteurization' },
  ],
};
