/**
 * Shared unit conversions and brewing helpers.
 *
 * Every function here is pure and works with plain numbers.
 * @module core/units
 */

/** Density of CO₂ at 0 °C and 101.325 kPa, g/l (one "volume" of CO₂). */
export const CO2_G_PER_L_PER_VOLUME = 1.977;
/** Density of ethanol at 20 °C, g/ml. */
export const ETHANOL_DENSITY = 0.78924;
/** Specific gravity of ethanol used in the brewing ABV ⇄ ABW relation (Hall 1995). */
export const ETHANOL_SG = 0.79336;
/** 1 bar in psi. */
export const PSI_PER_BAR = 14.503773773;
/** Mass of one standard drink, g of ethanol. */
export const STANDARD_DRINK_G = 10;

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Parses a user-entered number, accepting a decimal comma as well as a dot.
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseNumber(value) {
  if (isNumber(value)) return value;
  if (typeof value !== 'string') return null;
  const text = value.trim().replace(/\s+/g, '').replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/**
 * Builds toBase/fromBase for units that differ only by a factor.
 * @param {Record<string, number>} factors size of one unit in the base unit
 */
export function factorConversion(factors) {
  return {
    /** @param {number} value @param {string} unitId */
    toBase(value, unitId) {
      const factor = factors[unitId];
      return isNumber(value) && factor ? value * factor : null;
    },
    /** @param {number} value @param {string} unitId */
    fromBase(value, unitId) {
      const factor = factors[unitId];
      return isNumber(value) && factor ? value / factor : null;
    },
  };
}

// Gravity

/**
 * Specific gravity (20/20 °C) to degrees Plato, ASBC polynomial.
 * @param {number} sg
 */
export function sgToPlato(sg) {
  return -616.868 + 1111.14 * sg - 630.272 * sg ** 2 + 135.997 * sg ** 3;
}

/**
 * Degrees Plato to specific gravity, the exact inverse of {@link sgToPlato}
 * found by Newton's method.
 * @param {number} plato
 */
export function platoToSg(plato) {
  let sg = 1 + plato / (258.6 - (plato / 258.2) * 227.1);
  for (let i = 0; i < 30; i++) {
    const slope = 1111.14 - 2 * 630.272 * sg + 3 * 135.997 * sg ** 2;
    const step = (sgToPlato(sg) - plato) / slope;
    sg -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  return sg;
}

/**
 * Gravity points, e.g. 1.048 → 48.
 * @param {number} sg
 */
export function gravityPoints(sg) {
  return (sg - 1) * 1000;
}

// Temperature

/** @param {number} celsius */
export function celsiusToFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}

/** @param {number} fahrenheit */
export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

// Beer colour

/** @param {number} srm */
export function srmToEbc(srm) {
  return srm * 1.97;
}

/** @param {number} ebc */
export function ebcToSrm(ebc) {
  return ebc / 1.97;
}

/** @param {number} lovibond */
export function lovibondToSrm(lovibond) {
  return 1.3546 * lovibond - 0.76;
}

/** @param {number} srm */
export function srmToLovibond(srm) {
  return (srm + 0.76) / 1.3546;
}

// Alcohol

/**
 * Alcohol by weight from alcohol by volume (Hall 1995).
 * @param {number} abv % v/v
 * @param {number} [sg] specific gravity of the beer, defaults to 1.010
 */
export function abvToAbw(abv, sg = 1.010) {
  return ETHANOL_SG * abv / sg;
}

/**
 * Alcohol by volume from alcohol by weight (Hall 1995).
 * @param {number} abw % w/w
 * @param {number} [sg] specific gravity of the beer, defaults to 1.010
 */
export function abwToAbv(abw, sg = 1.010) {
  return abw * sg / ETHANOL_SG;
}

/**
 * Grams of ethanol in a drink.
 * @param {number} volumeMl
 * @param {number} abv % v/v
 */
export function ethanolGrams(volumeMl, abv) {
  return volumeMl * abv / 100 * ETHANOL_DENSITY;
}

// Carbonation

/** @param {number} volumes volumes of CO₂ */
export function co2VolumesToGramsPerLitre(volumes) {
  return volumes * CO2_G_PER_L_PER_VOLUME;
}

/** @param {number} gramsPerLitre g/l of CO₂ */
export function co2GramsPerLitreToVolumes(gramsPerLitre) {
  return gramsPerLitre / CO2_G_PER_L_PER_VOLUME;
}
