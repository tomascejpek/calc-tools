/**
 * Inner surface temperature and the risk of condensation and mould.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { dewPoint } from './humidity.js';

/** Inner surface resistance for condensation checks (ČSN 73 0540-2, glazing 0.13), m²K/W. */
const RSI = 0.25;

const inputs = [
  { id: 'inside', type: 'number', default: 21, min: -20, max: 50, step: 0.5, unit: '°C', label: { cs: 'Teplota v místnosti', en: 'Room temperature' } },
  { id: 'rh', type: 'number', default: 50, min: 1, max: 100, step: 1, unit: '%', label: { cs: 'Relativní vlhkost v místnosti', en: 'Room relative humidity' } },
  { id: 'outside', type: 'number', default: -12, min: -50, max: 40, step: 1, unit: '°C', label: { cs: 'Venkovní teplota', en: 'Outside temperature' } },
  { id: 'u', type: 'number', default: 1.4, min: 0.01, max: 10, step: 0.01, unit: 'W/(m²·K)', label: { cs: 'Součinitel U konstrukce (v místě mostu vyšší)', en: 'U-value of the element (higher at a bridge)' } },
];

const outputs = [
  { id: 'surface', label: { cs: 'Teplota vnitřního povrchu', en: 'Inner surface temperature' }, unit: '°C', precision: 1 },
  { id: 'dewPoint', label: { cs: 'Rosný bod vzduchu v místnosti', en: 'Dew point of the room air' }, unit: '°C', precision: 1 },
  { id: 'mouldLimit', label: { cs: 'Mez růstu plísní (80 % vlhkosti u povrchu)', en: 'Mould limit (80 % humidity at the surface)' }, unit: '°C', precision: 1 },
  { id: 'fRsi', label: { cs: 'Teplotní faktor f_Rsi', en: 'Temperature factor f_Rsi' }, precision: 3 },
  { id: 'verdict', type: 'text', label: { cs: 'Hodnocení', en: 'Verdict' } },
];

export default {
  id: 'surface-condensation',
  kind: 'calculator',
  category: 'eng-building',
  tags: ['engineering'],
  name: { cs: 'Rosný bod na povrchu stěny (kondenzace, plísně)', en: 'Surface condensation and mould risk' },
  description: {
    cs: 'Teplota vnitřního povrchu stěny nebo okna θsi = θi − U · Rsi · (θi − θe) a srovnání s rosným bodem vzduchu v místnosti a s mezí pro plísně (80 % relativní vlhkosti u povrchu). Klesne-li povrch pod rosný bod, sráží se voda; pod mezí plísní roste riziko plísní i bez viditelné kondenzace. Rsi = 0,25 podle ČSN 73 0540-2.',
    en: 'Inner surface temperature of a wall or window θsi = θi − U · Rsi · (θi − θe), compared with the dew point of the room air and the mould limit (80 % relative humidity at the surface). If the surface falls below the dew point water condenses; below the mould limit mould may grow even without visible condensation. Rsi = 0.25 by ČSN 73 0540-2.',
  },
  keywords: {
    cs: ['rosný bod', 'kondenzace', 'plíseň', 'vlhkost', 'povrchová teplota', 'tepelný most', 'okno', 'frsi'],
    en: ['dew point', 'condensation', 'mould', 'mold', 'surface temperature', 'thermal bridge', 'window', 'frsi'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { inside, rh, outside, u } = read.values;
    if (outside >= inside) return emptyResult(outputs, [{ cs: 'Venku musí být chladněji než uvnitř.', en: 'It must be colder outside than inside.' }]);
    const surface = inside - u * RSI * (inside - outside);
    const dew = dewPoint(inside, rh);
    // Surface temperature at which the room air would reach 80 % relative humidity
    const mouldLimit = dewPoint(inside, Math.min(100, rh / 0.8));
    const verdict = surface < dew
      ? { cs: 'na povrchu kondenzuje voda', en: 'water condenses on the surface' }
      : surface < mouldLimit
        ? { cs: 'riziko plísní', en: 'risk of mould' }
        : { cs: 'bez kondenzace a plísní', en: 'no condensation or mould' };
    return { values: { surface, dewPoint: dew, mouldLimit, fRsi: (surface - outside) / (inside - outside), verdict }, warnings: [] };
  },
  references: [
    { title: 'ČSN 73 0540-2: Tepelná ochrana budov – Požadavky (nejnižší povrchová teplota, f_Rsi)' },
    { title: 'ČSN EN ISO 13788: Tepelně vlhkostní chování stavebních dílců – Vnitřní povrchová teplota' },
  ],
};
