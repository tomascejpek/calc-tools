/**
 * Data size converter: decimal (kB, MB) and binary (KiB, MiB) prefixes.
 */

import { unitTable } from '../../core/converter.js';

const table = unitTable([
  ['bit', 1 / 8, 'bit'],
  ['kbit', 1e3 / 8, 'kbit'],
  ['Mbit', 1e6 / 8, 'Mbit'],
  ['Gbit', 1e9 / 8, 'Gbit'],
  ['B', 1, { cs: 'B (bajt)', en: 'B (byte)' }],
  ['kB', 1e3, 'kB'],
  ['MB', 1e6, 'MB'],
  ['GB', 1e9, 'GB'],
  ['TB', 1e12, 'TB'],
  ['PB', 1e15, 'PB'],
  ['KiB', 2 ** 10, 'KiB'],
  ['MiB', 2 ** 20, 'MiB'],
  ['GiB', 2 ** 30, 'GiB'],
  ['TiB', 2 ** 40, 'TiB'],
  ['PiB', 2 ** 50, 'PiB'],
], { defaultUnit: 'GB', defaultValue: 1 });

export default {
  id: 'data',
  kind: 'converter',
  category: 'units-other',
  tags: [],
  name: { cs: 'Převod datových jednotek (kB a KiB)', en: 'Data size converter (kB and KiB)' },
  description: {
    cs: 'Převod velikosti dat mezi bity, bajty a jejich násobky. Desítkové předpony (kB, MB, GB) jsou mocniny 1000, jak je uvádějí výrobci disků; binární (KiB, MiB, GiB) mocniny 1024, jak velikost často ukazují operační systémy. Proto má „1 TB“ disk asi 931 GiB.',
    en: 'Converts data size between bits, bytes and their multiples. Decimal prefixes (kB, MB, GB) are powers of 1000, as disk makers use them; binary ones (KiB, MiB, GiB) are powers of 1024, as operating systems often show sizes. That is why a "1 TB" disk has about 931 GiB.',
  },
  keywords: {
    cs: ['data', 'bajt', 'bit', 'kilobajt', 'megabajt', 'gigabajt', 'terabajt', 'kib', 'mib', 'gib', 'velikost souboru', 'disk'],
    en: ['data', 'byte', 'bit', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'kibibyte', 'mebibyte', 'gibibyte', 'file size', 'disk'],
  },
  units: table.units,
  toBase: table.toBase,
  fromBase: table.fromBase,
  references: [
    { title: 'IEC 80000-13: Quantities and units – Information science and technology (binary prefixes)' },
    { title: 'NIST: Prefixes for binary multiples', url: 'https://physics.nist.gov/cuu/Units/binary.html' },
  ],
};
