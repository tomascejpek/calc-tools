import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, getTool } from '../calc_tools/static/calc_tools/index.js';
import { windChill } from '../calc_tools/static/calc_tools/tools/environment/wind-chill.js';
import { heatIndexF } from '../calc_tools/static/calc_tools/tools/environment/heat-index.js';
import { seaLevelPressure } from '../calc_tools/static/calc_tools/tools/environment/sea-level-pressure.js';
import { altitudeAtPressure, boilingPoint, pressureAtAltitude } from '../calc_tools/static/calc_tools/tools/environment/altitude-boiling.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

describe('wind-chill', () => {
  test('Environment Canada table: −10 °C at 20 km/h → −18 °C; −20 °C at 40 km/h → −34 °C', () => {
    near(windChill(-10, 20), -17.9, 0.1);
    near(windChill(-20, 40), -34, 0.5);
  });

  test('risk levels follow the wind chill', () => {
    assert.equal(run('wind-chill').values.risk.en, 'moderate, cover face and hands');
    assert.match(run('wind-chill', { temperature: -30, wind: 50 }).values.risk.en, /high/);
  });

  test('out of range and invalid input', () => {
    invalid(run('wind-chill', { temperature: 20 }));
    invalid(run('wind-chill', { wind: 2 }));
  });
});

describe('heat-index', () => {
  test('NWS table: 90 °F at 60 % → 100 °F; 100 °F at 50 % → 118 °F', () => {
    near(heatIndexF(90, 60), 100, 1);
    near(heatIndexF(100, 50), 118, 1);
  });

  test('mild conditions use the simple formula close to the air temperature', () => {
    const mild = run('heat-index', { temperature: 22, rh: 50 }).values;
    near(mild.heatIndex, 22, 1);
    assert.equal(mild.risk.en, 'no special risk');
    assert.match(run('heat-index', { temperature: 40, rh: 60 }).values.risk.en, /danger/);
  });

  test('invalid input', () => {
    invalid(run('heat-index', { temperature: 10 }));
    invalid(run('heat-index', { rh: 120 }));
  });
});

describe('sea-level-pressure', () => {
  test('965 hPa at 400 m and 15 °C ≈ 1011.7 hPa at sea level', () => {
    const result = run('sea-level-pressure').values;
    near(result.sea, 1011.7, 0.2);
    near(result.difference, result.sea - 965, 1e-12);
  });

  test('round trip and sea level itself', () => {
    const back = run('sea-level-pressure', { find: 'station', pressure: 1011.66189744615 }).values;
    near(back.station, 965, 1e-9);
    near(seaLevelPressure(1013, 0, 15), 1013, 1e-12);
  });

  test('invalid input', () => {
    invalid(run('sea-level-pressure', { pressure: 100 }));
    invalid(run('sea-level-pressure', { find: 'moon' }));
  });
});

describe('altitude-boiling', () => {
  test('ISA: 898.75 hPa at 1000 m, 226.3 hPa at 11 km; inverse', () => {
    near(pressureAtAltitude(1000), 898.75, 0.01);
    near(pressureAtAltitude(11000), 226.32, 0.05);
    near(altitudeAtPressure(pressureAtAltitude(2500)), 2500, 1e-6);
  });

  test('boiling point by IAPWS-IF97: 99.97 °C at 1 atm, 120.21 °C at 2 bar, ~94.6 °C at 1603 m', () => {
    near(boilingPoint(1013.25), 99.974, 0.001);
    near(boilingPoint(2000), 120.21, 0.01);
    near(run('altitude-boiling', { altitude: 1603 }).values.boiling, 94.64, 0.05);
    near(run('altitude-boiling', { known: 'pressure', pressure: 1013.25 }).values.altitude, 0, 1e-9);
  });

  test('above the troposphere and invalid input', () => {
    invalid(run('altitude-boiling', { known: 'pressure', pressure: 221 }));
    invalid(run('altitude-boiling', { altitude: 12000 }));
    invalid(run('altitude-boiling', { known: 'boiling' }));
  });
});

describe('carbon-footprint', () => {
  test('3000 kWh at 0.45 kg/kWh = 1.35 t CO₂', () => {
    const result = run('carbon-footprint').values;
    assert.equal(result.total, 1350);
    near(result.tonnes, 1.35, 1e-12);
  });

  test('1000 l of petrol and a 2000 km flight', () => {
    const result = run('carbon-footprint', { items: [{ activity: 'petrol', amount: 1000 }, { activity: 'flight', amount: 2000 }] }).values;
    assert.deepEqual(result.items, [2310, 300]);
    assert.equal(result.total, 2610);
    assert.equal(run('carbon-footprint', { electricity: 0 }).values.total, 0, 'renewable electricity');
  });

  test('invalid input', () => {
    invalid(run('carbon-footprint', { items: [{ activity: 'cows' }] }));
    invalid(run('carbon-footprint', { items: [{ amount: -1 }] }));
    invalid(run('carbon-footprint', { items: [] }));
  });
});
