/**
 * Physical constants and properties shared by physics tools.
 * @module core/physics
 */

/** Standard acceleration of gravity, m/s². */
export const G0 = 9.80665;
/** Newtonian constant of gravitation, m³/(kg·s²) (CODATA 2018). */
export const GRAVITATION = 6.67430e-11;
/** Molar gas constant, J/(mol·K) (exact). */
export const R_GAS = 8.314462618;
/** Speed of light, m/s (exact). */
export const C_LIGHT = 299792458;
/** 0 °C in kelvins. */
export const KELVIN = 273.15;
/** Standard atmosphere, Pa. */
export const ATM = 101325;

/**
 * Density of air-free water at 0–150 °C, kg/m³ (Kell 1975).
 * @param {number} celsius
 */
export function waterDensity(celsius) {
  const t = celsius;
  return (999.83952 + 16.945176 * t - 7.9870401e-3 * t ** 2 - 46.170461e-6 * t ** 3
    + 105.56302e-9 * t ** 4 - 280.54253e-12 * t ** 5) / (1 + 16.879850e-3 * t);
}

/** Specific heat capacities, kJ/(kg·K), near room temperature. */
export const SPECIFIC_HEAT = {
  water: 4.186,
  wort: 4.0,
  ice: 2.09,
  air: 1.005,
  ethanol: 2.44,
  oil: 1.97,
  aluminium: 0.897,
  copper: 0.385,
  steel: 0.50,
  iron: 0.449,
  glass: 0.84,
};

/** Select options for SPECIFIC_HEAT, with a custom value last. */
export const SPECIFIC_HEAT_OPTIONS = [
  { value: 'water', label: { cs: 'voda (4,186)', en: 'water (4.186)' } },
  { value: 'wort', label: { cs: 'mladina (≈ 4,0)', en: 'wort (≈ 4.0)' } },
  { value: 'ice', label: { cs: 'led (2,09)', en: 'ice (2.09)' } },
  { value: 'air', label: { cs: 'vzduch (1,005)', en: 'air (1.005)' } },
  { value: 'ethanol', label: { cs: 'ethanol (2,44)', en: 'ethanol (2.44)' } },
  { value: 'oil', label: { cs: 'olej (≈ 1,97)', en: 'oil (≈ 1.97)' } },
  { value: 'aluminium', label: { cs: 'hliník (0,897)', en: 'aluminium (0.897)' } },
  { value: 'copper', label: { cs: 'měď (0,385)', en: 'copper (0.385)' } },
  { value: 'steel', label: { cs: 'nerezová ocel (0,50)', en: 'stainless steel (0.50)' } },
  { value: 'iron', label: { cs: 'železo (0,449)', en: 'iron (0.449)' } },
  { value: 'glass', label: { cs: 'sklo (0,84)', en: 'glass (0.84)' } },
  { value: 'custom', label: { cs: 'zadám sám', en: 'custom' } },
];

/**
 * Specific heat from a select value, or the custom number.
 * @param {string} material
 * @param {number} custom kJ/(kg·K)
 */
export function specificHeatOf(material, custom) {
  return material === 'custom' ? custom : SPECIFIC_HEAT[/** @type {keyof typeof SPECIFIC_HEAT} */ (material)];
}

/** Gravitational parameter GM (m³/s²) and mean radius (m) of bodies. */
export const BODIES = {
  earth: { gm: 3.986004418e14, radius: 6.3710e6 },
  moon: { gm: 4.9048695e12, radius: 1.7374e6 },
  mars: { gm: 4.282837e13, radius: 3.3895e6 },
  jupiter: { gm: 1.26686534e17, radius: 6.9911e7 },
  sun: { gm: 1.32712440018e20, radius: 6.957e8 },
};

/** Select options for BODIES, with a custom body last. */
export const BODY_OPTIONS = [
  { value: 'earth', label: { cs: 'Země', en: 'Earth' } },
  { value: 'moon', label: { cs: 'Měsíc', en: 'Moon' } },
  { value: 'mars', label: { cs: 'Mars', en: 'Mars' } },
  { value: 'jupiter', label: { cs: 'Jupiter', en: 'Jupiter' } },
  { value: 'sun', label: { cs: 'Slunce', en: 'Sun' } },
  { value: 'custom', label: { cs: 'zadám hmotnost a poloměr', en: 'enter mass and radius' } },
];

/** Shared references. */
export const CODATA = { title: 'NIST CODATA: Fundamental Physical Constants', url: 'https://physics.nist.gov/cuu/Constants/' };
export const KELL = { title: 'Kell, G. S.: Density, thermal expansivity, and compressibility of liquid water from 0 to 150 °C. J. Chem. Eng. Data 20 (1975)' };
