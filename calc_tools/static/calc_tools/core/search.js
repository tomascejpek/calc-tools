/**
 * Full-text search over tool descriptions, ignoring diacritics and case.
 * @module core/search
 */

/**
 * Lower-cases a text and strips diacritics ("Stupňovitost" → "stupnovitost").
 * @param {string} value
 */
export function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const WEIGHT = { name: 100, keywords: 10, description: 1 };

/**
 * @param {any} tool
 * @param {string[]} languages
 */
function fields(tool, languages) {
  const pick = (/** @type {any} */ text) => languages.map((lang) => text?.[lang] ?? '');
  return {
    name: normalize(pick(tool.name).join(' ')),
    keywords: normalize(languages.flatMap((lang) => tool.keywords?.[lang] ?? []).join(' ')),
    description: normalize(pick(tool.description).join(' ')),
  };
}

/**
 * Finds tools matching every word of the query, in the given language and in
 * English. Ordered by relevance: a match in the name ranks above keywords,
 * keywords above the description. An empty query returns all tools.
 * @template T
 * @param {T[]} tools
 * @param {string} query
 * @param {string} [lang]
 * @returns {T[]}
 */
export function searchTools(tools, query, lang = 'cs') {
  const words = normalize(query).split(/[\s,;]+/).filter(Boolean);
  if (!words.length) return [...tools];
  const languages = lang === 'en' ? ['en'] : [lang, 'en'];

  const scored = [];
  tools.forEach((tool, index) => {
    const text = fields(tool, languages);
    let score = 0;
    for (const word of words) {
      let best = 0;
      for (const [field, weight] of Object.entries(WEIGHT)) {
        if (text[/** @type {keyof typeof WEIGHT} */ (field)].includes(word)) best = Math.max(best, weight);
      }
      if (!best) return;
      score += best;
    }
    scored.push({ tool, score, index });
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.map((entry) => entry.tool);
}
