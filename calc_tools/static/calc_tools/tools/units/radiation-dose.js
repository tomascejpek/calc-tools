/**
 * Radiation dose: absorbed dose (Gy, rad) and equivalent dose (Sv, rem),
 * linked by the radiation weighting factor.
 */

/** Size of one unit in its own SI unit and whether it is an absorbed dose. */
const DOSE_UNITS = {
  uGy: { factor: 1e-6, absorbed: true },
  mGy: { factor: 1e-3, absorbed: true },
  Gy: { factor: 1, absorbed: true },
  rad: { factor: 0.01, absorbed: true },
  uSv: { factor: 1e-6, absorbed: false },
  mSv: { factor: 1e-3, absorbed: false },
  Sv: { factor: 1, absorbed: false },
  mrem: { factor: 1e-5, absorbed: false },
  rem: { factor: 0.01, absorbed: false },
};

/**
 * Sieverts per unit; absorbed doses are multiplied by the weighting factor.
 * @param {string} unitId
 * @param {number} weighting radiation weighting factor wR
 * @returns {number | null}
 */
export function sievertsPerUnit(unitId, weighting) {
  if (!Object.hasOwn(DOSE_UNITS, unitId)) return null;
  const unit = DOSE_UNITS[/** @type {keyof typeof DOSE_UNITS} */ (unitId)];
  return unit.factor * (unit.absorbed ? weighting : 1);
}

const label = (/** @type {string} */ text) => ({ cs: text, en: text });

export default {
  id: 'radiation-dose',
  kind: 'converter',
  category: 'units-other',
  tags: [],
  name: { cs: 'Převod dávky záření (Gy, Sv)', en: 'Radiation dose converter (Gy, Sv)' },
  description: {
    cs: 'Převod dávky záření. Absorbovaná dávka (gray, rad = 0,01 Gy) se na ekvivalentní dávku (sievert, rem = 0,01 Sv) přepočítává radiačním váhovým faktorem: 1 pro záření gama, rentgenové a beta, 2 pro protony, 20 pro alfa částice, pro neutrony 2,5–20 podle energie. Efektivní dávka by navíc vyžadovala tkáňové váhové faktory.',
    en: 'Converts radiation dose. Absorbed dose (gray, rad = 0.01 Gy) becomes equivalent dose (sievert, rem = 0.01 Sv) through the radiation weighting factor: 1 for gamma, X-rays and beta, 2 for protons, 20 for alpha particles, 2.5–20 for neutrons by energy. Effective dose would also need tissue weighting factors.',
  },
  keywords: {
    cs: ['dávka záření', 'absorbovaná dávka', 'ekvivalentní dávka', 'gray', 'gy', 'sievert', 'sv', 'msv', 'rem', 'rad', 'záření'],
    en: ['radiation dose', 'absorbed dose', 'equivalent dose', 'gray', 'gy', 'sievert', 'sv', 'msv', 'rem', 'rad', 'radiation'],
  },
  units: [
    { id: 'uSv', default: 100, label: label('µSv'), significant: 6, min: 0 },
    { id: 'mSv', label: label('mSv'), significant: 6, min: 0 },
    { id: 'Sv', label: label('Sv'), significant: 6, min: 0 },
    { id: 'mrem', label: label('mrem'), significant: 6, min: 0 },
    { id: 'rem', label: label('rem'), significant: 6, min: 0 },
    { id: 'uGy', label: label('µGy'), significant: 6, min: 0 },
    { id: 'mGy', label: label('mGy'), significant: 6, min: 0 },
    { id: 'Gy', label: label('Gy'), significant: 6, min: 0 },
    { id: 'rad', label: label('rad'), significant: 6, min: 0 },
  ],
  params: [
    { id: 'weighting', type: 'number', default: 1, min: 1, max: 20, step: 0.5, label: { cs: 'Radiační váhový faktor wR', en: 'Radiation weighting factor wR' } },
  ],
  // Base unit: sievert
  toBase(value, unitId, params = {}) {
    const factor = sievertsPerUnit(unitId, params.weighting ?? 1);
    return factor === null ? null : value * factor;
  },
  fromBase(value, unitId, params = {}) {
    const factor = sievertsPerUnit(unitId, params.weighting ?? 1);
    return factor === null ? null : value / factor;
  },
  references: [
    { title: 'ICRP Publication 103: The 2007 Recommendations of the International Commission on Radiological Protection – radiation weighting factors', url: 'https://www.icrp.org/publication.asp?id=ICRP%20Publication%20103' },
  ],
};
