/**
 * Calendar facts about a date: ISO week, day of the year, quarter, leap year.
 */

import { dayNumber, daysInMonth, isLeapYear, isoWeek, parseDate, weekdayName } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'date', type: 'date', default: '2026-10-31', label: { cs: 'Datum', en: 'Date' } },
];

const outputs = [
  { id: 'week', label: { cs: 'Týden v roce (ISO)', en: 'Week of the year (ISO)' }, precision: 0 },
  { id: 'weekYear', label: { cs: 'Rok, ke kterému týden patří', en: 'Year the week belongs to' }, precision: 0 },
  { id: 'weekday', type: 'text', label: { cs: 'Den v týdnu', en: 'Day of the week' } },
  { id: 'dayOfYear', label: { cs: 'Den v roce', en: 'Day of the year' }, precision: 0 },
  { id: 'daysLeft', label: { cs: 'Dní do konce roku', en: 'Days to the end of the year' }, precision: 0 },
  { id: 'quarter', label: { cs: 'Čtvrtletí', en: 'Quarter' }, precision: 0 },
  { id: 'monthDays', label: { cs: 'Dní v měsíci', en: 'Days in the month' }, precision: 0 },
  { id: 'leap', type: 'text', label: { cs: 'Přestupný rok', en: 'Leap year' } },
];

export default {
  id: 'week-number',
  kind: 'calculator',
  category: 'time-date',
  tags: ['time'],
  name: { cs: 'Týden v roce a den v roce', en: 'Week number and day of the year' },
  description: {
    cs: 'Číslo týdne podle ISO 8601 (týden začíná pondělím a první týden je ten se čtvrtkem, takže 1. leden může patřit do 52. nebo 53. týdne předchozího roku), den v týdnu, pořadí dne v roce, čtvrtletí a zda je rok přestupný.',
    en: 'The ISO 8601 week number (weeks start on Monday and week 1 is the one with the year\'s first Thursday, so 1 January may belong to week 52 or 53 of the year before), day of the week, day of the year, quarter and whether the year is a leap year.',
  },
  keywords: {
    cs: ['týden v roce', 'číslo týdne', 'kalendářní týden', 'den v roce', 'přestupný rok', 'čtvrtletí', 'den v týdnu'],
    en: ['week number', 'iso week', 'calendar week', 'day of year', 'leap year', 'quarter', 'day of week'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const date = /** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.date));
    const { week, year } = isoWeek(date);
    const dayOfYear = dayNumber(date) - dayNumber({ year: date.year, month: 1, day: 1 }) + 1;
    const leap = isLeapYear(date.year);
    return {
      values: {
        week,
        weekYear: year,
        weekday: weekdayName(date),
        dayOfYear,
        daysLeft: (leap ? 366 : 365) - dayOfYear,
        quarter: Math.ceil(date.month / 3),
        monthDays: daysInMonth(date.year, date.month),
        leap: leap ? { cs: 'ano', en: 'yes' } : { cs: 'ne', en: 'no' },
      },
      warnings: [],
    };
  },
  references: [{ title: 'ISO 8601-1: Date and time – week dates' }],
};
