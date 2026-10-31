/**
 * Time converter: from nanoseconds to Gregorian years.
 */

import { unitTable } from '../../core/converter.js';

/** Mean Gregorian year, s (365.2425 days). */
const YEAR = 365.2425 * 86400;

const table = unitTable([
  ['ns', 1e-9, 'ns'],
  ['us', 1e-6, 'µs'],
  ['ms', 1e-3, 'ms'],
  ['s', 1, 's'],
  ['min', 60, 'min'],
  ['h', 3600, 'h'],
  ['d', 86400, { cs: 'den', en: 'day' }],
  ['wk', 604800, { cs: 'týden', en: 'week' }],
  ['mo', YEAR / 12, { cs: 'měsíc (průměrný)', en: 'month (mean)' }],
  ['yr', YEAR, { cs: 'rok (gregoriánský)', en: 'year (Gregorian)' }],
], { defaultUnit: 'h', defaultValue: 1 });

/** Length of one unit in seconds. */
export const SECONDS = table.factors;

export default {
  id: 'time',
  kind: 'converter',
  category: 'units-basic',
  tags: [],
  name: { cs: 'Převod času', en: 'Time converter' },
  description: {
    cs: 'Převod času mezi sekundami a jejich zlomky, minutami, hodinami, dny, týdny, měsíci a roky. Rok je průměrný gregoriánský (365,2425 dne), měsíc jeho dvanáctina.',
    en: 'Converts time between seconds and their fractions, minutes, hours, days, weeks, months and years. The year is the mean Gregorian year (365.2425 days), the month a twelfth of it.',
  },
  keywords: {
    cs: ['čas', 'doba', 'sekunda', 'minuta', 'hodina', 'den', 'týden', 'měsíc', 'rok'],
    en: ['time', 'duration', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure), table 8 – minute, hour, day', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
};
