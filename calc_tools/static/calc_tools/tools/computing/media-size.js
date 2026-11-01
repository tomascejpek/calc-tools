/**
 * Size of an image or a video by resolution, colour depth and bitrate.
 */

import { bilingual } from '../../core/format.js';
import { gcdBig } from '../math/fractions.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  {
    id: 'mode', type: 'select', default: 'video', label: { cs: 'Počítám', en: 'Calculate' },
    options: [
      { value: 'video', label: { cs: 'video podle datového toku', en: 'video by bitrate' } },
      { value: 'raw', label: { cs: 'nekomprimované video', en: 'uncompressed video' } },
      { value: 'image', label: { cs: 'nekomprimovaný obrázek', en: 'uncompressed image' } },
    ],
  },
  { id: 'width', type: 'number', default: 1920, min: 1, max: 100000, step: 1, unit: 'px', label: { cs: 'Šířka', en: 'Width' } },
  { id: 'height', type: 'number', default: 1080, min: 1, max: 100000, step: 1, unit: 'px', label: { cs: 'Výška', en: 'Height' } },
  { id: 'depth', type: 'number', default: 24, min: 1, max: 128, step: 1, unit: { cs: 'bitů/px', en: 'bits/px' }, label: { cs: 'Barevná hloubka (RGB 24, RGBA 32, 10bit HDR 30)', en: 'Colour depth (RGB 24, RGBA 32, 10-bit HDR 30)' } },
  { id: 'fps', type: 'number', default: 25, min: 1, max: 1000, step: 1, unit: 'fps', label: { cs: 'Snímků za sekundu', en: 'Frames per second' } },
  { id: 'bitrate', type: 'number', default: 8, min: 0.01, max: 1e5, step: 0.5, unit: 'Mb/s', label: { cs: 'Datový tok (video + zvuk)', en: 'Bitrate (video + audio)' } },
  { id: 'duration', type: 'number', default: 90, min: 0, max: 1e6, step: 1, unit: 'min', label: { cs: 'Délka videa', en: 'Video length' } },
];

const outputs = [
  { id: 'megabytes', label: { cs: 'Velikost', en: 'Size' }, unit: 'MB', significant: 4 },
  { id: 'gigabytes', label: { cs: 'Velikost', en: 'Size' }, unit: 'GB', significant: 4 },
  { id: 'megapixels', label: { cs: 'Rozlišení', en: 'Resolution' }, unit: 'Mpx', significant: 4 },
  { id: 'aspect', type: 'text', label: { cs: 'Poměr stran', en: 'Aspect ratio' } },
];

export default {
  id: 'media-size',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'Velikost obrázku a videa', en: 'Image and video size' },
  description: {
    cs: 'Velikost videa podle datového toku a délky (90 minut při 8 Mb/s je 5,4 GB), nekomprimovaného videa podle rozlišení, barevné hloubky a snímkové frekvence, nebo nekomprimovaného obrázku. Ukáže i počet megapixelů a poměr stran. Komprimované formáty (JPEG, H.264) bývají desítky až stovky krát menší než nekomprimované.',
    en: 'Size of a video by bitrate and length (90 minutes at 8 Mbit/s is 5.4 GB), of uncompressed video by resolution, colour depth and frame rate, or of an uncompressed image. Also shows megapixels and the aspect ratio. Compressed formats (JPEG, H.264) tend to be tens to hundreds of times smaller than uncompressed.',
  },
  keywords: {
    cs: ['velikost videa', 'datový tok', 'bitrate', 'rozlišení', 'megapixely', 'poměr stran', 'velikost obrázku', 'full hd', '4k'],
    en: ['video size', 'bitrate', 'resolution', 'megapixels', 'aspect ratio', 'image size', 'file size', 'full hd', '4k'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mode, width, height, depth, fps, bitrate, duration } = read.values;
    if (!Number.isInteger(width) || !Number.isInteger(height)) return emptyResult(outputs, [{ cs: 'Rozlišení musí být celé číslo.', en: 'The resolution must be whole pixels.' }]);
    const frame = width * height * depth / 8;
    const bytes = mode === 'image' ? frame : mode === 'raw' ? frame * fps * duration * 60 : bitrate * 1e6 / 8 * duration * 60;
    const g = Number(gcdBig(BigInt(width), BigInt(height)));
    return {
      values: {
        megabytes: bytes / 1e6,
        gigabytes: bytes / 1e9,
        megapixels: width * height / 1e6,
        aspect: bilingual((lang, number) => `${width / g}:${height / g} (${number(width / height)} : 1)`, 4),
      },
      warnings: [],
    };
  },
  references: [{ title: 'ITU-R BT.709 / BT.2020 – image formats; IEC 80000-13 – data units' }],
};
