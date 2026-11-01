import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, convert, getTool } from '../calc_tools/static/calc_tools/index.js';
import { waterDensity } from '../calc_tools/static/calc_tools/core/physics.js';
import { collide } from '../calc_tools/static/calc_tools/tools/physics/momentum.js';
import { frictionFactor } from '../calc_tools/static/calc_tools/tools/physics/pressure-loss.js';
import { mixedTemperature } from '../calc_tools/static/calc_tools/tools/physics/liquid-mixing.js';
import { dissolvedMoles } from '../calc_tools/static/calc_tools/tools/physics/gas-solubility.js';
import { combine } from '../calc_tools/static/calc_tools/tools/physics/component-network.js';
import { nextStandard } from '../calc_tools/static/calc_tools/tools/physics/led-resistor.js';
import { soundInAir, soundInWater } from '../calc_tools/static/calc_tools/tools/physics/speed-of-sound.js';
import { addLevels } from '../calc_tools/static/calc_tools/tools/physics/decibels.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

/**
 * @param {number} actual
 * @param {number} expected
 * @param {number} [relative]
 */
function close(actual, expected, relative = 1e-9) {
  near(actual, expected, Math.abs(expected) * relative + 1e-12);
}

describe('accelerated-motion', () => {
  test('from rest at 2 m/s² for 5 s: 10 m/s, 25 m', () => {
    const result = run('accelerated-motion', { v0: 0, a: 2, t: 5 }).values;
    close(result.v, 10);
    close(result.s, 25);
    assert.equal(result.stopTime, null);
  });

  test('braking from 20 m/s at −5 m/s²: stops in 4 s after 40 m', () => {
    const result = run('accelerated-motion').values;
    close(result.stopTime, 4);
    close(result.stopDistance, 40);
    close(result.s, 20 * 3 - 2.5 * 9);
    assert.equal(run('accelerated-motion', { t: 6 }).warnings.length, 1);
  });

  test('zero time and invalid input', () => {
    assert.equal(run('accelerated-motion', { t: 0 }).values.s, 0);
    invalid(run('accelerated-motion', { t: -1 }));
    invalid(run('accelerated-motion', { a: 'fast' }));
  });
});

describe('free-fall', () => {
  test('from 20 m: 2.02 s, 19.8 m/s', () => {
    const result = run('free-fall').values;
    close(result.time, Math.sqrt(40 / 9.80665));
    close(result.speed, Math.sqrt(2 * 9.80665 * 20));
    close(result.speedKmh, result.speed * 3.6);
  });

  test('on the Moon a fall takes longer', () => {
    assert.ok(run('free-fall', { g: 1.62 }).values.time > run('free-fall').values.time * 2);
  });

  test('zero height and invalid input', () => {
    assert.equal(run('free-fall', { height: 0 }).values.speed, 0);
    invalid(run('free-fall', { g: 0 }));
    invalid(run('free-fall', { height: -5 }));
  });
});

describe('projectile', () => {
  test('45° from the ground goes furthest: v²/g', () => {
    const result = run('projectile').values;
    close(result.range, 400 / 9.80665, 1e-12);
    close(result.maxHeight, 100 / 9.80665, 1e-12);
    assert.ok(run('projectile', { angle: 30 }).values.range < result.range);
  });

  test('horizontal throw from 5 m', () => {
    const result = run('projectile', { speed: 10, angle: 0, height: 5 }).values;
    close(result.time, Math.sqrt(10 / 9.80665));
    close(result.impactSpeed, Math.sqrt(100 + 2 * 9.80665 * 5));
  });

  test('zero speed and invalid input', () => {
    assert.equal(run('projectile', { speed: 0 }).values.range, 0);
    invalid(run('projectile', { angle: 100 }));
    invalid(run('projectile', { g: -9.8 }));
  });
});

describe('mechanical-energy', () => {
  test('1000 kg at 50 km/h: 96.45 kJ, like a 9.83 m fall', () => {
    const result = run('mechanical-energy').values;
    close(result.kinetic, 1000 * (50 / 3.6) ** 2 / 2 / 1000);
    close(result.equivalentHeight, (50 / 3.6) ** 2 / (2 * 9.80665));
    close(result.potential, 1000 * 9.80665 * 10 / 1000);
  });

  test('energy grows with the square of speed', () => {
    close(run('mechanical-energy', { speed: 100 }).values.kinetic / run('mechanical-energy').values.kinetic, 4);
  });

  test('zero and invalid', () => {
    assert.equal(run('mechanical-energy', { mass: 0 }).values.total, 0);
    invalid(run('mechanical-energy', { speed: -1 }));
  });
});

describe('momentum', () => {
  test('elastic collision of equal masses swaps velocities', () => {
    const { u1, u2 } = collide(1, 3, 1, 0, 1);
    close(u1, 0);
    close(u2, 3);
  });

  test('momentum is conserved; inelastic loses energy', () => {
    const elastic = run('momentum').values;
    close(2 * elastic.u1 + 1 * elastic.u2, 6);
    near(elastic.energyLoss, 0, 1e-9);
    const sticky = run('momentum', { restitution: 0 }).values;
    close(sticky.u1, 2);
    close(sticky.u2, 2);
    close(sticky.energyLoss, 9 - 6);
  });

  test('no collision when body 1 does not catch up; invalid input', () => {
    const apart = run('momentum', { v1: 1, v2: 2 });
    assert.equal(apart.values.u1, 1);
    assert.equal(apart.warnings.length, 1);
    invalid(run('momentum', { m1: 0 }));
    invalid(run('momentum', { restitution: 2 }));
  });
});

describe('work-power', () => {
  test('500 N over 10 m in 20 s: 5 kJ, 250 W', () => {
    const result = run('work-power').values;
    close(result.work, 5000);
    close(result.power, 250);
  });

  test('perpendicular force does no work, opposite force negative work', () => {
    assert.equal(run('work-power', { angle: 90 }).values.work, 0);
    close(run('work-power', { angle: 180 }).values.work, -5000);
  });

  test('zero distance and invalid input', () => {
    assert.equal(run('work-power', { distance: 0 }).values.power, 0);
    invalid(run('work-power', { time: 0 }));
    invalid(run('work-power', { angle: 200 }));
  });
});

describe('lever-pulley', () => {
  test('lever 0.3 m : 1.2 m lifts 50 kg with the weight of 12.5 kg', () => {
    const result = run('lever-pulley').values;
    close(result.forceKg, 12.5);
    close(result.advantage, 4);
  });

  test('pulley with 4 ropes at 80 % efficiency', () => {
    const result = run('lever-pulley', { machine: 'pulley', efficiency: 80 }).values;
    close(result.forceKg, 50 / 3.2);
    assert.equal(result.travel, 4);
  });

  test('load on the pivot and invalid input', () => {
    const pivot = run('lever-pulley', { loadArm: 0 });
    assert.equal(pivot.values.force, 0);
    assert.equal(pivot.warnings.length, 1);
    invalid(run('lever-pulley', { machine: 'pulley', ropes: 2.5 }));
    invalid(run('lever-pulley', { machine: 'crane' }));
  });
});

describe('hydrostatic-pressure', () => {
  test('10 m of water ≈ 0.98 bar; absolute adds the atmosphere', () => {
    const result = run('hydrostatic-pressure').values;
    close(result.gauge, 98.0665);
    close(result.absolute, 98.0665 + 101.325);
  });

  test('denser liquid, higher pressure', () => {
    close(run('hydrostatic-pressure', { depth: 0.76, density: 13595.1 }).values.gauge, 101.325, 1e-4);
  });

  test('zero depth and invalid input', () => {
    assert.equal(run('hydrostatic-pressure', { depth: 0 }).values.gauge, 0);
    invalid(run('hydrostatic-pressure', { density: 0 }));
  });
});

describe('buoyancy', () => {
  test('10 l body of 7 kg floats 70 % submerged', () => {
    const result = run('buoyancy').values;
    close(result.buoyancy, 10 * 9.80665 / 1);
    close(result.submerged, 70);
    close(result.bodyDensity, 700);
  });

  test('a steel body sinks and weighs less in water', () => {
    const steel = run('buoyancy', { volume: 1, mass: 7.85 });
    assert.ok(steel.values.net < 0);
    assert.equal(steel.values.submerged, 100);
    assert.equal(steel.warnings.length, 1);
  });

  test('zero volume and invalid input', () => {
    invalid(run('buoyancy', { volume: 0 }));
    invalid(run('buoyancy', { density: -1 }));
  });
});

describe('pipe-flow', () => {
  test('10 l/min through 12 mm: 1.47 m/s; narrowing to 8 mm speeds up 2.25×', () => {
    const result = run('pipe-flow').values;
    close(result.v1, 10 / 60000 / (Math.PI * 0.006 ** 2));
    close(result.v2 / result.v1, (12 / 8) ** 2);
  });

  test('cross-sections', () => {
    close(run('pipe-flow').values.area1, Math.PI * 36);
  });

  test('zero flow and invalid input', () => {
    assert.equal(run('pipe-flow', { flow: 0 }).values.v1, 0);
    invalid(run('pipe-flow', { d1: 0 }));
  });
});

describe('bernoulli', () => {
  test('faster and higher means lower pressure', () => {
    const result = run('bernoulli').values;
    close(result.p2, 200 + 1000 * (1.5 ** 2 - 3.4 ** 2) / 2 / 1000 + 1000 * 9.80665 * (0 - 2) / 1000);
    assert.ok(result.difference < 0);
  });

  test('still liquid reduces to hydrostatics', () => {
    close(run('bernoulli', { v1: 0, v2: 0, h1: 10, h2: 0, p1: 100 }).values.p2, 100 + 98.0665);
  });

  test('cavitation warning and invalid input', () => {
    assert.equal(run('bernoulli', { p1: 10, v2: 20 }).warnings.length, 1);
    invalid(run('bernoulli', { density: 0 }));
  });
});

describe('pressure-loss', () => {
  test('friction factor: laminar 64/Re, Moody chart for turbulent flow', () => {
    close(frictionFactor(1000, 0), 0.064);
    near(frictionFactor(1e5, 1e-4), 0.0185, 0.0002);
    near(frictionFactor(1e6, 0), 0.0116, 0.0002);
  });

  test('15 l/min through 12 mm, 5 m: turbulent, Δp = f · L/D · ρv²/2', () => {
    const result = run('pressure-loss').values;
    assert.ok(result.reynolds > 4000);
    close(result.loss * 1000, result.friction * 5 / 0.012 * 998 * result.speed ** 2 / 2, 1e-9);
    close(result.head, result.loss * 1000 / (998 * 9.80665), 1e-9);
  });

  test('laminar flow, transitional warning and invalid input', () => {
    const slow = run('pressure-loss', { flow: 0.1 }).values;
    close(slow.friction, 64 / slow.reynolds);
    assert.equal(run('pressure-loss', { flow: 1.7 }).warnings.length, 1);
    invalid(run('pressure-loss', { diameter: 0 }));
  });
});

describe('heat-energy', () => {
  test('30 kg of water from 15 to 78 °C: 7.91 MJ = 2.2 kWh', () => {
    const result = run('heat-energy').values;
    close(result.kj, 30 * 4.186 * 63);
    close(result.kwh, result.kj / 3600);
  });

  test('materials and cooling', () => {
    close(run('heat-energy', { material: 'copper', mass: 1, from: 20, to: 30 }).values.kj, 3.85);
    assert.ok(run('heat-energy', { from: 80, to: 20 }).values.kj < 0);
    close(run('heat-energy', { material: 'custom', custom: 2, mass: 1, from: 0, to: 1 }).values.kj, 2);
  });

  test('zero and invalid', () => {
    assert.equal(run('heat-energy', { from: 20, to: 20 }).values.kj, 0);
    invalid(run('heat-energy', { material: 'unobtainium' }));
    invalid(run('heat-energy', { from: -300 }));
  });
});

describe('liquid-mixing', () => {
  test('20 kg at 80 °C + 10 kg at 15 °C → 58.3 °C', () => {
    const result = run('liquid-mixing', { parts: [{ mass: 20, temperature: 80 }, { mass: 10, temperature: 15 }] }).values;
    close(result.temperature, (20 * 80 + 10 * 15) / 30);
    close(result.mass, 30);
  });

  test('different specific heats', () => {
    close(mixedTemperature([{ mass: 1, temperature: 100, specificHeat: 0.385 }, { mass: 1, temperature: 0, specificHeat: 4.186 }]), 38.5 / 4.571, 1e-9);
  });

  test('zero mass and invalid input', () => {
    invalid(run('liquid-mixing', { parts: [{ mass: 0 }, { mass: 0 }] }));
    invalid(run('liquid-mixing', { parts: [{}] }));
    invalid(run('liquid-mixing', { parts: [{}, { temperature: 'hot' }] }));
  });
});

describe('heating-time', () => {
  test('30 l of water from 15 °C to the boil with 3 kW at 90 %: 66 minutes', () => {
    const result = run('heating-time').values;
    close(result.minutes, 30 * 4.186 * 85 * 1000 / 2700 / 60);
    near(result.minutes, 66, 0.5);
    close(result.cost, result.energy * 6);
  });

  test('double power halves the time', () => {
    close(run('heating-time', { power: 6000 }).values.minutes * 2, run('heating-time').values.minutes);
  });

  test('cooling target and invalid input', () => {
    invalid(run('heating-time', { from: 80, to: 20 }));
    invalid(run('heating-time', { power: 0 }));
    assert.equal(run('heating-time', { to: 120 }).warnings.length, 1);
  });
});

describe('latent-heat', () => {
  test('4 kg of water boiled off: 9.03 MJ', () => {
    close(run('latent-heat').values.kj, 4 * 2257);
  });

  test('3 kW at 90 % boils off 4.3 kg an hour', () => {
    close(run('latent-heat').values.rate, 2700 * 3600 / 2257000);
    close(run('latent-heat', { change: 'iceMelt', mass: 1 }).values.kj, 334);
  });

  test('zero and invalid', () => {
    assert.equal(run('latent-heat', { mass: 0 }).values.minutes, 0);
    invalid(run('latent-heat', { change: 'sublimation' }));
  });
});

describe('wort-cooling', () => {
  test('25 l from 100 to 20 °C with 12 → 40 °C water', () => {
    const result = run('wort-cooling').values;
    const heat = 25 * 1.05 * 4.0 * 80;
    close(result.water, heat / (4.186 * 28));
    close(result.minutes, result.water / 8);
  });

  test('warmer outlet water saves water', () => {
    assert.ok(run('wort-cooling', { waterOut: 80 }).values.water < run('wort-cooling').values.water / 2);
    assert.equal(run('wort-cooling', { waterOut: 105 }).warnings.length, 1);
  });

  test('impossible cooling and invalid input', () => {
    invalid(run('wort-cooling', { waterIn: 25 }));
    invalid(run('wort-cooling', { to: 100 }));
    invalid(run('wort-cooling', { waterOut: 10 }));
    invalid(run('wort-cooling', { flow: 0 }));
  });
});

describe('heat-loss', () => {
  test('flat wall: λ·S·ΔT/d', () => {
    close(run('heat-loss', { shape: 'flat', lambda: 0.04, area: 2, delta: 20, thickness: 100 }).values.watts, 16);
  });

  test('cylinder: thicker insulation, smaller loss', () => {
    const result = run('heat-loss').values;
    close(result.watts, 2 * Math.PI * 0.035 * 0.6 * 45 / Math.log(0.22 / 0.2));
    assert.ok(run('heat-loss', { thickness: 50 }).values.watts < result.watts);
  });

  test('zero difference and invalid input', () => {
    const none = run('heat-loss', { delta: 0 }).values;
    assert.equal(none.watts, 0);
    assert.equal(none.perKelvin, null);
    invalid(run('heat-loss', { thickness: 0 }));
  });
});

describe('thermal-expansion', () => {
  test('water density by Kell: 999.97 at 4 °C, 958.36 at 100 °C', () => {
    near(waterDensity(4), 999.972, 0.002);
    near(waterDensity(100), 958.365, 0.002);
    near(waterDensity(20), 998.204, 0.002);
  });

  test('wort shrinks about 4 % from the boil to 20 °C; steel expands 12 µm per m per K', () => {
    near(run('thermal-expansion').values.percent, -3.99, 0.01);
    close(run('thermal-expansion', { material: 'carbonSteel', size: 1000, from: 20, to: 21 }).values.change, 0.012);
  });

  test('zero change and invalid input', () => {
    near(run('thermal-expansion', { from: 20, to: 20 }).values.change, 0, 1e-12);
    invalid(run('thermal-expansion', { to: 200 }));
    invalid(run('thermal-expansion', { material: 'jelly' }));
  });
});

describe('ideal-gas', () => {
  test('1 mol at 0 °C and 101.325 kPa takes 22.414 l', () => {
    close(run('ideal-gas', { find: 'v' }).values.v, 22.41396954, 1e-8);
    close(run('ideal-gas').values.n, 1, 1e-5);
  });

  test('pressure, temperature and density of CO₂', () => {
    close(run('ideal-gas', { find: 'p', v: 11.20698477 }).values.p, 202.65, 1e-8);
    close(run('ideal-gas', { find: 't', p: 2 * 101.325 }).values.t, 273.15, 1e-4);
    near(run('ideal-gas').values.density, 1.9635, 0.0001);
  });

  test('no molar mass and invalid input', () => {
    assert.equal(run('ideal-gas', { molar: '' }).values.mass, null);
    invalid(run('ideal-gas', { t: -300 }));
    invalid(run('ideal-gas', { find: 'r' }));
  });
});

describe('gas-laws', () => {
  test('Boyle: double the pressure, half the volume', () => {
    close(run('gas-laws').values.v2, 5);
  });

  test('Charles and Gay-Lussac use absolute temperature', () => {
    close(run('gas-laws', { p2: 100, t2: 293.15 + 20 }).values.v2, 10 * (586.3 + 0) / 293.15, 1e-9);
    close(run('gas-laws', { find: 'p2', v2: 10, t2: 40 }).values.p2, 100 * 313.15 / 293.15);
    close(run('gas-laws', { find: 't2', p2: 100, v2: 20 }).values.t2, 2 * 293.15 - 273.15);
  });

  test('invalid input', () => {
    invalid(run('gas-laws', { t1: -273.15 }));
    invalid(run('gas-laws', { p1: 0 }));
  });
});

describe('gas-solubility', () => {
  test('CO₂ at 25 °C and 1 bar: 0.034 mol/kg = 1.5 g/l', () => {
    close(dissolvedMoles('co2', 1, 25), 0.034);
    near(run('gas-solubility', { pressure: 1, temperature: 25 }).values.gramsPerLitre, 1.496, 0.001);
  });

  test('colder water holds more; oxygen far less', () => {
    assert.ok(run('gas-solubility', { temperature: 4 }).values.gramsPerLitre > run('gas-solubility', { temperature: 20 }).values.gramsPerLitre);
    const oxygen = run('gas-solubility', { gas: 'o2', pressure: 0.21, temperature: 20 }).values;
    assert.ok(oxygen.gramsPerLitre > 0.008 && oxygen.gramsPerLitre < 0.011, `O₂ ${oxygen.gramsPerLitre}`);
    assert.equal(oxygen.volumes, null);
  });

  test('zero pressure and invalid input', () => {
    assert.equal(run('gas-solubility', { pressure: 0 }).values.gramsPerLitre, 0);
    invalid(run('gas-solubility', { gas: 'helium' }));
    invalid(run('gas-solubility', { temperature: 100 }));
  });
});

describe('ohms-law', () => {
  test('3 kW at 230 V: 13.04 A, 17.63 Ω', () => {
    const result = run('ohms-law').values;
    close(result.i, 3000 / 230);
    close(result.r, 230 * 230 / 3000);
  });

  test('every pair gives the same circuit', () => {
    const circuit = { u: 12, i: 2, r: 6, p: 24 };
    for (const known of ['ui', 'ur', 'ir', 'pu', 'pi', 'pr']) {
      const result = run('ohms-law', { known, ...circuit }).values;
      for (const id of ['u', 'i', 'r', 'p']) close(result[id], circuit[/** @type {'u'} */ (id)], 1e-12);
    }
  });

  test('division by zero and invalid input', () => {
    invalid(run('ohms-law', { known: 'ui', i: 0 }));
    invalid(run('ohms-law', { known: 'pu', u: 0 }));
    invalid(run('ohms-law', { known: 'xy' }));
  });
});

describe('component-network', () => {
  test('100, 220 and 330 Ω in parallel: 56.9 Ω; in series 650 Ω', () => {
    close(run('component-network').values.total, 1 / (1 / 100 + 1 / 220 + 1 / 330));
    close(run('component-network', { connection: 'series' }).values.total, 650);
  });

  test('capacitors add in parallel', () => {
    close(combine([10, 22], 'capacitor', 'parallel'), 32);
    close(combine([10, 10], 'capacitor', 'series'), 5);
  });

  test('zero values, garbage and too many', () => {
    invalid(run('component-network', { values: '100 0' }));
    invalid(run('component-network', { values: '4k7' }));
    invalid(run('component-network', { values: Array.from({ length: 101 }, () => '1').join(' ') }));
  });
});

describe('voltage-divider', () => {
  test('12 V with 10 k and 4.7 k: 3.84 V', () => {
    close(run('voltage-divider').values.vout, 12 * 4.7 / 14.7);
  });

  test('a load lowers the output', () => {
    const loaded = run('voltage-divider', { load: 4.7 }).values;
    close(loaded.vout, 12 * 2.35 / 12.35);
  });

  test('zero input and invalid values', () => {
    assert.equal(run('voltage-divider', { vin: 0 }).values.vout, 0);
    invalid(run('voltage-divider', { r1: 0 }));
  });
});

describe('led-resistor', () => {
  test('12 V, red LED 2 V, 20 mA: 500 Ω → 560 Ω (E12)', () => {
    const result = run('led-resistor').values;
    close(result.resistance, 500);
    assert.equal(result.standard, 560);
    close(result.actualCurrent, 10 / 560 * 1000);
  });

  test('E-series rounding up and LEDs in series', () => {
    assert.equal(nextStandard(470, 'e12'), 470);
    assert.equal(nextStandard(500, 'e24'), 510);
    assert.equal(nextStandard(8300, 'e12'), 10000);
    close(run('led-resistor', { forward: 3, count: 3, current: 20 }).values.resistance, 150);
  });

  test('supply too low and invalid input', () => {
    invalid(run('led-resistor', { supply: 3, forward: 3 }));
    invalid(run('led-resistor', { count: 1.5 }));
    invalid(run('led-resistor', { series: 'e96' }));
  });
});

describe('wire-size', () => {
  test('16 A, 25 m, 230 V, 3 %: 2.5 mm² copper', () => {
    const result = run('wire-size');
    assert.equal(result.values.standard, 2.5);
    assert.ok(result.values.actualPercent <= 3);
    assert.equal(result.warnings.length, 1, 'always reminds to check current capacity');
  });

  test('aluminium needs more, three-phase less', () => {
    assert.ok(run('wire-size', { material: 'aluminium' }).values.minimum > run('wire-size').values.minimum * 1.6);
    close(run('wire-size', { phases: 'three' }).values.minimum, run('wire-size').values.minimum * Math.sqrt(3) / 2);
  });

  test('beyond 300 mm² and invalid input', () => {
    const huge = run('wire-size', { current: 1000, length: 500 });
    assert.equal(huge.values.standard, null);
    assert.equal(huge.warnings.length, 2);
    invalid(run('wire-size', { material: 'gold' }));
    invalid(run('wire-size', { drop: 0 }));
  });
});

describe('battery-runtime', () => {
  test('100 Ah 12 V, 80 % usable, 90 % efficient, 60 W: 14.4 h', () => {
    close(run('battery-runtime').values.hours, 14.4);
  });

  test('battery current includes the converter loss', () => {
    close(run('battery-runtime').values.current, 60 / 0.9 / 12);
  });

  test('invalid input', () => {
    invalid(run('battery-runtime', { load: 0 }));
    invalid(run('battery-runtime', { usable: 120 }));
  });
});

describe('electricity-cost', () => {
  test('2 kW for 1 h a day for a year at 6 per kWh: 730 kWh, 4380', () => {
    const result = run('electricity-cost').values;
    close(result.kwh, 730);
    close(result.cost, 4380);
  });

  test('a 10 W bulb all day', () => {
    close(run('electricity-cost', { power: 10, hours: 24, days: 30 }).values.kwh, 7.2);
  });

  test('zero and invalid', () => {
    assert.equal(run('electricity-cost', { hours: 0 }).values.cost, 0);
    invalid(run('electricity-cost', { hours: 25 }));
  });
});

describe('refraction', () => {
  test('from water to air at 30°: 41.8°, critical angle 48.6°', () => {
    const result = run('refraction').values;
    close(result.refracted, Math.asin(1.333 * 0.5) * 180 / Math.PI);
    near(result.critical, 48.6, 0.05);
  });

  test('into a denser medium the ray bends towards the normal; 4 % reflection on glass at normal incidence', () => {
    const glass = run('refraction', { n1: 1, n2: 1.5, angle: 0 }).values;
    near(glass.reflectance, 4, 1e-9);
    assert.equal(glass.critical, null);
    assert.ok(run('refraction', { n1: 1, n2: 1.5, angle: 40 }).values.refracted < 40);
  });

  test('total internal reflection and invalid input', () => {
    const total = run('refraction', { angle: 60 });
    assert.equal(total.values.refracted, null);
    assert.equal(total.values.reflectance, 100);
    invalid(run('refraction', { n1: 0.5 }));
  });
});

describe('thin-lens', () => {
  test('object at 2f gives an image at 2f, magnification −1', () => {
    const result = run('thin-lens', { focal: 50, object: 100, size: 10 }).values;
    close(result.image, 100);
    close(result.magnification, -1);
    assert.equal(result.kind.cs, 'skutečný, převrácený');
  });

  test('magnifier and diverging lens give virtual images', () => {
    const magnifier = run('thin-lens', { focal: 100, object: 50 }).values;
    close(magnifier.magnification, 2);
    assert.equal(magnifier.kind.en, 'virtual, upright');
    assert.ok(run('thin-lens', { focal: -100, object: 200 }).values.image < 0);
    close(run('thin-lens').values.dioptres, 20);
  });

  test('object in the focal point and invalid input', () => {
    invalid(run('thin-lens', { focal: 50, object: 50 }));
    invalid(run('thin-lens', { focal: 0 }));
    invalid(run('thin-lens', { object: 0 }));
  });
});

describe('speed-of-sound', () => {
  test('air: 331.3 m/s at 0 °C, 343.2 m/s at 20 °C', () => {
    close(soundInAir(0), 331.3);
    near(run('speed-of-sound').values.speed, 343.2, 0.05);
  });

  test('water: 1402 m/s at 0 °C, 1482 at 20 °C, maximum near 74 °C', () => {
    near(soundInWater(0), 1402.39, 0.01);
    near(soundInWater(20), 1482.38, 0.01);
    assert.ok(soundInWater(74) > soundInWater(60) && soundInWater(74) > soundInWater(90));
    close(run('speed-of-sound', { frequency: 343.2146 }).values.wavelength, 1, 1e-6);
  });

  test('outside the range and invalid input', () => {
    invalid(run('speed-of-sound', { medium: 'water', temperature: 99 }));
    invalid(run('speed-of-sound', { medium: 'steel' }));
  });
});

describe('doppler', () => {
  test('source approaching at 100 km/h: f · c / (c − v)', () => {
    const c = soundInAir(20);
    close(run('doppler').values.approaching, 440 * c / (c - 100 / 3.6));
    close(run('doppler').values.receding, 440 * c / (c + 100 / 3.6));
  });

  test('observer moving towards a still source', () => {
    const c = soundInAir(20);
    close(run('doppler', { source: 0, observer: 36 }).values.approaching, 440 * (c + 10) / c);
  });

  test('no motion, supersonic and invalid input', () => {
    close(run('doppler', { source: 0 }).values.approaching, 440);
    assert.equal(run('doppler', { source: 0 }).values.semitones, 0);
    invalid(run('doppler', { source: 1300 }));
    invalid(run('doppler', { frequency: 0 }));
  });
});

describe('decibels', () => {
  test('80 + 80 dB = 83 dB; ten times farther −20 dB', () => {
    const result = run('decibels').values;
    near(result.total, 83.0103, 1e-4);
    close(result.attenuation, 20);
  });

  test('ten equal sources add 10 dB; doubling distance −6 dB', () => {
    close(addLevels(Array.from({ length: 10 }, () => 60)), 70);
    near(run('decibels', { levels: '90', to: 2 }).values.atDistance, 90 - 6.0206, 1e-4);
  });

  test('garbage, too many and extreme levels', () => {
    invalid(run('decibels', { levels: 'loud' }));
    invalid(run('decibels', { levels: '400' }));
    invalid(run('decibels', { from: 0 }));
  });
});

describe('time-dilation', () => {
  test('90 % of c: γ = 2.294, 10 years pass as 4.36 on board', () => {
    const result = run('time-dilation').values;
    close(result.gamma, 1 / Math.sqrt(1 - 0.81));
    near(result.properTime, 4.3589, 1e-4);
  });

  test('everyday speeds hardly change anything', () => {
    near(run('time-dilation', { speed: 0.001 }).values.gamma, 1, 1e-10);
  });

  test('zero speed and the speed of light', () => {
    assert.equal(run('time-dilation', { speed: 0 }).values.gamma, 1);
    invalid(run('time-dilation', { speed: 100 }));
  });
});

describe('escape-velocity', () => {
  test('Earth: 11.19 km/s and 7.91 km/s, 9.82 m/s² (without rotation)', () => {
    const result = run('escape-velocity').values;
    near(result.escape, 11.186, 0.001);
    near(result.orbital, 7.910, 0.001);
  });

  test('Moon and a custom body equal to Earth', () => {
    near(run('escape-velocity', { body: 'moon' }).values.escape, 2.376, 0.001);
    near(run('escape-velocity', { body: 'custom', mass: 5.9722e24, radius: 6371 }).values.escape, 11.186, 0.001);
    assert.ok(run('escape-velocity', { altitude: 400 }).values.orbital < 7.91);
  });

  test('invalid input', () => {
    invalid(run('escape-velocity', { body: 'pluto' }));
    invalid(run('escape-velocity', { body: 'custom', radius: 0 }));
  });
});

describe('orbital-period', () => {
  test('Earth around the Sun at 1 AU: 365.26 days, 29.8 km/s', () => {
    const result = run('orbital-period').values;
    near(result.days, 365.256, 0.01);
    near(result.speed, 29.78, 0.01);
  });

  test('geostationary orbit: 42 164 km → 23.93 h', () => {
    near(run('orbital-period', { body: 'earth', axis: 42164, unit: 'km' }).values.hours, 23.934, 0.002);
  });

  test('orbit inside the body and invalid input', () => {
    assert.equal(run('orbital-period', { body: 'earth', axis: 1000, unit: 'km' }).warnings.length, 1);
    invalid(run('orbital-period', { axis: 0 }));
    invalid(run('orbital-period', { unit: 'mile' }));
  });
});

describe('astro-distance', () => {
  test('1 pc = 3.2616 ly = 206 265 AU', () => {
    const result = convert(getTool('astro-distance'), 1, 'pc').values;
    near(result.ly, 3.26156, 1e-5);
    near(result.au, 206264.806, 0.001);
  });

  test('light from the Sun takes 8.3 minutes', () => {
    near(convert(getTool('astro-distance'), 1, 'au').values.lmin, 8.3167, 1e-4);
  });

  test('zero and invalid', () => {
    assert.equal(convert(getTool('astro-distance'), 0, 'ly').values.km, 0);
    invalid(convert(getTool('astro-distance'), -1, 'ly'));
  });
});
