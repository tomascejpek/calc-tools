/**
 * Difference between two dates in days, weeks, months and working days.
 */

import { bilingual } from '../../core/format.js';
import { calendarDifference, dayNumber, parseDate, workdaysBetween } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** The select for counting Czech public holidays, shared by date tools. */
export const HOLIDAYS_INPUT = {
  id: 'holidays', type: 'select', default: 'cz', label: { cs: 'Pracovní dny', en: 'Working days' },
  options: [
    { value: 'cz', label: { cs: 'po–pá bez českých státních svátků', en: 'Mon–Fri without Czech public holidays' } },
    { value: 'none', label: { cs: 'po–pá (svátky nepočítat)', en: 'Mon–Fri (ignore holidays)' } },
  ],
};

const inputs = [
  { id: 'from', type: 'date', default: '2026-01-01', label: { cs: 'Od data', en: 'From' } },
  { id: 'to', type: 'date', default: '2026-12-31', label: { cs: 'Do data', en: 'To' } },
  HOLIDAYS_INPUT,
];

const outputs = [
  { id: 'days', label: { cs: 'Počet dní', en: 'Days' }, precision: 0 },
  { id: 'calendar', type: 'text', label: { cs: 'Roky, měsíce, dny', en: 'Years, months, days' } },
  { id: 'weeks', type: 'text', label: { cs: 'Týdny a dny', en: 'Weeks and days' } },
  { id: 'workdays', label: { cs: 'Pracovní dny (bez počátečního dne)', en: 'Working days (start day excluded)' }, precision: 0 },
  { id: 'hours', label: { cs: 'Hodin', en: 'Hours' }, precision: 0 },
];

export default {
  id: 'date-difference',
  kind: 'calculator',
  category: 'time-date',
  tags: ['time'],
  name: { cs: 'Rozdíl dvou dat', en: 'Days between dates' },
  description: {
    cs: 'Kolik dní, týdnů, měsíců a let je mezi dvěma daty a kolik z toho pracovních dní (pondělí až pátek, volitelně bez českých státních svátků včetně Velkého pátku a Velikonočního pondělí). Počáteční den se nepočítá, koncový ano. Je-li konec dřív než začátek, vyjde rozdíl záporný.',
    en: 'How many days, weeks, months and years lie between two dates and how many of them are working days (Monday to Friday, optionally without Czech public holidays, Good Friday and Easter Monday included). The start day is not counted, the end day is. If the end is before the start, the difference is negative.',
  },
  keywords: {
    cs: ['rozdíl dat', 'počet dní', 'kolik dní', 'pracovní dny', 'svátky', 'mezi daty', 'datum', 'kalendář'],
    en: ['days between dates', 'date difference', 'how many days', 'working days', 'business days', 'holidays', 'calendar'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const from = /** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.from));
    const to = /** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.to));
    const days = dayNumber(to) - dayNumber(from);
    const forward = days >= 0;
    const span = forward ? calendarDifference(from, to) : calendarDifference(to, from);
    const sign = forward ? '' : '−';
    return {
      values: {
        days,
        calendar: bilingual((lang) => (lang === 'cs'
          ? `${sign}${span.years} r. ${span.months} měs. ${span.days} d.`
          : `${sign}${span.years} y ${span.months} m ${span.days} d`)),
        weeks: bilingual((lang) => {
          const weeks = Math.trunc(Math.abs(days) / 7);
          const rest = Math.abs(days) % 7;
          return lang === 'cs' ? `${sign}${weeks} týd. ${rest} d.` : `${sign}${weeks} wk ${rest} d`;
        }),
        workdays: workdaysBetween(dayNumber(from), dayNumber(to), read.values.holidays === 'cz'),
        hours: days * 24,
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Zákon č. 245/2000 Sb., o státních svátcích, o ostatních svátcích, o významných dnech a o dnech pracovního klidu' },
    { title: 'ISO 8601: Date and time – representations' },
  ],
};
