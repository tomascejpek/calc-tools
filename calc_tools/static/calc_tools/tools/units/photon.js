/**
 * Electromagnetic radiation: wavelength ⇄ frequency ⇄ wavenumber ⇄ photon energy.
 */

import { ELEMENTARY_CHARGE } from './energy.js';

/** Speed of light in vacuum, m/s (exact). */
export const SPEED_OF_LIGHT = 299792458;
/** Planck constant, J·s (exact). */
export const PLANCK = 6.62607015e-34;

/** Converts each unit to frequency in Hz and back. */
const TO_HZ = {
  nm: (/** @type {number} */ v) => SPEED_OF_LIGHT / (v * 1e-9),
  um: (/** @type {number} */ v) => SPEED_OF_LIGHT / (v * 1e-6),
  m: (/** @type {number} */ v) => SPEED_OF_LIGHT / v,
  'cm-1': (/** @type {number} */ v) => v * 100 * SPEED_OF_LIGHT,
  hz: (/** @type {number} */ v) => v,
  mhz: (/** @type {number} */ v) => v * 1e6,
  ghz: (/** @type {number} */ v) => v * 1e9,
  thz: (/** @type {number} */ v) => v * 1e12,
  ev: (/** @type {number} */ v) => v * ELEMENTARY_CHARGE / PLANCK,
  j: (/** @type {number} */ v) => v / PLANCK,
};

/** The inverse of each function in TO_HZ. */
const FROM_HZ = {
  nm: (/** @type {number} */ f) => SPEED_OF_LIGHT / f / 1e-9,
  um: (/** @type {number} */ f) => SPEED_OF_LIGHT / f / 1e-6,
  m: (/** @type {number} */ f) => SPEED_OF_LIGHT / f,
  'cm-1': (/** @type {number} */ f) => f / SPEED_OF_LIGHT / 100,
  hz: (/** @type {number} */ f) => f,
  mhz: (/** @type {number} */ f) => f / 1e6,
  ghz: (/** @type {number} */ f) => f / 1e9,
  thz: (/** @type {number} */ f) => f / 1e12,
  ev: (/** @type {number} */ f) => f * PLANCK / ELEMENTARY_CHARGE,
  j: (/** @type {number} */ f) => f * PLANCK,
};

const unit = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en, /** @type {object} */ extra = {}) => ({
  id, label: { cs, en }, significant: 6, min: 0, ...extra,
});

export default {
  id: 'photon',
  kind: 'converter',
  category: 'units-light',
  tags: [],
  name: { cs: 'Vlnová délka, frekvence a energie fotonu', en: 'Wavelength, frequency and photon energy' },
  description: {
    cs: 'Převod mezi vlnovou délkou elektromagnetického záření ve vakuu, frekvencí, vlnočtem a energií fotonu: f = c / λ, E = h·f. Viditelné světlo má 380–750 nm, tedy asi 1,65–3,3 eV.',
    en: 'Converts between the wavelength of electromagnetic radiation in vacuum, its frequency, wavenumber and photon energy: f = c / λ, E = h·f. Visible light is 380–750 nm, about 1.65–3.3 eV.',
  },
  keywords: {
    cs: ['vlnová délka', 'frekvence', 'kmitočet', 'energie fotonu', 'foton', 'elektronvolt', 'vlnočet', 'světlo', 'záření', 'spektrum'],
    en: ['wavelength', 'frequency', 'photon energy', 'photon', 'electronvolt', 'wavenumber', 'light', 'radiation', 'spectrum'],
  },
  units: [
    unit('nm', 'nm (vlnová délka)', 'nm (wavelength)', { default: 550 }),
    unit('um', 'µm (vlnová délka)', 'µm (wavelength)'),
    unit('m', 'm (vlnová délka)', 'm (wavelength)'),
    unit('cm-1', 'cm⁻¹ (vlnočet)', 'cm⁻¹ (wavenumber)'),
    unit('hz', 'Hz', 'Hz'),
    unit('mhz', 'MHz', 'MHz'),
    unit('ghz', 'GHz', 'GHz'),
    unit('thz', 'THz', 'THz'),
    unit('ev', 'eV (energie fotonu)', 'eV (photon energy)'),
    unit('j', 'J (energie fotonu)', 'J (photon energy)'),
  ],
  // Base unit: Hz
  toBase(value, unitId) {
    if (!Object.hasOwn(TO_HZ, unitId)) return null;
    return TO_HZ[/** @type {keyof typeof TO_HZ} */ (unitId)](value);
  },
  fromBase(value, unitId) {
    if (!Object.hasOwn(FROM_HZ, unitId)) return null;
    return FROM_HZ[/** @type {keyof typeof FROM_HZ} */ (unitId)](value);
  },
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure) – defining constants c, h, e', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
