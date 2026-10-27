/**
 * Helpers for the bilingual texts used by tools.
 * @module core/i18n
 */

/**
 * @typedef {{ cs: string, en: string }} Text
 */

/** Languages every tool text must provide. */
export const LANGUAGES = ['cs', 'en'];

/**
 * Picks a text in the given language, falling back to English. A plain
 * string (e.g. a unit that is the same in every language) is returned as is.
 * @param {Partial<Record<string, any>> | string | undefined} text
 * @param {string} [lang]
 */
export function localize(text, lang = 'en') {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] ?? text.en ?? '';
}

/**
 * @param {string} cs
 * @param {string} en
 * @returns {Text}
 */
export function text(cs, en) {
  return { cs, en };
}
