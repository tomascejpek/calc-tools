/**
 * Numbers written into text outputs in both languages.
 * @module core/format
 */

/** @typedef {import('./i18n.js').Text} Text */

/**
 * A number as text, at most `significant` significant digits, without
 * trailing zeros; Czech uses the decimal comma.
 * @param {number} value
 * @param {'cs' | 'en'} lang
 * @param {number} [significant]
 */
export function formatNumber(value, lang, significant = 12) {
  if (!Number.isFinite(value)) return '–';
  // Avoid "-0"
  const text = String(Number(value.toPrecision(significant)) + 0);
  return lang === 'cs' ? text.replace('.', ',') : text;
}

/**
 * A text per language built from a template function.
 * @param {(lang: 'cs' | 'en', number: (value: number) => string) => string} build
 * @param {number} [significant]
 * @returns {Text}
 */
export function bilingual(build, significant = 12) {
  return {
    cs: build('cs', (value) => formatNumber(value, 'cs', significant)),
    en: build('en', (value) => formatNumber(value, 'en', significant)),
  };
}
