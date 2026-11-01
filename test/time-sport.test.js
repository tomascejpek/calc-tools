import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { calculate, getTool } from '../calc_tools/static/calc_tools/index.js';
import { readInputs } from '../calc_tools/static/calc_tools/core/tool.js';
import {
  addMonths, calendarDifference, czechHolidays, dayNumber, durationText, easterSunday, isoText, isoWeek,
  parseDate, parseDuration, weekday, workdaysBetween,
} from '../calc_tools/static/calc_tools/core/time.js';
import { zoneOffset } from '../calc_tools/static/calc_tools/tools/time/time-zones.js';
import { riegel } from '../calc_tools/static/calc_tools/tools/sport/race-predictor.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

const date = (/** @type {string} */ text) => /** @type {import('../calc_tools/static/calc_tools/core/time.js').CalendarDate} */ (parseDate(text));

describe('core time', () => {
  test('dates: ISO and Czech forms, leap years, impossible dates', () => {
    assert.deepEqual(parseDate('31. 10. 2026'), { year: 2026, month: 10, day: 31 });
    assert.deepEqual(parseDate('2024-02-29'), { year: 2024, month: 2, day: 29 });
    for (const bad of ['2026-02-29', '2026-13-01', '2026-04-31', '0000-01-01', '31/10/2026', '1900-02-29']) assert.equal(parseDate(bad), null, bad);
    assert.equal(weekday(date('2026-10-31')), 6);
    assert.equal(dayNumber(date('1970-01-01')), 0);
  });

  test('Easter and Czech holidays: 2026 has 250 working days', () => {
    assert.equal(isoText(easterSunday(2026)), '2026-04-05');
    assert.equal(isoText(easterSunday(2000)), '2000-04-23');
    assert.equal(isoText(easterSunday(2019)), '2019-04-21');
    assert.equal(czechHolidays(2026).size, 13);
    assert.equal(czechHolidays(2015).size, 12, 'no Good Friday before 2016');
    assert.equal(workdaysBetween(dayNumber(date('2025-12-31')), dayNumber(date('2026-12-31')), true), 250);
  });

  test('ISO weeks, month arithmetic and durations', () => {
    assert.deepEqual(isoWeek(date('2021-01-03')), { week: 53, year: 2020 });
    assert.deepEqual(isoWeek(date('2024-12-30')), { week: 1, year: 2025 });
    assert.deepEqual(addMonths(date('2026-01-31'), 1), { year: 2026, month: 2, day: 28 });
    assert.deepEqual(calendarDifference(date('2000-01-31'), date('2000-03-01')), { years: 0, months: 1, days: 1 });
    assert.equal(parseDuration('3:45:20'), 13520);
    assert.equal(parseDuration('5,5'), 330);
    assert.equal(parseDuration('1:75'), null);
    assert.equal(durationText(3599.6), '1:00:00');
  });

  test('the date input type', () => {
    const inputs = [{ id: 'd', type: 'date', default: '2026-01-01', label: { cs: 'D', en: 'D' } }];
    assert.equal(readInputs(inputs, {}).values.d, '2026-01-01');
    assert.equal(readInputs(inputs, { d: '5. 3. 2026' }).values.d, '2026-03-05');
    assert.equal(readInputs(inputs, { d: '2026-02-30' }).ok, false);
    assert.equal(readInputs(inputs, { d: 20260101 }).ok, false);
    assert.equal(readInputs(inputs, { d: 'x'.repeat(1000) }).ok, false);
  });
});

describe('date-difference', () => {
  test('2026: 364 days, 52 weeks, 250 working days', () => {
    const result = run('date-difference').values;
    assert.equal(result.days, 364);
    assert.equal(result.weeks.cs, '52 týd. 0 d.');
    // 1 January is excluded as the start day, but it is a holiday anyway
    assert.equal(result.workdays, 250);
  });

  test('calendar difference and backwards dates', () => {
    assert.equal(run('date-difference', { from: '1990-05-15', to: '2026-10-31' }).values.calendar.en, '36 y 5 m 16 d');
    const back = run('date-difference', { from: '2026-03-01', to: '2026-02-01' }).values;
    assert.equal(back.days, -28);
    assert.equal(back.calendar.en, '−0 y 1 m 0 d');
    assert.equal(run('date-difference', { holidays: 'none' }).values.workdays, 260);
  });

  test('same day and invalid input', () => {
    assert.equal(run('date-difference', { to: '2026-01-01' }).values.days, 0);
    invalid(run('date-difference', { from: '2026-02-30' }));
  });
});

describe('date-add', () => {
  test('31. 10. 2026 + 30 days = 30. 11. 2026 (Monday)', () => {
    assert.equal(run('date-add').values.result.cs, '30. 11. 2026 (pondělí)');
  });

  test('working days skip weekends and holidays', () => {
    // Friday 23 Dec 2026 + 1 working day skips 24–27 Dec → Monday 28 Dec
    assert.equal(run('date-add', { date: '2026-12-23', count: 1, unit: 'workdays' }).values.result.en, '2026-12-28 (Monday)');
    assert.equal(run('date-add', { date: '2026-12-23', count: 1, unit: 'workdays', holidays: 'none' }).values.result.en, '2026-12-24 (Thursday)');
    assert.equal(run('date-add', { date: '2026-01-05', count: -1, unit: 'workdays' }).values.result.en, '2026-01-02 (Friday)');
    assert.equal(run('date-add', { count: 2, unit: 'weeks' }).values.days, 14);
  });

  test('zero, fractions and out of range', () => {
    assert.equal(run('date-add', { count: 0 }).values.result.en, '2026-10-31 (Saturday)');
    invalid(run('date-add', { count: 1.5 }));
    invalid(run('date-add', { date: '9999-12-31', count: 1 }));
  });
});

describe('week-number', () => {
  test('31. 10. 2026: week 44, day 304, Saturday', () => {
    const result = run('week-number').values;
    assert.equal(result.week, 44);
    assert.equal(result.dayOfYear, 304);
    assert.equal(result.weekday.cs, 'sobota');
    assert.equal(result.quarter, 4);
  });

  test('1 January may belong to the previous year\'s week; leap years', () => {
    const result = run('week-number', { date: '2021-01-01' }).values;
    assert.equal(result.week, 53);
    assert.equal(result.weekYear, 2020);
    assert.equal(run('week-number', { date: '2024-02-10' }).values.monthDays, 29);
    assert.equal(run('week-number', { date: '2024-12-31' }).values.dayOfYear, 366);
  });

  test('invalid input', () => {
    invalid(run('week-number', { date: 'yesterday' }));
  });
});

describe('age', () => {
  test('born 15. 5. 1990, on 31. 10. 2026: 36 years, birthday in 196 days', () => {
    const result = run('age').values;
    assert.equal(result.years, 36);
    assert.equal(result.daysToBirthday, 196);
    assert.equal(result.bornOn.en, 'Tuesday');
  });

  test('on the birthday and for 29 February', () => {
    const today = run('age', { on: '2026-05-15' }).values;
    assert.equal(today.daysToBirthday, 0);
    assert.equal(today.years, 36);
    assert.equal(run('age', { birth: '2000-02-29', on: '2025-02-28' }).values.years, 25);
  });

  test('birth after the date and invalid input', () => {
    invalid(run('age', { birth: '2030-01-01' }));
    invalid(run('age', { birth: '1990-02-30' }));
  });
});

describe('time-zones', () => {
  test('31 Oct 2026 18:00 Prague is 13:00 in New York (Europe already on winter time)', () => {
    const result = run('time-zones').values;
    assert.equal(result.result.cs, '13:00, 31. 10. 2026');
    assert.equal(result.difference, -5);
  });

  test('summer offsets, half-hour zones and day changes', () => {
    assert.equal(zoneOffset('Europe/Prague', Date.UTC(2026, 6, 1)), 120);
    assert.equal(run('time-zones', { date: '2026-07-01', time: '12:00', to: 'Asia/Kolkata' }).values.result.en, '15:30, 2026-07-01');
    assert.match(run('time-zones', { time: '20:00', to: 'Asia/Tokyo' }).values.result.en, /next day/);
  });

  test('time skipped by the change to summer time and invalid input', () => {
    assert.equal(run('time-zones', { date: '2026-03-29', time: '02:30' }).warnings.length, 1);
    invalid(run('time-zones', { time: '25:00' }));
    invalid(run('time-zones', { to: 'Mars/Olympus' }));
  });
});

describe('julian-date', () => {
  test('J2000.0: 1 January 2000 12:00 UTC = JD 2451545.0', () => {
    const result = run('julian-date').values;
    assert.equal(result.jd, 2451545);
    assert.equal(result.mjd, 51544.5);
  });

  test('back from JD; Unix epoch', () => {
    assert.equal(run('julian-date', { mode: 'fromJd', jd: 2440587.5 }).values.date.en, '1970-01-01 00:00:00 UTC');
    assert.equal(run('julian-date', { date: '1970-01-01', time: '00:00' }).values.jd, 2440587.5);
  });

  test('invalid input', () => {
    invalid(run('julian-date', { time: '12:60' }));
    invalid(run('julian-date', { mode: 'fromJd', jd: 0 }));
  });
});

describe('average-speed', () => {
  test('205 km in 2:15:00 = 91.1 km/h; at 90 km/h it takes 2:16:40', () => {
    near(run('average-speed').values.speed, 205 / 2.25, 1e-12);
    assert.equal(run('average-speed', { find: 'time' }).values.time.cs, '2:16:40');
  });

  test('distance from speed and time; minutes as a number', () => {
    near(run('average-speed', { find: 'distance', speed: 60, time: '90' }).values.distance, 90, 1e-12);
  });

  test('zero time and invalid input', () => {
    invalid(run('average-speed', { time: '0:00' }));
    invalid(run('average-speed', { time: '2h15' }));
  });
});

describe('pace', () => {
  test('5:30 min/km = 10.91 km/h, marathon 3:52:04', () => {
    const result = run('pace').values;
    near(result.speed, 3600 / 330, 1e-12);
    assert.equal(result.marathon.en, '3:52:04');
    assert.equal(result.paceMile.en, '8:51');
  });

  test('from speed and from pace per mile', () => {
    assert.equal(run('pace', { known: 'speed', speed: 12 }).values.paceKm.en, '5:00');
    assert.equal(run('pace', { known: 'paceMile', pace: '8:00' }).values.paceKm.en, '4:58');
  });

  test('zero pace and invalid input', () => {
    invalid(run('pace', { pace: '0:00' }));
    invalid(run('pace', { pace: '5:75' }));
  });
});

describe('trip-cost', () => {
  test('300 km there and back at 6.5 l/100 km and 38 per litre: 39 l, 1482', () => {
    const result = run('trip-cost').values;
    near(result.energy, 39, 1e-12);
    near(result.cost, 1482, 1e-9);
    near(result.perPerson, 741, 1e-9);
    near(result.co2, 39 * 2.31, 1e-9);
  });

  test('electric car has no fuel CO₂; tolls count', () => {
    const ev = run('trip-cost', { fuel: 'electric', consumption: 18, price: 6, tolls: 440 }).values;
    near(ev.cost, 600 * 0.18 * 6 + 440, 1e-9);
    assert.equal(ev.co2, 0);
  });

  test('zero distance and invalid input', () => {
    assert.equal(run('trip-cost', { distance: 0 }).values.perKm, 0);
    invalid(run('trip-cost', { people: 0 }));
  });
});

describe('stopping-distance', () => {
  test('90 km/h on dry asphalt: 25 m reaction + 39.8 m braking', () => {
    const result = run('stopping-distance').values;
    near(result.reactionDistance, 25, 1e-12);
    near(result.braking, 25 ** 2 / (2 * 0.8 * 9.80665), 1e-9);
  });

  test('double speed means four times the braking distance; ice and slopes', () => {
    near(run('stopping-distance', { speed: 100 }).values.braking / run('stopping-distance', { speed: 50 }).values.braking, 4, 1e-9);
    assert.ok(run('stopping-distance', { surface: 'ice' }).values.braking > 300);
    assert.ok(run('stopping-distance', { slope: -10 }).values.braking > run('stopping-distance').values.braking);
  });

  test('cannot stop and invalid input', () => {
    invalid(run('stopping-distance', { surface: 'ice', slope: -15 }));
    invalid(run('stopping-distance', { surface: 'mud' }));
  });
});

describe('race-predictor', () => {
  test('10 km in 50:00 → half marathon 1:50:19 (Riegel)', () => {
    const result = run('race-predictor').values;
    assert.equal(result.predicted.en, durationText(riegel(3000, 10, 21.0975)));
    assert.equal(result.race10k.en, '50:00');
  });

  test('exponent 1 is a constant pace', () => {
    assert.equal(run('race-predictor', { exponent: 1, target: 20 }).values.predicted.en, '1:40:00');
  });

  test('very different distances warn; invalid input', () => {
    assert.equal(run('race-predictor', { distance: 1, target: 42.195 }).warnings.length, 1);
    invalid(run('race-predictor', { time: '0' }));
    invalid(run('race-predictor', { exponent: 2 }));
  });
});

describe('heart-rate-zones', () => {
  test('age 40, Karvonen with resting 60: max 180, zone 2 132–144', () => {
    const result = run('heart-rate-zones').values;
    assert.equal(result.maximum, 180);
    assert.equal(result.zone2.cs, '132–144 tepů/min');
  });

  test('220 − age without resting rate: zones from the maximum', () => {
    const result = run('heart-rate-zones', { formula: 'fox', resting: '' }).values;
    assert.equal(result.maximum, 180);
    assert.equal(result.zone1.en, '90–108 bpm');
    assert.equal(run('heart-rate-zones', { formula: 'measured', max: 200 }).values.maximum, 200);
  });

  test('resting above maximum and invalid input', () => {
    invalid(run('heart-rate-zones', { formula: 'measured', max: 110, resting: 115 }));
    invalid(run('heart-rate-zones', { age: 5 }));
  });
});
