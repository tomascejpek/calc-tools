/**
 * Data transfer: download time from size and speed, Mb/s ⇄ MB/s.
 */

import { bilingual } from '../../core/format.js';
import { durationText } from '../../core/time.js';
import { emptyResult, readInputs } from '../../core/tool.js';

/** Size units in bytes. */
export const SIZE_UNITS = { MB: 1e6, GB: 1e9, TB: 1e12, MiB: 2 ** 20, GiB: 2 ** 30, TiB: 2 ** 40 };
/** Speed units in bits per second. */
export const SPEED_UNITS = { kbps: 1e3, Mbps: 1e6, Gbps: 1e9, MBps: 8e6, GBps: 8e9 };

const inputs = [
  { id: 'size', type: 'number', default: 4.7, min: 0, max: 1e9, step: 0.1, label: { cs: 'Velikost dat', en: 'Data size' } },
  {
    id: 'sizeUnit', type: 'select', default: 'GB', label: { cs: 'Jednotka velikosti', en: 'Size unit' },
    options: Object.keys(SIZE_UNITS).map((unit) => ({ value: unit, label: { cs: unit, en: unit } })),
  },
  { id: 'speed', type: 'number', default: 100, min: 0.001, max: 1e9, step: 1, label: { cs: 'Rychlost připojení', en: 'Connection speed' } },
  {
    id: 'speedUnit', type: 'select', default: 'Mbps', label: { cs: 'Jednotka rychlosti', en: 'Speed unit' },
    options: [
      { value: 'kbps', label: { cs: 'kb/s (kilobity)', en: 'kbit/s' } },
      { value: 'Mbps', label: { cs: 'Mb/s (megabity, jak je uvádějí operátoři)', en: 'Mbit/s (as providers quote it)' } },
      { value: 'Gbps', label: { cs: 'Gb/s', en: 'Gbit/s' } },
      { value: 'MBps', label: { cs: 'MB/s (megabajty)', en: 'MB/s (megabytes)' } },
      { value: 'GBps', label: { cs: 'GB/s', en: 'GB/s' } },
    ],
  },
  { id: 'overhead', type: 'number', default: 10, min: 0, max: 90, step: 1, unit: '%', label: { cs: 'Režie protokolu a sítě', en: 'Protocol and network overhead' } },
];

const outputs = [
  { id: 'time', type: 'text', label: { cs: 'Doba přenosu', en: 'Transfer time' } },
  { id: 'seconds', label: { cs: 'Doba přenosu', en: 'Transfer time' }, unit: 's', significant: 4 },
  { id: 'megabytesPerSecond', label: { cs: 'Skutečná rychlost', en: 'Effective speed' }, unit: 'MB/s', significant: 4 },
  { id: 'megabitsPerSecond', label: { cs: 'Skutečná rychlost', en: 'Effective speed' }, unit: 'Mb/s', significant: 4 },
];

export default {
  id: 'transfer-time',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'Přenosová rychlost a doba stažení', en: 'Transfer speed and download time' },
  description: {
    cs: 'Jak dlouho trvá stáhnout nebo nahrát data danou rychlostí. Operátoři uvádějí rychlost v megabitech za sekundu (Mb/s), programy ukazují megabajty (MB/s): 100 Mb/s je jen 12,5 MB/s. Režie protokolů a sítě skutečnou rychlost snižuje obvykle o 5–15 %.',
    en: 'How long it takes to download or upload data at a given speed. Providers quote speed in megabits per second (Mbit/s), programs show megabytes (MB/s): 100 Mbit/s is only 12.5 MB/s. Protocol and network overhead usually lowers the real speed by 5–15 %.',
  },
  keywords: {
    cs: ['přenosová rychlost', 'doba stažení', 'mb/s', 'megabit', 'megabajt', 'rychlost internetu', 'stahování', 'upload'],
    en: ['transfer speed', 'download time', 'mbps', 'megabit', 'megabyte', 'internet speed', 'bandwidth', 'upload'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { size, sizeUnit, speed, speedUnit, overhead } = read.values;
    const bits = size * SIZE_UNITS[/** @type {keyof typeof SIZE_UNITS} */ (sizeUnit)] * 8;
    const effective = speed * SPEED_UNITS[/** @type {keyof typeof SPEED_UNITS} */ (speedUnit)] * (1 - overhead / 100);
    const seconds = bits / effective;
    return {
      values: { time: bilingual(() => durationText(seconds)), seconds, megabytesPerSecond: effective / 8e6, megabitsPerSecond: effective / 1e6 },
      warnings: [],
    };
  },
  references: [{ title: 'IEC 80000-13: bit, byte and binary prefixes' }],
};
