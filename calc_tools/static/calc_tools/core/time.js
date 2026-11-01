/**
 * Calendar arithmetic on plain dates (no time zone), Czech public holidays,
 * ISO weeks, Julian dates and h:mm:ss durations.
 * @module core/time
 */

/** @typedef {{ year: number, month: number, day: number }} CalendarDate month 1–12 */

const DAY_MS = 86400000;

/** ISO date YYYY-MM-DD or Czech D. M. YYYY. */
export const DATE_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$|^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/;

/**
 * @param {number} year
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * @param {number} year
 * @param {number} month 1–12
 */
export function daysInMonth(year, month) {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/**
 * Parses an ISO or Czech date; null when it does not exist (31. 2.).
 * @param {string} text
 * @returns {CalendarDate | null}
 */
export function parseDate(text) {
  const match = String(text).trim().match(DATE_PATTERN);
  if (!match) return null;
  const [year, month, day] = match[1] ? [match[1], match[2], match[3]].map(Number) : [match[6], match[5], match[4]].map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/**
 * Days since 1970-01-01 (proleptic Gregorian calendar).
 * @param {CalendarDate} date
 */
export function dayNumber({ year, month, day }) {
  const utc = new Date(Date.UTC(2000, month - 1, day));
  utc.setUTCFullYear(year);
  return Math.round(utc.getTime() / DAY_MS);
}

/**
 * @param {number} days since 1970-01-01
 * @returns {CalendarDate}
 */
export function fromDayNumber(days) {
  const date = new Date(days * DAY_MS);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/**
 * ISO weekday, 1 = Monday … 7 = Sunday.
 * @param {CalendarDate} date
 */
export function weekday(date) {
  return ((dayNumber(date) % 7) + 7 + 3) % 7 + 1;
}

/** @param {CalendarDate} date */
export function isoText({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const WEEKDAYS = {
  cs: ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

/**
 * Weekday name per language.
 * @param {CalendarDate} date
 */
export function weekdayName(date) {
  const index = weekday(date) - 1;
  return { cs: WEEKDAYS.cs[index], en: WEEKDAYS.en[index] };
}

/**
 * The date written in both languages: "31. 10. 2026 (sobota)" and "2026-10-31 (Saturday)".
 * @param {CalendarDate} date
 */
export function dateText(date) {
  const name = weekdayName(date);
  return { cs: `${date.day}. ${date.month}. ${date.year} (${name.cs})`, en: `${isoText(date)} (${name.en})` };
}

/**
 * Easter Sunday in the Gregorian calendar (anonymous Gregorian algorithm).
 * @param {number} year
 * @returns {CalendarDate}
 */
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

/**
 * Czech public holidays of a year as day numbers (zákon č. 245/2000 Sb.;
 * Good Friday since 2016).
 * @param {number} year
 */
export function czechHolidays(year) {
  const fixed = [[1, 1], [5, 1], [5, 8], [7, 5], [7, 6], [9, 28], [10, 28], [11, 17], [12, 24], [12, 25], [12, 26]];
  const easter = dayNumber(easterSunday(year));
  const days = new Set(fixed.map(([month, day]) => dayNumber({ year, month, day })));
  days.add(easter + 1);
  if (year >= 2016) days.add(easter - 2);
  return days;
}

/** @type {Map<number, Set<number>>} */
const holidayCache = new Map();

/**
 * Whether a day is a working day: Monday–Friday and, if asked, not a Czech holiday.
 * @param {number} days day number
 * @param {boolean} holidays
 */
export function isWorkday(days, holidays) {
  const date = fromDayNumber(days);
  if (weekday(date) > 5) return false;
  if (!holidays) return true;
  if (!holidayCache.has(date.year)) holidayCache.set(date.year, czechHolidays(date.year));
  return !/** @type {Set<number>} */ (holidayCache.get(date.year)).has(days);
}

/**
 * Working days from one day to another, counting the end day but not the start.
 * @param {number} from day number
 * @param {number} to day number
 * @param {boolean} holidays
 */
export function workdaysBetween(from, to, holidays) {
  const step = to >= from ? 1 : -1;
  let count = 0;
  for (let day = from + step; step > 0 ? day <= to : day >= to; day += step) if (isWorkday(day, holidays)) count += step;
  return count;
}

/**
 * Moves by a number of working days (negative goes back).
 * @param {number} from day number
 * @param {number} count
 * @param {boolean} holidays
 */
export function addWorkdays(from, count, holidays) {
  const step = count >= 0 ? 1 : -1;
  let day = from;
  for (let left = Math.abs(count); left > 0;) {
    day += step;
    if (isWorkday(day, holidays)) left--;
  }
  return day;
}

/**
 * A date moved by whole months; a day past the end of the target month is
 * clamped to its last day (31 Jan + 1 month = 28/29 Feb).
 * @param {CalendarDate} date
 * @param {number} months
 * @returns {CalendarDate}
 */
export function addMonths({ year, month, day }, months) {
  const index = year * 12 + (month - 1) + months;
  const y = Math.floor(index / 12);
  const m = index - y * 12 + 1;
  return { year: y, month: m, day: Math.min(day, daysInMonth(y, m)) };
}

/**
 * Whole years, months and days from one date to a later one: the most whole
 * months that fit (with clamping, as addMonths), then the remaining days.
 * @param {CalendarDate} from
 * @param {CalendarDate} to not before from
 */
export function calendarDifference(from, to) {
  let months = (to.year - from.year) * 12 + (to.month - from.month);
  if (dayNumber(addMonths(from, months)) > dayNumber(to)) months -= 1;
  const days = dayNumber(to) - dayNumber(addMonths(from, months));
  return { years: Math.floor(months / 12), months: months % 12, days };
}

/**
 * ISO 8601 week number and week-based year.
 * @param {CalendarDate} date
 */
export function isoWeek(date) {
  // The week belongs to the year of its Thursday
  const thursday = fromDayNumber(dayNumber(date) + 4 - weekday(date));
  const first = dayNumber({ year: thursday.year, month: 1, day: 1 });
  return { week: Math.floor((dayNumber(thursday) - first) / 7) + 1, year: thursday.year };
}

/**
 * Julian date of a UTC moment; JD 2440587.5 is 1970-01-01 00:00 UTC.
 * @param {number} days day number
 * @param {number} [fraction] fraction of the day since midnight
 */
export function julianDate(days, fraction = 0) {
  return days + fraction + 2440587.5;
}

/** Durations as h:mm:ss, mm:ss or plain minutes with a decimal point or comma. */
export const DURATION_PATTERN = /^(\d{1,4}:)?\d{1,2}:\d{1,2}([.,]\d+)?$|^\d+([.,]\d+)?$/;

/**
 * Parses h:mm:ss, mm:ss or plain minutes into seconds; null when invalid.
 * @param {string} text
 */
export function parseDuration(text) {
  const value = String(text).trim();
  if (!DURATION_PATTERN.test(value)) return null;
  if (!value.includes(':')) return Number(value.replace(',', '.')) * 60;
  const parts = value.replace(',', '.').split(':').map(Number);
  const [h, m, s] = parts.length === 3 ? parts : [0, ...parts];
  if (m >= 60 || s >= 60) return null;
  return h * 3600 + m * 60 + s;
}

/**
 * Seconds as h:mm:ss (or m:ss under an hour).
 * @param {number} seconds
 */
export function durationText(seconds) {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
