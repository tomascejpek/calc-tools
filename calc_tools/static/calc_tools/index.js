/**
 * Registry of all tools.
 *
 * To add a tool, import its module here and append it to the list within its
 * category; a tool tagged 'beer' also goes into beer.js.
 * @module calc-tools
 */

import { createRegistry } from './core/registry.js';

import siPrefix from './tools/units/si-prefix.js';
import length from './tools/units/length.js';
import area from './tools/units/area.js';
import time from './tools/units/time.js';
import speed from './tools/units/speed.js';
import acceleration from './tools/units/acceleration.js';
import force from './tools/units/force.js';
import energy from './tools/units/energy.js';
import power from './tools/units/power.js';
import torque from './tools/units/torque.js';
import density from './tools/units/density.js';
import concentration from './tools/units/concentration.js';
import specificHeat from './tools/units/specific-heat.js';
import thermalConductivity from './tools/units/thermal-conductivity.js';
import volumeFlow from './tools/units/volume-flow.js';
import massFlow from './tools/units/mass-flow.js';
import { capacitance, current, resistance, voltage } from './tools/units/electric.js';
import charge from './tools/units/charge.js';
import illuminance from './tools/units/illuminance.js';
import photometry from './tools/units/photometry.js';
import photon from './tools/units/photon.js';
import angle from './tools/units/angle.js';
import radioactivity from './tools/units/radioactivity.js';
import radiationDose from './tools/units/radiation-dose.js';
import data from './tools/units/data.js';
import fuelConsumption from './tools/units/fuel-consumption.js';

import percentage from './tools/math/percentage.js';
import percentChange from './tools/math/percent-change.js';
import ruleOfThree from './tools/math/rule-of-three.js';
import fractions from './tools/math/fractions.js';
import rounding from './tools/math/rounding.js';
import gcdLcm from './tools/math/gcd-lcm.js';
import primes from './tools/math/primes.js';
import numberBase from './tools/math/number-base.js';
import roman from './tools/math/roman.js';
import quadratic from './tools/math/quadratic.js';
import cubic from './tools/math/cubic.js';
import linearSystem from './tools/math/linear-system.js';
import powerLog from './tools/math/power-log.js';
import planeShapes from './tools/math/plane-shapes.js';
import solids from './tools/math/solids.js';
import triangle from './tools/math/triangle.js';
import pythagoras from './tools/math/pythagoras.js';
import tankVolume from './tools/math/tank-volume.js';
import combinatorics from './tools/math/combinatorics.js';
import statistics from './tools/math/statistics.js';
import normalDistribution from './tools/math/normal-distribution.js';
import linearRegression from './tools/math/linear-regression.js';

import compoundInterest from './tools/finance/compound-interest.js';
import loan from './tools/finance/loan.js';
import apr from './tools/finance/apr.js';
import vat from './tools/finance/vat.js';
import margin from './tools/finance/margin.js';

import acceleratedMotion from './tools/physics/accelerated-motion.js';
import freeFall from './tools/physics/free-fall.js';
import projectile from './tools/physics/projectile.js';
import mechanicalEnergy from './tools/physics/mechanical-energy.js';
import momentum from './tools/physics/momentum.js';
import workPower from './tools/physics/work-power.js';
import leverPulley from './tools/physics/lever-pulley.js';
import hydrostaticPressure from './tools/physics/hydrostatic-pressure.js';
import buoyancy from './tools/physics/buoyancy.js';
import pipeFlow from './tools/physics/pipe-flow.js';
import bernoulli from './tools/physics/bernoulli.js';
import pressureLoss from './tools/physics/pressure-loss.js';
import heatEnergy from './tools/physics/heat-energy.js';
import liquidMixing from './tools/physics/liquid-mixing.js';
import heatingTime from './tools/physics/heating-time.js';
import latentHeat from './tools/physics/latent-heat.js';
import wortCooling from './tools/physics/wort-cooling.js';
import heatLoss from './tools/physics/heat-loss.js';
import thermalExpansion from './tools/physics/thermal-expansion.js';
import idealGas from './tools/physics/ideal-gas.js';
import gasLaws from './tools/physics/gas-laws.js';
import gasSolubility from './tools/physics/gas-solubility.js';
import ohmsLaw from './tools/physics/ohms-law.js';
import componentNetwork from './tools/physics/component-network.js';
import voltageDivider from './tools/physics/voltage-divider.js';
import ledResistor from './tools/physics/led-resistor.js';
import wireSize from './tools/physics/wire-size.js';
import batteryRuntime from './tools/physics/battery-runtime.js';
import electricityCost from './tools/physics/electricity-cost.js';
import refraction from './tools/physics/refraction.js';
import thinLens from './tools/physics/thin-lens.js';
import speedOfSound from './tools/physics/speed-of-sound.js';
import doppler from './tools/physics/doppler.js';
import decibels from './tools/physics/decibels.js';
import timeDilation from './tools/physics/time-dilation.js';
import escapeVelocity from './tools/physics/escape-velocity.js';
import orbitalPeriod from './tools/physics/orbital-period.js';
import astroDistance from './tools/physics/astro-distance.js';

import molarMass from './tools/chemistry/molar-mass.js';
import amount from './tools/chemistry/amount.js';
import balanceEquation from './tools/chemistry/balance-equation.js';
import reactionYield from './tools/chemistry/reaction-yield.js';
import dilution from './tools/chemistry/dilution.js';
import solutionMixing from './tools/chemistry/solution-mixing.js';
import solutionPrep from './tools/chemistry/solution-prep.js';
import ph from './tools/chemistry/ph.js';
import buffer from './tools/chemistry/buffer.js';
import dissociationConstant from './tools/chemistry/dissociation-constant.js';
import gasVolume from './tools/chemistry/gas-volume.js';
import partialPressure from './tools/chemistry/partial-pressure.js';
import halfLife from './tools/chemistry/half-life.js';
import arrhenius from './tools/chemistry/arrhenius.js';
import reactionHeat from './tools/chemistry/reaction-heat.js';
import combustionHeat from './tools/chemistry/combustion-heat.js';
import sanitizer from './tools/chemistry/sanitizer.js';

import bakersPercentage from './tools/food/bakers-percentage.js';
import doughHydration from './tools/food/dough-hydration.js';
import sourdough from './tools/food/sourdough.js';
import kitchenMeasures from './tools/food/kitchen-measures.js';
import recipeScaling from './tools/food/recipe-scaling.js';
import salting from './tools/food/salting.js';
import fermentationBrine from './tools/food/fermentation-brine.js';
import pasteurization from './tools/food/pasteurization.js';
import bmi from './tools/food/bmi.js';
import basalMetabolism from './tools/food/basal-metabolism.js';
import foodEnergy from './tools/food/food-energy.js';
import bloodAlcohol from './tools/food/blood-alcohol.js';

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

const registry = createRegistry([
  siPrefix, length, area, volume, mass, time, speed, acceleration,
  force, pressure, energy, power, torque,
  density, concentration,
  temperature, specificHeat, thermalConductivity,
  volumeFlow, massFlow,
  voltage, current, resistance, capacitance, charge,
  illuminance, photometry, photon,
  angle, radioactivity, radiationDose, data, fuelConsumption,
  percentage, percentChange, ruleOfThree, fractions, rounding,
  gcdLcm, primes, numberBase, roman,
  quadratic, cubic, linearSystem, powerLog,
  planeShapes, solids, triangle, pythagoras, tankVolume,
  combinatorics,
  statistics, normalDistribution, linearRegression,
  compoundInterest, loan, apr, vat, margin,
  acceleratedMotion, freeFall, projectile, mechanicalEnergy, momentum, workPower, leverPulley,
  hydrostaticPressure, buoyancy, pipeFlow, bernoulli, pressureLoss,
  heatEnergy, liquidMixing, heatingTime, latentHeat, wortCooling, heatLoss, thermalExpansion,
  idealGas, gasLaws, gasSolubility,
  ohmsLaw, componentNetwork, voltageDivider, ledResistor, wireSize, batteryRuntime, electricityCost,
  refraction, thinLens, speedOfSound, doppler, decibels,
  timeDilation, escapeVelocity, orbitalPeriod, astroDistance,
  molarMass, amount, balanceEquation, reactionYield, dilution, solutionMixing, solutionPrep, ph, buffer, dissociationConstant, gasVolume, partialPressure, halfLife, arrhenius, reactionHeat, combustionHeat, sanitizer,
  bakersPercentage, doughHydration, sourdough, kitchenMeasures, recipeScaling, salting, fermentationBrine, pasteurization, bmi, basalMetabolism, foodEnergy, bloodAlcohol,
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
  mustGravity, potentialAlcohol, sulfite, spiritDilution, alcoholmeter,
  meadSugar, tosna,
]);

/** All tools, ordered by category. */
export const tools = registry.tools;
/** Tool categories in display order. */
export const categories = registry.categories;
/** Finds a tool by its id. */
export const getTool = registry.getTool;
/**
 * Tools matching a query in the given language and in English, ignoring
 * diacritics and case, ordered by relevance. An empty query returns all tools.
 */
export const search = registry.search;
