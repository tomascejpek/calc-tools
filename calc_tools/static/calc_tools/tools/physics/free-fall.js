/**
 * Free fall without air resistance.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'height', type: 'number', default: 20, min: 0, max: 1e6, step: 1, unit: 'm', label: { cs: 'Výška pádu', en: 'Drop height' } },
  { id: 'g', type: 'number', default: G0, min: 0.01, max: 1000, step: 0.01, unit: 'm/s²', label: { cs: 'Tíhové zrychlení g', en: 'Gravity g' } },
];

const outputs = [
  { id: 'time', label: { cs: 'Doba pádu', en: 'Fall time' }, unit: 's', significant: 6 },
  { id: 'speed', label: { cs: 'Rychlost dopadu', en: 'Impact speed' }, unit: 'm/s', significant: 6 },
  { id: 'speedKmh', label: { cs: 'Rychlost dopadu', en: 'Impact speed' }, unit: 'km/h', significant: 6 },
];

export default {
  id: 'free-fall',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Volný pád', en: 'Free fall' },
  description: {
    cs: 'Doba pádu t = √(2h / g) a rychlost dopadu v = √(2gh) z dané výšky bez odporu vzduchu. Pro Měsíc zadejte g = 1,62 m/s², pro Mars 3,71 m/s². Ve vzduchu padají lehké a velké předměty pomaleji.',
    en: 'Fall time t = √(2h / g) and impact speed v = √(2gh) from a height without air resistance. For the Moon enter g = 1.62 m/s², for Mars 3.71 m/s². In air light and large objects fall more slowly.',
  },
  keywords: {
    cs: ['volný pád', 'pád', 'doba pádu', 'rychlost dopadu', 'tíhové zrychlení', 'gravitace'],
    en: ['free fall', 'falling', 'fall time', 'impact speed', 'gravity', 'drop'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { height, g } = read.values;
    const speed = Math.sqrt(2 * g * height);
    return { values: { time: Math.sqrt(2 * height / g), speed, speedKmh: speed * 3.6 }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – free-fall acceleration' }],
};
