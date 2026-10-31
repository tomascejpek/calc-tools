/**
 * Hop utilisation by boil time and gravity, compared across methods.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { danielsUtilization, garetzUtilization, gravityAdjustment, ragerUtilization, tinsethUtilization } from './ibu.js';

const inputs = [
  { id: 'minutes', type: 'number', default: 60, min: 0, max: 240, step: 5, unit: 'min', label: { cs: 'Doba varu', en: 'Boil time' } },
  { id: 'gravity', type: 'number', default: 1.050, min: 1.000, max: 1.200, step: 0.001, unit: 'SG', label: { cs: 'Hustota mladiny při varu', en: 'Boil gravity' } },
];

const outputs = [
  { id: 'tinseth', label: { cs: 'Tinseth', en: 'Tinseth' }, unit: '%', precision: 1 },
  { id: 'rager', label: { cs: 'Rager', en: 'Rager' }, unit: '%', precision: 1 },
  { id: 'garetz', label: { cs: 'Garetz (bez korekce na dávku chmele)', en: 'Garetz (without the hopping-rate factor)' }, unit: '%', precision: 1 },
  { id: 'danielsLeaf', label: { cs: 'Daniels – hlávkový chmel', en: 'Daniels – whole leaf' }, unit: '%', precision: 1 },
  { id: 'danielsPellet', label: { cs: 'Daniels – granule', en: 'Daniels – pellets' }, unit: '%', precision: 1 },
];

export default {
  id: 'hop-utilization',
  kind: 'calculator',
  category: 'hops',
  tags: ['beer'],
  name: { cs: 'Využití chmele podle doby varu', en: 'Hop utilisation by boil time' },
  description: {
    cs: 'Jaká část alfa hořkých kyselin se při dané době varu a hustotě mladiny izomerizuje a přejde do piva, podle čtyř obvyklých metod. Hodnoty jsou pro hlávkový chmel; granule mají asi o 10 % víc.',
    en: 'What share of the alpha acids is isomerised and ends up in the beer for a given boil time and wort gravity, by four common methods. Values are for whole hops; pellets give about 10 % more.',
  },
  keywords: {
    cs: ['využití chmele', 'utilizace', 'doba varu', 'chmelení', 'izomerace', 'tinseth', 'rager', 'garetz', 'daniels'],
    en: ['hop utilization', 'utilisation', 'boil time', 'isomerization', 'tinseth', 'rager', 'garetz', 'daniels'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { minutes, gravity } = read.values;
    const adjustment = gravityAdjustment(gravity);
    return {
      values: {
        tinseth: tinsethUtilization(gravity, minutes) * 100,
        rager: ragerUtilization(minutes) / adjustment * 100,
        garetz: garetzUtilization(minutes) / adjustment * 100,
        danielsLeaf: danielsUtilization(minutes) / adjustment * 100,
        danielsPellet: danielsUtilization(minutes, true) / adjustment * 100,
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Tinseth, G.: Glenn\'s Hop Utilization Numbers', url: 'https://www.realbeer.com/hops/research.html' },
    { title: 'Hall, M. L.: What\'s Your IBU? Zymurgy, Special Issue 1997' },
    { title: 'Daniels, R.: Designing Great Beers. Brewers Publications, 1996' },
  ],
};
