import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, convert, getTool } from '../calc_tools/static/calc_tools/index.js';
import { SI_PREFIXES, powerOfTen, prefixedRows } from '../calc_tools/static/calc_tools/core/converter.js';
import { coneSolidAngle } from '../calc_tools/static/calc_tools/tools/units/photometry.js';
import { invalid, near } from './helpers.js';

/**
 * Converts and returns the values, asserting there are no warnings.
 * @param {string} id
 * @param {unknown} value
 * @param {string} unit
 * @param {Record<string, any>} [params]
 */
function values(id, value, unit, params) {
  const result = convert(getTool(id), value, unit, params);
  assert.deepEqual(result.warnings, [], `${id} ${value} ${unit}`);
  return /** @type {Record<string, number>} */ (result.values);
}

/**
 * @param {number} actual
 * @param {number} expected
 * @param {number} [relative]
 */
function close(actual, expected, relative = 1e-6) {
  near(actual, expected, Math.abs(expected) * relative);
}

describe('core converter helpers', () => {
  test('powers of ten are exact and prefixes span quecto to quetta', () => {
    assert.equal(powerOfTen(-3), 0.001);
    assert.equal(powerOfTen(30), 1e30);
    assert.equal(SI_PREFIXES.length, 25);
    assert.deepEqual(prefixedRows('V', ['µ', 'k']).map((row) => row[0]), ['uV', 'kV']);
    assert.throws(() => prefixedRows('V', ['x']));
  });
});

describe('si-prefix', () => {
  test('1 k is 1000 without a prefix and 0.001 M', () => {
    const result = values('si-prefix', 1, 'k');
    assert.equal(result.base, 1000);
    close(result.M, 0.001);
    close(result.u, 1e9);
  });

  test('quetta and quecto', () => {
    close(values('si-prefix', 1, 'Q').base, 1e30);
    close(values('si-prefix', 1, 'q').base, 1e-30);
    close(values('si-prefix', 1, 'Q').q, 1e60);
  });

  test('zero, negative and invalid', () => {
    assert.equal(values('si-prefix', 0, 'G').base, 0);
    close(values('si-prefix', -2, 'm').base, -0.002);
    invalid(convert(getTool('si-prefix'), 'kilo', 'k'));
    invalid(convert(getTool('si-prefix'), 1, 'K'));
  });
});

describe('length', () => {
  test('inch, foot, mile and nautical mile', () => {
    close(values('length', 1, 'in').mm, 25.4);
    close(values('length', 1, 'mi').km, 1.609344);
    close(values('length', 1, 'nmi').m, 1852);
    close(values('length', 1, 'yd').ft, 3);
  });

  test('metric steps', () => {
    const result = values('length', '1,5', 'km');
    close(result.m, 1500);
    close(result.um, 1.5e9);
  });

  test('zero and negative length', () => {
    assert.equal(values('length', 0, 'ft').m, 0);
    invalid(convert(getTool('length'), -1, 'm'));
  });
});

describe('area', () => {
  test('hectare, are and acre', () => {
    close(values('area', 1, 'ha').m2, 10000);
    close(values('area', 1, 'ha').a, 100);
    close(values('area', 1, 'acre').m2, 4046.8564224);
    close(values('area', 1, 'mi2').acre, 640);
  });

  test('square feet and inches', () => {
    close(values('area', 1, 'ft2').in2, 144);
    close(values('area', 1, 'm2').ft2, 10.7639104, 1e-8);
  });

  test('zero and invalid', () => {
    assert.equal(values('area', 0, 'km2').ha, 0);
    invalid(convert(getTool('area'), -5, 'ha'));
  });
});

describe('time', () => {
  test('hours, days and weeks', () => {
    close(values('time', 1, 'd').h, 24);
    close(values('time', 1, 'wk').min, 10080);
    close(values('time', 1, 'h').ms, 3.6e6);
  });

  test('a Gregorian year has 365.2425 days and 12 months', () => {
    close(values('time', 1, 'yr').d, 365.2425);
    close(values('time', 1, 'yr').mo, 12);
  });

  test('zero and invalid', () => {
    assert.equal(values('time', 0, 's').yr, 0);
    invalid(convert(getTool('time'), -1, 's'));
    invalid(convert(getTool('time'), '1:30', 'h'));
  });
});

describe('speed', () => {
  test('100 km/h = 27.78 m/s = 62.14 mph = 54 kn', () => {
    const result = values('speed', 100, 'km-h');
    close(result['m-s'], 27.7777778);
    close(result.mph, 62.1371192);
    close(result.kn, 53.9956803);
  });

  test('1 knot is one nautical mile per hour', () => {
    close(values('speed', 1, 'kn')['km-h'], 1.852);
  });

  test('zero and invalid', () => {
    assert.equal(values('speed', 0, 'mph')['km-h'], 0);
    invalid(convert(getTool('speed'), -10, 'km-h'));
  });
});

describe('acceleration', () => {
  test('1 g = 9.80665 m/s² = 32.174 ft/s²', () => {
    close(values('acceleration', 1, 'g')['m-s2'], 9.80665);
    close(values('acceleration', 1, 'g')['ft-s2'], 32.1740486);
  });

  test('negative values mean deceleration', () => {
    close(values('acceleration', -9.80665, 'm-s2').g, -1);
  });

  test('zero and invalid', () => {
    assert.equal(values('acceleration', 0, 'gal').g, 0);
    invalid(convert(getTool('acceleration'), 'fast', 'g'));
  });
});

describe('force', () => {
  test('1 kp = 9.80665 N, 1 lbf = 4.448 N', () => {
    close(values('force', 1, 'kp').N, 9.80665);
    close(values('force', 1, 'lbf').N, 4.4482216152605);
    close(values('force', 1, 'N').dyn, 1e5);
  });

  test('negative force is allowed (direction)', () => {
    close(values('force', -1, 'kN').N, -1000);
  });

  test('zero and invalid', () => {
    assert.equal(values('force', 0, 'lbf').kp, 0);
    invalid(convert(getTool('force'), '10 N', 'N'));
  });
});

describe('pressure – new units', () => {
  test('1 atm = 760 mmHg = 760 Torr = 101 325 Pa', () => {
    const result = values('pressure', 1, 'atm');
    close(result.pa, 101325);
    close(result.mmhg, 760, 1e-5);
    close(result.torr, 760, 1e-12);
    close(result.hpa, 1013.25);
  });

  test('technical atmosphere and water column', () => {
    close(values('pressure', 1, 'at').mh2o, 10);
    close(values('pressure', 1, 'at').kpa, 98.0665);
    close(values('pressure', 1, 'inhg').mmhg, 25.4, 1e-4);
  });

  test('vacuum limit applies to every unit', () => {
    close(values('pressure', -760, 'torr').atm, -1);
    invalid(convert(getTool('pressure'), -800, 'mmhg'));
    invalid(convert(getTool('pressure'), -102000, 'pa'));
  });
});

describe('energy', () => {
  test('1 kWh = 3.6 MJ = 3412 BTU = 860 kcal', () => {
    const result = values('energy', 1, 'kWh');
    close(result.MJ, 3.6);
    close(result.btu, 3412.14163);
    close(result.kcal, 860.420650);
  });

  test('electronvolt and calorie', () => {
    close(values('energy', 1, 'eV').J, 1.602176634e-19);
    close(values('energy', 1, 'kcal').kJ, 4.184);
    close(values('energy', 1, 'ftlbf').J, 1.3558179483);
  });

  test('zero and invalid', () => {
    assert.equal(values('energy', 0, 'J').eV, 0);
    invalid(convert(getTool('energy'), -1, 'J'));
  });
});

describe('power', () => {
  test('metric and mechanical horsepower', () => {
    close(values('power', 1, 'k').W, 735.49875);
    close(values('power', 1, 'hp').W, 745.69987158);
    close(values('power', 100, 'kW').k, 135.962162);
  });

  test('BTU per hour', () => {
    close(values('power', 1, 'kW')['btu-h'], 3412.14163);
  });

  test('zero and invalid', () => {
    assert.equal(values('power', 0, 'hp').W, 0);
    invalid(convert(getTool('power'), -5, 'W'));
  });
});

describe('torque', () => {
  test('1 lbf·ft = 1.3558 N·m, 1 kp·m = 9.80665 N·m', () => {
    close(values('torque', 1, 'lbfft').Nm, 1.3558179483);
    close(values('torque', 1, 'kpm').Nm, 9.80665);
    close(values('torque', 1, 'lbfft').lbfin, 12);
  });

  test('negative torque (direction)', () => {
    close(values('torque', -10, 'Nm').Ncm, -1000);
  });

  test('zero and invalid', () => {
    assert.equal(values('torque', 0, 'Nm').lbfft, 0);
    invalid(convert(getTool('torque'), 'x', 'Nm'));
  });
});

describe('density', () => {
  test('water: 1 g/cm³ = 1000 kg/m³ = 62.43 lb/ft³ = 8.345 lb/US gal', () => {
    const result = values('density', 1, 'g-cm3');
    close(result['kg-m3'], 1000);
    close(result['lb-ft3'], 62.4279606);
    close(result['lb-usgal'], 8.34540445);
  });

  test('t/m³ equals g/cm³', () => {
    close(values('density', 7.85, 't-m3')['g-cm3'], 7.85);
  });

  test('zero and invalid', () => {
    assert.equal(values('density', 0, 'kg-m3')['lb-in3'], 0);
    invalid(convert(getTool('density'), -1, 'g-cm3'));
  });
});

describe('concentration', () => {
  test('dilute aqueous solution: 1 mg/l = 1 ppm, 1 % w/w = 10 g/l', () => {
    const result = values('concentration', 10, 'g-l');
    close(result.ww, 1);
    close(result.ppm, 10000);
    close(result.wv, 1);
  });

  test('molarity and volume percent with the substance properties', () => {
    // NaCl 58.44 g/mol: 1 mol/l = 58.44 g/l; ethanol 0.789 kg/l: 10 % v/v = 78.9 g/l
    const salt = values('concentration', 1, 'mol-l', { molarMass: 58.44 });
    close(salt['g-l'], 58.44);
    close(salt['mmol-l'], 1000);
    close(values('concentration', 10, 'vv', { soluteDensity: 0.789 })['g-l'], 78.9);
    // A denser solution has fewer ppm for the same mg/l
    close(values('concentration', 1200, 'mg-l', { density: 1.2 }).ppm, 1000);
  });

  test('missing properties leave those units empty; invalid input', () => {
    const result = values('concentration', 1000, 'mg-l');
    assert.equal(result['mol-l'], null);
    assert.equal(result.vv, null);
    invalid(convert(getTool('concentration'), 1, 'mol-l'));
    invalid(convert(getTool('concentration'), 101, 'ww'));
    invalid(convert(getTool('concentration'), 1, 'mg-l', { density: 0 }));
  });
});

describe('temperature – Rankine and Réaumur', () => {
  test('boiling water: 80 °Ré, 671.67 °Ra', () => {
    const result = values('temperature', 100, 'c');
    close(result.re, 80);
    close(result.ra, 671.67);
  });

  test('absolute zero is 0 °Ra', () => {
    near(values('temperature', 0, 'ra').k, 0, 1e-12);
    close(values('temperature', 0, 'ra').f, -459.67);
  });

  test('below absolute zero is rejected', () => {
    invalid(convert(getTool('temperature'), -1, 'ra'));
    invalid(convert(getTool('temperature'), -219, 're'));
  });
});

describe('specific-heat', () => {
  test('water: 1 cal/(g·K) = 4.184 kJ/(kg·K); 1 BTU/(lb·°F) = 4.1868 kJ/(kg·K)', () => {
    close(values('specific-heat', 1, 'cal-gK')['kJ-kgK'], 4.184);
    close(values('specific-heat', 1, 'btu-lbF')['J-kgK'], 4186.8);
  });

  test('J/(g·K) equals kJ/(kg·K)', () => {
    close(values('specific-heat', 0.9, 'J-gK')['kJ-kgK'], 0.9);
  });

  test('zero and invalid', () => {
    assert.equal(values('specific-heat', 0, 'J-kgK')['cal-gK'], 0);
    invalid(convert(getTool('specific-heat'), -1, 'J-kgK'));
  });
});

describe('thermal-conductivity', () => {
  test('1 BTU/(h·ft·°F) = 1.7307 W/(m·K)', () => {
    close(values('thermal-conductivity', 1, 'btu-hftF')['W-mK'], 1.73073467);
    close(values('thermal-conductivity', 1, 'kcal-hmK')['W-mK'], 1.163);
  });

  test('insulation: 0.04 W/(m·K) ≈ 0.277 BTU·in/(h·ft²·°F)', () => {
    close(values('thermal-conductivity', 0.04, 'W-mK')['btuin-hft2F'], 0.277339, 1e-5);
  });

  test('zero and invalid', () => {
    assert.equal(values('thermal-conductivity', 0, 'W-mK')['btu-hftF'], 0);
    invalid(convert(getTool('thermal-conductivity'), -0.1, 'W-mK'));
  });
});

describe('volume-flow', () => {
  test('1 m³/h = 16.667 l/min = 4.403 US GPM', () => {
    const result = values('volume-flow', 1, 'm3-h');
    close(result['l-min'], 16.6666667);
    close(result.usgpm, 4.40286754);
  });

  test('CFM', () => {
    close(values('volume-flow', 1, 'cfm')['l-min'], 28.316846592);
  });

  test('zero and invalid', () => {
    assert.equal(values('volume-flow', 0, 'l-s')['m3-h'], 0);
    invalid(convert(getTool('volume-flow'), -1, 'l-min'));
  });
});

describe('mass-flow', () => {
  test('1 t/h = 1000 kg/h = 0.2778 kg/s', () => {
    close(values('mass-flow', 1, 't-h')['kg-h'], 1000);
    close(values('mass-flow', 1, 't-h')['kg-s'], 0.277777778);
  });

  test('pounds per hour', () => {
    close(values('mass-flow', 1, 'kg-h')['lb-h'], 2.20462262);
  });

  test('zero and invalid', () => {
    assert.equal(values('mass-flow', 0, 'kg-s')['lb-min'], 0);
    invalid(convert(getTool('mass-flow'), -3, 'kg-h'));
  });
});

for (const [id, cases, zeroUnit, negative] of /** @type {[string, [number, string, string, number][], string, boolean][]} */ ([
  ['voltage', [[230, 'V', 'kV', 0.23], [1, 'MV', 'V', 1e6], [5, 'uV', 'mV', 0.005]], 'V', true],
  ['current', [[250, 'mA', 'A', 0.25], [1, 'A', 'uA', 1e6], [3, 'nA', 'uA', 0.003]], 'A', true],
  ['resistance', [[4.7, 'kΩ', 'Ω', 4700], [1, 'GΩ', 'MΩ', 1000], [50, 'mΩ', 'Ω', 0.05]], 'Ω', false],
  ['capacitance', [[100, 'nF', 'uF', 0.1], [1, 'uF', 'pF', 1e6], [2.2, 'mF', 'F', 0.0022]], 'F', false],
])) {
  describe(id, () => {
    test('SI prefixes', () => {
      for (const [value, from, to, expected] of cases) close(values(id, value, from)[to], expected);
    });

    test(negative ? 'negative values are allowed' : 'negative values are rejected', () => {
      if (negative) close(values(id, -2, cases[0][1])[cases[0][2]], -2 * cases[0][3] / cases[0][0]);
      else invalid(convert(getTool(id), -1, zeroUnit));
    });

    test('zero and invalid', () => {
      assert.equal(Object.values(values(id, 0, zeroUnit)).every((value) => value === 0), true);
      invalid(convert(getTool(id), `12 ${zeroUnit}`, zeroUnit));
      invalid(convert(getTool(id), 1, 'X'));
    });
  });
}

describe('charge', () => {
  test('10 000 mAh at 3.7 V = 37 Wh = 36 000 C', () => {
    const result = values('charge', 10000, 'mAh', { voltage: 3.7 });
    close(result.Wh, 37);
    close(result.C, 36000);
    close(result.Ah, 10);
  });

  test('voltage links Ah and Wh', () => {
    close(values('charge', 1, 'kWh', { voltage: 12 }).Ah, 1000 / 12);
    close(values('charge', 100, 'Ah', { voltage: '12,8' }).Wh, 1280);
  });

  test('zero and invalid', () => {
    assert.equal(values('charge', 0, 'Wh').mAh, 0);
    invalid(convert(getTool('charge'), 1, 'Wh', { voltage: 0 }));
    invalid(convert(getTool('charge'), -1, 'Ah'));
  });
});

describe('illuminance', () => {
  test('1 foot-candle = 10.764 lux', () => {
    close(values('illuminance', 1, 'fc').lx, 10.7639104);
    close(values('illuminance', 1, 'ph').lx, 1e4);
  });

  test('kilolux', () => {
    close(values('illuminance', 100, 'klx').lx, 1e5);
  });

  test('zero and invalid', () => {
    assert.equal(values('illuminance', 0, 'lx').fc, 0);
    invalid(convert(getTool('illuminance'), -1, 'lx'));
  });
});

describe('photometry', () => {
  test('solid angles: sphere 4π, hemisphere 2π', () => {
    close(coneSolidAngle(360), 4 * Math.PI);
    close(coneSolidAngle(180), 2 * Math.PI);
  });

  test('isotropic source: 4π lm per cd; lux falls with the square of distance', () => {
    const result = calculate(getTool('photometry'), { known: 'candela', value: 100, angle: 360, distance: 2 }).values;
    close(result.lumen, 400 * Math.PI);
    close(result.lux, 25);
    const fromLumen = calculate(getTool('photometry'), { known: 'lumen', value: 400 * Math.PI, angle: 360, distance: 2 }).values;
    close(fromLumen.candela, 100);
  });

  test('zero light and invalid input', () => {
    assert.equal(calculate(getTool('photometry'), { value: 0 }).values.lux, 0);
    invalid(calculate(getTool('photometry'), { angle: 0 }));
    invalid(calculate(getTool('photometry'), { known: 'watt' }));
    invalid(calculate(getTool('photometry'), { distance: 0 }));
  });
});

describe('photon', () => {
  test('green light 550 nm: 545 THz, 2.254 eV', () => {
    const result = values('photon', 550, 'nm');
    close(result.thz, 545.077196);
    close(result.ev, 2.25425, 1e-5);
  });

  test('1 eV ↔ 1239.84 nm; 2.4 GHz ↔ 12.5 cm', () => {
    close(values('photon', 1, 'ev').nm, 1239.84198);
    close(values('photon', 2.4, 'ghz').m, 0.124913524);
    close(values('photon', 10000, 'cm-1').um, 1);
  });

  test('zero wavelength cannot be converted; invalid input', () => {
    invalid(convert(getTool('photon'), 0, 'nm'));
    invalid(convert(getTool('photon'), -1, 'ev'));
    invalid(convert(getTool('photon'), 'blue', 'nm'));
  });
});

describe('angle', () => {
  test('right angle: π/2 rad, 100 gon, 1600 mils', () => {
    const result = values('angle', 90, 'deg');
    close(result.rad, Math.PI / 2);
    close(result.grad, 100);
    close(result.mil, 1600);
    close(result.turn, 0.25);
  });

  test('minutes and seconds', () => {
    close(values('angle', 1, 'deg').arcsec, 3600);
    close(values('angle', 1, 'rad').deg, 57.2957795);
  });

  test('zero, negative and invalid', () => {
    assert.equal(values('angle', 0, 'rad').deg, 0);
    close(values('angle', -180, 'deg').turn, -0.5);
    invalid(convert(getTool('angle'), '45°', 'deg'));
  });
});

describe('radioactivity', () => {
  test('1 Ci = 37 GBq', () => {
    close(values('radioactivity', 1, 'Ci').GBq, 37);
    close(values('radioactivity', 1, 'pCi').Bq, 0.037);
  });

  test('disintegrations per minute', () => {
    close(values('radioactivity', 1, 'Bq').dpm, 60);
  });

  test('zero and invalid', () => {
    assert.equal(values('radioactivity', 0, 'Ci').Bq, 0);
    invalid(convert(getTool('radioactivity'), -1, 'Bq'));
  });
});

describe('radiation-dose', () => {
  test('1 Sv = 100 rem; gamma: 1 Gy = 1 Sv', () => {
    const result = values('radiation-dose', 1, 'Sv');
    close(result.rem, 100);
    close(result.Gy, 1);
    close(result.mrem, 1e5);
  });

  test('alpha particles weigh 20 times', () => {
    close(values('radiation-dose', 1, 'mGy', { weighting: 20 }).mSv, 20);
    close(values('radiation-dose', 20, 'mSv', { weighting: 20 }).mGy, 1);
  });

  test('zero and invalid', () => {
    assert.equal(values('radiation-dose', 0, 'Gy').Sv, 0);
    invalid(convert(getTool('radiation-dose'), 1, 'Gy', { weighting: 50 }));
    invalid(convert(getTool('radiation-dose'), -1, 'Sv'));
  });
});

describe('data', () => {
  test('a 1 TB disk is 931.3 GiB', () => {
    close(values('data', 1, 'TB').GiB, 931.322575);
    close(values('data', 1, 'KiB').B, 1024);
    close(values('data', 1, 'GiB').MiB, 1024);
  });

  test('bits and bytes', () => {
    close(values('data', 100, 'Mbit').MB, 12.5);
    close(values('data', 1, 'B').bit, 8);
  });

  test('zero and invalid', () => {
    assert.equal(values('data', 0, 'PB').bit, 0);
    invalid(convert(getTool('data'), -1, 'GB'));
  });
});

describe('fuel-consumption', () => {
  test('6 l/100 km = 16.67 km/l = 39.2 mpg US = 47.1 mpg UK', () => {
    const result = values('fuel-consumption', 6, 'l-100km');
    close(result['km-l'], 16.6666667);
    close(result['mpg-us'], 39.2024306);
    close(result['mpg-uk'], 47.0801736);
  });

  test('reciprocal: 30 mpg US = 7.84 l/100 km', () => {
    close(values('fuel-consumption', 30, 'mpg-us')['l-100km'], 7.84048611);
  });

  test('zero cannot be converted; invalid input', () => {
    invalid(convert(getTool('fuel-consumption'), 0, 'l-100km'));
    invalid(convert(getTool('fuel-consumption'), -6, 'l-100km'));
  });
});

describe('volume and mass – new units', () => {
  test('cubic metre, decilitre, quart and imperial ounce', () => {
    close(values('volume', 1, 'm3').l, 1000);
    close(values('volume', 1, 'l').dl, 10);
    close(values('volume', 1, 'us-gal')['us-qt'], 4);
    close(values('volume', 1, 'uk-pint')['uk-floz'], 20);
  });

  test('tonne, decagram, carat, stone and tons', () => {
    close(values('mass', 1, 't').kg, 1000);
    close(values('mass', 1, 'dag').g, 10);
    close(values('mass', 1, 'ct').mg, 200);
    close(values('mass', 1, 'st').lb, 14);
    close(values('mass', 1, 'us-ton').lb, 2000);
    close(values('mass', 1, 'uk-ton').lb, 2240);
    close(values('mass', 1, 'lb').gr, 7000);
  });

  test('zero and invalid', () => {
    assert.equal(values('volume', 0, 'ft3').l, 0);
    assert.equal(values('mass', 0, 'ug').t, 0);
    invalid(convert(getTool('mass'), -1, 't'));
    invalid(convert(getTool('volume'), -1, 'm3'));
  });
});
