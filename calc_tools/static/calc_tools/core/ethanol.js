/**
 * Density of water–ethanol mixtures by the formula of the International
 * Alcoholometric Tables (OIML R 22, reproduced in Council Directive
 * 76/766/EEC), valid from −20 to +40 °C.
 * @module core/ethanol
 */

import { solveIncreasing } from './units.js';

const A = [
  9.982012300e2, -1.929769495e2, 3.891238958e2, -1.668103923e3, 1.352215441e4, -8.829278388e4,
  3.062874042e5, -6.138381234e5, 7.470172998e5, -5.478461354e5, 2.234460334e5, -3.903285426e4,
];
const B = [-2.0618513e-1, -5.2682542e-3, 3.6130013e-5, -3.8957702e-7, 7.1693540e-9, -9.9739231e-11];
const C = [
  [
    1.693443461530087e-1, -1.046914743455169e1, 7.196353469546523e1, -7.047478054272792e2,
    3.924090430035045e3, -1.210164659068747e4, 2.248646550400788e4, -2.605562982188164e4,
    1.852373922069467e4, -7.420201433430137e3, 1.285617841998974e3,
  ],
  [
    -1.193013005057010e-2, 2.517399633803461e-1, -2.170575700536993, 1.353034988843029e1,
    -5.029988758547014e1, 1.096355666577570e2, -1.422753946421155e2, 1.080435942856230e2,
    -4.414153236817392e1, 7.442971530188783,
  ],
  [
    -6.802995733503803e-4, 1.876837790289664e-2, -2.002561813734156e-1, 1.022992966719220,
    -2.895696483903638, 4.810060584300675, -4.672147440794683, 2.458043105903461,
    -5.411227621436812e-1,
  ],
  [4.075376675622027e-6, -8.763058573471110e-6, 6.515031360099368e-6, -1.515784836987210e-6],
  // The directive prints 10⁻³ for C5,1; 10⁻⁸ is the value that reproduces the tables
  [-2.788074354782409e-8, 1.345612883493354e-8],
];

/** Lowest and highest temperature of the formula, °C. */
export const ETHANOL_T_MIN = -20;
export const ETHANOL_T_MAX = 40;

/**
 * Density of a water–ethanol mixture, kg/m³.
 * @param {number} p mass fraction of ethanol, 0–1
 * @param {number} t temperature, °C
 */
export function mixtureDensity(p, t) {
  const dt = t - 20;
  let rho = A[0];
  for (let k = 2; k <= 12; k++) rho += A[k - 1] * p ** (k - 1);
  for (let k = 1; k <= 6; k++) rho += B[k - 1] * dt ** k;
  C.forEach((row, i) => {
    row.forEach((c, k) => { rho += c * p ** (k + 1) * dt ** (i + 1); });
  });
  return rho;
}

/** Density of pure ethanol at 20 °C, kg/m³. */
export const ETHANOL_DENSITY_20 = mixtureDensity(1, 20);

/**
 * Alcohol by volume at 20 °C from the mass fraction.
 * @param {number} p mass fraction, 0–1
 * @returns {number} % vol
 */
export function abvFromMassFraction(p) {
  return p * mixtureDensity(p, 20) / ETHANOL_DENSITY_20 * 100;
}

/**
 * Mass fraction of ethanol from alcohol by volume at 20 °C.
 * @param {number} abv % vol, 0–100
 * @returns {number | null}
 */
export function massFractionFromAbv(abv) {
  return solveIncreasing(abvFromMassFraction, abv, 0, 1);
}

/** Cubic thermal expansion of alcoholometer glass, 1/°C (OIML R 44). */
export const GLASS_EXPANSION = 25e-6;

/**
 * True alcohol by volume at 20 °C from an alcoholometer reading taken at
 * another temperature. The instrument floats at the mark whose 20 °C
 * density, corrected for the expansion of its glass, equals the density of
 * the liquid at the measured temperature.
 * @param {number} reading % vol shown by an alcoholometer calibrated at 20 °C
 * @param {number} celsius temperature of the spirit
 * @returns {number | null}
 */
export function correctAlcoholmeter(reading, celsius) {
  const pReading = massFractionFromAbv(reading);
  if (pReading === null) return null;
  const density = mixtureDensity(pReading, 20) / (1 + GLASS_EXPANSION * (celsius - 20));
  // Density falls as the mass fraction rises, so solve on its negative
  const p = solveIncreasing((x) => -mixtureDensity(x, celsius), -density, 0, 1);
  return p === null ? null : abvFromMassFraction(p);
}
