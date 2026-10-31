import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { convert } from '../calc_tools/static/calc_tools/index.js';
import {
  abvFromMassFraction, correctAlcoholmeter, massFractionFromAbv, mixtureDensity,
} from '../calc_tools/static/calc_tools/core/ethanol.js';
import { extractKg, platoToSg, wortDensity } from '../calc_tools/static/calc_tools/core/units.js';
import mustGravity, { kmwToOechsle, nmToSg, oechsleToKmw, sgToNm } from '../calc_tools/static/calc_tools/tools/wine/must-gravity.js';
import potentialAlcohol, { chaptalisationGrams } from '../calc_tools/static/calc_tools/tools/wine/potential-alcohol.js';
import sulfite, { freeSo2ForMolecular } from '../calc_tools/static/calc_tools/tools/wine/sulfite.js';
import spiritDilution from '../calc_tools/static/calc_tools/tools/wine/spirit-dilution.js';
import alcoholmeter from '../calc_tools/static/calc_tools/tools/wine/alcoholmeter.js';
import meadSugar from '../calc_tools/static/calc_tools/tools/mead/mead-sugar.js';
import tosna, { tosnaFermaidO } from '../calc_tools/static/calc_tools/tools/mead/tosna.js';
import { invalid, near } from './helpers.js';

describe('ethanol density (OIML)', () => {
  test('water, ethanol and a 50 % mixture at 20 °C', () => {
    near(mixtureDensity(0, 20), 998.20, 0.01);
    near(mixtureDensity(1, 20), 789.24, 0.01);
    // CRC Handbook: 50 % w/w ethanol 0.91384 g/ml at 20 °C
    near(mixtureDensity(0.5, 20), 913.8, 0.1);
    near(mixtureDensity(0, 4), 999.97, 0.01);
  });

  test('40 % vol is 33.3 % w/w; % vol and mass fraction invert', () => {
    near(massFractionFromAbv(40), 0.3330, 0.0005);
    for (const abv of [0, 5, 40, 96, 100]) near(abvFromMassFraction(massFractionFromAbv(abv)), abv, 1e-8);
    assert.equal(massFractionFromAbv(101), null);
  });
});

describe('alcoholmeter', () => {
  test('International tables: 40 % read at 25 °C is 38.0 %, at 15 °C 42.0 %', () => {
    near(correctAlcoholmeter(40, 25), 38.0, 0.15);
    near(correctAlcoholmeter(40, 15), 42.0, 0.15);
    const result = alcoholmeter.compute({}).values;
    near(result.difference, result.abv - 40, 1e-12);
  });

  test('zero correction at 20 °C', () => {
    near(alcoholmeter.compute({ reading: 55, temperature: 20 }).values.abv, 55, 1e-8);
  });

  test('impossible readings and out of range', () => {
    invalid(alcoholmeter.compute({ reading: 0, temperature: 30 }));
    invalid(alcoholmeter.compute({ temperature: 50 }));
    invalid(alcoholmeter.compute({ reading: 120 }));
  });
});

describe('spirit-dilution', () => {
  test('ethanol volume is kept, water exceeds the simple ratio by the contraction', () => {
    const result = spiritDilution.compute({ volume: 1, abv: 70, target: 45 }).values;
    // % vol at 20 °C: the volume of ethanol is conserved
    near(result.finalVolume * 45, 70, 1e-6);
    near(result.simpleWater, 70 / 45 - 1, 1e-12);
    assert.ok(result.water > result.simpleWater && result.water < result.simpleWater * 1.1);
  });

  test('96 % to 40 %', () => {
    const result = spiritDilution.compute({ volume: '1,0', abv: 96, target: 40 }).values;
    near(result.finalVolume, 2.4, 1e-6);
    assert.ok(result.water > 1.4 && result.water < 1.5, `water ${result.water}`);
  });

  test('zero change and invalid input', () => {
    near(spiritDilution.compute({ abv: 45, target: 45 }).values.water, 0, 1e-9);
    invalid(spiritDilution.compute({ abv: 40, target: 45 }));
    invalid(spiritDilution.compute({ target: 0 }));
  });
});

describe('must-gravity', () => {
  test('Oechsle and KMW (Babo)', () => {
    near(convert(mustGravity, 1.085, 'sg').values.oechsle, 85, 1e-9);
    // Oe = KMW × (4.54 + 0.022 × KMW): 20 °KMW = 99.6 °Oe
    near(kmwToOechsle(20), 99.6, 1e-9);
    near(oechsleToKmw(99.6), 20, 1e-9);
    near(convert(mustGravity, 20, 'brix').values.sg, platoToSg(20), 1e-12);
  });

  test('°NM is kg of sugar per 100 l: KMW × density', () => {
    const sg = 1.090;
    near(sgToNm(sg), oechsleToKmw(90) * sg, 1e-9);
    near(nmToSg(sgToNm(sg)), sg, 1e-9);
    const result = convert(mustGravity, 20, 'nm').values;
    assert.ok(result.oechsle > 85 && result.oechsle < 95, `Oe ${result.oechsle}`);
  });

  test('zero and out of range', () => {
    const water = convert(mustGravity, 0, 'oechsle').values;
    near(water.nm, 0, 1e-9);
    near(water.kmw, 0, 1e-9);
    invalid(convert(mustGravity, 50, 'nm'));
    invalid(convert(mustGravity, 0.99, 'sg'));
    invalid(convert(mustGravity, 10, '__proto__'));
  });
});

describe('potential-alcohol', () => {
  test('16.83 g/l of sugar per 1 % vol', () => {
    const result = potentialAlcohol.compute({ scale: 'nm', gravity: 16.83 }).values;
    near(result.sugar, 168.3, 1e-6);
    near(result.alcohol, 10, 1e-6);
  });

  test('chaptalisation includes the volume of the sugar', () => {
    const result = potentialAlcohol.compute({ scale: 'nm', gravity: 16.83, volume: 100, target: 12 });
    const kg = result.values.chaptalisation;
    near(kg * 1000, chaptalisationGrams(100, 168.3, 12 * 16.83), 1e-6);
    // Sugar per litre after adding: (old sugar + invert sugar) / (volume + sugar volume)
    const sugar = (168.3 * 100 + kg * 1000 * 2 * 180.16 / 342.30) / (100 + kg * 0.625);
    near(sugar, 12 * 16.83, 1e-6);
  });

  test('zero, target already reached and invalid input', () => {
    assert.equal(potentialAlcohol.compute({ scale: 'oechsle', gravity: 0 }).values.alcohol, 0);
    const done = potentialAlcohol.compute({ target: 5 });
    assert.equal(done.values.chaptalisation, 0);
    assert.equal(done.warnings.length, 1);
    invalid(potentialAlcohol.compute({ scale: 'oechsle', gravity: 300 }));
    invalid(potentialAlcohol.compute({ scale: 'baume' }));
  });
});

describe('sulfite', () => {
  test('0.8 mg/l molecular at pH 3.4 needs about 32 mg/l free SO₂', () => {
    near(freeSo2ForMolecular(0.8, 3.4), 31.92, 0.01);
    const result = sulfite.compute({}).values;
    // Potassium metabisulfite is 57.6 % SO₂
    near(result.grams, 31.92 * 20 / 1000 / 0.5764, 0.002);
    near(result.campden, result.grams / 0.44, 1e-9);
  });

  test('sodium salt is stronger; existing SO₂ is subtracted', () => {
    assert.ok(sulfite.compute({ source: 'sodium' }).values.grams < sulfite.compute({}).values.grams);
    near(sulfite.compute({ current: 20 }).values.addition, 31.92 - 20, 0.01);
  });

  test('zero addition, high pH and invalid input', () => {
    assert.equal(sulfite.compute({ current: 100 }).values.grams, 0);
    assert.equal(sulfite.compute({ ph: 4.0 }).warnings.length, 1);
    invalid(sulfite.compute({ ph: 5 }));
    invalid(sulfite.compute({ source: 'sulfur' }));
  });
});

describe('mead-sugar', () => {
  test('honey and water give the target gravity and volume', () => {
    const result = meadSugar.compute({ volume: 20, scale: 'sg', target: 1.100, base: 1.000 }).values;
    const mass = 20 * wortDensity(result.plato);
    near(result.kg * 0.80 / mass * 100, result.plato, 1e-9);
    near(result.kg + result.liquid * wortDensity(0), mass, 1e-9);
    assert.ok(result.kg > 6 && result.kg < 7, `honey ${result.kg}`);
  });

  test('apple juice needs less sugar', () => {
    const cider = meadSugar.compute({ target: 1.060, base: 1.045, sweetener: 'sucrose' }).values;
    const water = meadSugar.compute({ target: 1.060, base: 1.000, sweetener: 'sucrose' }).values;
    assert.ok(cider.kg < water.kg / 3);
    near(extractKg(cider.plato, 20), cider.kg + cider.liquid * wortDensity(platoToSgInverse(1.045)) * platoToSgInverse(1.045) / 100, 1e-9);
  });

  test('zero sugar, lower target and invalid input', () => {
    near(meadSugar.compute({ target: 1.045, base: 1.045 }).values.kg, 0, 1e-9);
    invalid(meadSugar.compute({ target: 1.040, base: 1.050 }));
    invalid(meadSugar.compute({ sweetener: 'maple' }));
    invalid(meadSugar.compute({ target: 1.3 }));
  });
});

describe('tosna', () => {
  test('°Bx × 10 × factor / 50 g per gallon', () => {
    near(tosnaFermaidO(25, 0.9, 3.785411784), 4.5, 1e-9);
    const result = tosna.compute({ volume: 3.785411784, scale: 'plato', og: 25 }).values;
    near(result.total, 4.5, 1e-9);
    near(result.perAddition, 4.5 / 4, 1e-9);
    near(result.yan, 225, 1e-9);
  });

  test('Go-Ferm and rehydration water', () => {
    const result = tosna.compute({ yeast: 8 }).values;
    near(result.goFerm, 10, 1e-12);
    near(result.water, 200, 1e-12);
    assert.ok(tosna.compute({ requirement: 'high' }).values.total > tosna.compute({ requirement: 'low' }).values.total);
  });

  test('zero sugar and invalid input', () => {
    assert.equal(tosna.compute({ scale: 'plato', og: 0 }).values.total, 0);
    invalid(tosna.compute({ requirement: 'extreme' }));
    invalid(tosna.compute({ yeast: -1 }));
  });
});

/** °P of a gravity, via the exact inverse used by the tools. */
function platoToSgInverse(/** @type {number} */ sg) {
  let lo = 0;
  let hi = 44;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (platoToSg(mid) < sg) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
