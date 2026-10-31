/**
 * Refractometer readings before and during fermentation (Sean Terrill).
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { platoToSg, sgToPlato } from '../../core/units.js';
import { abvStandard } from './abv.js';

/**
 * Final gravity from initial and current Brix readings, Terrill's cubic fit.
 * @param {number} initialBrix corrected by the wort correction factor
 * @param {number} currentBrix corrected by the wort correction factor
 */
export function terrillFg(initialBrix, currentBrix) {
  const i = initialBrix;
  const f = currentBrix;
  return 1 - 0.0044993 * i + 0.011774 * f + 0.00027581 * i ** 2 - 0.0012717 * f ** 2
    - 0.0000072800 * i ** 3 + 0.000063293 * f ** 3;
}

const inputs = [
  {
    id: 'stage', type: 'select', default: 'fermenting', label: { cs: 'Měřím', en: 'Measuring' },
    options: [
      { value: 'wort', label: { cs: 'mladinu před kvašením', en: 'wort before fermentation' } },
      { value: 'fermenting', label: { cs: 'pivo během kvašení nebo po něm', en: 'beer during or after fermentation' } },
    ],
  },
  { id: 'initial', type: 'number', default: 12.5, min: 0, max: 40, step: 0.1, unit: '°Bx', label: { cs: 'Původní údaj (mladina)', en: 'Original reading (wort)' } },
  { id: 'current', type: 'number', default: 6.5, min: 0, max: 40, step: 0.1, unit: '°Bx', label: { cs: 'Současný údaj', en: 'Current reading' } },
  { id: 'wcf', type: 'number', default: 1.04, min: 0.9, max: 1.2, step: 0.01, label: { cs: 'Korekční faktor mladiny', en: 'Wort correction factor' } },
];

const outputs = [
  { id: 'og', label: { cs: 'Původní hustota', en: 'Original gravity' }, unit: 'SG', precision: 3 },
  { id: 'originalPlato', label: { cs: 'Původní extrakt', en: 'Original extract' }, unit: '°P', precision: 1 },
  { id: 'fg', label: { cs: 'Současná hustota', en: 'Current gravity' }, unit: 'SG', precision: 3 },
  { id: 'apparentPlato', label: { cs: 'Zdánlivý extrakt', en: 'Apparent extract' }, unit: '°P', precision: 1 },
  { id: 'abv', label: { cs: 'Alkohol', en: 'Alcohol by volume' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 },
  { id: 'attenuation', label: { cs: 'Zdánlivé prokvašení', en: 'Apparent attenuation' }, unit: '%', precision: 0 },
];

export default {
  id: 'refractometer',
  kind: 'calculator',
  category: 'corrections',
  tags: ['beer'],
  name: { cs: 'Refraktometr', en: 'Refractometer' },
  description: {
    cs: 'Přepočet údaje refraktometru (°Bx) na hustotu. Mladinu dělí korekčním faktorem (obvykle 1,02–1,06, zjistíte porovnáním s hustoměrem). Alkohol zkresluje lom světla, proto se během kvašení počítá s původním i současným údajem podle Seana Terrilla.',
    en: 'Converts refractometer readings (°Bx) to gravity. Wort readings are divided by the wort correction factor (usually 1.02–1.06, found by comparing with a hydrometer). Alcohol distorts the refraction, so during fermentation both the original and the current reading are used, after Sean Terrill.',
  },
  keywords: {
    cs: ['refraktometr', 'brix', 'korekce', 'korekční faktor', 'terrill', 'konečná hustota', 'kvašení'],
    en: ['refractometer', 'brix', 'wort correction factor', 'terrill', 'final gravity', 'fermentation'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { stage, initial, current, wcf } = read.values;
    const originalPlato = initial / wcf;
    const og = platoToSg(originalPlato);
    if (stage === 'wort') {
      return { values: { og, originalPlato, fg: og, apparentPlato: originalPlato, abv: 0, attenuation: 0 }, warnings: [] };
    }
    if (current > initial) {
      return emptyResult(outputs, [{ cs: 'Současný údaj nemůže být vyšší než původní.', en: 'The current reading cannot be higher than the original.' }]);
    }
    if (originalPlato <= 0) {
      return emptyResult(outputs, [{ cs: 'Zadejte původní údaj mladiny.', en: 'Enter the original wort reading.' }]);
    }
    const fg = terrillFg(originalPlato, current / wcf);
    const apparentPlato = sgToPlato(fg);
    return {
      values: {
        og,
        originalPlato,
        fg,
        apparentPlato,
        abv: Math.max(0, abvStandard(og, fg)),
        attenuation: (originalPlato - apparentPlato) / originalPlato * 100,
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Terrill, S.: Refractometer FG results (cubic fit, 2011)', url: 'http://seanterrill.com/2011/04/07/refractometer-fg-results/' },
  ],
};
