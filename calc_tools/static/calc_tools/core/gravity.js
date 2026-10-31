/**
 * Gravity inputs that may be entered in SG or °P: a shared scale select and
 * range checks that depend on the chosen scale.
 * @module core/gravity
 */

import { rangeWarning } from './tool.js';
import { platoToSg, sgToPlato } from './units.js';

/** @typedef {import('./i18n.js').Text} Text */

/** Accepted ranges of a gravity in each scale. */
export const GRAVITY_SCALES = {
  sg: { min: 0.990, max: 1.200, unit: 'SG' },
  plato: { min: -2.6, max: 44, unit: '°P' },
};

/**
 * The select input choosing the gravity scale.
 * @param {'sg' | 'plato'} [defaultScale]
 */
export function scaleInput(defaultScale = 'plato') {
  return {
    id: 'scale', type: 'select', default: defaultScale, label: { cs: 'Jednotka hustoty', en: 'Gravity unit' },
    options: [
      { value: 'plato', label: { cs: '°P', en: '°P' } },
      { value: 'sg', label: { cs: 'SG', en: 'SG' } },
    ],
  };
}

/**
 * Checks gravity inputs against the range of the chosen scale and converts
 * them to both scales.
 * @param {any[]} inputs input descriptors
 * @param {Record<string, any>} values read values, including `scale`
 * @param {string[]} ids ids of the gravity inputs
 * @returns {{ warnings: Text[], plato: Record<string, number>, sg: Record<string, number> }}
 */
export function readGravities(inputs, values, ids) {
  const scale = values.scale === 'sg' ? 'sg' : 'plato';
  const range = GRAVITY_SCALES[scale];
  /** @type {Text[]} */
  const warnings = [];
  /** @type {Record<string, number>} */
  const plato = {};
  /** @type {Record<string, number>} */
  const sg = {};
  for (const id of ids) {
    const input = inputs.find((candidate) => candidate.id === id);
    const value = values[id];
    if (value === null || value === undefined) continue;
    if (value < range.min || value > range.max) {
      warnings.push(rangeWarning(input.label, range.min, range.max, range.unit));
      continue;
    }
    plato[id] = scale === 'sg' ? sgToPlato(value) : value;
    sg[id] = scale === 'sg' ? value : platoToSg(value);
  }
  return { warnings, plato, sg };
}
