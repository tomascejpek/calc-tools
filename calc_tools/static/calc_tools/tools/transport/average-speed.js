/**
 * Average speed, time or distance of a journey.
 */

import { bilingual } from '../../core/format.js';
import { DURATION_PATTERN, durationText, parseDuration } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** The duration input shared by transport and sport tools. */
export const DURATION_INPUT = {
  type: 'text', maxLength: 12, pattern: DURATION_PATTERN,
  hint: { cs: 'Ve tvaru h:mm:ss, mm:ss nebo počet minut.', en: 'As h:mm:ss, mm:ss or a number of minutes.' },
};

const inputs = [
  {
    id: 'find', type: 'select', default: 'speed', label: { cs: 'Hledám', en: 'Find' },
    options: [
      { value: 'speed', label: { cs: 'průměrnou rychlost', en: 'average speed' } },
      { value: 'time', label: { cs: 'dobu jízdy', en: 'travel time' } },
      { value: 'distance', label: { cs: 'vzdálenost', en: 'distance' } },
    ],
  },
  { id: 'distance', type: 'number', default: 205, min: 0, max: 1e7, step: 1, unit: 'km', label: { cs: 'Vzdálenost', en: 'Distance' } },
  { id: 'time', ...DURATION_INPUT, default: '2:15:00', label: { cs: 'Doba (h:mm:ss)', en: 'Time (h:mm:ss)' } },
  { id: 'speed', type: 'number', default: 90, min: 0.001, max: 1e6, step: 1, unit: 'km/h', label: { cs: 'Průměrná rychlost', en: 'Average speed' } },
];

const outputs = [
  { id: 'speed', label: { cs: 'Průměrná rychlost', en: 'Average speed' }, unit: 'km/h', significant: 5 },
  { id: 'time', type: 'text', label: { cs: 'Doba', en: 'Time' } },
  { id: 'distance', label: { cs: 'Vzdálenost', en: 'Distance' }, unit: 'km', significant: 5 },
  { id: 'metresPerSecond', label: { cs: 'Rychlost', en: 'Speed' }, unit: 'm/s', significant: 4 },
];

export default {
  id: 'average-speed',
  kind: 'calculator',
  category: 'transport',
  tags: ['transport'],
  name: { cs: 'Průměrná rychlost, čas a vzdálenost', en: 'Average speed, time and distance' },
  description: {
    cs: 'Ze dvou hodnot dopočítá třetí: v = s / t. Za jak dlouho dojedu 205 km průměrem 90 km/h? 2 h 17 min. Průměrná rychlost zahrnuje i zastávky a zdržení, proto bývá znatelně nižší než rychlost na dálnici.',
    en: 'Works out the third value from two: v = s / t. How long do 205 km take at an average of 90 km/h? 2 h 17 min. The average speed includes stops and delays, so it tends to be well below the motorway speed.',
  },
  keywords: {
    cs: ['průměrná rychlost', 'doba jízdy', 'vzdálenost', 'za jak dlouho', 'km/h', 'cesta', 'rychlost'],
    en: ['average speed', 'travel time', 'distance', 'how long', 'km/h', 'journey', 'speed distance time'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { find } = read.values;
    let distance = read.values.distance;
    let speed = read.values.speed;
    let seconds = /** @type {number} */ (parseDuration(read.values.time));
    if (find === 'speed') {
      if (seconds <= 0) return emptyResult(outputs, [{ cs: 'Doba musí být delší než nula.', en: 'The time must be above zero.' }]);
      speed = distance / (seconds / 3600);
    } else if (find === 'time') {
      seconds = distance / speed * 3600;
    } else {
      distance = speed * seconds / 3600;
    }
    return {
      values: { speed, time: bilingual(() => durationText(seconds)), distance, metresPerSecond: speed / 3.6 },
      warnings: [],
    };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – average speed' }],
};
