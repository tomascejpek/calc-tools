/**
 * Thermal resistance and U-value of a building element (ČSN EN ISO 6946).
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Surface resistances Rsi and Rse, m²K/W (ČSN EN ISO 6946). */
export const SURFACE_RESISTANCE = {
  wall: { rsi: 0.13, rse: 0.04 },
  roof: { rsi: 0.10, rse: 0.04 },
  floor: { rsi: 0.17, rse: 0.04 },
  ground: { rsi: 0.17, rse: 0 },
};

/** Required and recommended U-values of an external wall, roof and floor (ČSN 73 0540-2), W/(m²K). */
export const U_REQUIRED = { wall: [0.30, 0.25], roof: [0.24, 0.16], floor: [0.24, 0.16], ground: [0.45, 0.30] };

const inputs = [
  {
    id: 'element', type: 'select', default: 'wall', label: { cs: 'Konstrukce', en: 'Element' },
    options: [
      { value: 'wall', label: { cs: 'obvodová stěna (tok vodorovně)', en: 'external wall (horizontal flow)' } },
      { value: 'roof', label: { cs: 'střecha, strop pod nevytápěnou půdou (tok nahoru)', en: 'roof, ceiling under unheated loft (upward flow)' } },
      { value: 'floor', label: { cs: 'strop nad venkovním prostorem (tok dolů)', en: 'floor above outside air (downward flow)' } },
      { value: 'ground', label: { cs: 'podlaha na terénu', en: 'floor on the ground' } },
    ],
  },
  {
    id: 'layers', type: 'list', min: 1, max: 15, label: { cs: 'Vrstva', en: 'Layer' },
    fields: [
      { id: 'name', type: 'text', optional: true, maxLength: 40, pattern: /^[\p{L}\p{N} ,.%()/-]+$/u, label: { cs: 'Materiál (nepovinný)', en: 'Material (optional)' } },
      { id: 'thickness', type: 'number', default: 300, min: 0, max: 5000, step: 5, unit: 'mm', label: { cs: 'Tloušťka', en: 'Thickness' } },
      { id: 'lambda', type: 'number', default: 0.16, min: 0.001, max: 500, step: 0.001, unit: 'W/(m·K)', label: { cs: 'Tepelná vodivost λ', en: 'Thermal conductivity λ' } },
    ],
  },
  { id: 'delta', type: 'number', default: 33, min: 0, max: 100, step: 1, unit: 'K', label: { cs: 'Rozdíl teplot (výpočtově 21 − (−12) °C)', en: 'Temperature difference (design 21 − (−12) °C)' } },
  { id: 'area', type: 'number', default: 1, min: 0, max: 1e6, step: 1, unit: 'm²', label: { cs: 'Plocha konstrukce', en: 'Element area' } },
];

const outputs = [
  { id: 'u', label: { cs: 'Součinitel prostupu tepla U', en: 'U-value' }, unit: 'W/(m²·K)', precision: 3 },
  { id: 'r', label: { cs: 'Tepelný odpor konstrukce R', en: 'Thermal resistance R' }, unit: 'm²·K/W', precision: 2 },
  { id: 'rTotal', label: { cs: 'Odpor při prostupu R_T (s Rsi, Rse)', en: 'Total resistance R_T (with Rsi, Rse)' }, unit: 'm²·K/W', precision: 2 },
  { id: 'loss', label: { cs: 'Tepelná ztráta', en: 'Heat loss' }, unit: 'W', precision: 0 },
  { id: 'rating', type: 'text', label: { cs: 'Hodnocení podle ČSN 73 0540-2', en: 'Rating by ČSN 73 0540-2' } },
];

export default {
  id: 'u-value',
  kind: 'calculator',
  category: 'eng-building',
  tags: ['engineering'],
  name: { cs: 'Tepelný odpor a součinitel U', en: 'Thermal resistance and U-value' },
  description: {
    cs: 'Tepelný odpor vrstvené konstrukce R = Σ d / λ a součinitel prostupu tepla U = 1 / (Rsi + R + Rse) podle ČSN EN ISO 6946, tepelná ztráta při daném rozdílu teplot a srovnání s požadavkem ČSN 73 0540-2 (obvodová stěna požadováno 0,30, doporučeno 0,25 W/(m²K)). Tepelné mosty, kotvy a vlhkost materiálů nezahrnuje.',
    en: 'Thermal resistance of a layered element R = Σ d / λ and U-value U = 1 / (Rsi + R + Rse) by EN ISO 6946, the heat loss at a temperature difference and a comparison with the Czech ČSN 73 0540-2 requirement (external wall required 0.30, recommended 0.25 W/(m²K)). Thermal bridges, fixings and moisture are not included.',
  },
  keywords: {
    cs: ['součinitel prostupu tepla', 'u hodnota', 'tepelný odpor', 'zateplení', 'izolace', 'čsn 73 0540', 'tepelná ztráta', 'stěna'],
    en: ['u-value', 'thermal transmittance', 'thermal resistance', 'r-value', 'insulation', 'heat loss', 'wall'],
  },
  inputs,
  outputs,
  compute(values) {
    const source = values && typeof values === 'object' ? /** @type {Record<string, any>} */ (values) : {};
    // Example wall when called without layers: 300 mm ceramic block + 160 mm EPS; a form passes its own list
    const defaults = [{}, { thickness: 160, lambda: 0.037 }];
    const read = readInputs(inputs, { ...source, layers: Object.hasOwn(source, 'layers') && source.layers != null ? source.layers : defaults });
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { element, layers, delta, area } = read.values;
    const r = layers.reduce((/** @type {number} */ sum, /** @type {any} */ layer) => sum + layer.thickness / 1000 / layer.lambda, 0);
    const surface = SURFACE_RESISTANCE[/** @type {keyof typeof SURFACE_RESISTANCE} */ (element)];
    const rTotal = surface.rsi + r + surface.rse;
    const u = 1 / rTotal;
    const [required, recommended] = U_REQUIRED[/** @type {keyof typeof U_REQUIRED} */ (element)];
    const rating = u <= recommended
      ? { cs: `splňuje doporučenou hodnotu ${String(recommended).replace('.', ',')}`, en: `meets the recommended ${recommended}` }
      : u <= required
        ? { cs: `splňuje požadovanou hodnotu ${String(required).replace('.', ',')}`, en: `meets the required ${required}` }
        : { cs: `nesplňuje požadavek ${String(required).replace('.', ',')}`, en: `fails the requirement ${required}` };
    return { values: { u, r, rTotal, loss: u * area * delta, rating }, warnings: [] };
  },
  references: [
    { title: 'ČSN EN ISO 6946: Stavební prvky a stavební konstrukce – Tepelný odpor a součinitel prostupu tepla' },
    { title: 'ČSN 73 0540-2: Tepelná ochrana budov – Požadavky' },
  ],
};
