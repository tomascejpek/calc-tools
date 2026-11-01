/**
 * Race time prediction by Riegel's formula.
 */

import { bilingual } from '../../core/format.js';
import { durationText, parseDuration } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { DURATION_INPUT } from '../transport/average-speed.js';
import { RACES } from '../transport/pace.js';

/**
 * Predicted time for another distance: T₂ = T₁ · (D₂ / D₁)^1.06.
 * @param {number} seconds
 * @param {number} distance km
 * @param {number} target km
 * @param {number} [exponent]
 */
export function riegel(seconds, distance, target, exponent = 1.06) {
  return seconds * (target / distance) ** exponent;
}

const inputs = [
  { id: 'distance', type: 'number', default: 10, min: 0.1, max: 500, step: 0.1, unit: 'km', label: { cs: 'Uběhnutá vzdálenost', en: 'Distance run' } },
  { id: 'time', ...DURATION_INPUT, default: '50:00', label: { cs: 'Čas (h:mm:ss)', en: 'Time (h:mm:ss)' } },
  { id: 'target', type: 'number', default: 21.0975, min: 0.1, max: 500, step: 0.1, unit: 'km', label: { cs: 'Cílová vzdálenost', en: 'Target distance' } },
  { id: 'exponent', type: 'number', default: 1.06, min: 1, max: 1.2, step: 0.01, label: { cs: 'Exponent únavy (Riegel 1,06)', en: 'Fatigue exponent (Riegel 1.06)' } },
];

const outputs = [
  { id: 'predicted', type: 'text', label: { cs: 'Předpokládaný čas', en: 'Predicted time' } },
  { id: 'pace', type: 'text', label: { cs: 'Tempo na km', en: 'Pace per km' } },
  { id: 'race5k', type: 'text', label: { cs: '5 km', en: '5 km' } },
  { id: 'race10k', type: 'text', label: { cs: '10 km', en: '10 km' } },
  { id: 'half', type: 'text', label: { cs: 'Půlmaraton', en: 'Half marathon' } },
  { id: 'marathon', type: 'text', label: { cs: 'Maraton', en: 'Marathon' } },
];

export default {
  id: 'race-predictor',
  kind: 'calculator',
  category: 'sport',
  tags: ['sport'],
  name: { cs: 'Předpověď času závodu (Riegel)', en: 'Race time predictor (Riegel)' },
  description: {
    cs: 'Odhad času na jinou trať podle Riegelova vzorce T₂ = T₁ · (D₂ / D₁)^1,06 z výsledku na známé trati. Desítka za 50 minut dává půlmaraton asi za 1:50. Platí pro trati zhruba od 3 do 42 km a předpokládá stejnou připravenost; na maraton bývá skutečný čas bez specifického tréninku delší.',
    en: 'Estimates the time for another distance by Riegel\'s formula T₂ = T₁ · (D₂ / D₁)^1.06 from a result on a known distance. A 50-minute 10 km gives a half marathon of about 1:50. Holds for distances from roughly 3 to 42 km and assumes the same fitness; without specific training the real marathon time tends to be longer.',
  },
  keywords: {
    cs: ['předpověď času', 'riegel', 'běh', 'maraton', 'půlmaraton', 'závod', 'čas na trať'],
    en: ['race predictor', 'riegel', 'running', 'marathon', 'half marathon', 'race time', 'finish time'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { distance, target, exponent } = read.values;
    const seconds = /** @type {number} */ (parseDuration(read.values.time));
    if (!(seconds > 0)) return emptyResult(outputs, [{ cs: 'Čas musí být delší než nula.', en: 'The time must be above zero.' }]);
    const text = (/** @type {number} */ km) => bilingual(() => durationText(riegel(seconds, distance, km, exponent)));
    const predicted = riegel(seconds, distance, target, exponent);
    return {
      values: {
        predicted: text(target),
        pace: bilingual(() => durationText(predicted / target)),
        race5k: text(RACES['5k']),
        race10k: text(RACES['10k']),
        half: text(RACES.half),
        marathon: text(RACES.marathon),
      },
      warnings: target / distance > 10 || distance / target > 10
        ? [{ cs: 'Trati se liší víc než desetkrát; odhad je nejistý.', en: 'The distances differ more than tenfold; the estimate is uncertain.' }]
        : [],
    };
  },
  references: [{ title: 'Riegel, P. S.: Athletic records and human endurance. American Scientist 69 (1981)' }],
};
