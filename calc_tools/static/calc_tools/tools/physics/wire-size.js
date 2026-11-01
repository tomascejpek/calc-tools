/**
 * Wire cross-section for a current and an allowed voltage drop.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Resistivity at 20 °C (Ω·mm²/m) and its temperature coefficient (1/K), IEC 60228. */
export const CONDUCTORS = {
  copper: { rho: 0.017241, alpha: 0.00393 },
  aluminium: { rho: 0.028264, alpha: 0.00403 },
};

/** Standard cross-sections, mm². */
export const STANDARD_SECTIONS = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

/**
 * Voltage drop over a cable, V.
 * @param {{ current: number, length: number, section: number, rho: number, phases: 'dc' | 'single' | 'three' }} cable
 *   length one way, m; section mm²
 */
export function voltageDrop({ current, length, section, rho, phases }) {
  const factor = phases === 'three' ? Math.sqrt(3) : 2;
  return factor * current * length * rho / section;
}

const inputs = [
  { id: 'current', type: 'number', default: 16, min: 0.001, max: 1e5, step: 1, unit: 'A', label: { cs: 'Proud', en: 'Current' } },
  { id: 'length', type: 'number', default: 25, min: 0.01, max: 1e6, step: 1, unit: 'm', label: { cs: 'Délka vedení (jedním směrem)', en: 'Cable length (one way)' } },
  { id: 'voltage', type: 'number', default: 230, min: 1, max: 1e6, step: 1, unit: 'V', label: { cs: 'Napětí', en: 'Voltage' } },
  { id: 'drop', type: 'number', default: 3, min: 0.1, max: 50, step: 0.5, unit: '%', label: { cs: 'Povolený úbytek napětí', en: 'Allowed voltage drop' } },
  {
    id: 'phases', type: 'select', default: 'single', label: { cs: 'Soustava', en: 'System' },
    options: [
      { value: 'dc', label: { cs: 'stejnosměrná', en: 'DC' } },
      { value: 'single', label: { cs: 'jednofázová 230 V', en: 'single-phase AC' } },
      { value: 'three', label: { cs: 'třífázová 400 V', en: 'three-phase AC' } },
    ],
  },
  {
    id: 'material', type: 'select', default: 'copper', label: { cs: 'Materiál', en: 'Material' },
    options: [
      { value: 'copper', label: { cs: 'měď', en: 'copper' } },
      { value: 'aluminium', label: { cs: 'hliník', en: 'aluminium' } },
    ],
  },
  { id: 'temperature', type: 'number', default: 70, min: -50, max: 250, step: 5, unit: '°C', label: { cs: 'Provozní teplota vodiče', en: 'Conductor operating temperature' } },
];

const outputs = [
  { id: 'minimum', label: { cs: 'Nejmenší průřez pro úbytek', en: 'Minimum cross-section for the drop' }, unit: 'mm²', significant: 4 },
  { id: 'standard', label: { cs: 'Nejbližší vyšší normalizovaný průřez', en: 'Next standard cross-section' }, unit: 'mm²', significant: 4 },
  { id: 'actualDrop', label: { cs: 'Úbytek napětí s tímto průřezem', en: 'Voltage drop with that section' }, unit: 'V', significant: 4 },
  { id: 'actualPercent', label: { cs: 'Úbytek napětí s tímto průřezem', en: 'Voltage drop with that section' }, unit: '%', significant: 3 },
  { id: 'loss', label: { cs: 'Ztráta výkonu ve vedení', en: 'Power lost in the cable' }, unit: 'W', significant: 4 },
];

export default {
  id: 'wire-size',
  kind: 'calculator',
  category: 'physics-electric',
  tags: ['physics'],
  name: { cs: 'Průřez vodiče podle úbytku napětí', en: 'Wire size by voltage drop' },
  description: {
    cs: 'Nejmenší průřez měděného nebo hliníkového vodiče, při kterém úbytek napětí nepřekročí povolenou mez (v domovních rozvodech obvykle 3–5 %), s odporem při provozní teplotě. Nekontroluje dovolené proudové zatížení podle způsobu uložení ani jištění – to určuje ČSN 33 2000-5-52 a návrh má dělat elektrikář s oprávněním.',
    en: 'The smallest copper or aluminium cross-section that keeps the voltage drop within the limit (usually 3–5 % in buildings), with the resistance at operating temperature. It does not check the current-carrying capacity for the installation method or the protection – that is set by IEC 60364-5-52 and should be designed by a qualified electrician.',
  },
  keywords: {
    cs: ['průřez vodiče', 'průřez kabelu', 'úbytek napětí', 'kabel', 'vodič', 'mm2', 'elektroinstalace', 'prodlužovačka'],
    en: ['wire size', 'cable size', 'voltage drop', 'cable', 'conductor', 'cross-section', 'wire gauge', 'extension cord'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { current, length, voltage, drop, phases, material, temperature } = read.values;
    const conductor = CONDUCTORS[/** @type {keyof typeof CONDUCTORS} */ (material)];
    const rho = conductor.rho * (1 + conductor.alpha * (temperature - 20));
    const allowed = voltage * drop / 100;
    const minimum = voltageDrop({ current, length, section: 1, rho, phases }) / allowed;
    const standard = STANDARD_SECTIONS.find((section) => section >= minimum * (1 - 1e-12)) ?? null;
    const warnings = [{
      cs: 'Ověřte i dovolené proudové zatížení a jištění (ČSN 33 2000-5-52); tento výpočet řeší jen úbytek napětí.',
      en: 'Also check the current-carrying capacity and protection (IEC 60364-5-52); this only covers the voltage drop.',
    }];
    if (standard === null) {
      return { values: { minimum, standard: null, actualDrop: null, actualPercent: null, loss: null }, warnings: [...warnings, { cs: 'Potřebný průřez přesahuje 300 mm²; použijte více paralelních vodičů nebo vyšší napětí.', en: 'The section exceeds 300 mm²; use parallel conductors or a higher voltage.' }] };
    }
    const actualDrop = voltageDrop({ current, length, section: standard, rho, phases });
    return {
      values: { minimum, standard, actualDrop, actualPercent: actualDrop / voltage * 100, loss: actualDrop * current * (phases === 'three' ? Math.sqrt(3) : 1) },
      warnings,
    };
  },
  references: [
    { title: 'IEC 60228: Conductors of insulated cables – resistance at 20 °C' },
    { title: 'ČSN 33 2000-5-52 (IEC 60364-5-52): Výběr a stavba elektrických zařízení – Elektrická vedení' },
  ],
};
