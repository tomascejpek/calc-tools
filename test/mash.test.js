import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import strikeWater, { strikeTemperature } from '../calc_tools/static/calc_tools/tools/beer/strike-water.js';
import mashInfusion, { infusionVolume } from '../calc_tools/static/calc_tools/tools/beer/mash-infusion.js';
import decoction, { decoctionFraction } from '../calc_tools/static/calc_tools/tools/beer/decoction.js';
import waterVolumes from '../calc_tools/static/calc_tools/tools/beer/water-volumes.js';
import { invalid, near } from './helpers.js';

const QT_PER_LB_TO_L_PER_KG = 0.946352946 / 0.45359237;
const fToC = (/** @type {number} */ f) => (f - 32) * 5 / 9;

describe('strike-water', () => {
  test('Palmer: 1.5 qt/lb, grain 70 °F, mash 150 °F → strike about 160.7 °F', () => {
    // Palmer (imperial): Tw = 0.2 / 1.5 × (150 − 70) + 150 = 160.7 °F = 71.5 °C
    near(strikeTemperature(1.5 * QT_PER_LB_TO_L_PER_KG, fToC(70), fToC(150)), fToC(160.7), 0.2);
  });

  test('defaults: 15 l on 5 kg, 20 → 65 °C', () => {
    const result = strikeWater.compute({});
    near(result.values.temperature, 65 + 0.41 / 3 * 45, 1e-9);
    near(result.values.ratio, 3, 1e-12);
    near(result.values.mashVolume, 15 + 5 * 0.67, 1e-9);
    assert.deepEqual(result.warnings, []);
  });

  test('tun allowance is added and extremes warn', () => {
    near(strikeWater.compute({ tunLoss: 2 }).values.temperature - strikeWater.compute({}).values.temperature, 2, 1e-9);
    assert.equal(strikeWater.compute({ water: 2, grain: 5 }).warnings.length, 2, 'thick mash: boiling and ratio');
  });

  test('zero difference and invalid input', () => {
    invalid(strikeWater.compute({ grainTemp: 65, target: 65 }));
    invalid(strikeWater.compute({ grain: 0 }));
    invalid(strikeWater.compute({ target: 90 }));
    invalid(strikeWater.compute({ water: '1e999' }));
  });
});

describe('mash-infusion', () => {
  test('heat balance: the added water and the mash meet at the target', () => {
    const volume = infusionVolume({ grain: 5, water: 15, from: 52, to: 63, infusion: 98 });
    near(volume, 11 * (0.41 * 5 + 15) / 35, 1e-12);
    // Heat lost by the infusion equals heat gained by mash and grain
    near(volume * (98 - 63), (15 + 0.41 * 5) * (63 - 52), 1e-9);
  });

  test('outputs total water and ratio', () => {
    const result = mashInfusion.compute({ water: '15,0' }).values;
    near(result.totalWater, 15 + result.volume, 1e-12);
    near(result.ratio, result.totalWater / 5, 1e-12);
  });

  test('zero step and impossible infusions', () => {
    invalid(mashInfusion.compute({ from: 63, to: 63 }));
    invalid(mashInfusion.compute({ to: 72, infusion: 70 }));
    invalid(mashInfusion.compute({ infusion: 120 }));
  });
});

describe('decoction', () => {
  test('fraction = (T2 − T1) / (Td − T1)', () => {
    near(decoctionFraction(50, 65, 100), 0.3, 1e-12);
    const result = decoction.compute({ grain: 0, water: 30, from: 50, to: 65 }).values;
    near(result.volume, 9, 1e-9);
    near(result.fraction, 30, 1e-9);
  });

  test('large decoctions warn', () => {
    assert.equal(decoction.compute({ from: 40, to: 75 }).warnings.length, 1);
  });

  test('zero step and invalid input', () => {
    invalid(decoction.compute({ from: 63, to: 63 }));
    invalid(decoction.compute({ to: 76, decoction: 75 }));
    invalid(decoction.compute({ water: 0 }));
  });
});

describe('water-volumes', () => {
  test('works back from the fermenter', () => {
    const result = waterVolumes.compute({
      batch: 20, grain: 5, ratio: 3, boilMinutes: 60, evaporation: 4, absorption: 1, tunDeadSpace: 1, kettleLoss: 2, shrinkage: 4,
    }).values;
    near(result.postBoil, 22 / 0.96, 1e-9);
    near(result.preBoil, 22 / 0.96 + 4, 1e-9);
    near(result.total, 22 / 0.96 + 4 + 5 + 1, 1e-9);
    near(result.mash, 15, 1e-12);
    near(result.sparge + result.mash, result.total, 1e-9);
    near(result.totalRatio, result.total / 5, 1e-12);
  });

  test('no sparge when the mash ratio takes all the water', () => {
    const result = waterVolumes.compute({ ratio: 10 });
    assert.equal(result.values.sparge, 0);
    assert.equal(result.values.mash, result.values.total);
    assert.equal(result.warnings.length, 1);
  });

  test('zero losses and no grain', () => {
    const result = waterVolumes.compute({ grain: 0, boilMinutes: 0, kettleLoss: 0, shrinkage: 0, tunDeadSpace: 0 }).values;
    near(result.total, 20, 1e-12);
    assert.equal(result.totalRatio, null);
    invalid(waterVolumes.compute({ shrinkage: 20 }));
    invalid(waterVolumes.compute({ batch: -5 }));
  });
});
