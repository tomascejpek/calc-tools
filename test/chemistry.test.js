import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, convert, getTool } from '../calc_tools/static/calc_tools/index.js';
import {
  ATOMIC_WEIGHTS, balance, formulaMass, hillKey, parseEquation, parseFormula,
} from '../calc_tools/static/calc_tools/core/chemistry.js';
import { acidHydrogen } from '../calc_tools/static/calc_tools/tools/chemistry/ph.js';
import { rateRatio } from '../calc_tools/static/calc_tools/tools/chemistry/arrhenius.js';
import { remaining } from '../calc_tools/static/calc_tools/tools/chemistry/half-life.js';
import { parseOverrides } from '../calc_tools/static/calc_tools/tools/chemistry/reaction-heat.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

/**
 * @param {string} text
 */
function balanced(text) {
  const parsed = /** @type {{ reactants: string[], products: string[] }} */ (parseEquation(text));
  return balance(parsed.reactants, parsed.products).coefficients?.map(Number) ?? null;
}

describe('core chemistry', () => {
  test('formulas with groups, brackets, hydrates and phases', () => {
    near(/** @type {number} */ (formulaMass('H2O')), 18.015, 1e-9);
    near(/** @type {number} */ (formulaMass('Ca(OH)2')), 40.078 + 2 * (15.999 + 1.008), 1e-9);
    near(/** @type {number} */ (formulaMass('CuSO4·5H2O')), 249.677, 1e-6);
    near(/** @type {number} */ (formulaMass('K4[Fe(CN)6]')), 368.345, 1e-6);
    assert.equal(formulaMass('NaCl(aq)'), formulaMass('NaCl'));
    assert.equal(hillKey(parseFormula('CH3COOH')), 'C2H4O2');
    assert.equal(Object.keys(ATOMIC_WEIGHTS).length, 118);
  });

  test('bad formulas are rejected', () => {
    for (const bad of ['Xx', 'h2o', 'H2(O', 'H2O)', '', '2', 'H0', 'Fe..O']) assert.equal(formulaMass(bad), null, bad);
  });

  test('balancing, including redox and impossible equations', () => {
    assert.deepEqual(balanced('Fe + O2 = Fe2O3'), [4, 3, 2]);
    assert.deepEqual(balanced('KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2'), [2, 16, 2, 2, 8, 5]);
    assert.deepEqual(balanced('2H2 + O2 → 2H2O'), [2, 1, 2], 'given coefficients are ignored');
    assert.equal(balanced('H2 + O2 = H2O2 + H2O'), null, 'two independent reactions');
    assert.equal(balanced('NaCl = KBr'), null);
    assert.equal(parseEquation('H2 + O2'), null);
  });
});

describe('molar-mass', () => {
  test('CuSO₄·5H₂O: 249.68 g/mol, 25.45 % Cu', () => {
    const result = run('molar-mass').values;
    near(result.molarMass, 249.677, 1e-6);
    assert.match(result.composition.cs, /^Cu 25,45 %/);
    assert.match(result.composition.en, /^Cu 25\.45 %/);
    assert.equal(result.atoms, 21);
  });

  test('letter case matters: Co vs CO', () => {
    near(run('molar-mass', { formula: 'Co' }).values.molarMass, 58.933, 1e-9);
    near(run('molar-mass', { formula: 'CO' }).values.molarMass, 28.010, 1e-9);
  });

  test('invalid and malicious formulas', () => {
    invalid(run('molar-mass', { formula: 'Zz9' }));
    invalid(run('molar-mass', { formula: '<script>' }));
    invalid(run('molar-mass', { formula: 'H'.repeat(200) }));
  });
});

describe('amount', () => {
  test('18 g of water ≈ 1 mol ≈ 6.02 · 10²³ molecules', () => {
    const result = run('amount').values;
    near(result.moles, 18 / 18.015, 1e-12);
    near(result.particles, 18 / 18.015 * 6.02214076e23, 1e10);
  });

  test('from moles and from particles', () => {
    near(run('amount', { formula: 'NaCl', known: 'moles', value: 2 }).values.mass, 116.88, 1e-9);
    near(run('amount', { known: 'particles', value: 6.02214076e23 }).values.moles, 1, 1e-15);
  });

  test('zero and invalid', () => {
    assert.equal(run('amount', { value: 0 }).values.particles, 0);
    invalid(run('amount', { formula: 'Qq' }));
    invalid(run('amount', { known: 'volume' }));
  });
});

describe('balance-equation', () => {
  test('octane combustion: 2 C8H18 + 25 O2 → 16 CO2 + 18 H2O', () => {
    const result = run('balance-equation').values;
    assert.equal(result.balanced, '2 C8H18 + 25 O2 → 16 CO2 + 18 H2O');
    assert.deepEqual(result.coefficients, [2, 25, 16, 18]);
  });

  test('photosynthesis and hydrates', () => {
    assert.equal(run('balance-equation', { equation: 'CO2 + H2O -> C6H12O6 + O2' }).values.balanced, '6 CO2 + 6 H2O → C6H12O6 + 6 O2');
    assert.equal(run('balance-equation', { equation: 'CuSO4·5H2O = CuSO4 + H2O' }).values.balanced, 'CuSO4·5H2O → CuSO4 + 5 H2O');
  });

  test('impossible, ambiguous and malformed equations', () => {
    invalid(run('balance-equation', { equation: 'H2O = CO2' }));
    invalid(run('balance-equation', { equation: 'H2 + O2 = H2O2 + H2O' }));
    invalid(run('balance-equation', { equation: 'H2 + O2' }));
    invalid(run('balance-equation', { equation: 'H2; DROP TABLE x' }));
  });
});

describe('reaction-yield', () => {
  test('1 kg of glucose → at most 511 g of ethanol; 460 g is 90 %', () => {
    const result = run('reaction-yield').values;
    near(result.theoretical, 1000 / 180.156 * 2 * 46.069, 1e-9);
    near(result.yield, 460 / result.theoretical * 100, 1e-9);
  });

  test('species are matched by composition (C2H5OH = C2H6O)', () => {
    near(run('reaction-yield', { product: 'C2H6O' }).values.theoretical, run('reaction-yield').values.theoretical, 1e-12);
    near(run('reaction-yield', { product: 'CO2', actual: '' }).values.theoretical, 1000 / 180.156 * 2 * 44.009, 1e-9);
  });

  test('species on the wrong side, too high yield and invalid input', () => {
    invalid(run('reaction-yield', { reactant: 'CO2' }));
    invalid(run('reaction-yield', { product: 'NaCl' }));
    assert.equal(run('reaction-yield', { actual: 600 }).warnings.length, 1);
    invalid(run('reaction-yield', { mass: -1 }));
  });
});

describe('dilution', () => {
  test('80 % lactic acid to 1 l of 5 %: 62.5 ml + 937.5 ml water', () => {
    const result = run('dilution').values;
    near(result.v1, 62.5, 1e-12);
    near(result.solvent, 937.5, 1e-12);
  });

  test('final concentration and volume', () => {
    near(run('dilution', { find: 'c2', c1: 1, v1: 10, v2: 100 }).values.c2, 0.1, 1e-15);
    near(run('dilution', { find: 'v2', c1: 2, v1: 5, c2: 0.5 }).values.v2, 20, 1e-12);
    near(run('dilution', { find: 'c1', v1: 50, c2: 1, v2: 500 }).values.c1, 10, 1e-12);
  });

  test('concentrating by dilution and invalid input', () => {
    invalid(run('dilution', { find: 'v1', c1: 5, c2: 10 }));
    invalid(run('dilution', { c1: 0 }));
  });
});

describe('solution-mixing', () => {
  test('96 % and water to 40 %: 40 : 56 parts', () => {
    const result = run('solution-mixing').values;
    assert.equal(result.highParts, 40);
    assert.equal(result.lowParts, 56);
    near(result.highAmount * 0.96, 1000 * 0.4, 1e-9);
  });

  test('two solutions', () => {
    const result = run('solution-mixing', { high: 30, low: 10, target: 15, total: 100 }).values;
    near(result.highAmount, 25, 1e-12);
    near(result.lowAmount, 75, 1e-12);
  });

  test('target outside the range and invalid input', () => {
    invalid(run('solution-mixing', { target: 98 }));
    invalid(run('solution-mixing', { high: 10, low: 20 }));
  });
});

describe('solution-prep', () => {
  test('1 l of 0.1 mol/l HCl from 37 % (1.18 g/ml): 8.35 ml', () => {
    near(run('solution-prep').values.millilitres, 8.3504, 1e-4);
  });

  test('from a solid and with a hydrate', () => {
    near(run('solution-prep', { source: 'solid', formula: 'NaCl', purity: 100 }).values.grams, 5.844, 1e-9);
    const hydrate = run('solution-prep', { source: 'solid', formula: 'CuSO4·5H2O', concentration: 0.1, purity: 100 }).values;
    near(hydrate.grams, 24.9677, 1e-6);
    near(run('solution-prep', { source: 'solid', formula: 'NaCl', unit: 'wv', concentration: 0.9, purity: 100 }).values.grams, 9, 1e-12);
  });

  test('zero and invalid input', () => {
    assert.equal(run('solution-prep', { concentration: 0 }).values.grams, 0);
    invalid(run('solution-prep', { purity: 0 }));
    invalid(run('solution-prep', { formula: 'Xy' }));
  });
});

describe('ph', () => {
  test('0.1 mol/l acetic acid: pH 2.88; 0.01 mol/l HCl: pH 2', () => {
    near(run('ph').values.ph, 2.8829, 1e-3);
    near(run('ph', { kind: 'strongAcid', concentration: 0.01 }).values.ph, 2, 1e-9);
    near(run('ph', { kind: 'strongBase', concentration: 0.01 }).values.ph, 12, 1e-9);
  });

  test('very dilute acids approach neutral; ammonia', () => {
    near(run('ph', { kind: 'strongAcid', concentration: 1e-8 }).values.ph, 6.978, 1e-3);
    near(run('ph', { kind: 'weakBase', pk: 4.75, concentration: 0.1 }).values.ph, 11.12, 0.01);
    near(/** @type {number} */ (acidHydrogen(0.1, Infinity)), 0.1, 1e-12);
  });

  test('pH + pOH = 14; invalid input', () => {
    const result = run('ph', { pk: 3.86 }).values;
    near(result.ph + result.poh, 14, 1e-12);
    invalid(run('ph', { concentration: 0 }));
    invalid(run('ph', { kind: 'salt' }));
  });
});

describe('buffer', () => {
  test('equal parts give pH = pKa', () => {
    near(run('buffer', { acid: 0.1, base: 0.1 }).values.ph, 4.76, 1e-12);
  });

  test('ratio for a target pH', () => {
    const result = run('buffer', { system: 'phosphate', target: 7.4 }).values;
    near(result.ratio, 10 ** 0.2, 1e-12);
    near(run('buffer', { system: 'custom', pka: 6, acid: 1, base: 10 }).values.ph, 7, 1e-12);
  });

  test('outside the buffer range and invalid input', () => {
    assert.equal(run('buffer', { base: 10 }).warnings.length, 1);
    assert.equal(run('buffer', { target: '' }).values.ratio, null);
    invalid(run('buffer', { acid: 0 }));
  });
});

describe('dissociation-constant', () => {
  test('acetic acid: pKa 4.76 = Ka 1.74 · 10⁻⁵, conjugate pKb 9.24', () => {
    const result = convert(getTool('dissociation-constant'), 4.76, 'pka').values;
    near(result.ka, 1.7378e-5, 1e-9);
    near(result.pkb, 9.24, 1e-12);
    near(result.ka * result.kb, 1e-14, 1e-26);
  });

  test('from Ka', () => {
    near(convert(getTool('dissociation-constant'), 1e-3, 'ka').values.pka, 3, 1e-12);
  });

  test('zero Ka and invalid input', () => {
    invalid(convert(getTool('dissociation-constant'), 0, 'ka'));
    invalid(convert(getTool('dissociation-constant'), 'strong', 'pka'));
  });
});

describe('gas-volume', () => {
  test('44 g of CO₂ at 0 °C and 101.325 kPa: 22.41 l', () => {
    near(run('gas-volume').values.volume, 22.4145, 1e-4);
    near(run('gas-volume', { conditions: 'satp', known: 'moles', value: 1 }).values.volume, 24.790, 1e-3);
  });

  test('volume back to mass; custom conditions', () => {
    near(run('gas-volume', { known: 'volume', value: 22.414, formula: 'O2' }).values.mass, 31.998, 0.001);
    const custom = run('gas-volume', { conditions: 'custom', temperature: 0, pressure: 202.65, known: 'moles', value: 1 }).values;
    near(custom.molarVolume, 11.207, 0.001);
  });

  test('invalid input', () => {
    invalid(run('gas-volume', { formula: 'Xx' }));
    invalid(run('gas-volume', { conditions: 'custom', temperature: -300 }));
  });
});

describe('partial-pressure', () => {
  test('air: 78 % N₂, 21 % O₂, 1 % Ar at 101.325 kPa', () => {
    const result = run('partial-pressure', { gases: [{ name: 'N₂', share: 78 }, { name: 'O₂', share: 21 }, { name: 'Ar', share: 1 }] });
    near(result.values.pressures[1], 21.278, 0.001);
    assert.equal(result.values.sum, 100);
    assert.deepEqual(result.warnings, []);
  });

  test('shares not adding up to 100 % warn', () => {
    assert.equal(run('partial-pressure', { gases: [{ share: 50 }] }).warnings.length, 1);
  });

  test('invalid input', () => {
    invalid(run('partial-pressure', { gases: [{ share: 120 }] }));
    invalid(run('partial-pressure', { gases: [{ name: '<b>x</b>', share: 10 }] }));
    invalid(run('partial-pressure', { gases: [] }));
  });
});

describe('half-life', () => {
  test('carbon-14: 10 000 years leave 29.8 %', () => {
    near(run('half-life').values.fraction, 100 * 2 ** (-10000 / 5730), 1e-9);
    near(run('half-life', { time: 5730 }).values.fraction, 50, 1e-12);
  });

  test('zero and second order', () => {
    assert.equal(remaining(0, 100, 10, 20), 0);
    near(remaining(0, 100, 10, 10), 50, 1e-12);
    near(remaining(2, 100, 10, 30), 25, 1e-12);
  });

  test('zero time and invalid input', () => {
    assert.equal(run('half-life', { time: 0 }).values.remaining, 100);
    invalid(run('half-life', { halfLife: 0 }));
    invalid(run('half-life', { order: '3' }));
  });
});

describe('arrhenius', () => {
  test('beer from 4 to 20 °C at 70 kJ/mol ages 5.2 times faster', () => {
    const result = run('arrhenius').values;
    near(result.ratio, rateRatio(70, 4, 20), 1e-12);
    near(result.ratio, 5.2487, 1e-3);
    near(result.shelfLife, 12 / result.ratio, 1e-12);
  });

  test('activation energy from two rates; Q₁₀ ≈ 2 for about 50 kJ/mol at 20 °C', () => {
    const energy = run('arrhenius', { mode: 'energy', t1: 20, value1: 1, t2: 30, value2: 2 }).values.ea;
    // R · ln 2 / (1/293.15 − 1/303.15)
    near(energy, 8.314462618 * Math.LN2 / (1 / 293.15 - 1 / 303.15) / 1000, 1e-9);
    near(energy, 51.22, 0.01);
    near(run('arrhenius', { ea: energy, t1: 20 }).values.q10, 2, 1e-9);
  });

  test('same temperature and invalid input', () => {
    assert.equal(run('arrhenius', { t2: 4 }).values.ratio, 1);
    invalid(run('arrhenius', { mode: 'energy', t1: 20, t2: 20 }));
    invalid(run('arrhenius', { t1: -280 }));
  });
});

describe('reaction-heat', () => {
  test('methane combustion: −890.3 kJ, with vapour −802.3 kJ', () => {
    const result = run('reaction-heat').values;
    near(result.enthalpy, -890.3, 0.05);
    assert.equal(result.balanced, 'CH4 + 2 O2 → CO2 + 2 H2O');
    assert.match(result.kind.cs, /exotermní/);
    near(run('reaction-heat', { water: 'gas' }).values.enthalpy, -802.3, 0.05);
  });

  test('thermite and extra enthalpies', () => {
    near(run('reaction-heat', { equation: 'Al + Fe2O3 = Al2O3 + Fe' }).values.enthalpy, -851.5, 0.05);
    near(run('reaction-heat', { equation: 'CuO + H2 = Cu + H2O', overrides: 'CuO = -157,3' }).values.enthalpy, -128.53, 0.01);
    assert.deepEqual(parseOverrides('A=1'), null);
    assert.match(run('reaction-heat', { equation: 'CaCO3 = CaO + CO2' }).values.kind.en, /endothermic/);
  });

  test('missing data and invalid input', () => {
    const missing = run('reaction-heat', { equation: 'CuO + H2 = Cu + H2O' });
    invalid(missing);
    assert.match(missing.warnings[0].cs, /CuO/);
    invalid(run('reaction-heat', { overrides: 'nonsense' }));
    invalid(run('reaction-heat', { equation: 'H2O = CO2' }));
  });
});

describe('combustion-heat', () => {
  test('1 kg of propane: 46.35 MJ = 12.9 kWh', () => {
    const result = run('combustion-heat').values;
    near(result.lhv, 46.35, 1e-12);
    near(result.kwh, 12.875, 1e-12);
    near(result.useful, 12.875 * 0.85, 1e-12);
  });

  test('litres of diesel and cubic metres of natural gas', () => {
    near(run('combustion-heat', { fuel: 'diesel', unit: 'volume', amount: 1 }).values.mass, 0.832, 1e-12);
    const gas = run('combustion-heat', { fuel: 'naturalGas', unit: 'volume', amount: 1 }).values;
    assert.ok(gas.kwh > 9 && gas.kwh < 11, `natural gas ${gas.kwh} kWh/m³`);
  });

  test('solid fuels by volume and invalid input', () => {
    invalid(run('combustion-heat', { fuel: 'wood', unit: 'volume' }));
    invalid(run('combustion-heat', { fuel: 'uranium' }));
  });
});

describe('sanitizer', () => {
  test('Star San: 1 oz per 5 gal = 1.56 ml/l', () => {
    const result = run('sanitizer').values;
    near(result.perLitre, 1.5623, 1e-4);
    near(result.product, 15.623, 1e-3);
  });

  test('bleach 5 % to 200 ppm: 3.74 ml/l, with a chlorine warning; 30 % peroxide to 3 %', () => {
    const bleach = run('sanitizer', { product: 'hypochlorite', stock: 5, density: 1.07, target: 200, targetUnit: 'ppm' });
    near(bleach.values.perLitre, 200 / 53.5, 1e-12);
    assert.match(bleach.warnings[0].cs, /chlor/);
    near(run('sanitizer', { product: 'peroxide' }).values.perLitre, 30000 / (0.3 * 1.11 * 1000), 1e-9);
  });

  test('target stronger than the product and invalid input', () => {
    invalid(run('sanitizer', { product: 'peroxide', stock: 3, target: 30 }));
    invalid(run('sanitizer', { product: 'peroxide', target: 101 }));
    invalid(run('sanitizer', { product: 'vodka' }));
  });
});
