/**
 * Alcoholmeter reading corrected to 20 °C.
 */

import { ETHANOL_T_MAX, ETHANOL_T_MIN, correctAlcoholmeter } from '../../core/ethanol.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'reading', type: 'number', default: 40, min: 0, max: 100, step: 0.1, unit: { cs: '% obj.', en: '% ABV' }, label: { cs: 'Údaj lihoměru', en: 'Alcoholmeter reading' } },
  { id: 'temperature', type: 'number', default: 25, min: ETHANOL_T_MIN, max: ETHANOL_T_MAX, step: 0.5, unit: '°C', label: { cs: 'Teplota destilátu', en: 'Spirit temperature' } },
];

const outputs = [
  { id: 'abv', label: { cs: 'Skutečný obsah alkoholu při 20 °C', en: 'True alcohol at 20 °C' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 },
  { id: 'difference', label: { cs: 'Oprava', en: 'Correction' }, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 },
];

export default {
  id: 'alcoholmeter',
  kind: 'calculator',
  category: 'wine',
  tags: ['spirits'],
  name: { cs: 'Lihoměr – teplotní korekce', en: 'Alcoholmeter temperature correction' },
  description: {
    cs: 'Oprava údaje lihoměru (alkoholometru) kalibrovaného na 20 °C, když destilát má jinou teplotu. Teplý destilát je řidší a lihoměr ukazuje víc, studený méně. Počítá podle vzorce mezinárodních alkoholometrických tabulek (OIML) včetně roztažnosti skla; platí jen pro směs vody a alkoholu, ne pro likéry s cukrem.',
    en: 'Corrects the reading of an alcoholmeter calibrated at 20 °C when the spirit is at another temperature. Warm spirit is less dense and reads high, cold spirit reads low. Uses the formula of the International Alcoholometric Tables (OIML) including the expansion of the glass; valid only for water–alcohol mixtures, not for sweetened liqueurs.',
  },
  keywords: {
    cs: ['lihoměr', 'alkoholometr', 'teplotní korekce', 'destilát', 'pálenka', 'síla', 'alkohol', 'oiml'],
    en: ['alcoholmeter', 'alcoholometer', 'proof hydrometer', 'temperature correction', 'spirit', 'abv', 'oiml'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { reading, temperature } = read.values;
    const abv = correctAlcoholmeter(reading, temperature);
    if (abv === null) {
      return emptyResult(outputs, [{ cs: 'Pro tento údaj a teplotu nelze sílu určit.', en: 'The strength cannot be determined for this reading and temperature.' }]);
    }
    return { values: { abv, difference: abv - reading }, warnings: [] };
  },
  references: [
    { title: 'OIML R 22 International Alcoholometric Tables, formula as in Council Directive 76/766/EEC', url: 'https://eur-lex.europa.eu/eli/dir/1976/766/oj/eng' },
    { title: 'OIML R 44 Alcoholometers and alcohol hydrometers (glass expansion 25·10⁻⁶ /°C)', url: 'https://www.oiml.org/en/files/pdf_r/r044-e85.pdf' },
  ],
};
