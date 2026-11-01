/**
 * Diluting sanitizers and disinfectants to the working strength.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Label doses of no-rinse acid and iodine sanitizers, ml per litre. */
export const LABEL_DOSE = {
  starsan: 29.57 / 18.927,
  iodophor: 14.79 / 18.927,
};

const inputs = [
  {
    id: 'product', type: 'select', default: 'starsan', label: { cs: 'Přípravek', en: 'Product' },
    options: [
      { value: 'starsan', label: { cs: 'Star San (1 oz na 5 gal = 1,56 ml/l)', en: 'Star San (1 oz per 5 gal = 1.56 ml/l)' } },
      { value: 'iodophor', label: { cs: 'jodofor, 1,6 % jódu (12,5 ppm = 0,78 ml/l)', en: 'iodophor, 1.6 % iodine (12.5 ppm = 0.78 ml/l)' } },
      { value: 'peroxide', label: { cs: 'peroxid vodíku', en: 'hydrogen peroxide' } },
      { value: 'hypochlorite', label: { cs: 'chlornan sodný (SAVO, Domestos)', en: 'sodium hypochlorite (bleach)' } },
      { value: 'peracetic', label: { cs: 'kyselina peroctová (Persteril)', en: 'peracetic acid' } },
      { value: 'custom', label: { cs: 'jiný roztok (zadám koncentrace)', en: 'other solution (enter strengths)' } },
    ],
  },
  { id: 'volume', type: 'number', default: 10, min: 0.01, max: 1e7, step: 0.5, unit: 'l', label: { cs: 'Objem pracovního roztoku', en: 'Volume of working solution' } },
  { id: 'stock', type: 'number', default: 30, min: 0.001, max: 100, step: 0.5, unit: '%', label: { cs: 'Koncentrace přípravku (u chlornanu aktivní chlor)', en: 'Product strength (for bleach: available chlorine)' } },
  { id: 'density', type: 'number', default: 1.11, min: 0.5, max: 3, step: 0.01, unit: 'g/ml', label: { cs: 'Hustota přípravku (30% H₂O₂ 1,11; 5% chlornan 1,07; 15% peroctová 1,13)', en: 'Product density (30 % H₂O₂ 1.11; 5 % bleach 1.07; 15 % peracetic 1.13)' } },
  { id: 'target', type: 'number', default: 3, min: 0.000001, max: 1e6, step: 0.1, label: { cs: 'Cílová koncentrace', en: 'Target strength' } },
  {
    id: 'targetUnit', type: 'select', default: 'percent', label: { cs: 'Jednotka cílové koncentrace', en: 'Target unit' },
    options: [
      { value: 'percent', label: { cs: '% (g/100 ml)', en: '% (g/100 ml)' } },
      { value: 'ppm', label: { cs: 'ppm (mg/l)', en: 'ppm (mg/l)' } },
    ],
  },
];

const outputs = [
  { id: 'product', label: { cs: 'Přípravku', en: 'Product' }, unit: 'ml', significant: 4 },
  { id: 'water', label: { cs: 'Vody', en: 'Water' }, unit: 'l', significant: 4 },
  { id: 'perLitre', label: { cs: 'Přípravku na litr', en: 'Product per litre' }, unit: 'ml/l', significant: 4 },
];

const CHLORINE_WARNING = {
  cs: 'Chlornan nikdy nemíchejte s kyselinami (Star San, peroctová, ocet) – uvolňuje se jedovatý chlor. Po chlornanu oplachujte, zbytky chloru dávají pivu chlorfenolovou pachuť.',
  en: 'Never mix bleach with acids (Star San, peracetic acid, vinegar) – it releases toxic chlorine gas. Rinse after bleach; chlorine residue gives beer chlorophenol off-flavours.',
};

export default {
  id: 'sanitizer',
  kind: 'calculator',
  category: 'sanitation',
  tags: ['chemistry', 'beer'],
  name: { cs: 'Ředění sanitace a dezinfekce', en: 'Diluting sanitizers' },
  description: {
    cs: 'Kolik přípravku a vody na pracovní roztok. Star San a jodofor se ředí podle etikety (1,56 a 0,78 ml/l, bez oplachu, styk 1–2 minuty). Peroxid, chlornan a kyselinu peroctovou spočítá z koncentrace a hustoty přípravku na cílovou koncentraci – obvykle 3 % H₂O₂, 50–200 ppm chloru, 0,1–0,2 % peroctové kyseliny. Při práci s koncentráty chraňte oči a ruce.',
    en: 'How much product and water for a working solution. Star San and iodophor go by the label (1.56 and 0.78 ml/l, no rinse, 1–2 minutes contact). Peroxide, bleach and peracetic acid are worked out from the product strength and density to the target – usually 3 % H₂O₂, 50–200 ppm chlorine, 0.1–0.2 % peracetic acid. Protect eyes and hands when handling concentrates.',
  },
  keywords: {
    cs: ['sanitace', 'dezinfekce', 'star san', 'jodofor', 'peroxid vodíku', 'chlornan', 'savo', 'kyselina peroctová', 'persteril', 'ředění'],
    en: ['sanitizer', 'sanitation', 'disinfection', 'star san', 'iodophor', 'hydrogen peroxide', 'bleach', 'peracetic acid', 'dilution'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { product, volume, stock, density, target, targetUnit } = read.values;
    let perLitre;
    if (Object.hasOwn(LABEL_DOSE, product)) {
      perLitre = LABEL_DOSE[/** @type {keyof typeof LABEL_DOSE} */ (product)];
    } else {
      if (targetUnit === 'percent' && target > 100) {
        return emptyResult(outputs, [{ cs: 'Koncentrace v procentech může být nejvýš 100 %.', en: 'A percentage can be at most 100 %.' }]);
      }
      // mg of active substance per ml of product: % w/w × density
      const stockMgPerMl = stock / 100 * density * 1000;
      const targetMgPerL = targetUnit === 'ppm' ? target : target * 10000;
      perLitre = targetMgPerL / stockMgPerMl;
      if (perLitre > 1000) {
        return emptyResult(outputs, [{ cs: 'Cílová koncentrace je vyšší než koncentrace přípravku.', en: 'The target is stronger than the product.' }]);
      }
    }
    const ml = perLitre * volume;
    return { values: { product: ml, water: volume - ml / 1000, perLitre }, warnings: product === 'hypochlorite' ? [CHLORINE_WARNING] : [] };
  },
  references: [
    { title: 'Five Star Chemicals: Star San – product information and dilution', url: 'https://fivestarchemicals.com/' },
    { title: 'Palmer, J.: How to Brew, 4th ed., ch. 2 – cleaning and sanitizing (iodophor 12.5 ppm, bleach)' },
    { title: 'U.S. FDA Food Code, § 4-501.114 – chemical sanitizer concentrations (chlorine 50–200 ppm)' },
  ],
};
