/**
 * Runtime helpers shared by tools and pages: input validation and safe
 * evaluation of converters and calculators.
 * @module core/tool
 */

import { localize } from './i18n.js';
import { isNumber, parseNumber } from './units.js';

/** @typedef {import('./i18n.js').Text} Text */

/**
 * @typedef {object} Input
 * @property {string} id
 * @property {'number' | 'select' | 'list'} [type] defaults to 'number'
 * @property {Text} label
 * @property {string | Text} [unit] a plain string or a text per language
 * @property {number | string} [default]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {boolean} [optional] an empty number is allowed and read as null
 * @property {{ value: string, label: Text }[]} [options] for 'select'
 * @property {Input[]} [fields] for 'list'
 */

/**
 * @typedef {object} Output
 * @property {string} id
 * @property {Text} label
 * @property {string | Text} [unit] a plain string or a text per language
 * @property {number} [precision]
 * @property {'number' | 'list'} [type] 'list' outputs an array of numbers
 */

/**
 * @typedef {object} Result
 * @property {Record<string, number | null | (number | null)[]>} values
 * @property {Text[]} warnings
 */

/**
 * Formats a number for a warning text in the given language.
 * @param {number} value
 * @param {'cs' | 'en'} lang
 */
function show(value, lang) {
  const text = String(value);
  return lang === 'cs' ? text.replace('.', ',') : text;
}

/**
 * @param {Text} label
 * @param {string} prefixCs
 * @param {string} prefixEn
 */
function prefixed(label, prefixCs, prefixEn) {
  return {
    cs: prefixCs ? `${prefixCs} – ${label.cs}` : label.cs,
    en: prefixEn ? `${prefixEn} – ${label.en}` : label.en,
  };
}

/**
 * Reads raw values (numbers or user-entered strings) according to input
 * descriptors: fills defaults, parses numbers with a decimal comma or dot and
 * checks ranges and select options.
 * @param {Input[]} inputs
 * @param {Record<string, any>} [raw]
 * @param {{ cs: string, en: string }} [prefix] label prefix for list items
 * @returns {{ ok: boolean, values: Record<string, any>, warnings: Text[] }}
 */
export function readInputs(inputs, raw = {}, prefix = { cs: '', en: '' }) {
  /** @type {Record<string, any>} */
  const values = {};
  /** @type {Text[]} */
  const warnings = [];
  let ok = true;
  const source = raw && typeof raw === 'object' ? raw : {};

  for (const input of inputs) {
    const label = prefixed(input.label, prefix.cs, prefix.en);
    // Only own properties: values inherited through a prototype are ignored
    let value = Object.hasOwn(source, input.id) ? source[input.id] : undefined;
    const type = input.type ?? 'number';

    if (type === 'select') {
      if (value === undefined || value === null || value === '') value = input.default;
      if (!input.options?.some((option) => option.value === value)) {
        ok = false;
        warnings.push({ cs: `${label.cs}: neznámá volba.`, en: `${label.en}: unknown option.` });
        value = null;
      }
      values[input.id] = value;
      continue;
    }

    if (type === 'list') {
      const items = Array.isArray(value) ? value : [];
      const min = input.min ?? 0;
      const max = input.max ?? Infinity;
      if (items.length < min || items.length > max) {
        ok = false;
        warnings.push({
          cs: `${label.cs}: počet položek musí být ${min} až ${max}.`,
          en: `${label.en}: the number of items must be ${min} to ${max}.`,
        });
      }
      values[input.id] = items.map((item, index) => {
        const read = readInputs(input.fields ?? [], item, {
          cs: `${label.cs} ${index + 1}`,
          en: `${label.en} ${index + 1}`,
        });
        ok = ok && read.ok;
        warnings.push(...read.warnings);
        return read.values;
      });
      continue;
    }

    if (value === undefined || value === null || value === '') {
      if (input.optional) {
        values[input.id] = null;
        continue;
      }
      value = input.default;
    }
    const number = parseNumber(value);
    if (number === null) {
      ok = false;
      warnings.push({ cs: `${label.cs}: zadejte číslo.`, en: `${label.en}: enter a number.` });
      values[input.id] = null;
      continue;
    }
    const tooLow = isNumber(input.min) && number < input.min;
    const tooHigh = isNumber(input.max) && number > input.max;
    if (tooLow || tooHigh) {
      ok = false;
      warnings.push(rangeWarning(label, input.min, input.max, input.unit));
    }
    values[input.id] = number;
  }
  return { ok, values, warnings };
}

/**
 * Copies raw values and gives a list input one default item when it is
 * missing. Only own properties count, as in {@link readInputs}.
 * @param {unknown} raw
 * @param {string} id list input id
 * @returns {Record<string, any>}
 */
export function withDefaultItem(raw, id) {
  const source = raw && typeof raw === 'object' ? /** @type {Record<string, any>} */ (raw) : {};
  const own = Object.hasOwn(source, id) ? source[id] : undefined;
  return { ...source, [id]: own ?? [{}] };
}

/**
 * @param {Text} label
 * @param {number | undefined} min
 * @param {number | undefined} max
 * @param {string | Text} [unit]
 * @returns {Text}
 */
export function rangeWarning(label, min, max, unit) {
  const cs = unit ? ` ${localize(unit, 'cs')}` : '';
  const en = unit ? ` ${localize(unit, 'en')}` : '';
  if (isNumber(min) && isNumber(max)) {
    return {
      cs: `${label.cs}: hodnota musí být od ${show(min, 'cs')} do ${show(max, 'cs')}${cs}.`,
      en: `${label.en}: the value must be between ${show(min, 'en')} and ${show(max, 'en')}${en}.`,
    };
  }
  if (isNumber(min)) {
    return {
      cs: `${label.cs}: hodnota musí být aspoň ${show(min, 'cs')}${cs}.`,
      en: `${label.en}: the value must be at least ${show(min, 'en')}${en}.`,
    };
  }
  return {
    cs: `${label.cs}: hodnota může být nejvýš ${show(/** @type {number} */ (max), 'cs')}${cs}.`,
    en: `${label.en}: the value must be at most ${show(/** @type {number} */ (max), 'en')}${en}.`,
  };
}

/**
 * A result with every output set to null.
 * @param {Output[]} outputs
 * @param {Text[]} warnings
 * @returns {Result}
 */
export function emptyResult(outputs, warnings) {
  /** @type {Record<string, null>} */
  const values = {};
  for (const output of outputs) values[output.id] = null;
  return { values, warnings };
}

/**
 * Converts a value entered in one unit of a converter to all its units.
 * Invalid or out-of-range input gives null for every unit and a warning.
 * @param {any} tool a converter
 * @param {unknown} value number or user-entered string
 * @param {string} unitId
 * @param {Record<string, any>} [params] values of the converter's `params`
 * @returns {Result}
 */
export function convert(tool, value, unitId, params = {}) {
  const units = /** @type {any[]} */ (tool.units);
  const empty = () => emptyResult(units, warnings);
  /** @type {Text[]} */
  const warnings = [];
  const unit = units.find((candidate) => candidate.id === unitId);
  if (!unit) {
    warnings.push({ cs: 'Neznámá jednotka.', en: 'Unknown unit.' });
    return empty();
  }
  const read = readInputs([{ ...unit, type: 'number', unit: undefined }], { [unit.id]: value });
  const settings = readInputs(tool.params ?? [], params);
  warnings.push(...read.warnings, ...settings.warnings);
  if (!read.ok || !settings.ok) return empty();

  try {
    const base = tool.toBase(read.values[unit.id], unitId, settings.values);
    if (!isNumber(base)) {
      warnings.push({ cs: 'Hodnotu nelze převést.', en: 'The value cannot be converted.' });
      return empty();
    }
    /** @type {Record<string, number | null>} */
    const values = {};
    for (const target of units) {
      const converted = tool.fromBase(base, target.id, settings.values);
      values[target.id] = isNumber(converted) ? converted : null;
    }
    return { values, warnings };
  } catch {
    warnings.push({ cs: 'Hodnotu nelze převést.', en: 'The value cannot be converted.' });
    return empty();
  }
}

/**
 * Runs a calculator; never throws.
 * @param {any} tool a calculator
 * @param {Record<string, any>} [values]
 * @returns {Result}
 */
export function calculate(tool, values = {}) {
  try {
    return tool.compute(values);
  } catch {
    return emptyResult(tool.outputs, [{ cs: 'Výpočet se nezdařil.', en: 'The calculation failed.' }]);
  }
}
