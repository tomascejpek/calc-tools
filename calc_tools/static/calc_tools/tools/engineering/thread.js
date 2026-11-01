/**
 * ISO metric threads: pitch, tap drill and basic dimensions.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Coarse pitch of ISO metric threads, mm (ISO 261). */
export const COARSE_PITCH = {
  M1: 0.25, 'M1.2': 0.25, 'M1.4': 0.3, 'M1.6': 0.35, M2: 0.4, 'M2.5': 0.45, M3: 0.5, M4: 0.7, M5: 0.8, M6: 1,
  M8: 1.25, M10: 1.5, M12: 1.75, M14: 2, M16: 2, M18: 2.5, M20: 2.5, M22: 2.5, M24: 3, M27: 3, M30: 3.5,
  M33: 3.5, M36: 4, M42: 4.5, M48: 5, M56: 5.5, M64: 6,
};

/** Clearance holes, medium series (ISO 273), mm. */
export const CLEARANCE_HOLE = {
  M1: 1.2, 'M1.2': 1.4, 'M1.4': 1.6, 'M1.6': 1.8, M2: 2.4, 'M2.5': 2.9, M3: 3.4, M4: 4.5, M5: 5.5, M6: 6.6,
  M8: 9, M10: 11, M12: 13.5, M14: 15.5, M16: 17.5, M18: 20, M20: 22, M22: 24, M24: 26, M27: 30, M30: 33,
  M33: 36, M36: 39, M42: 45, M48: 52, M56: 62, M64: 70,
};

/**
 * Basic dimensions of an ISO metric thread (ISO 724).
 * @param {number} d nominal diameter, mm
 * @param {number} p pitch, mm
 */
export function threadDimensions(d, p) {
  return {
    tapDrill: d - p,
    pitchDiameter: d - 0.649519 * p,
    minorInternal: d - 1.082532 * p,
    minorExternal: d - 1.226869 * p,
    stressArea: Math.PI / 4 * (d - 0.938194 * p) ** 2,
  };
}

const inputs = [
  {
    id: 'size', type: 'select', default: 'M8', label: { cs: 'Závit', en: 'Thread' },
    options: Object.keys(COARSE_PITCH).map((size) => ({
      value: size,
      label: { cs: `${size} × ${String(COARSE_PITCH[/** @type {keyof typeof COARSE_PITCH} */ (size)]).replace('.', ',')}`, en: `${size} × ${COARSE_PITCH[/** @type {keyof typeof COARSE_PITCH} */ (size)]}` },
    })),
  },
  { id: 'fine', type: 'number', optional: true, min: 0.075, max: 8, step: 0.05, unit: 'mm', label: { cs: 'Jemné stoupání (nepovinné, např. M8 × 1)', en: 'Fine pitch (optional, e.g. M8 × 1)' } },
];

const mm = (/** @type {string} */ id, /** @type {string} */ cs, /** @type {string} */ en) => ({ id, label: { cs, en }, unit: 'mm', precision: 3 });

const outputs = [
  mm('pitch', 'Stoupání', 'Pitch'),
  { id: 'tapDrill', label: { cs: 'Vrták pod závit (d − P)', en: 'Tap drill (d − P)' }, unit: 'mm', precision: 2 },
  mm('clearance', 'Průchozí otvor (střední řada)', 'Clearance hole (medium)'),
  mm('pitchDiameter', 'Střední průměr', 'Pitch diameter'),
  mm('minorInternal', 'Malý průměr matice', 'Minor diameter, nut'),
  mm('minorExternal', 'Malý průměr šroubu', 'Minor diameter, bolt'),
  { id: 'stressArea', label: { cs: 'Výpočtový průřez šroubu', en: 'Tensile stress area' }, unit: 'mm²', precision: 1 },
];

export default {
  id: 'thread',
  kind: 'calculator',
  category: 'eng-mechanical',
  tags: ['engineering'],
  name: { cs: 'Metrické závity a vrtáky pod závit', en: 'Metric threads and tap drills' },
  description: {
    cs: 'Stoupání hrubého metrického závitu ISO, vrták pod závit (průměr − stoupání, např. M8 → 6,75 mm, v praxi vrták 6,8), průchozí otvor, střední a malé průměry a výpočtový průřez šroubu. Pro jemný závit zadejte stoupání. Do tvrdých materiálů nebo pro tvářecí závitníky volte vrták podle doporučení výrobce.',
    en: 'Coarse ISO metric thread pitch, tap drill (diameter − pitch, e.g. M8 → 6.75 mm, in practice a 6.8 drill), clearance hole, pitch and minor diameters and the tensile stress area. For a fine thread enter the pitch. For hard materials or forming taps choose the drill by the maker\'s advice.',
  },
  keywords: {
    cs: ['závit', 'metrický závit', 'vrták pod závit', 'stoupání závitu', 'závitník', 'průchozí otvor', 'm8', 'šroub'],
    en: ['thread', 'metric thread', 'tap drill', 'thread pitch', 'tap', 'clearance hole', 'bolt', 'm8'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { size, fine } = read.values;
    const d = Number(size.slice(1));
    const pitch = fine ?? COARSE_PITCH[/** @type {keyof typeof COARSE_PITCH} */ (size)];
    if (pitch >= d / 2) return emptyResult(outputs, [{ cs: 'Stoupání je na tento průměr příliš velké.', en: 'The pitch is too large for this diameter.' }]);
    return {
      values: { pitch, clearance: CLEARANCE_HOLE[/** @type {keyof typeof CLEARANCE_HOLE} */ (size)], ...threadDimensions(d, pitch) },
      warnings: [],
    };
  },
  references: [
    { title: 'ISO 261: ISO general purpose metric screw threads – general plan' },
    { title: 'ISO 724: basic dimensions; ISO 898-1: tensile stress area; ISO 273: clearance holes' },
  ],
};
