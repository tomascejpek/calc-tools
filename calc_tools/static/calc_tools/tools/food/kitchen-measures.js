/**
 * Kitchen measures by volume ⇄ weight, by the density of the ingredient.
 */

/** Density of ingredients as usually measured (spooned, not packed), g/ml. */
export const INGREDIENT_DENSITY = {
  water: 1.0,
  milk: 1.03,
  oil: 0.92,
  honey: 1.42,
  flour: 0.53,
  sugar: 0.85,
  brownSugar: 0.93,
  powderedSugar: 0.51,
  butter: 0.96,
  salt: 1.2,
  rice: 0.78,
  oats: 0.38,
  cocoa: 0.42,
};

/** Size of each unit in grams (mass) or millilitres (volume). */
const MASS = { g: 1, kg: 1000, dag: 10, oz: 28.349523125, lb: 453.59237 };
/** US customary cup, ml (exact); spoons and fluid ounces are fractions of it. */
const US_CUP = 236.5882365;
const VOLUME = {
  ml: 1, dl: 100, l: 1000,
  cup: US_CUP, metricCup: 250, czMug: 250,
  tbsp: US_CUP / 16, metricTbsp: 15, tsp: US_CUP / 48, metricTsp: 5,
  floz: US_CUP / 8,
};

/**
 * Grams per unit for an ingredient.
 * @param {string} unitId
 * @param {number} density g/ml
 * @returns {number | null}
 */
function gramsPerUnit(unitId, density) {
  if (Object.hasOwn(MASS, unitId)) return MASS[/** @type {keyof typeof MASS} */ (unitId)];
  if (Object.hasOwn(VOLUME, unitId)) return VOLUME[/** @type {keyof typeof VOLUME} */ (unitId)] * density;
  return null;
}

/**
 * @param {Record<string, any>} params
 */
function densityOf(params) {
  const ingredient = params?.ingredient ?? 'flour';
  if (ingredient === 'custom') return params?.density ?? 1;
  return Object.hasOwn(INGREDIENT_DENSITY, ingredient) ? INGREDIENT_DENSITY[/** @type {keyof typeof INGREDIENT_DENSITY} */ (ingredient)] : null;
}

const unit = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en, /** @type {object} */ extra = {}) => ({
  id, label: { cs, en }, significant: 4, min: 0, ...extra,
});

export default {
  id: 'kitchen-measures',
  kind: 'converter',
  category: 'food-kitchen',
  tags: ['food'],
  name: { cs: 'Kuchyňské míry (hrnek, lžíce, gramy)', en: 'Kitchen measures (cups, spoons, grams)' },
  description: {
    cs: 'Převod hrnků, lžic, lžiček a uncí na gramy a zpět podle hustoty suroviny: hrnek mouky váží asi 125 g, hrnek cukru 200 g. Americký hrnek má 236,6 ml, metrický 250 ml; americká lžíce 14,8 ml, česká 15 ml. Sypké suroviny se liší podle toho, jak se do míry nabírají – berte výsledek jako orientační.',
    en: 'Converts cups, spoons and ounces to grams and back by the density of the ingredient: a cup of flour weighs about 125 g, a cup of sugar 200 g. A US cup is 236.6 ml, a metric cup 250 ml; a US tablespoon 14.8 ml, a metric one 15 ml. Dry ingredients vary with how they are scooped – treat the result as approximate.',
  },
  keywords: {
    cs: ['kuchyňské míry', 'hrnek', 'lžíce', 'lžička', 'cup', 'unce', 'gramy', 'převod receptu', 'americký recept'],
    en: ['kitchen measures', 'cups to grams', 'cup', 'tablespoon', 'teaspoon', 'ounce', 'grams', 'baking conversion'],
  },
  units: [
    unit('g', 'g', 'g', { default: 250 }),
    unit('dag', 'dkg', 'dag'),
    unit('kg', 'kg', 'kg'),
    unit('oz', 'oz (unce hmotnostní)', 'oz (weight)'),
    unit('lb', 'lb (libra)', 'lb (pound)'),
    unit('ml', 'ml', 'ml'),
    unit('dl', 'dl', 'dl'),
    unit('l', 'l', 'l'),
    unit('cup', 'hrnek (US, 236,6 ml)', 'cup (US, 236.6 ml)'),
    unit('metricCup', 'hrnek (metrický, 250 ml)', 'cup (metric, 250 ml)'),
    unit('czMug', 'hrnek (český, 250 ml)', 'mug (Czech, 250 ml)'),
    unit('tbsp', 'lžíce (US, 14,8 ml)', 'tablespoon (US, 14.8 ml)'),
    unit('metricTbsp', 'lžíce (15 ml)', 'tablespoon (metric, 15 ml)'),
    unit('tsp', 'lžička (US, 4,9 ml)', 'teaspoon (US, 4.9 ml)'),
    unit('metricTsp', 'lžička (5 ml)', 'teaspoon (metric, 5 ml)'),
    unit('floz', 'fl oz (unce objemová, US)', 'fl oz (US)'),
  ],
  params: [
    {
      id: 'ingredient', type: 'select', default: 'flour', label: { cs: 'Surovina', en: 'Ingredient' },
      options: [
        { value: 'flour', label: { cs: 'hladká mouka (0,53 g/ml)', en: 'all-purpose flour (0.53 g/ml)' } },
        { value: 'sugar', label: { cs: 'krupicový cukr (0,85)', en: 'granulated sugar (0.85)' } },
        { value: 'powderedSugar', label: { cs: 'moučkový cukr (0,51)', en: 'powdered sugar (0.51)' } },
        { value: 'brownSugar', label: { cs: 'třtinový cukr, upěchovaný (0,93)', en: 'brown sugar, packed (0.93)' } },
        { value: 'butter', label: { cs: 'máslo (0,96)', en: 'butter (0.96)' } },
        { value: 'water', label: { cs: 'voda (1,00)', en: 'water (1.00)' } },
        { value: 'milk', label: { cs: 'mléko (1,03)', en: 'milk (1.03)' } },
        { value: 'oil', label: { cs: 'olej (0,92)', en: 'oil (0.92)' } },
        { value: 'honey', label: { cs: 'med (1,42)', en: 'honey (1.42)' } },
        { value: 'salt', label: { cs: 'jemná sůl (1,2)', en: 'fine salt (1.2)' } },
        { value: 'rice', label: { cs: 'rýže (0,78)', en: 'rice (0.78)' } },
        { value: 'oats', label: { cs: 'ovesné vločky (0,38)', en: 'rolled oats (0.38)' } },
        { value: 'cocoa', label: { cs: 'kakao (0,42)', en: 'cocoa powder (0.42)' } },
        { value: 'custom', label: { cs: 'zadám hustotu', en: 'custom density' } },
      ],
    },
    { id: 'density', type: 'number', default: 1, min: 0.01, max: 25, step: 0.01, unit: 'g/ml', label: { cs: 'Vlastní hustota', en: 'Custom density' } },
  ],
  // Base unit: gram
  toBase(value, unitId, params = {}) {
    const density = densityOf(params);
    const factor = density === null ? null : gramsPerUnit(unitId, density);
    return factor === null ? null : value * factor;
  },
  fromBase(value, unitId, params = {}) {
    const density = densityOf(params);
    const factor = density === null ? null : gramsPerUnit(unitId, density);
    return factor === null ? null : value / factor;
  },
  references: [
    { title: 'King Arthur Baking: Ingredient weight chart', url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
    { title: 'NIST Handbook 44, Appendix C – US customary volume units', url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition' },
  ],
};
