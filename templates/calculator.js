/**
 * Template for a new calculator. Copy it to
 * calc_tools/static/calc_tools/tools/<category>/<id>.js, fill it in and
 * register it in index.js.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * The pure core of the calculation, exported for reuse and tests.
 * @param {number} a
 * @param {number} b
 */
export function example(a, b) {
  return a * b;
}

const inputs = [
  { id: 'a', type: 'number', default: 1, min: 0, max: 100, step: 1, unit: 'g', label: { cs: 'Vstup A', en: 'Input A' } },
  { id: 'b', type: 'number', default: 2, min: 0, max: 100, step: 1, label: { cs: 'Vstup B', en: 'Input B' } },
];

const outputs = [
  { id: 'result', label: { cs: 'Výsledek', en: 'Result' }, unit: 'g', precision: 1 },
];

export default {
  id: 'example',
  kind: 'calculator',
  category: 'beer',
  tags: ['beer'],
  name: { cs: 'Název', en: 'Name' },
  description: { cs: 'Co nástroj počítá a za jakých předpokladů.', en: 'What the tool calculates and under which assumptions.' },
  keywords: { cs: ['klíčové slovo'], en: ['keyword'] },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    return { values: { result: example(read.values.a, read.values.b) }, warnings: [] };
  },
  references: [{ title: 'Source of the formula', url: 'https://example.org/' }],
};
