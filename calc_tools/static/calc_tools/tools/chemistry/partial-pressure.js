/**
 * Partial pressures of a gas mixture (Dalton's law).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'total', type: 'number', default: 101.325, min: 0, max: 1e7, step: 1, unit: 'kPa', label: { cs: 'Celkový tlak směsi', en: 'Total pressure of the mixture' } },
  {
    id: 'gases', type: 'list', min: 1, max: 20, label: { cs: 'Složka', en: 'Component' },
    fields: [
      { id: 'name', type: 'text', optional: true, maxLength: 30, pattern: /^[\p{L}\p{N} ₀-₉()+-]+$/u, label: { cs: 'Název (nepovinný)', en: 'Name (optional)' } },
      { id: 'share', type: 'number', default: 21, min: 0, max: 100, step: 0.1, unit: { cs: '% obj. (= mol. %)', en: '% by volume (= mole %)' }, label: { cs: 'Podíl', en: 'Share' } },
    ],
  },
];

const outputs = [
  { id: 'pressures', type: 'list', label: { cs: 'Parciální tlak složky', en: 'Partial pressure of component' }, unit: 'kPa', significant: 6 },
  { id: 'sum', label: { cs: 'Součet podílů', en: 'Sum of shares' }, unit: '%', significant: 6 },
];

export default {
  id: 'partial-pressure',
  kind: 'calculator',
  category: 'chemistry-gases',
  tags: ['chemistry'],
  name: { cs: 'Parciální tlaky (Daltonův zákon)', en: 'Partial pressures (Dalton\'s law)' },
  description: {
    cs: 'Každá složka směsi ideálních plynů přispívá k celkovému tlaku podle svého molárního (objemového) podílu: pᵢ = xᵢ · p. Kyslík ve vzduchu (21 %) má u hladiny moře parciální tlak asi 21 kPa. Pro rozpustnost plynu v kapalině rozhoduje právě parciální tlak.',
    en: 'Each component of an ideal gas mixture adds to the total pressure by its mole (volume) fraction: pᵢ = xᵢ · p. Oxygen in air (21 %) has a partial pressure of about 21 kPa at sea level. It is the partial pressure that sets the solubility of a gas in a liquid.',
  },
  keywords: {
    cs: ['parciální tlak', 'daltonův zákon', 'směs plynů', 'molární zlomek', 'tlak', 'vzduch'],
    en: ['partial pressure', 'dalton law', 'gas mixture', 'mole fraction', 'pressure', 'air'],
  },
  inputs,
  outputs,
  compute(values) {
    const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
    const read = readInputs(inputs, { ...source, gases: Object.hasOwn(source, 'gases') && source.gases != null ? source.gases : [{}] });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { total, gases } = read.values;
    const sum = gases.reduce((/** @type {number} */ acc, /** @type {any} */ gas) => acc + gas.share, 0);
    const warnings = Math.abs(sum - 100) > 0.01
      ? [{ cs: `Podíly dávají dohromady ${String(Math.round(sum * 100) / 100).replace('.', ',')} %, ne 100 %.`, en: `The shares add up to ${Math.round(sum * 100) / 100} %, not 100 %.` }]
      : [];
    return { values: { pressures: gases.map((/** @type {any} */ gas) => total * gas.share / 100), sum }, warnings };
  },
  references: [{ title: 'Atkins, P., de Paula, J.: Physical Chemistry – Dalton\'s law' }],
};
