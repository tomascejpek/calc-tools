/**
 * Age on a date and the next birthday.
 */

import { addMonths, calendarDifference, dateText, dayNumber, parseDate, weekdayName } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'birth', type: 'date', default: '1990-05-15', label: { cs: 'Datum narození', en: 'Date of birth' } },
  { id: 'on', type: 'date', default: '2026-10-31', label: { cs: 'K datu', en: 'On the date' } },
];

const outputs = [
  { id: 'years', label: { cs: 'Věk (celé roky)', en: 'Age (whole years)' }, precision: 0 },
  { id: 'exact', type: 'text', label: { cs: 'Přesně', en: 'Exactly' } },
  { id: 'days', label: { cs: 'Prožito dní', en: 'Days lived' }, precision: 0 },
  { id: 'nextBirthday', type: 'text', label: { cs: 'Příští narozeniny', en: 'Next birthday' } },
  { id: 'daysToBirthday', label: { cs: 'Dní do narozenin', en: 'Days to the birthday' }, precision: 0 },
  { id: 'bornOn', type: 'text', label: { cs: 'Narozen(a) v', en: 'Born on a' } },
];

export default {
  id: 'age',
  kind: 'calculator',
  category: 'time-date',
  tags: ['time'],
  name: { cs: 'Věk a příští narozeniny', en: 'Age and next birthday' },
  description: {
    cs: 'Kolik je komu let, měsíců a dní k danému datu, kolik dní prožil, kdy má příští narozeniny a v jaký den v týdnu se narodil. Narozeným 29. února se v nepřestupném roce počítají narozeniny 28. února.',
    en: 'How many years, months and days old someone is on a date, how many days they have lived, when the next birthday is and on which day of the week they were born. For people born on 29 February the birthday counts as 28 February in non-leap years.',
  },
  keywords: {
    cs: ['věk', 'kolik je mi let', 'narozeniny', 'datum narození', 'dní do narozenin', 'stáří'],
    en: ['age', 'how old', 'birthday', 'date of birth', 'days to birthday', 'age calculator'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const birth = /** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.birth));
    const on = /** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.on));
    if (dayNumber(on) < dayNumber(birth)) return emptyResult(outputs, [{ cs: 'Datum je dřív než narození.', en: 'The date is before the birth.' }]);
    const span = calendarDifference(birth, on);
    let next = addMonths(birth, (span.years + 1) * 12);
    if (span.months === 0 && span.days === 0) next = on;
    return {
      values: {
        years: span.years,
        exact: { cs: `${span.years} let, ${span.months} měs., ${span.days} d.`, en: `${span.years} years, ${span.months} months, ${span.days} days` },
        days: dayNumber(on) - dayNumber(birth),
        nextBirthday: dateText(next),
        daysToBirthday: dayNumber(next) - dayNumber(on),
        bornOn: weekdayName(birth),
      },
      warnings: [],
    };
  },
  references: [{ title: 'ISO 8601: Date and time – representations' }],
};
