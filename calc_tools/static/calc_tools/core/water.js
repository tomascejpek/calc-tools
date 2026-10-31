/**
 * Brewing water chemistry: alkalinity units, residual alkalinity, ions from
 * salt additions and the carbonate system used to acidify water.
 * @module core/water
 */

/** Equivalent weight of CaCO₃, mg/mEq. */
export const CACO3_EQ = 50.04;
/** Molar mass of HCO₃⁻, mg/mmol. */
export const HCO3_MOLAR = 61.017;
/** 1 °dH of alkalinity or hardness as CaCO₃, mg/l. */
export const CACO3_PER_DH = 17.848;

/** Alkalinity units accepted by water tools, with their size in mg/l as CaCO₃. */
export const ALKALINITY_UNITS = {
  caco3: 1,
  hco3: CACO3_EQ / HCO3_MOLAR,
  // KNK 4.5 (acid neutralising capacity to pH 4.5), as on Czech water reports
  mmol: CACO3_EQ,
  dh: CACO3_PER_DH,
};

/**
 * Residual alkalinity by Kolbach, mg/l as CaCO₃.
 * @param {number} alkalinity mg/l as CaCO₃
 * @param {number} calcium mg/l Ca²⁺
 * @param {number} magnesium mg/l Mg²⁺
 */
export function residualAlkalinity(alkalinity, calcium, magnesium) {
  return alkalinity - (calcium / 1.4 + magnesium / 1.7);
}

const MOLAR = { Ca: 40.078, Mg: 24.305, Na: 22.990, S: 32.06, O: 15.999, Cl: 35.453, H: 1.008, C: 12.011 };
const SO4 = MOLAR.S + 4 * MOLAR.O;
const HCO3 = MOLAR.H + MOLAR.C + 3 * MOLAR.O;
const H2O = 2 * MOLAR.H + MOLAR.O;

/**
 * Salts for brewing water and the mg of each ion one gram adds.
 * Hydrates are the forms sold for brewing.
 * @type {Record<string, { ions: Record<string, number> }>}
 */
export const SALTS = (() => {
  const gypsum = MOLAR.Ca + SO4 + 2 * H2O;
  const calciumChloride = MOLAR.Ca + 2 * MOLAR.Cl + 2 * H2O;
  const epsom = MOLAR.Mg + SO4 + 7 * H2O;
  const salt = MOLAR.Na + MOLAR.Cl;
  const soda = MOLAR.Na + HCO3;
  const per = (/** @type {number} */ part, /** @type {number} */ whole) => part / whole * 1000;
  return {
    gypsum: { ions: { calcium: per(MOLAR.Ca, gypsum), sulfate: per(SO4, gypsum) } },
    calciumChloride: { ions: { calcium: per(MOLAR.Ca, calciumChloride), chloride: per(2 * MOLAR.Cl, calciumChloride) } },
    epsom: { ions: { magnesium: per(MOLAR.Mg, epsom), sulfate: per(SO4, epsom) } },
    salt: { ions: { sodium: per(MOLAR.Na, salt), chloride: per(MOLAR.Cl, salt) } },
    bakingSoda: { ions: { sodium: per(MOLAR.Na, soda), bicarbonate: per(HCO3, soda) } },
  };
})();

/** pK values of carbonic acid at about 20 °C and of water. */
const PK1 = 6.35;
const PK2 = 10.33;
const PKW = 14.0;

/**
 * Alkalinity carried by a given total of carbonate species at a given pH,
 * mEq/l.
 * @param {number} carbonate total carbonate, mmol/l
 * @param {number} pH
 */
export function carbonateAlkalinity(carbonate, pH) {
  const h = 10 ** -pH;
  const k1 = 10 ** -PK1;
  const k2 = 10 ** -PK2;
  const denominator = h * h + h * k1 + k1 * k2;
  const a1 = h * k1 / denominator;
  const a2 = k1 * k2 / denominator;
  return carbonate * (a1 + 2 * a2) + (10 ** -PKW / h - h) * 1000;
}

/**
 * Acid needed to bring water of a given alkalinity and pH to a lower pH,
 * mEq per litre, in a closed system (CO₂ stays dissolved).
 * @param {number} alkalinity mEq/l
 * @param {number} pH measured pH of the water
 * @param {number} targetPh
 */
export function acidToTargetPh(alkalinity, pH, targetPh) {
  const water = carbonateAlkalinity(0, pH);
  const perCarbonate = carbonateAlkalinity(1, pH) - water;
  const carbonate = perCarbonate > 0 ? (alkalinity - water) / perCarbonate : 0;
  return alkalinity - carbonateAlkalinity(Math.max(0, carbonate), targetPh);
}

/**
 * Average charge given away per molecule of a polyprotic acid at a given pH.
 * @param {number[]} pKas
 * @param {number} pH
 */
export function acidCharge(pKas, pH) {
  const h = 10 ** -pH;
  // Terms of the distribution: [H]^n, [H]^(n−1)·K1, …, K1·…·Kn
  const terms = [h ** pKas.length];
  let product = 1;
  pKas.forEach((pKa, index) => {
    product *= 10 ** -pKa;
    terms.push(product * h ** (pKas.length - index - 1));
  });
  const total = terms.reduce((sum, term) => sum + term, 0);
  return terms.reduce((sum, term, index) => sum + index * term, 0) / total;
}
