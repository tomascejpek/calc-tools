import { test } from 'node:test';
import assert from 'node:assert/strict';

import { convert, tools } from '../calc_tools/static/calc_tools/index.js';
import { parseNumber, platoToSg, sgToPlato } from '../calc_tools/static/calc_tools/core/units.js';
import gravity from '../calc_tools/static/calc_tools/tools/units/gravity.js';
import beerColor from '../calc_tools/static/calc_tools/tools/units/beer-color.js';
import temperature from '../calc_tools/static/calc_tools/tools/units/temperature.js';
import volume from '../calc_tools/static/calc_tools/tools/units/volume.js';
import mass from '../calc_tools/static/calc_tools/tools/units/mass.js';
import pressure from '../calc_tools/static/calc_tools/tools/units/pressure.js';
import co2 from '../calc_tools/static/calc_tools/tools/units/co2.js';
import abvAbw from '../calc_tools/static/calc_tools/tools/units/abv-abw.js';
import { invalid, near } from './helpers.js';

test('parseNumber accepts a decimal comma and rejects garbage', () => {
  assert.equal(parseNumber('1,048'), 1.048);
  assert.equal(parseNumber(' 12.5 '), 12.5);
  assert.equal(parseNumber(3), 3);
  assert.equal(parseNumber('abc'), null);
  assert.equal(parseNumber(''), null);
  assert.equal(parseNumber(NaN), null);
});

test('gravity: values from the ASBC extract table', () => {
  // ASBC table: 10 °P = 1.04003, 12 °P = 1.04837, 20 °P = 1.08287 SG
  near(platoToSg(10), 1.04003, 0.0002);
  near(platoToSg(12), 1.04837, 0.0002);
  near(platoToSg(20), 1.08287, 0.0002);
  near(sgToPlato(1.048), 11.9, 0.05);
  const result = convert(gravity, '1,048', 'sg');
  near(result.values.plato, 11.9, 0.05);
  assert.equal(result.values.plato, result.values.brix);
  near(convert(gravity, 0, 'plato').values.sg, 1, 0.0001);
});

test('gravity: out of range gives null and a warning', () => {
  invalid(convert(gravity, 1.5, 'sg'));
  invalid(convert(gravity, 'x', 'plato'));
  invalid(convert(gravity, 1.05, 'unknown'));
});

test('beer colour: EBC = SRM × 1.97, SRM = 1.3546 × °L − 0.76', () => {
  near(convert(beerColor, 10, 'srm').values.ebc, 19.7, 1e-9);
  near(convert(beerColor, 2, 'lovibond').values.srm, 1.9492, 1e-4);
  near(convert(beerColor, 39.4, 'ebc').values.srm, 20, 1e-9);
  invalid(convert(beerColor, -1, 'ebc'));
});

test('temperature: fixed points', () => {
  const freezing = convert(temperature, 0, 'c').values;
  near(freezing.f, 32, 1e-9);
  near(freezing.k, 273.15, 1e-9);
  near(convert(temperature, 212, 'f').values.c, 100, 1e-9);
  near(convert(temperature, -40, 'c').values.f, -40, 1e-9);
  invalid(convert(temperature, -1, 'k'));
});

test('volume: NIST definitions', () => {
  near(convert(volume, 1, 'us-gal').values.l, 3.785411784, 1e-12);
  near(convert(volume, 1, 'us-bbl').values.l, 117.347765304, 1e-9);
  near(convert(volume, 1, 'uk-pint').values.ml, 568.26125, 1e-9);
  near(convert(volume, 1, 'us-gal').values['us-floz'], 128, 1e-9);
  near(convert(volume, 1, 'hl').values.l, 100, 1e-12);
  invalid(convert(volume, -5, 'l'));
});

test('mass: avoirdupois pound and ounce', () => {
  near(convert(mass, 1, 'lb').values.g, 453.59237, 1e-9);
  near(convert(mass, 16, 'oz').values.lb, 1, 1e-12);
  near(convert(mass, 1, 'kg').values.lb, 2.20462, 1e-5);
});

test('pressure: standard atmosphere and bar', () => {
  const atm = convert(pressure, 1, 'atm').values;
  near(atm.bar, 1.01325, 1e-9);
  near(atm.psi, 14.6959, 1e-4);
  near(convert(pressure, 1, 'bar').values.psi, 14.5038, 1e-4);
});

test('co2: 2.5 volumes ≈ 4.9 g/l', () => {
  near(convert(co2, 2.5, 'volumes').values['g-l'], 4.94, 0.01);
  near(convert(co2, '5', 'g-l').values.volumes, 2.53, 0.01);
  assert.equal(convert(co2, 0, 'volumes').values['g-l'], 0);
  invalid(convert(co2, 50, 'g-l'));
});

test('abv-abw: Hall relation with and without beer gravity', () => {
  // 5 % ABV at FG 1.010: ABW = 0.79336 × 5 / 1.010
  near(convert(abvAbw, 5, 'abv').values.abw, 3.9275, 1e-4);
  near(convert(abvAbw, 5, 'abv', { sg: '1,000' }).values.abw, 3.9668, 1e-4);
  near(convert(abvAbw, 4, 'abw', { sg: 1.02 }).values.abv, 5.1427, 1e-4);
  invalid(convert(abvAbw, 5, 'abv', { sg: 2 }));
  invalid(convert(abvAbw, 101, 'abv'));
});

test('every converter round-trips all units', () => {
  for (const tool of tools.filter((candidate) => candidate.kind === 'converter')) {
    for (const unit of tool.units) {
      const low = unit.min ?? -100;
      const high = unit.max ?? low + 1000;
      for (const share of [0.1, 0.5, 0.9]) {
        const value = low + (high - low) * share;
        const base = tool.toBase(value, unit.id, {});
        near(tool.fromBase(base, unit.id, {}), value, Math.abs(value) * 1e-9 + 1e-9, `${tool.id}/${unit.id} at ${value}`);
      }
    }
  }
});
