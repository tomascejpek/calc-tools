/**
 * Registry of all tools.
 *
 * To add a tool, import its module here and append it to `tools` within its
 * category.
 * @module calc-tools
 */

import { searchTools } from './core/search.js';

import gravity from './tools/units/gravity.js';
import beerColor from './tools/units/beer-color.js';
import temperature from './tools/units/temperature.js';
import volume from './tools/units/volume.js';
import mass from './tools/units/mass.js';
import pressure from './tools/units/pressure.js';
import co2 from './tools/units/co2.js';
import abvAbw from './tools/units/abv-abw.js';

import abv from './tools/beer/abv.js';
import degreeToAbv from './tools/beer/degree-to-abv.js';
import alcoholUnits from './tools/beer/alcohol-units.js';
import ibu from './tools/beer/ibu.js';
import primingSugar from './tools/beer/priming-sugar.js';
import kegCarbonation from './tools/beer/keg-carbonation.js';

export { calculate, convert, emptyResult, readInputs } from './core/tool.js';
export { localize } from './core/i18n.js';
export { normalize } from './core/search.js';
export { isNumber, parseNumber } from './core/units.js';

/** Tool categories in display order. */
export const categories = [
  { id: 'units', name: { cs: 'Převody jednotek', en: 'Unit conversions' } },
  { id: 'beer', name: { cs: 'Pivo', en: 'Beer' } },
];

/** All tools, ordered by category. */
export const tools = [
  gravity, beerColor, temperature, volume, mass, pressure, co2, abvAbw,
  abv, degreeToAbv, alcoholUnits, ibu, primingSugar, kegCarbonation,
].sort((a, b) => categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category));

/**
 * @param {string} id
 */
export function getTool(id) {
  return tools.find((tool) => tool.id === id);
}

/**
 * Tools matching a query in the given language and in English, ignoring
 * diacritics and case, ordered by relevance. An empty query returns all tools.
 * @param {string} query
 * @param {string} [lang]
 */
export function search(query, lang = 'cs') {
  return searchTools(tools, query, lang);
}
