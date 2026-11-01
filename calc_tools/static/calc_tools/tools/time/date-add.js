/**
 * Adding calendar days or working days to a date.
 */

import { addWorkdays, dateText, dayNumber, fromDayNumber, parseDate } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { HOLIDAYS_INPUT } from './date-difference.js';

const inputs = [
  { id: 'date', type: 'date', default: '2026-10-31', label: { cs: 'Datum', en: 'Date' } },
  { id: 'count', type: 'number', default: 30, min: -1000000, max: 1000000, step: 1, label: { cs: 'Přičíst (záporné = odečíst)', en: 'Add (negative = subtract)' } },
  {
    id: 'unit', type: 'select', default: 'days', label: { cs: 'Jednotka', en: 'Unit' },
    options: [
      { value: 'days', label: { cs: 'kalendářní dny', en: 'calendar days' } },
      { value: 'workdays', label: { cs: 'pracovní dny', en: 'working days' } },
      { value: 'weeks', label: { cs: 'týdny', en: 'weeks' } },
    ],
  },
  HOLIDAYS_INPUT,
];

const outputs = [
  { id: 'result', type: 'text', label: { cs: 'Výsledné datum', en: 'Resulting date' } },
  { id: 'days', label: { cs: 'Kalendářních dní mezi daty', en: 'Calendar days between' }, precision: 0 },
];

export default {
  id: 'date-add',
  kind: 'calculator',
  category: 'time-date',
  tags: ['time'],
  name: { cs: 'Přičtení dnů a pracovních dnů k datu', en: 'Add days or working days to a date' },
  description: {
    cs: 'Jaké datum bude za daný počet kalendářních dní, týdnů nebo pracovních dní, např. splatnost faktury nebo lhůta. U pracovních dní se přeskakují víkendy a volitelně české státní svátky. Lhůty podle zákona se počítají podle jeho pravidel (lhůta končící o víkendu se posouvá na další pracovní den).',
    en: 'Which date it will be after a number of calendar days, weeks or working days, e.g. an invoice due date or a deadline. Working days skip weekends and optionally Czech public holidays. Legal deadlines follow their own rules (one ending at a weekend moves to the next working day).',
  },
  keywords: {
    cs: ['přičíst dny', 'datum za', 'pracovní dny', 'splatnost', 'lhůta', 'termín', 'kalendář'],
    en: ['add days', 'date after', 'working days', 'business days', 'due date', 'deadline', 'calendar'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { count, unit } = read.values;
    if (!Number.isInteger(count)) return emptyResult(outputs, [{ cs: 'Počet musí být celé číslo.', en: 'The count must be a whole number.' }]);
    const start = dayNumber(/** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.date)));
    const end = unit === 'workdays' ? addWorkdays(start, count, read.values.holidays === 'cz') : start + count * (unit === 'weeks' ? 7 : 1);
    const result = fromDayNumber(end);
    if (result.year < 1 || result.year > 9999) return emptyResult(outputs, [{ cs: 'Výsledek je mimo roky 1–9999.', en: 'The result is outside the years 1–9999.' }]);
    return { values: { result: dateText(result), days: end - start }, warnings: [] };
  },
  references: [{ title: 'Zákon č. 245/2000 Sb., o státních svátcích' }],
};
