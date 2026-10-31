/**
 * Brewing salt additions and the resulting water profile.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { CACO3_EQ, HCO3_MOLAR, SALTS, residualAlkalinity } from '../../core/water.js';

const ION_IDS = ['calcium', 'magnesium', 'sodium', 'sulfate', 'chloride', 'bicarbonate'];

/**
 * Water profile after adding salts, mg/l.
 * @param {Record<string, number>} water ions in mg/l
 * @param {Record<string, number>} grams salt id → grams
 * @param {number} litres
 */
export function addSalts(water, grams, litres) {
  /** @type {Record<string, number>} */
  const result = { ...water };
  for (const [salt, amount] of Object.entries(grams)) {
    const ions = SALTS[salt]?.ions ?? {};
    for (const [ion, mgPerGram] of Object.entries(ions)) {
      result[ion] = (result[ion] ?? 0) + mgPerGram * amount / litres;
    }
  }
  return result;
}

const ion = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en, /** @type {number} */ fallback) => ({
  id, type: 'number', default: fallback, min: 0, max: 2000, step: 1, unit: 'mg/l', label: { cs, en },
});
const salt = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', default: 0, min: 0, max: 10000, step: 0.1, unit: 'g', label: { cs, en },
});

const inputs = [
  { id: 'volume', type: 'number', default: 25, min: 0.1, max: 100000, step: 0.5, unit: 'l', label: { cs: 'Objem vody', en: 'Water volume' } },
  ion('calcium', 'Vápník (Ca²⁺) ve vodě', 'Calcium (Ca²⁺) in the water', 20),
  ion('magnesium', 'Hořčík (Mg²⁺) ve vodě', 'Magnesium (Mg²⁺) in the water', 5),
  ion('sodium', 'Sodík (Na⁺) ve vodě', 'Sodium (Na⁺) in the water', 10),
  ion('sulfate', 'Sírany (SO₄²⁻) ve vodě', 'Sulfate (SO₄²⁻) in the water', 20),
  ion('chloride', 'Chloridy (Cl⁻) ve vodě', 'Chloride (Cl⁻) in the water', 15),
  ion('bicarbonate', 'Hydrogenuhličitany (HCO₃⁻) ve vodě', 'Bicarbonate (HCO₃⁻) in the water', 60),
  salt('gypsum', 'Sádrovec CaSO₄·2H₂O', 'Gypsum CaSO₄·2H₂O'),
  salt('calciumChloride', 'Chlorid vápenatý CaCl₂·2H₂O', 'Calcium chloride CaCl₂·2H₂O'),
  salt('epsom', 'Hořká sůl MgSO₄·7H₂O', 'Epsom salt MgSO₄·7H₂O'),
  salt('salt', 'Kuchyňská sůl NaCl', 'Table salt NaCl'),
  salt('bakingSoda', 'Jedlá soda NaHCO₃', 'Baking soda NaHCO₃'),
];

const result = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, label: { cs, en }, unit: 'mg/l', precision: 0,
});

const outputs = [
  result('calcium', 'Vápník (Ca²⁺)', 'Calcium (Ca²⁺)'),
  result('magnesium', 'Hořčík (Mg²⁺)', 'Magnesium (Mg²⁺)'),
  result('sodium', 'Sodík (Na⁺)', 'Sodium (Na⁺)'),
  result('sulfate', 'Sírany (SO₄²⁻)', 'Sulfate (SO₄²⁻)'),
  result('chloride', 'Chloridy (Cl⁻)', 'Chloride (Cl⁻)'),
  result('bicarbonate', 'Hydrogenuhličitany (HCO₃⁻)', 'Bicarbonate (HCO₃⁻)'),
  { id: 'ratio', label: { cs: 'Poměr SO₄ : Cl', en: 'SO₄ : Cl ratio' }, unit: '', precision: 2 },
  { id: 'ra', label: { cs: 'Zbytková alkalita', en: 'Residual alkalinity' }, unit: { cs: 'mg/l CaCO₃', en: 'mg/l as CaCO₃' }, precision: 0 },
];

export default {
  id: 'water-salts',
  kind: 'calculator',
  category: 'water-chemistry',
  tags: ['beer'],
  name: { cs: 'Minerální přídavky do vody', en: 'Brewing salt additions' },
  description: {
    cs: 'Jak se změní složení vody po přidání sádrovce, chloridu vápenatého, hořké soli, kuchyňské soli nebo jedlé sody. Ukáže výsledné ionty, poměr síranů a chloridů a zbytkovou alkalitu. Soli se počítají v hydratované formě, ve které se prodávají.',
    en: 'How the water profile changes after adding gypsum, calcium chloride, Epsom salt, table salt or baking soda. Shows the resulting ions, the sulfate to chloride ratio and residual alkalinity. Salts are taken in the hydrated form in which they are sold.',
  },
  keywords: {
    cs: ['minerály', 'soli', 'úprava vody', 'sádrovec', 'chlorid vápenatý', 'hořká sůl', 'jedlá soda', 'vápník', 'sírany', 'chloridy', 'profil vody'],
    en: ['brewing salts', 'water profile', 'gypsum', 'calcium chloride', 'epsom salt', 'baking soda', 'calcium', 'sulfate', 'chloride', 'water adjustment'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { volume } = read.values;
    /** @type {Record<string, number>} */
    const water = {};
    for (const id of ION_IDS) water[id] = read.values[id];
    /** @type {Record<string, number>} */
    const grams = {};
    for (const id of Object.keys(SALTS)) grams[id] = read.values[id];
    const profile = addSalts(water, grams, volume);
    const alkalinity = profile.bicarbonate * CACO3_EQ / HCO3_MOLAR;
    const warnings = [];
    if (profile.sodium > 150) warnings.push({ cs: 'Sodík nad 150 mg/l může chutnat slaně.', en: 'Sodium above 150 mg/l may taste salty.' });
    if (profile.sulfate > 500) warnings.push({ cs: 'Sírany nad 500 mg/l bývají cítit sírově a hořce.', en: 'Sulfate above 500 mg/l tends to taste sulfury and harsh.' });
    return {
      values: {
        ...profile,
        ratio: profile.chloride > 0 ? profile.sulfate / profile.chloride : null,
        ra: residualAlkalinity(alkalinity, profile.calcium, profile.magnesium),
      },
      warnings,
    };
  },
  references: [
    { title: 'Palmer, J., Kaminski, C.: Water – A Comprehensive Guide for Brewers. Brewers Publications, 2013 – ion contributions of brewing salts' },
    { title: 'Molar masses: IUPAC standard atomic weights', url: 'https://iupac.qmul.ac.uk/AtWt/' },
  ],
};
