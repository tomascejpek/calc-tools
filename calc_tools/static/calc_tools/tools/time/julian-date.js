/**
 * Julian date and modified Julian date of a UTC moment, and back.
 */

import { bilingual } from '../../core/format.js';
import { dayNumber, fromDayNumber, isoText, parseDate } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'mode', type: 'select', default: 'toJd', label: { cs: 'Převod', en: 'Convert' },
    options: [
      { value: 'toJd', label: { cs: 'datum → juliánské datum', en: 'date → Julian date' } },
      { value: 'fromJd', label: { cs: 'juliánské datum → datum', en: 'Julian date → date' } },
    ],
  },
  { id: 'date', type: 'date', default: '2000-01-01', label: { cs: 'Datum (UTC)', en: 'Date (UTC)' } },
  {
    id: 'time', type: 'text', default: '12:00', maxLength: 8, pattern: /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    hint: { cs: 'Ve tvaru HH:MM nebo HH:MM:SS.', en: 'As HH:MM or HH:MM:SS.' }, label: { cs: 'Čas (UTC)', en: 'Time (UTC)' },
  },
  { id: 'jd', type: 'number', default: 2451545, min: 1721425.5, max: 5373484.5, step: 0.5, label: { cs: 'Juliánské datum', en: 'Julian date' } },
];

const outputs = [
  { id: 'jd', label: { cs: 'Juliánské datum (JD)', en: 'Julian date (JD)' }, precision: 5 },
  { id: 'mjd', label: { cs: 'Modifikované juliánské datum (MJD)', en: 'Modified Julian date (MJD)' }, precision: 5 },
  { id: 'date', type: 'text', label: { cs: 'Datum a čas (UTC)', en: 'Date and time (UTC)' } },
];

export default {
  id: 'julian-date',
  kind: 'calculator',
  category: 'time-date',
  tags: ['time'],
  name: { cs: 'Juliánské datum', en: 'Julian date' },
  description: {
    cs: 'Juliánské datum je souvislé počítání dní od 1. ledna 4713 př. n. l., které používá astronomie; den začíná v poledne UTC. JD 2451545,0 je 1. ledna 2000 ve 12:00 UTC. Modifikované juliánské datum MJD = JD − 2400000,5 začíná o půlnoci. Datum se zadává v gregoriánském kalendáři.',
    en: 'The Julian date is a continuous count of days since 1 January 4713 BC used in astronomy; a day starts at noon UTC. JD 2451545.0 is 1 January 2000 at 12:00 UTC. The modified Julian date MJD = JD − 2400000.5 starts at midnight. Dates are entered in the Gregorian calendar.',
  },
  keywords: {
    cs: ['juliánské datum', 'jd', 'mjd', 'astronomie', 'počítání dní', 'julian day'],
    en: ['julian date', 'julian day', 'jd', 'mjd', 'modified julian date', 'astronomy'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    let jd;
    if (read.values.mode === 'toJd') {
      const [h, m, s = 0] = read.values.time.split(':').map(Number);
      jd = dayNumber(/** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.date))) + (h * 3600 + m * 60 + s) / 86400 + 2440587.5;
    } else {
      jd = read.values.jd;
    }
    const days = jd - 2440587.5;
    const whole = Math.floor(days);
    const seconds = Math.round((days - whole) * 86400);
    const date = fromDayNumber(whole + Math.floor(seconds / 86400));
    const rest = seconds % 86400;
    const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
    const clock = `${pad(Math.floor(rest / 3600))}:${pad(Math.floor(rest % 3600 / 60))}:${pad(rest % 60)}`;
    return {
      values: {
        jd,
        mjd: jd - 2400000.5,
        date: bilingual((lang) => (lang === 'cs' ? `${date.day}. ${date.month}. ${date.year} ${clock} UTC` : `${isoText(date)} ${clock} UTC`)),
      },
      warnings: [],
    };
  },
  references: [
    { title: 'Meeus, J.: Astronomical Algorithms, 2nd ed., ch. 7 – Julian day' },
    { title: 'IAU: Julian date and modified Julian date conventions' },
  ],
};
