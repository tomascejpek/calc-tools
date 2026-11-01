/**
 * Running and cycling pace: min/km ⇄ km/h ⇄ min/mile, with race times.
 */

import { bilingual } from '../../core/format.js';
import { durationText, parseDuration } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Miles in km. */
const MILE = 1.609344;

/** Race distances, km. */
export const RACES = { '5k': 5, '10k': 10, half: 21.0975, marathon: 42.195 };

const inputs = [
  {
    id: 'known', type: 'select', default: 'pace', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'pace', label: { cs: 'tempo (min/km)', en: 'pace (min/km)' } },
      { value: 'paceMile', label: { cs: 'tempo (min/míli)', en: 'pace (min/mile)' } },
      { value: 'speed', label: { cs: 'rychlost (km/h)', en: 'speed (km/h)' } },
    ],
  },
  {
    id: 'pace', type: 'text', default: '5:30', maxLength: 8, pattern: /^\d{1,2}:[0-5]\d$|^\d+([.,]\d+)?$/,
    hint: { cs: 'Ve tvaru m:ss nebo počet minut.', en: 'As m:ss or a number of minutes.' }, label: { cs: 'Tempo', en: 'Pace' },
  },
  { id: 'speed', type: 'number', default: 12, min: 0.1, max: 200, step: 0.1, unit: 'km/h', label: { cs: 'Rychlost', en: 'Speed' } },
];

const outputs = [
  { id: 'paceKm', type: 'text', label: { cs: 'Tempo na km', en: 'Pace per km' } },
  { id: 'paceMile', type: 'text', label: { cs: 'Tempo na míli', en: 'Pace per mile' } },
  { id: 'speed', label: { cs: 'Rychlost', en: 'Speed' }, unit: 'km/h', precision: 2 },
  { id: 'mph', label: { cs: 'Rychlost', en: 'Speed' }, unit: 'mph', precision: 2 },
  { id: 'race5k', type: 'text', label: { cs: 'Čas na 5 km', en: 'Time for 5 km' } },
  { id: 'race10k', type: 'text', label: { cs: 'Čas na 10 km', en: 'Time for 10 km' } },
  { id: 'half', type: 'text', label: { cs: 'Čas na půlmaraton', en: 'Half marathon time' } },
  { id: 'marathon', type: 'text', label: { cs: 'Čas na maraton', en: 'Marathon time' } },
];

export default {
  id: 'pace',
  kind: 'calculator',
  category: 'transport',
  tags: ['transport', 'sport'],
  name: { cs: 'Tempo (min/km ⇄ km/h)', en: 'Pace (min/km ⇄ km/h)' },
  description: {
    cs: 'Převod běžeckého tempa v minutách na kilometr nebo míli na rychlost v km/h a mph a zpět, s časy na 5 km, 10 km, půlmaraton a maraton při stejném tempu. Tempo 5:30 min/km je 10,9 km/h a maraton za 3:52.',
    en: 'Converts running pace in minutes per kilometre or mile to speed in km/h and mph and back, with times for 5 km, 10 km, the half marathon and the marathon at that pace. A pace of 5:30 min/km is 10.9 km/h and a 3:52 marathon.',
  },
  keywords: {
    cs: ['tempo', 'min/km', 'běh', 'rychlost', 'maraton', 'půlmaraton', 'km/h', 'tempo běhu'],
    en: ['pace', 'min/km', 'running pace', 'speed', 'marathon', 'half marathon', 'min/mile', 'pace converter'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { known } = read.values;
    let secondsPerKm;
    if (known === 'speed') {
      secondsPerKm = 3600 / read.values.speed;
    } else {
      const seconds = /** @type {number} */ (parseDuration(read.values.pace));
      if (!(seconds > 0)) return emptyResult(outputs, [{ cs: 'Tempo musí být delší než nula.', en: 'The pace must be above zero.' }]);
      secondsPerKm = known === 'paceMile' ? seconds / MILE : seconds;
    }
    const text = (/** @type {number} */ seconds) => bilingual(() => durationText(seconds));
    const speed = 3600 / secondsPerKm;
    return {
      values: {
        paceKm: text(secondsPerKm),
        paceMile: text(secondsPerKm * MILE),
        speed,
        mph: speed / MILE,
        race5k: text(secondsPerKm * RACES['5k']),
        race10k: text(secondsPerKm * RACES['10k']),
        half: text(secondsPerKm * RACES.half),
        marathon: text(secondsPerKm * RACES.marathon),
      },
      warnings: [],
    };
  },
  references: [{ title: 'World Athletics: road race distances (marathon 42.195 km)' }],
};
