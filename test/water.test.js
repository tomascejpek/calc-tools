import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { acidCharge, acidToTargetPh, carbonateAlkalinity, residualAlkalinity, SALTS } from '../calc_tools/static/calc_tools/core/water.js';
import residualAlkalinityTool from '../calc_tools/static/calc_tools/tools/beer/residual-alkalinity.js';
import sulfateChloride from '../calc_tools/static/calc_tools/tools/beer/sulfate-chloride.js';
import waterSalts, { addSalts } from '../calc_tools/static/calc_tools/tools/beer/water-salts.js';
import mashPh, { estimateMashPh } from '../calc_tools/static/calc_tools/tools/beer/mash-ph.js';
import waterAcidification, { acidMeqPerMl } from '../calc_tools/static/calc_tools/tools/beer/water-acidification.js';
import beerLine, { LINE_RESISTANCE, balancedLength } from '../calc_tools/static/calc_tools/tools/beer/beer-line.js';
import { kegPressurePsi } from '../calc_tools/static/calc_tools/tools/beer/keg-carbonation.js';
import { invalid, near } from './helpers.js';

const GAL = 3.785411784;

describe('residual-alkalinity', () => {
  test('Kolbach: Ca/1.4 and Mg/1.7 offset alkalinity as CaCO₃', () => {
    near(residualAlkalinity(100, 140, 0), 0, 1e-12);
    near(residualAlkalinity(100, 0, 170), 0, 1e-12);
    // 1 mEq/l = 50.04 mg/l CaCO₃ = 61.02 mg/l HCO₃⁻ = 2.8 °dH
    const result = residualAlkalinityTool.compute({ calcium: 0, magnesium: 0, alkalinity: 61.017, alkalinityUnit: 'hco3' }).values;
    near(result.ra, 50.04, 1e-9);
    near(result.raMeq, 1, 1e-9);
    near(result.raDh, 2.804, 0.001);
  });

  test('all alkalinity units agree', () => {
    const units = { caco3: 50.04, hco3: 61.017, mmol: 1, dh: 50.04 / 17.848 };
    for (const [unit, value] of Object.entries(units)) {
      near(residualAlkalinityTool.compute({ alkalinity: value, alkalinityUnit: unit }).values.alkalinity, 50.04, 1e-9, unit);
    }
  });

  test('soft water gives negative RA; invalid input', () => {
    assert.ok(residualAlkalinityTool.compute({ alkalinity: 0, calcium: 50 }).values.ra < 0);
    invalid(residualAlkalinityTool.compute({ alkalinityUnit: 'ppm' }));
    invalid(residualAlkalinityTool.compute({ calcium: -1 }));
    invalid(residualAlkalinityTool.compute({ magnesium: '10 mg' }));
  });
});

describe('sulfate-chloride', () => {
  test('ratio', () => {
    near(sulfateChloride.compute({ sulfate: 300, chloride: 100 }).values.ratio, 3, 1e-12);
    assert.equal(sulfateChloride.compute({ sulfate: 0 }).values.ratio, 0);
  });

  test('decimal comma and balanced water', () => {
    near(sulfateChloride.compute({ sulfate: '75,5', chloride: '75,5' }).values.ratio, 1, 1e-12);
    near(sulfateChloride.compute({ sulfate: 2000, chloride: 1 }).values.ratio, 2000, 1e-9);
  });

  test('zero chloride and invalid input', () => {
    invalid(sulfateChloride.compute({ chloride: 0 }));
    invalid(sulfateChloride.compute({ sulfate: 5000 }));
  });
});

describe('water-salts', () => {
  test('1 g per US gallon matches Palmer\'s table', () => {
    // Palmer: gypsum 61.5 Ca + 147.4 SO₄, CaCl₂·2H₂O 72 Ca + 127 Cl, Epsom 26 Mg + 103 SO₄ (ppm per g/gal)
    const one = (/** @type {string} */ salt) => addSalts({}, { [salt]: 1 }, GAL);
    near(one('gypsum').calcium, 61.5, 0.5);
    near(one('gypsum').sulfate, 147.4, 0.5);
    near(one('calciumChloride').calcium, 72, 0.5);
    near(one('calciumChloride').chloride, 127.4, 0.5);
    near(one('epsom').magnesium, 26, 0.5);
    near(one('epsom').sulfate, 103, 0.5);
  });

  test('tool adds to the base water and reports ratio and RA', () => {
    const result = waterSalts.compute({ volume: 20, gypsum: 4, calciumChloride: 2 }).values;
    near(result.calcium, 20 + (SALTS.gypsum.ions.calcium * 4 + SALTS.calciumChloride.ions.calcium * 2) / 20, 1e-9);
    near(result.ratio, result.sulfate / result.chloride, 1e-12);
    assert.ok(result.ra < waterSalts.compute({ volume: 20 }).values.ra);
    assert.equal(waterSalts.compute({ volume: 1, salt: 1 }).warnings.length, 1, 'salty');
  });

  test('zero additions keep the water; invalid and unexpected input', () => {
    const plain = waterSalts.compute({}).values;
    assert.equal(plain.calcium, 20);
    assert.equal(plain.bicarbonate, 60);
    // Unknown fields are ignored, not added
    assert.deepEqual(waterSalts.compute({ chalk: 100, __proto__: { gypsum: 9 } }).values, plain);
    assert.deepEqual(addSalts({}, { constructor: 5, toString: 1 }, 1), {});
    invalid(waterSalts.compute({ gypsum: -1 }));
    invalid(waterSalts.compute({ volume: 0 }));
  });
});

describe('mash-ph', () => {
  test('0.03 pH per °dH of RA', () => {
    near(estimateMashPh(5.7, 17.848), 5.73, 1e-12);
    const result = mashPh.compute({ grist: 'custom', distilledPh: 5.6, alkalinity: 0, calcium: 0, magnesium: 0 }).values;
    near(result.ph, 5.6, 1e-12);
  });

  test('darker grists lower the pH; out-of-range pH warns', () => {
    const pale = mashPh.compute({ grist: 'pale' }).values.ph;
    assert.ok(mashPh.compute({ grist: 'dark' }).values.ph < pale);
    assert.equal(mashPh.compute({ alkalinity: 300 }).warnings.length, 1);
    assert.equal(mashPh.compute({ grist: 'dark', alkalinity: 0, calcium: 200 }).warnings.length, 1);
  });

  test('invalid input', () => {
    invalid(mashPh.compute({ grist: 'black' }));
    invalid(mashPh.compute({ distilledPh: 8 }));
  });
});

describe('water-acidification', () => {
  test('carbonate alkalinity: almost all of it is neutralised at pH 4.3', () => {
    near(carbonateAlkalinity(2, 8.3), 2, 0.05);
    // At pH 4.3 the acid also supplies the free H⁺ (+0.05 mEq/l), while about
    // 1 % of the carbonate stays as HCO₃⁻ (−0.02 mEq/l)
    near(acidToTargetPh(2, 7.5, 4.3), 2.03, 0.01);
    // Above the water's own pH no acid is needed
    near(acidToTargetPh(2, 7.5, 7.5), 0, 1e-12);
  });

  test('strength of the acids', () => {
    // 88 % lactic acid fully dissociated: 1.21 × 0.88 / 90.08 × 1000 = 11.82 mEq/ml
    near(acidMeqPerMl('lactic88', 7), 11.82, 0.01);
    // Phosphoric acid gives about one proton at mash pH
    near(acidCharge([2.15, 7.20, 12.35], 5.5), 1.02, 0.01);
    const lactic = waterAcidification.compute({}).values;
    assert.ok(lactic.mlPerLitre > 0.15 && lactic.mlPerLitre < 0.3, `ml/l ${lactic.mlPerLitre}`);
    near(lactic.ml, lactic.mlPerLitre * 20, 1e-12);
    assert.ok(waterAcidification.compute({ acid: 'phosphoric10' }).values.ml > lactic.ml);
  });

  test('zero alkalinity, much lactic acid and invalid input', () => {
    assert.ok(waterAcidification.compute({ alkalinity: 0 }).values.ml < 0.1);
    assert.equal(waterAcidification.compute({ alkalinity: 800, alkalinityUnit: 'caco3' }).warnings.length, 1);
    invalid(waterAcidification.compute({ target: 7.5, ph: 7.5 }));
    invalid(waterAcidification.compute({ acid: 'sulfuric' }));
    invalid(waterAcidification.compute({ ph: 14 }));
  });
});

describe('beer-line', () => {
  test('3/16" vinyl is 3 psi per foot = 0.679 bar/m', () => {
    near(LINE_RESISTANCE['vinyl-3/16'], 0.6786, 0.0005);
    near(balancedLength(1, 0, 0.5, 0), 2, 1e-12);
  });

  test('pressure from carbonation, rise and tap pressure', () => {
    const result = beerLine.compute({ rise: 0, tapPressure: 0 }).values;
    near(result.pressure, kegPressurePsi(2.5, 4) / 14.503773773, 1e-9);
    near(result.length, result.pressure / result.resistance, 1e-9);
    assert.ok(beerLine.compute({ rise: 2 }).values.length < beerLine.compute({ rise: 0 }).values.length);
    near(beerLine.compute({ line: 'custom', resistance: 0.2 }).values.resistance, 0.2, 1e-12);
  });

  test('zero length and invalid input', () => {
    invalid(beerLine.compute({ rise: 10 }));
    invalid(beerLine.compute({ line: 'garden-hose' }));
    invalid(beerLine.compute({ resistance: 0 }));
  });
});
