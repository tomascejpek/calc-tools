import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, getTool } from '../calc_tools/static/calc_tools/index.js';
import { sectionArea } from '../calc_tools/static/calc_tools/tools/engineering/material-weight.js';
import { groutPerSquareMetre } from '../calc_tools/static/calc_tools/tools/engineering/tiles.js';
import { threadDimensions } from '../calc_tools/static/calc_tools/tools/engineering/thread.js';
import { beltLength } from '../calc_tools/static/calc_tools/tools/engineering/gear-ratio.js';
import { holeDeviations, rangeIndex, shaftDeviations } from '../calc_tools/static/calc_tools/tools/engineering/fits.js';
import { dewPoint, saturationPressure } from '../calc_tools/static/calc_tools/tools/engineering/humidity.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

describe('material-weight', () => {
  test('tube 48.3 × 3.2 steel: 3.56 kg/m (EN 10255)', () => {
    const result = run('material-weight').values;
    near(result.perMetre, 3.56, 0.005);
    near(result.mass, result.perMetre * 6, 1e-9);
  });

  test('sheet, round bar and aluminium', () => {
    // 1 m² of 1 mm steel sheet weighs 7.85 kg
    near(run('material-weight', { shape: 'plate', a: 1000, thickness: 1, length: 1 }).values.mass, 7.85, 1e-9);
    near(run('material-weight', { shape: 'round', a: 20, length: 1 }).values.perMetre, Math.PI * 100 * 7850e-6, 1e-12);
    near(run('material-weight', { shape: 'plate', material: 'aluminium', a: 1000, thickness: 1, length: 1 }).values.mass, 2.7, 1e-9);
    near(/** @type {number} */ (sectionArea('angle', { a: 50, b: 50, thickness: 5 })), 475, 1e-12);
  });

  test('impossible walls and invalid input', () => {
    invalid(run('material-weight', { a: 10, thickness: 6 }));
    invalid(run('material-weight', { material: 'unobtainium' }));
    invalid(run('material-weight', { length: -1 }));
  });
});

describe('concrete', () => {
  test('5 × 4 × 0.15 m slab with 5 % allowance: 3.15 m³', () => {
    const result = run('concrete').values;
    near(result.volume, 3.15, 1e-12);
    near(result.cement, 3.15 * 330, 1e-9);
    assert.equal(result.bags, Math.ceil(3.15 * 330 / 25));
  });

  test('round column', () => {
    near(run('concrete', { shape: 'column', width: 0.3, depth: 3, waste: 0 }).values.volume, Math.PI * 0.0225 * 3, 1e-12);
  });

  test('zero and invalid input', () => {
    assert.equal(run('concrete', { depth: 0 }).values.volume, 0);
    invalid(run('concrete', { grade: 'c90' }));
  });
});

describe('mortar', () => {
  test('40 m² of 15 mm plaster: 660 l with 10 % allowance, 44 bags at 15 l', () => {
    const result = run('mortar').values;
    near(result.litres, 660, 1e-9);
    assert.equal(result.bags, 44);
  });

  test('brickwork takes far more mortar than thin-joint blocks', () => {
    const brick = run('mortar', { work: 'brick', thickness: 300 }).values.litres;
    const thin = run('mortar', { work: 'thinJoint', thickness: 300 }).values.litres;
    near(brick / thin, 0.25 / 0.015, 1e-9);
  });

  test('invalid input', () => {
    invalid(run('mortar', { work: 'glue' }));
    invalid(run('mortar', { yield: 0 }));
  });
});

describe('paint', () => {
  test('16 m perimeter, 2.6 m high, 4 m² openings, ceiling, 2 coats at 8 m²/l', () => {
    const result = run('paint').values;
    near(result.area, 16 * 2.6 - 4 + 16, 1e-12);
    near(result.litres, result.area * 2 / 8, 1e-12);
    assert.equal(result.cans, 3);
  });

  test('exact can count is not rounded up', () => {
    assert.equal(run('paint', { perimeter: 10, height: 2, openings: 0, ceiling: 0, coats: 2, coverage: 8, can: 5 }).values.cans, 1);
  });

  test('openings larger than walls and invalid input', () => {
    invalid(run('paint', { openings: 100 }));
    invalid(run('paint', { coverage: 0 }));
  });
});

describe('tiles', () => {
  test('12 m² of 60 × 30 tiles with 3 mm joints and 10 % waste: 73 tiles', () => {
    const result = run('tiles').values;
    assert.equal(result.tiles, Math.ceil(13.2 / (0.603 * 0.303)));
    assert.equal(result.boxes, Math.ceil(13.2 / 1.44));
    near(result.adhesive, 48, 1e-12);
  });

  test('grout formula: smaller tiles need more', () => {
    near(groutPerSquareMetre(600, 300, 3, 9), 900 / 180000 * 3 * 9 * 1.6, 1e-12);
    assert.ok(groutPerSquareMetre(100, 100, 3, 9) > groutPerSquareMetre(600, 300, 3, 9) * 3);
  });

  test('zero area and invalid input', () => {
    assert.equal(run('tiles', { area: 0 }).values.tiles, 0);
    assert.equal(run('paint', { perimeter: 0, openings: 0, ceiling: 0 }).values.cans, 0);
    invalid(run('tiles', { length: 0 }));
  });
});

describe('thread', () => {
  test('M8: pitch 1.25, tap drill 6.75, clearance 9, stress area 36.6 mm² (ISO 898-1)', () => {
    const result = run('thread').values;
    assert.equal(result.pitch, 1.25);
    near(result.tapDrill, 6.75, 1e-12);
    assert.equal(result.clearance, 9);
    near(result.stressArea, 36.6, 0.05);
  });

  test('stress areas M12 84.3 and M20 245 mm²; fine thread M8 × 1', () => {
    near(threadDimensions(12, 1.75).stressArea, 84.3, 0.05);
    near(threadDimensions(20, 2.5).stressArea, 245, 0.5);
    near(run('thread', { fine: 1 }).values.tapDrill, 7, 1e-12);
  });

  test('impossible pitch and invalid input', () => {
    invalid(run('thread', { size: 'M2', fine: 1.5 }));
    invalid(run('thread', { size: 'M7' }));
  });
});

describe('cutting-speed', () => {
  test('10 mm HSS drill in steel at 25 m/min: 796 rpm', () => {
    const result = run('cutting-speed').values;
    near(result.rpm, 25000 / (Math.PI * 10), 1e-9);
    near(result.feedRate, result.rpm * 2 * 0.05, 1e-9);
  });

  test('carbide and custom cutting speed', () => {
    near(run('cutting-speed', { tool: 'carbide' }).values.cuttingSpeed, 150, 1e-12);
    near(run('cutting-speed', { material: 'custom', vc: 100, diameter: 50 }).values.rpm, 100000 / (Math.PI * 50), 1e-9);
  });

  test('invalid input', () => {
    invalid(run('cutting-speed', { diameter: 0 }));
    invalid(run('cutting-speed', { tool: 'diamond' }));
  });
});

describe('gear-ratio', () => {
  test('pulleys 100 → 300 mm: ratio 3, speed ÷ 3, torque × 3 × η', () => {
    const result = run('gear-ratio').values;
    assert.equal(result.ratio, 3);
    near(result.outputRpm, 1450 / 3, 1e-9);
    near(result.outputTorque, 10 * 3 * 0.97, 1e-12);
    near(result.belt, beltLength(100, 300, 400), 1e-9);
  });

  test('belt length of equal pulleys is 2C + πD; gears have no belt', () => {
    near(beltLength(100, 100, 500), 1000 + Math.PI * 100, 1e-9);
    assert.equal(run('gear-ratio', { kind: 'gears', driver: 20, driven: 60 }).values.belt, null);
  });

  test('overlapping pulleys warn; invalid input', () => {
    assert.equal(run('gear-ratio', { centre: 100 }).warnings.length, 1);
    invalid(run('gear-ratio', { driver: 0 }));
  });
});

describe('fits', () => {
  test('25 H7/g6: hole 0/+21, shaft −7/−20, clearance 7–41 µm (ISO 286-2 tables)', () => {
    const result = run('fits').values;
    assert.deepEqual([result.holeLower, result.holeUpper, result.shaftUpper, result.shaftLower], [0, 21, -7, -20]);
    assert.deepEqual([result.minClearance, result.maxClearance], [7, 41]);
    assert.match(result.fit.cs, /H7\/g6: s vůlí/);
    near(result.holeMax, 25.021, 1e-12);
  });

  test('transition and interference fits; range edges belong to the lower range', () => {
    assert.deepEqual(shaftDeviations('k', 6, rangeIndex(25)), { upper: 15, lower: 2 });
    assert.deepEqual(shaftDeviations('p', 6, rangeIndex(25)), { upper: 35, lower: 22 });
    assert.match(run('fits', { shaft: 'p' }).values.fit.en, /interference/);
    assert.match(run('fits', { shaft: 'k' }).values.fit.en, /transition/);
    // 30 mm is in 18–30, 30.001 in 30–50
    assert.equal(holeDeviations('H', 7, rangeIndex(30)).upper, 21);
    assert.equal(holeDeviations('H', 7, rangeIndex(30.001)).upper, 25);
    assert.deepEqual(holeDeviations('F', 8, rangeIndex(10)), { upper: 35, lower: 13 });
    assert.deepEqual(shaftDeviations('js', 6, rangeIndex(100)), { upper: 11, lower: -11 });
    assert.deepEqual(shaftDeviations('k', 9, rangeIndex(25)), { upper: 52, lower: 0 });
  });

  test('out of range and invalid input', () => {
    invalid(run('fits', { size: 600 }));
    invalid(run('fits', { hole: 'K' }));
    invalid(run('fits', { shaftGrade: '12' }));
  });
});

describe('humidity', () => {
  test('22 °C and 50 %: dew point 11.1 °C, 9.7 g/m³', () => {
    const result = run('humidity').values;
    near(result.dewPoint, 11.1, 0.05);
    near(result.absolute, 9.68, 0.01);
    // Magnus gives 23.33 hPa, within 0.3 % of the 23.39 hPa in the tables
    near(saturationPressure(20), 23.39, 0.07);
  });

  test('from the dew point; saturated air', () => {
    near(run('humidity', { known: 'dew', dew: 11.0946 }).values.rh, 50, 0.01);
    near(dewPoint(15, 100), 15, 1e-9);
  });

  test('dew point above the air temperature and invalid input', () => {
    invalid(run('humidity', { known: 'dew', dew: 25 }));
    invalid(run('humidity', { rh: 120 }));
  });
});

describe('u-value', () => {
  test('300 mm block (λ 0.16) + 160 mm EPS (λ 0.037): U ≈ 0.157', () => {
    const result = run('u-value').values;
    near(result.r, 0.3 / 0.16 + 0.16 / 0.037, 1e-12);
    near(result.u, 1 / (0.13 + result.r + 0.04), 1e-12);
    assert.match(result.rating.cs, /doporučenou/);
  });

  test('uninsulated brick wall fails the requirement', () => {
    const result = run('u-value', { layers: [{ thickness: 450, lambda: 0.8 }] }).values;
    assert.ok(result.u > 0.3);
    assert.match(result.rating.en, /fails/);
  });

  test('invalid input', () => {
    invalid(run('u-value', { layers: [{ lambda: 0 }] }));
    invalid(run('u-value', { element: 'window' }));
  });
});

describe('surface-condensation', () => {
  test('old window U 1.4 at −12 °C condenses at 21 °C / 50 %', () => {
    const result = run('surface-condensation').values;
    near(result.surface, 21 - 1.4 * 0.25 * 33, 1e-12);
    assert.equal(result.verdict.en, 'water condenses on the surface');
  });

  test('a well insulated wall stays dry; mould limit is above the dew point', () => {
    const wall = run('surface-condensation', { u: 0.2 }).values;
    assert.equal(wall.verdict.en, 'no condensation or mould');
    assert.ok(wall.mouldLimit > wall.dewPoint);
    near(wall.fRsi, 1 - 0.2 * 0.25, 1e-12);
  });

  test('warmer outside and invalid input', () => {
    invalid(run('surface-condensation', { outside: 25 }));
    invalid(run('surface-condensation', { rh: 0 }));
  });
});

describe('room-climate', () => {
  test('20 m², 2.6 m, insulated older house: 1.56 kW heating', () => {
    near(run('room-climate').values.heating, 52 * 30 / 1000, 1e-12);
  });

  test('cooling adds people and appliances; 1 kW ≈ 3412 BTU/h', () => {
    const result = run('room-climate').values;
    near(result.cooling, (20 * 90 + 200 + 200) / 1000, 1e-12);
    near(result.coolingBtu / result.cooling, 3412.14, 0.01);
  });

  test('invalid input', () => {
    invalid(run('room-climate', { height: 0.5 }));
    invalid(run('room-climate', { building: 'igloo' }));
  });
});

describe('three-phase', () => {
  test('11 kW at 400 V and cos φ 0.85: 18.7 A per line', () => {
    const result = run('three-phase').values;
    near(result.current, 11000 / (Math.sqrt(3) * 400 * 0.85), 1e-9);
    near(result.apparent, 11 / 0.85, 1e-12);
  });

  test('power from current; single phase', () => {
    near(run('three-phase', { find: 'power', current: 16, cosphi: 1 }).values.power, Math.sqrt(3) * 400 * 16 / 1000, 1e-12);
    near(run('three-phase', { system: 'single', voltage: 230, power: 2.3, cosphi: 1 }).values.current, 10, 1e-12);
  });

  test('resistive load has no reactive power; invalid input', () => {
    near(run('three-phase', { cosphi: 1 }).values.reactive, 0, 1e-9);
    invalid(run('three-phase', { cosphi: 0 }));
  });
});

describe('power-factor', () => {
  test('50 kW from 0.75 to 0.95: 27.7 kvar', () => {
    const result = run('power-factor').values;
    near(result.kvar, 50 * (Math.tan(Math.acos(0.75)) - Math.tan(Math.acos(0.95))), 1e-9);
    near(result.currentReduction, (1 - 0.75 / 0.95) * 100, 1e-9);
  });

  test('star needs three times the capacitance of delta', () => {
    const result = run('power-factor').values;
    near(result.starMicrofarad / result.deltaMicrofarad, 3, 1e-12);
  });

  test('target not higher and invalid input', () => {
    invalid(run('power-factor', { target: 0.7 }));
    invalid(run('power-factor', { current: 1.2 }));
  });
});

describe('circuit-breaker', () => {
  test('3 kW at 230 V: 13 A → 16 A breaker, with a safety reminder', () => {
    const result = run('circuit-breaker');
    near(result.values.current, 3000 / 230, 1e-12);
    assert.equal(result.values.breaker, 16);
    assert.match(result.warnings[0].cs, /ČSN 33 2000-4-43/);
  });

  test('three-phase 11 kW: 15.9 A → 16 A; diversity lowers the current', () => {
    assert.equal(run('circuit-breaker', { system: 'three', power: 11000 }).values.breaker, 16);
    near(run('circuit-breaker', { simultaneity: 50 }).values.current, 1500 / 230, 1e-12);
  });

  test('beyond 125 A and invalid input', () => {
    invalid(run('circuit-breaker', { power: 100000 }));
    invalid(run('circuit-breaker', { cosphi: 0 }));
  });
});
