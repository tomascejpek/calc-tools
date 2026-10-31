import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { convert } from '../calc_tools/static/calc_tools/index.js';
import { extractKg, platoFromExtract, platoToSg, wortDensity } from '../calc_tools/static/calc_tools/core/units.js';
import maltExtract, { percentToPpg, ppgToPercent } from '../calc_tools/static/calc_tools/tools/beer/malt-extract.js';
import brewhouseEfficiency from '../calc_tools/static/calc_tools/tools/beer/brewhouse-efficiency.js';
import ogEstimate from '../calc_tools/static/calc_tools/tools/beer/og-estimate.js';
import gravityAdjust from '../calc_tools/static/calc_tools/tools/beer/gravity-adjust.js';
import sugarAddition, { SWEETENER_EXTRACT } from '../calc_tools/static/calc_tools/tools/beer/sugar-addition.js';
import hydrometerCorrection, { correctHydrometer } from '../calc_tools/static/calc_tools/tools/beer/hydrometer-correction.js';
import refractometer, { terrillFg } from '../calc_tools/static/calc_tools/tools/beer/refractometer.js';
import { invalid, near } from './helpers.js';

const fToC = (/** @type {number} */ f) => (f - 32) * 5 / 9;

describe('extract helpers', () => {
  test('25 l of 12 °P wort holds 3.14 kg of extract', () => {
    // 25 l × 1.0484 × 0.9982 kg/l × 12 %
    near(extractKg(12, 25), 25 * platoToSg(12) * 0.9982 * 0.12, 1e-9);
    near(extractKg(12, 25), 3.1396, 0.0005);
  });

  test('platoFromExtract inverts extractKg', () => {
    for (const plato of [0, 5, 12, 25]) near(platoFromExtract(extractKg(plato, 20), 20), plato, 1e-8);
    assert.equal(platoFromExtract(1, 0), null);
    assert.equal(platoFromExtract(1000, 1), null);
  });
});

describe('malt-extract', () => {
  test('sucrose is 100 % and 46.214 PPG; 80 % ≈ 37 PPG', () => {
    near(percentToPpg(100), 46.214, 1e-12);
    near(ppgToPercent(37), 80.06, 0.01);
    const result = convert(maltExtract, '80', 'percent');
    near(result.values.ppg, 36.97, 0.01);
    // 1 PPG = 8.345 points·l/kg
    near(result.values.pkl, result.values.ppg * 8.3454, 0.01);
  });

  test('round trip and zero', () => {
    near(convert(maltExtract, 300, 'pkl').values.pkl, 300, 1e-9);
    assert.equal(convert(maltExtract, 0, 'ppg').values.percent, 0);
  });

  test('out of range', () => {
    invalid(convert(maltExtract, 101, 'percent'));
    invalid(convert(maltExtract, 50, 'ppg'));
    invalid(convert(maltExtract, '<b>', 'percent'));
  });
});

describe('brewhouse-efficiency', () => {
  test('5 kg of 80 % malt giving 25 l of 12 °P → 78.5 %', () => {
    const result = brewhouseEfficiency.compute({ malts: [{ kg: 5, extract: 80 }], volume: 25, gravity: 12 });
    near(result.values.potential, 4, 1e-12);
    near(result.values.efficiency, 3.1396 / 4 * 100, 0.02);
  });

  test('several malts and gravity in SG', () => {
    const result = brewhouseEfficiency.compute({
      malts: [{ kg: 4, extract: 81 }, { kg: 1, extract: 75 }], volume: 25, scale: 'sg', gravity: platoToSg(12),
    });
    near(result.values.potential, 4 * 0.81 + 0.75, 1e-12);
    near(result.values.extract, extractKg(12, 25), 1e-9);
  });

  test('over 100 % warns; zero and invalid input', () => {
    assert.equal(brewhouseEfficiency.compute({ malts: [{ kg: 1 }] }).warnings.length, 1);
    assert.equal(brewhouseEfficiency.compute({ gravity: 0 }).values.efficiency, 0);
    invalid(brewhouseEfficiency.compute({ malts: [{ kg: 0 }] }));
    invalid(brewhouseEfficiency.compute({ malts: [] }));
    invalid(brewhouseEfficiency.compute({ gravity: 60 }));
    invalid(brewhouseEfficiency.compute({ malts: Array.from({ length: 21 }, () => ({})) }));
  });
});

describe('og-estimate', () => {
  test('inverts the efficiency calculation', () => {
    const extract = extractKg(12, 25);
    const result = ogEstimate.compute({ fermentables: [{ kg: extract / 0.8 / 0.75, extract: 80 }], volume: 25, efficiency: 75 });
    near(result.values.plato, 12, 1e-6);
    near(result.values.og, platoToSg(12), 1e-8);
  });

  test('sugar dissolves completely regardless of efficiency', () => {
    const sugar = [{ kg: 1, extract: 100, type: 'dissolved' }];
    near(ogEstimate.compute({ fermentables: sugar, efficiency: 50 }).values.extract, 1, 1e-12);
    near(ogEstimate.compute({ fermentables: sugar, efficiency: 90 }).values.extract, 1, 1e-12);
  });

  test('zero and invalid', () => {
    near(ogEstimate.compute({ fermentables: [{ kg: 0 }] }).values.plato, 0, 1e-9);
    invalid(ogEstimate.compute({ fermentables: [{ kg: 1000 }], volume: 1 }));
    invalid(ogEstimate.compute({ fermentables: [{ type: 'magic' }] }));
    invalid(ogEstimate.compute({ efficiency: 0 }));
  });
});

describe('gravity-adjust', () => {
  test('dilution keeps the extract mass', () => {
    const result = gravityAdjust.compute({ volume: 20, gravity: 13, target: 12 }).values;
    near(extractKg(12, result.finalVolume), extractKg(13, 20), 1e-9);
    near(result.addWater, (result.finalVolume * wortDensity(12) - 20 * wortDensity(13)) / 0.9982, 1e-9);
    assert.equal(result.boilOff, 0);
  });

  test('concentration by boiling and SG input', () => {
    const result = gravityAdjust.compute({ scale: 'sg', gravity: 1.040, target: 1.050 }).values;
    assert.equal(result.addWater, 0);
    assert.ok(result.boilOff > 3.5 && result.boilOff < 4.5, `boil off ${result.boilOff}`);
    near(result.targetSg, 1.050, 1e-9);
  });

  test('zero change and invalid input', () => {
    const same = gravityAdjust.compute({ gravity: 12, target: 12 }).values;
    near(same.addWater, 0, 1e-9);
    near(same.finalVolume, 20, 1e-9);
    invalid(gravityAdjust.compute({ target: 0 }));
    invalid(gravityAdjust.compute({ scale: 'sg', gravity: 1.5 }));
    invalid(gravityAdjust.compute({ gravity: 'twelve' }));
  });
});

describe('sugar-addition', () => {
  test('the added sugar reaches the target gravity exactly', () => {
    const result = sugarAddition.compute({ volume: 20, gravity: 11, target: 12 }).values;
    const mass = 20 * wortDensity(11) + result.grams / 1000;
    const extract = extractKg(11, 20) + result.grams / 1000;
    near(extract / mass * 100, 12, 1e-9);
    near(result.finalVolume, mass / wortDensity(12), 1e-9);
  });

  test('glucose monohydrate and malt extract need more than sucrose', () => {
    const sucrose = sugarAddition.compute({}).values.grams;
    const glucose = sugarAddition.compute({ sweetener: 'glucose' }).values.grams;
    // (1 − 0.12) / (0.9091 − 0.12): the sweetener's own water dilutes too
    near(glucose / sucrose, 0.88 / (180.16 / 198.17 - 0.12), 1e-9);
    assert.ok(sugarAddition.compute({ sweetener: 'lme' }).values.grams > sugarAddition.compute({ sweetener: 'dme' }).values.grams);
    near(SWEETENER_EXTRACT.glucose, 0.9091, 1e-4);
  });

  test('zero, lower target and invalid input', () => {
    near(sugarAddition.compute({ gravity: 12, target: 12 }).values.grams, 0, 1e-9);
    invalid(sugarAddition.compute({ gravity: 12, target: 11 }));
    invalid(sugarAddition.compute({ sweetener: 'salt' }));
    invalid(sugarAddition.compute({ target: 45 }));
  });
});

describe('hydrometer-correction', () => {
  test('table for a 60 °F hydrometer: +1 at 70 °F, +2 at 77 °F, +6 at 100 °F', () => {
    const cal = fToC(60);
    near((correctHydrometer(1.050, fToC(70), cal) - 1.050) * 1000, 1.1, 0.5);
    near((correctHydrometer(1.050, fToC(77), cal) - 1.050) * 1000, 2, 0.5);
    near((correctHydrometer(1.050, fToC(100), cal) - 1.050) * 1000, 6, 0.6);
  });

  test('a warm sample reads low, a cold one high; °P input', () => {
    const warm = hydrometerCorrection.compute({ reading: 12, temperature: 25 }).values;
    assert.ok(warm.plato > 12.2 && warm.plato < 12.4, `plato ${warm.plato}`);
    assert.ok(hydrometerCorrection.compute({ reading: 12, temperature: 10 }).values.plato < 12);
    assert.equal(hydrometerCorrection.compute({ temperature: 50 }).warnings.length, 1);
  });

  test('zero correction at the calibration temperature; invalid input', () => {
    near(hydrometerCorrection.compute({ reading: 12, temperature: 20 }).values.plato, 12, 1e-9);
    near(hydrometerCorrection.compute({ scale: 'sg', reading: 1.000, temperature: 20 }).values.sg, 1, 1e-12);
    invalid(hydrometerCorrection.compute({ temperature: 90 }));
    invalid(hydrometerCorrection.compute({ scale: 'sg', reading: 12 }));
  });
});

describe('refractometer', () => {
  test('Terrill cubic fit', () => {
    // 12 and 6 °Bx with WCF 1.04: corrected 11.538 and 5.769
    near(terrillFg(12 / 1.04, 6 / 1.04), 1.01138, 0.00002);
    const result = refractometer.compute({ initial: 12, current: 6 }).values;
    near(result.fg, 1.01138, 0.00002);
    near(result.originalPlato, 12 / 1.04, 1e-12);
    assert.ok(result.abv > 4.5 && result.abv < 5);
  });

  test('wort reading divides by the correction factor', () => {
    const result = refractometer.compute({ stage: 'wort', initial: 13, wcf: 1 }).values;
    near(result.og, platoToSg(13), 1e-12);
    assert.equal(result.abv, 0);
  });

  test('zero and invalid readings', () => {
    invalid(refractometer.compute({ initial: 0, current: 0 }));
    invalid(refractometer.compute({ initial: 8, current: 10 }));
    invalid(refractometer.compute({ wcf: 2 }));
    invalid(refractometer.compute({ stage: 'beer' }));
  });
});
