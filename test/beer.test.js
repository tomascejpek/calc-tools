import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate } from '../calc_tools/static/calc_tools/index.js';
import abv, { abvAlternative, abvStandard, realExtract } from '../calc_tools/static/calc_tools/tools/beer/abv.js';
import degreeToAbv, { estimateAbv } from '../calc_tools/static/calc_tools/tools/beer/degree-to-abv.js';
import alcoholUnits from '../calc_tools/static/calc_tools/tools/beer/alcohol-units.js';
import ibu, { tinsethIbu, tinsethUtilization } from '../calc_tools/static/calc_tools/tools/beer/ibu.js';
import primingSugar, { residualCo2 } from '../calc_tools/static/calc_tools/tools/beer/priming-sugar.js';
import kegCarbonation, { kegPressurePsi, kegVolumes } from '../calc_tools/static/calc_tools/tools/beer/keg-carbonation.js';
import { invalid, near } from './helpers.js';

test('abv: standard formula, OG 1.050 / FG 1.010 → 5.25 %', () => {
  near(abvStandard(1.050, 1.010), 5.25, 1e-9);
  const result = abv.compute({ og: 1.050, fg: 1.010 });
  near(result.values.abv, 5.25, 1e-9);
  near(result.values.apparentAttenuation, 79.3, 0.5);
  assert.deepEqual(result.warnings, []);
});

test('abv: alternative formula (Hall 1995) and strong beers', () => {
  // 76.08 × 0.04 / 0.725 × 1.010 / 0.794
  near(abvAlternative(1.050, 1.010), 5.3394, 1e-4);
  const strong = abv.compute({ og: '1,090', fg: '1,020' });
  assert.ok(strong.warnings.length === 1, 'standard formula warns above OG 1.070');
  const alternative = abv.compute({ og: 1.090, fg: 1.020, method: 'alternative' });
  assert.ok(alternative.values.abv > strong.values.abv);
});

test('abv: real extract by Balling and inputs in °P', () => {
  // RE = 0.1808 × 12 + 0.8192 × 3
  near(realExtract(12, 3), 4.6272, 1e-9);
  const result = abv.compute({ scale: 'plato', og: 12, fg: 3 });
  near(result.values.realExtract, 4.6272, 1e-9);
  near(result.values.apparentAttenuation, 75, 1e-9);
  near(result.values.realAttenuation, 61.4, 0.1);
  near(result.values.abv, 4.81, 0.01);
  // Hall's ASBC calorie formula: a 5 % beer has roughly 200–240 kcal in 0.5 l
  const kcal = abv.compute({ og: 1.050, fg: 1.010 }).values.kcal;
  assert.ok(kcal > 200 && kcal < 240, `kcal ${kcal}`);
});

test('abv: invalid inputs give null and warnings', () => {
  invalid(abv.compute({ og: 1.010, fg: 1.050 }));
  invalid(abv.compute({ og: 'x' }));
  invalid(abv.compute({ og: 1.5 }));
  invalid(abv.compute({ scale: 'plato', og: 50, fg: 10 }));
  invalid(abv.compute({ method: 'other' }));
});

test('degree-to-abv: a Czech ten has about 4 %', () => {
  near(estimateAbv(10, 75), 3.97, 0.03);
  const result = degreeToAbv.compute({});
  near(result.values.abv, 3.97, 0.03);
  assert.equal(result.values.attenuation, 75);
  near(degreeToAbv.compute({ plato: 12, preset: 'lager' }).values.abv, 4.81, 0.01);
  assert.equal(degreeToAbv.compute({ plato: 12, preset: 'draught', attenuation: 10 }).values.attenuation, 78);
  assert.equal(degreeToAbv.compute({ plato: 0 }).values.abv, 0);
  assert.equal(degreeToAbv.compute({ preset: 'low-alcohol' }).warnings.length, 1);
  invalid(degreeToAbv.compute({ plato: 41 }));
});

test('alcohol-units: grams of ethanol and 10 g standard drinks', () => {
  // 500 ml × 5 % × 0.78924 g/ml
  const half = alcoholUnits.compute({ volume: 500, abv: 5 }).values;
  near(half.grams, 19.73, 0.01);
  near(half.drinks, 1.973, 0.001);
  near(alcoholUnits.compute({ volume: 40, abv: 40 }).values.grams, 12.63, 0.01);
  assert.equal(alcoholUnits.compute({ volume: 0, abv: 5 }).values.grams, 0);
  invalid(alcoholUnits.compute({ volume: 500, abv: 120 }));
});

test('ibu: Tinseth utilisation table', () => {
  // Tinseth's table: 1.050 / 60 min = 0.231, 1.050 / 30 min = 0.177, 1.030 / 60 min = 0.276
  near(tinsethUtilization(1.050, 60), 0.231, 0.0005);
  near(tinsethUtilization(1.050, 30), 0.177, 0.0005);
  near(tinsethUtilization(1.030, 60), 0.276, 0.0005);
  assert.equal(tinsethUtilization(1.050, 0), 0);
});

test('ibu: several additions, pellets and BU:GU', () => {
  // 1 oz of 5 % hops for 60 min in 5 US gal at 1.050 ≈ 17.3 IBU
  near(tinsethIbu({ grams: 28.35, alpha: 5, minutes: 60, litres: 18.93, gravity: 1.050 }), 17.3, 0.1);
  const result = ibu.compute({
    volume: '18,93',
    og: 1.050,
    hops: [
      { grams: 28.35, alpha: 5, minutes: 60, form: 'leaf' },
      { grams: 28.35, alpha: 5, minutes: 60, form: 'pellet' },
    ],
  });
  assert.equal(result.values.additions.length, 2);
  near(result.values.additions[1] / result.values.additions[0], 1.1, 1e-9);
  near(result.values.ibu, result.values.additions[0] + result.values.additions[1], 1e-9);
  near(result.values.buGu, result.values.ibu / 50, 1e-9);
  // Defaults: 20 g of 4 % hops for 60 min in 20 l → 40 mg/l × 0.2307
  near(ibu.compute({}).values.ibu, 9.23, 0.01);
});

test('ibu: invalid hop additions', () => {
  invalid(ibu.compute({ hops: [] }));
  invalid(ibu.compute({ hops: [{ alpha: 40 }] }));
  invalid(ibu.compute({ volume: 0 }));
  invalid(ibu.compute({ hops: Array.from({ length: 11 }, () => ({})) }));
});

test('priming-sugar: residual CO₂ and sucrose dose', () => {
  // Residual CO₂ at 68 °F (20 °C) ≈ 0.86 volumes
  near(residualCo2(20), 0.86, 0.01);
  near(residualCo2(0), 1.70, 0.01);
  const result = primingSugar.compute({ volumes: 2.5, beer: 20, temperature: 20 });
  // (2.5 − 0.8617) × 1.977 / 0.5143 ≈ 6.3 g/l
  near(result.values.perLitre, 6.30, 0.02);
  near(result.values.total, 126, 0.5);
  const glucose = primingSugar.compute({ volumes: 2.5, beer: 20, temperature: 20, sugar: 'glucose' });
  near(glucose.values.perLitre / result.values.perLitre, 1.158, 0.001);
});

test('priming-sugar: edge cases', () => {
  const none = primingSugar.compute({ volumes: 1, temperature: 0 });
  assert.equal(none.values.total, 0);
  assert.equal(none.warnings.length, 1);
  assert.equal(primingSugar.compute({ volumes: 4 }).warnings.length, 1);
  invalid(primingSugar.compute({ temperature: 50 }));
  invalid(primingSugar.compute({ sugar: 'salt' }));
});

test('keg-carbonation: carbonation chart values', () => {
  // Carbonation chart: 38 °F, 2.5 volumes ≈ 11 psi; 40 °F, 2.6 volumes ≈ 13 psi
  near(kegPressurePsi(2.5, (38 - 32) * 5 / 9), 11.2, 0.3);
  near(kegPressurePsi(2.6, (40 - 32) * 5 / 9), 13.0, 0.5);
  const result = kegCarbonation.compute({ temperature: 4, volumes: 2.5 });
  near(result.values.pressurePsi, result.values.pressureBar * 14.5038, 1e-3);
  near(kegVolumes(result.values.pressurePsi, 4), 2.5, 1e-9);
});

test('keg-carbonation: carbonation from pressure', () => {
  const result = kegCarbonation.compute({ mode: 'volumes', temperature: 4, pressure: '0,8' });
  near(result.values.pressureBar, 0.8, 1e-12);
  near(kegPressurePsi(result.values.volumes, 4), 0.8 * 14.503773773, 1e-9);
  invalid(kegCarbonation.compute({ temperature: 2, volumes: 0.5 }));
  invalid(kegCarbonation.compute({ mode: 'volumes', pressure: -1 }));
});

test('calculate never throws', () => {
  const broken = { outputs: [{ id: 'x' }], compute() { throw new Error('boom'); } };
  invalid(calculate(broken, {}));
  near(calculate(abv, null).values.abv, 5.25, 1e-9);
});
