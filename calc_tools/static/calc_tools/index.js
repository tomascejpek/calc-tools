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

import strikeWater from './tools/beer/strike-water.js';
import mashInfusion from './tools/beer/mash-infusion.js';
import decoction from './tools/beer/decoction.js';

import waterVolumes from './tools/beer/water-volumes.js';

import brewhouseEfficiency from './tools/beer/brewhouse-efficiency.js';
import maltExtract from './tools/beer/malt-extract.js';
import ogEstimate from './tools/beer/og-estimate.js';

import gravityAdjust from './tools/beer/gravity-adjust.js';
import sugarAddition from './tools/beer/sugar-addition.js';
import hydrometerCorrection from './tools/beer/hydrometer-correction.js';
import refractometer from './tools/beer/refractometer.js';

import ibu from './tools/beer/ibu.js';
import hopStand from './tools/beer/hop-stand.js';
import hopUtilization from './tools/beer/hop-utilization.js';
import buGu from './tools/beer/bu-gu.js';

import recipeColor from './tools/beer/recipe-color.js';

import pitchRate from './tools/beer/pitch-rate.js';
import yeastStarter from './tools/beer/yeast-starter.js';
import yeastViability from './tools/beer/yeast-viability.js';

import abv from './tools/beer/abv.js';
import degreeToAbv from './tools/beer/degree-to-abv.js';
import attenuation from './tools/beer/attenuation.js';
import alcoholUnits from './tools/beer/alcohol-units.js';

import residualAlkalinity from './tools/beer/residual-alkalinity.js';
import sulfateChloride from './tools/beer/sulfate-chloride.js';
import waterSalts from './tools/beer/water-salts.js';
import mashPh from './tools/beer/mash-ph.js';
import waterAcidification from './tools/beer/water-acidification.js';

import primingSugar from './tools/beer/priming-sugar.js';
import kegCarbonation from './tools/beer/keg-carbonation.js';
import beerLine from './tools/beer/beer-line.js';

import mustGravity from './tools/wine/must-gravity.js';
import potentialAlcohol from './tools/wine/potential-alcohol.js';
import sulfite from './tools/wine/sulfite.js';
import spiritDilution from './tools/wine/spirit-dilution.js';
import alcoholmeter from './tools/wine/alcoholmeter.js';

import meadSugar from './tools/mead/mead-sugar.js';
import tosna from './tools/mead/tosna.js';

export { calculate, convert, emptyResult, readInputs } from './core/tool.js';
export { localize } from './core/i18n.js';
export { normalize } from './core/search.js';
export { isNumber, parseNumber } from './core/units.js';

/** Tool categories in display order. */
export const categories = [
  { id: 'units', name: { cs: 'Převody jednotek', en: 'Unit conversions' } },
  { id: 'mash', name: { cs: 'Rmutování', en: 'Mashing' } },
  { id: 'water', name: { cs: 'Voda – objemy', en: 'Water volumes' } },
  { id: 'efficiency', name: { cs: 'Výtěžnost', en: 'Efficiency' } },
  { id: 'corrections', name: { cs: 'Korekce a měření', en: 'Corrections and readings' } },
  { id: 'hops', name: { cs: 'Hořkost', en: 'Bitterness' } },
  { id: 'color', name: { cs: 'Barva', en: 'Colour' } },
  { id: 'yeast', name: { cs: 'Kvasnice', en: 'Yeast' } },
  { id: 'fermentation', name: { cs: 'Kvašení a alkohol', en: 'Fermentation and alcohol' } },
  { id: 'water-chemistry', name: { cs: 'Voda – chemie', en: 'Water chemistry' } },
  { id: 'packaging', name: { cs: 'Stáčení a výčep', en: 'Packaging and dispensing' } },
  { id: 'wine', name: { cs: 'Víno a destiláty', en: 'Wine and spirits' } },
  { id: 'mead', name: { cs: 'Medovina a cider', en: 'Mead and cider' } },
];

/** All tools, ordered by category. */
export const tools = [
  gravity, beerColor, temperature, volume, mass, pressure, co2, abvAbw,
  strikeWater, mashInfusion, decoction,
  waterVolumes,
  brewhouseEfficiency, maltExtract, ogEstimate,
  gravityAdjust, sugarAddition, hydrometerCorrection, refractometer,
  ibu, hopStand, hopUtilization, buGu,
  recipeColor,
  pitchRate, yeastStarter, yeastViability,
  abv, degreeToAbv, attenuation, alcoholUnits,
  residualAlkalinity, sulfateChloride, waterSalts, mashPh, waterAcidification,
  primingSugar, kegCarbonation, beerLine,
  mustGravity, potentialAlcohol, sulfite, spiritDilution, alcoholmeter,
  meadSugar, tosna,
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
