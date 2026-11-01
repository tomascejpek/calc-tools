/**
 * Sound levels: adding sources and attenuation with distance.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { NUMBER_LIST_PATTERN, parseNumbers } from '../math/statistics.js';

/**
 * Total level of incoherent sources, dB.
 * @param {number[]} levels dB
 */
export function addLevels(levels) {
  return 10 * Math.log10(levels.reduce((sum, level) => sum + 10 ** (level / 10), 0));
}

const inputs = [
  {
    id: 'levels', type: 'text', default: '80 80', maxLength: 2000, pattern: NUMBER_LIST_PATTERN,
    hint: { cs: 'Hladiny v dB oddělené mezerou.', en: 'Levels in dB separated by spaces.' },
    label: { cs: 'Hladiny zdrojů', en: 'Source levels' },
  },
  { id: 'from', type: 'number', default: 1, min: 0.001, max: 1e7, step: 0.5, unit: 'm', label: { cs: 'Vzdálenost, ve které hladiny platí', en: 'Distance at which the levels apply' } },
  { id: 'to', type: 'number', default: 10, min: 0.001, max: 1e7, step: 0.5, unit: 'm', label: { cs: 'Nová vzdálenost', en: 'New distance' } },
];

const outputs = [
  { id: 'total', label: { cs: 'Celková hladina', en: 'Total level' }, unit: 'dB', precision: 1 },
  { id: 'atDistance', label: { cs: 'Celková hladina v nové vzdálenosti', en: 'Total level at the new distance' }, unit: 'dB', precision: 1 },
  { id: 'attenuation', label: { cs: 'Útlum vzdáleností', en: 'Attenuation by distance' }, unit: 'dB', precision: 1 },
];

export default {
  id: 'decibels',
  kind: 'calculator',
  category: 'physics-waves',
  tags: ['physics'],
  name: { cs: 'Decibely: sčítání a útlum', en: 'Decibels: adding and distance' },
  description: {
    cs: 'Decibely se nesčítají přímo: dva stejné zdroje dají o 3 dB víc (80 + 80 dB = 83 dB), deset stejných o 10 dB. Od bodového zdroje ve volném prostoru klesá hladina o 6 dB s každým zdvojnásobením vzdálenosti (−20·log(r₂/r₁)). Odrazy a překážky ve skutečnosti útlum mění.',
    en: 'Decibels do not add directly: two equal sources give 3 dB more (80 + 80 dB = 83 dB), ten equal ones 10 dB more. Away from a point source in free space the level drops by 6 dB with every doubling of distance (−20·log(r₂/r₁)). Reflections and obstacles change the attenuation in reality.',
  },
  keywords: {
    cs: ['decibely', 'db', 'hluk', 'hladina akustického tlaku', 'sčítání hluku', 'útlum', 'akustika'],
    en: ['decibels', 'db', 'noise', 'sound pressure level', 'adding decibels', 'attenuation', 'acoustics', 'inverse square'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const levels = parseNumbers(read.values.levels);
    if (levels === null || !levels.length) return emptyResult(outputs, [{ cs: 'Hladiny musí být čísla.', en: 'The levels must be numbers.' }]);
    if (levels.length > 100 || levels.some((level) => Math.abs(level) > 300)) {
      return emptyResult(outputs, [{ cs: 'Nejvýš 100 zdrojů v rozsahu ±300 dB.', en: 'At most 100 sources within ±300 dB.' }]);
    }
    const total = addLevels(levels);
    const attenuation = 20 * Math.log10(read.values.to / read.values.from);
    return { values: { total, atDistance: total - attenuation, attenuation }, warnings: [] };
  },
  references: [{ title: 'Kinsler, L. E. et al.: Fundamentals of Acoustics, 4th ed. – sound levels and spherical spreading' }],
};
