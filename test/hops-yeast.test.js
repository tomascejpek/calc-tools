import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import ibu, {
  danielsUtilization, garetzUtilization, gravityAdjustment, ibuByMethod, ragerUtilization, tinsethIbu,
} from '../calc_tools/static/calc_tools/tools/beer/ibu.js';
import hopStand, { relativeIsomerisation } from '../calc_tools/static/calc_tools/tools/beer/hop-stand.js';
import hopUtilization from '../calc_tools/static/calc_tools/tools/beer/hop-utilization.js';
import buGu from '../calc_tools/static/calc_tools/tools/beer/bu-gu.js';
import recipeColor, { maltColorUnits, moreySrm } from '../calc_tools/static/calc_tools/tools/beer/recipe-color.js';
import pitchRate, { cellsNeeded } from '../calc_tools/static/calc_tools/tools/beer/pitch-rate.js';
import yeastStarter, { starterGrowth } from '../calc_tools/static/calc_tools/tools/beer/yeast-starter.js';
import yeastViability, { yeastViability as viability } from '../calc_tools/static/calc_tools/tools/beer/yeast-viability.js';
import attenuation, { ballingAbw } from '../calc_tools/static/calc_tools/tools/beer/attenuation.js';
import { platoToSg } from '../calc_tools/static/calc_tools/core/units.js';
import { invalid, near } from './helpers.js';

// 1 oz of 5 % hops in 5 US gal at 1.050
const OZ_IN_5_GAL = { litres: 18.927, gravity: 1.050 };
const ONE_OZ = { grams: 28.3495, alpha: 5, pellets: false };

describe('ibu methods', () => {
  test('Rager curve: 18.11 % at 31.32 min, about 30.8 % at 60 min, gravity adjustment above 1.050', () => {
    near(ragerUtilization(31.32), 0.1811, 1e-12);
    near(ragerUtilization(60), 0.308, 0.001);
    assert.equal(gravityAdjustment(1.040), 1);
    near(gravityAdjustment(1.090), 1.2, 1e-12);
  });

  test('Daniels and Garetz tables', () => {
    assert.equal(danielsUtilization(5), 0.05);
    assert.equal(danielsUtilization(60), 0.24);
    assert.equal(danielsUtilization(90, true), 0.34);
    assert.equal(garetzUtilization(10), 0);
    assert.equal(garetzUtilization(11), 0.02);
    assert.equal(garetzUtilization(60), 0.20);
    assert.equal(garetzUtilization(120), 0.23);
  });

  test('1 oz of 5 % hops, 60 min, 5 gal at 1.050 by each method', () => {
    const hop = [{ ...ONE_OZ, minutes: 60 }];
    // 74.9 mg/l of alpha acids
    near(ibuByMethod('tinseth', hop, OZ_IN_5_GAL)[0], tinsethIbu({ ...ONE_OZ, minutes: 60, ...OZ_IN_5_GAL }), 1e-9);
    near(ibuByMethod('rager', hop, OZ_IN_5_GAL)[0], 74.89 * ragerUtilization(60), 0.02);
    near(ibuByMethod('daniels', hop, OZ_IN_5_GAL)[0], 74.89 * 0.24, 0.02);
    // Garetz: IBU × (1 + IBU / 260) = 0.20 × 74.89 → 14.20
    near(ibuByMethod('garetz', hop, OZ_IN_5_GAL)[0], 14.20, 0.02);
  });

  test('Garetz: elevation, partial boil and pellets', () => {
    const hop = [{ ...ONE_OZ, minutes: 60 }];
    const sea = ibuByMethod('garetz', hop, OZ_IN_5_GAL)[0];
    // 1650 ft (502.9 m) gives a temperature factor of 1.06
    const high = ibuByMethod('garetz', hop, { ...OZ_IN_5_GAL, elevation: 502.92 })[0];
    near(high * (1 + high / 260) * 1.06, sea * (1 + sea / 260), 1e-6);
    assert.ok(ibuByMethod('garetz', hop, { ...OZ_IN_5_GAL, boilLitres: 10 })[0] < sea);
    assert.ok(ibuByMethod('garetz', [{ ...hop[0], pellets: true }], OZ_IN_5_GAL)[0] > sea);
  });

  test('tool: method select, partial boil lowers Rager and Daniels', () => {
    const base = { volume: 20, og: 1.060, hops: [{ grams: 30, alpha: 6, minutes: 60 }] };
    const full = ibu.compute({ ...base, method: 'rager' }).values.ibu;
    const partial = ibu.compute({ ...base, method: 'rager', boilVolume: 10 }).values.ibu;
    assert.ok(partial < full);
    assert.ok(ibu.compute({ ...base, method: 'daniels' }).values.ibu > 0);
    assert.equal(ibu.compute({ ...base, method: 'garetz', hops: [{ minutes: 5 }] }).values.ibu, 0);
  });

  test('invalid method and boil volume', () => {
    invalid(ibu.compute({ method: 'guess' }));
    invalid(ibu.compute({ boilVolume: 0 }));
    invalid(ibu.compute({ elevation: 9000 }));
  });
});

describe('hop-stand', () => {
  test('at 100 °C it equals Tinseth; at 80 °C about 1/6 of it (Malowicki)', () => {
    near(relativeIsomerisation(100), 1, 1e-12);
    near(relativeIsomerisation(80), 0.165, 0.002);
    const boil = hopStand.compute({ temperature: 100, minutes: 20, hops: [{ grams: 50, alpha: 10, form: 'leaf' }] }).values.ibu;
    near(boil, tinsethIbu({ grams: 50, alpha: 10, minutes: 20, litres: 20, gravity: 1.050 }), 1e-9);
  });

  test('cooler stands give less, pellets 10 % more', () => {
    const at = (/** @type {number} */ temperature) => hopStand.compute({ temperature }).values.ibu;
    assert.ok(at(70) < at(80) && at(80) < at(90));
    const leaf = hopStand.compute({ hops: [{ form: 'leaf' }] }).values.ibu;
    near(hopStand.compute({ hops: [{ form: 'pellet' }] }).values.ibu / leaf, 1.1, 1e-9);
  });

  test('zero time and invalid input', () => {
    assert.equal(hopStand.compute({ minutes: 0 }).values.ibu, 0);
    invalid(hopStand.compute({ temperature: 30 }));
    invalid(hopStand.compute({ hops: [] }));
  });
});

describe('hop-utilization', () => {
  test('Tinseth 23.1 % and Rager 30.8 % at 60 min and 1.050', () => {
    const result = hopUtilization.compute({}).values;
    near(result.tinseth, 23.07, 0.01);
    near(result.rager, 30.82, 0.01);
    assert.equal(result.danielsLeaf, 24);
    assert.equal(result.danielsPellet, 30);
    assert.equal(result.garetz, 20);
  });

  test('high gravity lowers all methods', () => {
    const low = hopUtilization.compute({ gravity: 1.050 }).values;
    const high = hopUtilization.compute({ gravity: 1.090 }).values;
    for (const id of Object.keys(low)) assert.ok(high[id] < low[id], id);
  });

  test('zero minutes and invalid input', () => {
    const zero = hopUtilization.compute({ minutes: 0 }).values;
    assert.equal(zero.tinseth, 0);
    assert.equal(zero.garetz, 0);
    invalid(hopUtilization.compute({ minutes: -1 }));
    invalid(hopUtilization.compute({ gravity: 0.9 }));
  });
});

describe('bu-gu', () => {
  test('35 IBU at 1.050 → 0.70', () => {
    near(buGu.compute({ ibu: 35, scale: 'sg', og: 1.050 }).values.ratio, 0.7, 1e-9);
    near(buGu.compute({ ibu: 35, og: 12 }).values.points, (platoToSg(12) - 1) * 1000, 1e-9);
  });

  test('zero IBU', () => {
    assert.equal(buGu.compute({ ibu: 0 }).values.ratio, 0);
  });

  test('water gravity and invalid input', () => {
    invalid(buGu.compute({ og: 0 }));
    invalid(buGu.compute({ ibu: 500 }));
    invalid(buGu.compute({ scale: 'brix' }));
  });
});

describe('recipe-color', () => {
  test('Morey: 10 lb of 2 °L in 5 gal → MCU 4 → 3.86 SRM', () => {
    near(maltColorUnits([{ kg: 4.5359237, lovibond: 2 }], 18.92706), 4, 1e-6);
    near(moreySrm(4), 1.4922 * 4 ** 0.6859, 1e-12);
    const result = recipeColor.compute({ scale: 'lovibond', volume: 18.92706, malts: [{ kg: 4.5359237, color: 2 }] }).values;
    near(result.srm, 3.862, 0.002);
    near(result.ebc, result.srm * 1.97, 1e-9);
  });

  test('dark malt in EBC raises the colour', () => {
    const pale = recipeColor.compute({}).values.ebc;
    const dark = recipeColor.compute({ malts: [{ kg: 4.5, color: 4 }, { kg: 0.2, color: 1000 }] }).values.ebc;
    assert.ok(dark > pale * 4, `${dark} vs ${pale}`);
  });

  test('zero and invalid', () => {
    assert.equal(recipeColor.compute({ malts: [{ kg: 0 }] }).values.ebc, 0);
    invalid(recipeColor.compute({ volume: 0 }));
    invalid(recipeColor.compute({ malts: [{ color: -5 }] }));
  });
});

describe('pitch-rate', () => {
  test('20 l of 12 °P ale at 0.75 → 180 billion cells', () => {
    near(cellsNeeded(0.75, 20, 12), 180, 1e-12);
    const result = pitchRate.compute({}).values;
    near(result.cells, 180, 1e-9);
    near(result.dryGrams, 18, 1e-9);
    // 100 billion at 30 days → 79 % viable
    near(result.packs, 180 / 79, 1e-9);
  });

  test('lager rate and custom rate', () => {
    near(pitchRate.compute({ style: 'lager' }).values.cells, 360, 1e-9);
    near(pitchRate.compute({ style: 'custom', rate: 2 }).values.cells, 480, 1e-9);
    near(pitchRate.compute({ scale: 'sg', gravity: platoToSg(12) }).values.cells, 180, 1e-6);
  });

  test('dead yeast, zero gravity and invalid input', () => {
    const old = pitchRate.compute({ packAge: 200 });
    assert.equal(old.values.packs, null);
    assert.equal(old.warnings.length, 1);
    assert.equal(pitchRate.compute({ gravity: 0 }).values.cells, 0);
    invalid(pitchRate.compute({ style: 'wild' }));
    invalid(pitchRate.compute({ dryCells: 0 }));
  });
});

describe('yeast-starter', () => {
  test('Troester: 1.4 billion per gram below 1.4 billion cells per gram', () => {
    near(starterGrowth(100, 200), 280, 1e-12);
    near(starterGrowth(300, 100), (2.33 - 0.67 * 3) * 100, 1e-12);
    assert.equal(starterGrowth(400, 100), 0);
  });

  test('tool: 2 l of 10 °P with 100 billion cells', () => {
    const result = yeastStarter.compute({}).values;
    near(result.growth, 1.4 * result.dme * 0.95, 1e-9);
    near(result.total, 100 + result.growth, 1e-9);
    assert.ok(result.dme > 200 && result.dme < 230, `dme ${result.dme}`);
  });

  test('zero cells and invalid input', () => {
    const none = yeastStarter.compute({ cells: 0 }).values;
    assert.equal(none.factor, null);
    assert.equal(yeastStarter.compute({ cells: 1000, volume: 0.5 }).warnings.length, 1);
    invalid(yeastStarter.compute({ volume: 0 }));
    invalid(yeastStarter.compute({ plato: 30 }));
  });
});

describe('yeast-viability', () => {
  test('0.7 % per day, never below zero', () => {
    assert.equal(viability(0), 100);
    near(viability(30), 79, 1e-12);
    assert.equal(viability(365), 0);
  });

  test('viable cells and a warning for old yeast', () => {
    near(yeastViability.compute({ days: 10, cells: 200 }).values.viableCells, 186, 1e-9);
    assert.equal(yeastViability.compute({ days: 100 }).warnings.length, 1);
  });

  test('invalid input', () => {
    invalid(yeastViability.compute({ days: -1 }));
    invalid(yeastViability.compute({ cells: 'many' }));
  });
});

describe('attenuation', () => {
  test('12 °P → 3 °P: RDF 61.4 %, real extract 4.63, ABW by Balling 3.80 %', () => {
    near(ballingAbw(12, 4.6272), 7.3728 / (2.0665 - 0.12798), 1e-9);
    const result = attenuation.compute({ og: 12, fg: 3 }).values;
    near(result.apparentAttenuation, 75, 1e-9);
    near(result.realAttenuation, 61.44, 0.01);
    near(result.realExtract, 4.6272, 1e-9);
    near(result.abw, 3.803, 0.001);
    near(result.abv, 4.85, 0.01);
  });

  test('calories add up and scale with the serving', () => {
    const result = attenuation.compute({}).values;
    near(result.kcal, result.kcalAlcohol + result.kcalCarbohydrates, 1e-9);
    near(result.kj, result.kcal * 4.184, 1e-9);
    near(attenuation.compute({ serving: 250 }).values.kcal, result.kcal / 2, 1e-9);
    assert.ok(result.kcal > 200 && result.kcal < 240);
  });

  test('zero fermentation, zero serving and invalid input', () => {
    const none = attenuation.compute({ og: 12, fg: 12 }).values;
    assert.equal(none.abw, 0);
    assert.equal(none.kcalAlcohol, 0);
    assert.equal(attenuation.compute({ serving: 0 }).values.kcal, 0);
    invalid(attenuation.compute({ og: 0 }));
    invalid(attenuation.compute({ og: 10, fg: 12 }));
    invalid(attenuation.compute({ scale: 'sg', og: 12 }));
  });
});
