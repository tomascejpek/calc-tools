/**
 * Converting a time between time zones, with daylight saving time (IANA tz database via Intl).
 */

import { bilingual } from '../../core/format.js';
import { parseDate } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Common zones: IANA id and city names. */
export const ZONES = [
  ['Europe/Prague', 'Praha', 'Prague'], ['Europe/London', 'Londýn', 'London'], ['Europe/Lisbon', 'Lisabon', 'Lisbon'],
  ['Europe/Helsinki', 'Helsinky', 'Helsinki'], ['Europe/Moscow', 'Moskva', 'Moscow'], ['Europe/Istanbul', 'Istanbul', 'Istanbul'],
  ['Asia/Dubai', 'Dubaj', 'Dubai'], ['Asia/Kolkata', 'Dillí', 'Delhi'], ['Asia/Bangkok', 'Bangkok', 'Bangkok'],
  ['Asia/Shanghai', 'Peking', 'Beijing'], ['Asia/Tokyo', 'Tokio', 'Tokyo'], ['Australia/Sydney', 'Sydney', 'Sydney'],
  ['Pacific/Auckland', 'Auckland', 'Auckland'], ['America/New_York', 'New York', 'New York'], ['America/Chicago', 'Chicago', 'Chicago'],
  ['America/Denver', 'Denver', 'Denver'], ['America/Los_Angeles', 'Los Angeles', 'Los Angeles'], ['America/Sao_Paulo', 'São Paulo', 'São Paulo'],
  ['Pacific/Honolulu', 'Honolulu', 'Honolulu'], ['UTC', 'UTC', 'UTC'],
];

/**
 * Offset of a zone from UTC at an instant, minutes.
 * @param {string} zone IANA id
 * @param {number} utcMs
 */
export function zoneOffset(zone, utcMs) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(new Date(utcMs));
  const get = (/** @type {string} */ type) => Number(parts.find((part) => part.type === type)?.value);
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((wall - utcMs) / 60000);
}

/**
 * UTC instant of a wall-clock time in a zone; flags times skipped by a DST change.
 * @param {string} zone
 * @param {number} year
 * @param {number} month 1–12
 * @param {number} day
 * @param {number} hour
 * @param {number} minute
 */
export function zonedToUtc(zone, year, month, day, hour, minute) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let utc = wall - zoneOffset(zone, wall) * 60000;
  utc = wall - zoneOffset(zone, utc) * 60000;
  return { utc, exists: utc + zoneOffset(zone, utc) * 60000 === wall };
}

/**
 * @param {number} minutes
 */
function offsetText(minutes) {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(minutes);
  return `UTC${sign}${Math.floor(abs / 60)}${abs % 60 ? `:${String(abs % 60).padStart(2, '0')}` : ''}`;
}

const zoneOptions = ZONES.map(([value, cs, en]) => ({ value, label: { cs, en } }));

const inputs = [
  { id: 'date', type: 'date', default: '2026-10-31', label: { cs: 'Datum', en: 'Date' } },
  {
    id: 'time', type: 'text', default: '18:00', maxLength: 5, pattern: /^([01]?\d|2[0-3]):[0-5]\d$/,
    hint: { cs: 'Ve tvaru HH:MM.', en: 'As HH:MM.' }, label: { cs: 'Čas', en: 'Time' },
  },
  { id: 'from', type: 'select', default: 'Europe/Prague', label: { cs: 'Z časového pásma', en: 'From time zone' }, options: zoneOptions },
  { id: 'to', type: 'select', default: 'America/New_York', label: { cs: 'Do časového pásma', en: 'To time zone' }, options: zoneOptions },
];

const outputs = [
  { id: 'result', type: 'text', label: { cs: 'Čas v cílovém pásmu', en: 'Time in the target zone' } },
  { id: 'offsets', type: 'text', label: { cs: 'Posun od UTC', en: 'Offset from UTC' } },
  { id: 'difference', label: { cs: 'Rozdíl', en: 'Difference' }, unit: 'h', significant: 4 },
];

export default {
  id: 'time-zones',
  kind: 'calculator',
  category: 'time-date',
  tags: ['time'],
  name: { cs: 'Převod časových pásem', en: 'Time zone converter' },
  description: {
    cs: 'Kolik je hodin v jiném časovém pásmu, včetně letního času podle mezinárodní databáze časových pásem (IANA), kterou obsahuje prohlížeč. Rozdíl se během roku mění, protože Evropa a Amerika přecházejí na letní čas v jiné dny. Čas, který při přechodu na letní čas neexistuje (např. 2:30), se ohlásí.',
    en: 'What time it is in another time zone, including daylight saving time by the international time zone database (IANA) built into the browser. The difference changes over the year because Europe and America switch to summer time on different days. A time skipped by the change to summer time (e.g. 2:30) is reported.',
  },
  keywords: {
    cs: ['časová pásma', 'časový posun', 'kolik je hodin', 'letní čas', 'utc', 'světový čas', 'časový rozdíl'],
    en: ['time zone', 'time zones', 'time difference', 'world clock', 'daylight saving time', 'utc', 'convert time'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { from, to } = read.values;
    const date = /** @type {import('../../core/time.js').CalendarDate} */ (parseDate(read.values.date));
    const [hour, minute] = read.values.time.split(':').map(Number);
    const { utc, exists } = zonedToUtc(from, date.year, date.month, date.day, hour, minute);
    const fromOffset = zoneOffset(from, utc);
    const toOffset = zoneOffset(to, utc);
    const target = new Date(utc + toOffset * 60000);
    const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
    const dayShift = Math.round((Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()) - Date.UTC(date.year, date.month - 1, date.day)) / 86400000);
    return {
      values: {
        result: bilingual((lang) => {
          const time = `${pad(target.getUTCHours())}:${pad(target.getUTCMinutes())}`;
          const day = lang === 'cs'
            ? `${target.getUTCDate()}. ${target.getUTCMonth() + 1}. ${target.getUTCFullYear()}`
            : `${target.getUTCFullYear()}-${pad(target.getUTCMonth() + 1)}-${pad(target.getUTCDate())}`;
          const shift = dayShift === 0 ? '' : lang === 'cs' ? (dayShift > 0 ? ' (následující den)' : ' (předchozí den)') : (dayShift > 0 ? ' (next day)' : ' (previous day)');
          return `${time}, ${day}${shift}`;
        }),
        offsets: { cs: `${offsetText(fromOffset)} → ${offsetText(toOffset)}`, en: `${offsetText(fromOffset)} → ${offsetText(toOffset)}` },
        difference: (toOffset - fromOffset) / 60,
      },
      warnings: exists ? [] : [{ cs: 'Tento čas při přechodu na letní čas neexistuje; posunul se o hodinu.', en: 'This time does not exist due to the change to summer time; it was moved by an hour.' }],
    };
  },
  references: [{ title: 'IANA Time Zone Database', url: 'https://www.iana.org/time-zones' }],
};
