import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, convert, getTool } from '../calc_tools/static/calc_tools/index.js';
import { pasteurizationUnits } from '../calc_tools/static/calc_tools/tools/food/pasteurization.js';
import { mifflinStJeor } from '../calc_tools/static/calc_tools/tools/food/basal-metabolism.js';
import { widmarkFactor } from '../calc_tools/static/calc_tools/tools/food/blood-alcohol.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

describe('alcohol-units – definitions, servings and energy', () => {
  test('two pints of 5 % beer are 39.5 g: 3.9 WHO drinks, 4.9 UK units, 2.8 US drinks', () => {
    const who = run('alcohol-units', { servings: 2 }).values;
    near(who.grams, 39.46, 0.01);
    near(who.drinks, 3.946, 0.001);
    near(run('alcohol-units', { servings: 2, standard: 'uk' }).values.drinks, 39.462 / 8, 0.001);
    near(run('alcohol-units', { servings: 2, standard: 'us' }).values.drinks, 39.462 / 14, 0.001);
  });

  test('energy of alcohol: 29 kJ/g ≈ 6.93 kcal/g', () => {
    near(run('alcohol-units').values.kcal, 19.731 * 29 / 4.184, 0.01);
  });

  test('defaults match the earlier behaviour; invalid standard', () => {
    near(run('alcohol-units').values.drinks, 1.973, 0.001);
    assert.equal(run('alcohol-units', { servings: 0 }).values.grams, 0);
    invalid(run('alcohol-units', { standard: 'pub' }));
  });
});

describe('bakers-percentage', () => {
  test('500 g flour, 350 g water, 10 g salt → 100 : 70 : 2', () => {
    const result = run('bakers-percentage').values;
    assert.deepEqual(result.percent, [100, 70, 2]);
    assert.equal(result.hydration, 70);
    assert.equal(result.dough, 860);
  });

  test('two flours and scaling to a dough weight', () => {
    const result = run('bakers-percentage', {
      ingredients: [{ grams: 400, kind: 'flour' }, { grams: 100, kind: 'flour' }, { grams: 375, kind: 'water' }, { grams: 10, kind: 'other' }],
      target: 1770,
    }).values;
    assert.deepEqual(result.percent, [80, 20, 75, 2]);
    assert.deepEqual(result.scaled, [800, 200, 750, 20]);
  });

  test('no flour and invalid input', () => {
    invalid(run('bakers-percentage', { ingredients: [{ kind: 'water' }] }));
    invalid(run('bakers-percentage', { ingredients: [{ name: '<script>', grams: 1 }] }));
    invalid(run('bakers-percentage', { ingredients: [] }));
  });
});

describe('dough-hydration', () => {
  test('450 g flour, 280 g water and 100 g of 100 % starter: 66 %', () => {
    const result = run('dough-hydration').values;
    near(result.hydration, 66, 1e-12);
    near(result.addWater, 500 * 0.72 - 330, 1e-12);
  });

  test('water in milk, eggs and butter counts', () => {
    const result = run('dough-hydration', { water: 0, milk: 300, eggs: 100, butter: 50, starter: 0, flour: 500 }).values;
    near(result.totalWater, 300 * 0.87 + 75 + 8, 1e-9);
  });

  test('no flour and invalid input', () => {
    invalid(run('dough-hydration', { flour: 0, starter: 0 }));
    invalid(run('dough-hydration', { water: -1 }));
  });
});

describe('sourdough', () => {
  test('200 g at 1 : 5 : 5 → 18 g starter, 91 g flour, 91 g water', () => {
    const result = run('sourdough').values;
    near(result.starter + result.flour + result.water, 200, 1e-9);
    near(result.flour / result.starter, 5, 1e-12);
    near(result.hydration, 100, 1e-12);
  });

  test('stiff levain 1 : 2 : 1 from a 100 % starter', () => {
    const result = run('sourdough', { amount: 100, starterParts: 1, flourParts: 2, waterParts: 1 }).values;
    near(result.hydration, (25 + 12.5) / (50 + 12.5) * 100, 1e-9);
  });

  test('no flour and invalid input', () => {
    const none = run('sourdough', { flourParts: 0 });
    assert.equal(none.values.inoculation, null);
    assert.equal(none.warnings.length, 1);
    invalid(run('sourdough', { starterParts: 0 }));
  });
});

describe('kitchen-measures', () => {
  test('a US cup of flour ≈ 125 g, of sugar ≈ 200 g', () => {
    near(convert(getTool('kitchen-measures'), 1, 'cup', { ingredient: 'flour' }).values.g, 125.4, 0.1);
    near(convert(getTool('kitchen-measures'), 1, 'cup', { ingredient: 'sugar' }).values.g, 201.1, 0.1);
  });

  test('spoons and custom density', () => {
    const cup = convert(getTool('kitchen-measures'), 1, 'cup', { ingredient: 'water' }).values;
    near(cup.tbsp, 16, 1e-9);
    near(cup.tsp, 48, 1e-9);
    near(convert(getTool('kitchen-measures'), 100, 'g', { ingredient: 'custom', density: 0.5 }).values.ml, 200, 1e-12);
  });

  test('zero and invalid input', () => {
    assert.equal(convert(getTool('kitchen-measures'), 0, 'cup').values.g, 0);
    invalid(convert(getTool('kitchen-measures'), 1, 'cup', { ingredient: 'sand' }));
    invalid(convert(getTool('kitchen-measures'), -1, 'g'));
  });
});

describe('recipe-scaling', () => {
  test('from 4 to 6 servings: 1.5×', () => {
    const result = run('recipe-scaling').values;
    assert.equal(result.factor, 1.5);
    assert.deepEqual(result.amounts, [300, 4.5, 0.75]);
  });

  test('round pan 20 → 26 cm: 1.69×; rectangular pan', () => {
    near(run('recipe-scaling', { mode: 'round', from: 20, to: 26 }).values.factor, 1.69, 1e-12);
    near(run('recipe-scaling', { mode: 'rectangle', from: 30, fromWidth: 20, to: 40, toWidth: 25 }).values.factor, 1000 / 600, 1e-12);
  });

  test('invalid input', () => {
    invalid(run('recipe-scaling', { from: 0 }));
    invalid(run('recipe-scaling', { mode: 'triangle' }));
  });
});

describe('salting', () => {
  test('dry 2 % on 1 kg: 20 g; equilibrium on food and water', () => {
    assert.equal(run('salting').values.salt, 20);
    assert.equal(run('salting', { method: 'equilibrium', water: 1000 }).values.salt, 40);
  });

  test('nitrite curing salt replaces salt; Prague Powder #1 for 120 mg/kg', () => {
    const eu = run('salting', { curing: 'eu' }).values;
    assert.equal(eu.salt, 0);
    assert.equal(eu.curingSalt, 20);
    near(eu.nitritePpm, 120, 1e-9);
    near(run('salting', { curing: 'prague1' }).values.curingSalt, 1000 * 120e-6 / 0.0625, 1e-12);
  });

  test('too much nitrite warns; invalid input', () => {
    assert.equal(run('salting', { curing: 'prague1', nitrite: 200 }).warnings.length, 1);
    invalid(run('salting', { percent: 50 }));
    invalid(run('salting', { curing: 'saltpetre' }));
  });
});

describe('fermentation-brine', () => {
  test('3 % brine from 1 l of water: 30.9 g of salt', () => {
    near(run('fermentation-brine').values.salt, 1000 * 0.03 / 0.97, 1e-9);
  });

  test('equilibrium and dry salting', () => {
    near(run('fermentation-brine', { method: 'equilibrium' }).values.salt, 60, 1e-9);
    near(run('fermentation-brine', { method: 'dry', vegetables: 5000, percent: 2 }).values.salt, 100, 1e-9);
  });

  test('low salt warns; invalid input', () => {
    assert.equal(run('fermentation-brine', { percent: 1 }).warnings.length, 1);
    invalid(run('fermentation-brine', { percent: 0 }));
  });
});

describe('pasteurization', () => {
  test('1 min at 60 °C is 1 PU; 6.94 °C more is ten times', () => {
    assert.equal(pasteurizationUnits(60, 1), 1);
    near(pasteurizationUnits(66.94, 1), 10, 1e-9);
  });

  test('10 min at 62 °C ≈ 19.4 PU; time for 20 PU at 65 °C', () => {
    near(run('pasteurization').values.pu, 10 * 10 ** (2 / 6.94), 1e-9);
    const time = run('pasteurization', { find: 'time', temperature: 65, target: 20 }).values.minutes;
    near(pasteurizationUnits(65, time), 20, 1e-9);
  });

  test('zero time and invalid input', () => {
    assert.equal(run('pasteurization', { minutes: 0 }).values.pu, 0);
    invalid(run('pasteurization', { temperature: 120 }));
    invalid(run('pasteurization', { find: 'sterilise' }));
  });
});

describe('bmi', () => {
  test('75 kg, 178 cm: 23.7, normal weight', () => {
    const result = run('bmi').values;
    near(result.bmi, 75 / 1.78 ** 2, 1e-12);
    assert.equal(result.category.cs, 'normální hmotnost');
    assert.equal(result.healthyRange.en, '58.6–79.2 kg');
  });

  test('category boundaries', () => {
    assert.equal(run('bmi', { weight: 100, height: 200 }).values.category.en, 'overweight');
    assert.equal(run('bmi', { weight: 50, height: 180 }).values.category.en, 'underweight');
    assert.equal(run('bmi', { weight: 160, height: 180 }).values.category.en, 'obesity class III');
  });

  test('invalid input', () => {
    invalid(run('bmi', { height: 0 }));
    invalid(run('bmi', { weight: 'heavy' }));
  });
});

describe('basal-metabolism', () => {
  test('Mifflin–St Jeor: man 75 kg, 178 cm, 35 years → 1692.5 kcal', () => {
    near(mifflinStJeor('male', 75, 178, 35), 1692.5, 1e-9);
    near(run('basal-metabolism').values.total, 1692.5 * 1.375, 1e-9);
  });

  test('women have 166 kcal less at the same size', () => {
    near(run('basal-metabolism').values.bmr - run('basal-metabolism', { sex: 'female' }).values.bmr, 166, 1e-9);
    near(run('basal-metabolism').values.bmrKj, 1692.5 * 4.184, 1e-9);
  });

  test('invalid input', () => {
    invalid(run('basal-metabolism', { age: 10 }));
    invalid(run('basal-metabolism', { activity: 'couch' }));
  });
});

describe('food-energy', () => {
  test('10 g protein, 5 g fat, 30 g carbohydrate, 3 g fibre: 889 kJ', () => {
    const result = run('food-energy').values;
    assert.equal(result.kj, 170 + 185 + 510 + 24);
    near(result.kcal, 889 / 4.184, 1e-9);
  });

  test('100 g of pure fat is 3700 kJ, 884 kcal', () => {
    const fat = run('food-energy', { protein: 0, fat: 100, carbohydrate: 0, fibre: 0 }).values;
    assert.equal(fat.kj, 3700);
    assert.equal(fat.fatShare, 100);
  });

  test('zero and invalid input', () => {
    assert.equal(run('food-energy', { protein: 0, fat: 0, carbohydrate: 0, fibre: 0 }).values.proteinShare, 0);
    invalid(run('food-energy', { fat: -1 }));
  });
});

describe('blood-alcohol', () => {
  test('Widmark factor by Seidl for a man of 80 kg and 180 cm ≈ 0.76', () => {
    near(widmarkFactor('male', 80, 180), 0.31608 - 0.004821 * 80 + 0.004632 * 180, 1e-12);
    assert.ok(widmarkFactor('female', 80, 180) < widmarkFactor('male', 80, 180));
  });

  test('half a litre of 5 % beer: peak about 0.29 ‰, gone in about 2 hours', () => {
    const result = run('blood-alcohol', { hours: 0 });
    near(result.values.peak, 19.731 * 0.9 / (80 * widmarkFactor('male', 80, 180)), 1e-9);
    near(result.values.soberIn, result.values.peak / 0.15, 1e-9);
    assert.match(result.warnings[0].cs, /nulová tolerance/);
  });

  test('more drinks, sobered up and invalid input', () => {
    const two = run('blood-alcohol', { drinks: [{}, {}], hours: 0 }).values;
    near(two.peak, run('blood-alcohol', { hours: 0 }).values.peak * 2, 1e-12);
    assert.equal(run('blood-alcohol', { hours: 10 }).values.now, 0);
    invalid(run('blood-alcohol', { weight: 10 }));
    invalid(run('blood-alcohol', { drinks: [{ abv: 120 }] }));
  });
});
