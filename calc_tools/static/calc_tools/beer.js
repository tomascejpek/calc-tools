/**
 * Registry of brewing tools only: every tool tagged 'beer', including the
 * general unit converters a brewer needs. Same API as index.js, but the
 * browser loads only these modules.
 *
 * To add a brewing tool, import it here as well as in index.js;
 * test/registry.test.js checks that both agree.
 * @module calc-tools/beer
 */

import { createRegistry } from './core/registry.js';

import volume from './tools/units/volume.js';
import mass from './tools/units/mass.js';
import pressure from './tools/units/pressure.js';
import density from './tools/units/density.js';
import temperature from './tools/units/temperature.js';
import specificHeat from './tools/units/specific-heat.js';
import volumeFlow from './tools/units/volume-flow.js';

import tankVolume from './tools/math/tank-volume.js';

import gravity from './tools/units/gravity.js';
import beerColor from './tools/units/beer-color.js';
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

export { calculate, convert, emptyResult, readInputs } from './core/tool.js';
export { localize } from './core/i18n.js';
export { normalize } from './core/search.js';
export { isNumber, parseNumber } from './core/units.js';

const registry = createRegistry([
  volume, mass, pressure, density, temperature, specificHeat, volumeFlow,
  tankVolume,
  gravity, beerColor, co2, abvAbw,
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
]);

/** Brewing tools, ordered by category. */
export const tools = registry.tools;
/** Categories of the brewing tools in display order. */
export const categories = registry.categories;
/** Finds a brewing tool by its id. */
export const getTool = registry.getTool;
/**
 * Brewing tools matching a query in the given language and in English,
 * ignoring diacritics and case, ordered by relevance.
 */
export const search = registry.search;
