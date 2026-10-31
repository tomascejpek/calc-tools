/**
 * Luminous flux, intensity and illuminance of a light source with a beam.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Solid angle of a cone with the given full apex angle, sr.
 * @param {number} degrees full beam angle, up to 360 (whole sphere)
 */
export function coneSolidAngle(degrees) {
  return 2 * Math.PI * (1 - Math.cos(degrees / 2 * Math.PI / 180));
}

const inputs = [
  {
    id: 'known', type: 'select', default: 'lumen', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'lumen', label: { cs: 'světelný tok (lm)', en: 'luminous flux (lm)' } },
      { value: 'candela', label: { cs: 'svítivost (cd)', en: 'luminous intensity (cd)' } },
    ],
  },
  { id: 'value', type: 'number', default: 800, min: 0, max: 1e9, step: 1, label: { cs: 'Hodnota', en: 'Value' } },
  { id: 'angle', type: 'number', default: 120, min: 0.1, max: 360, step: 1, unit: '°', label: { cs: 'Úhel vyzařování (celý kužel)', en: 'Beam angle (full cone)' } },
  { id: 'distance', type: 'number', default: 2, min: 0.01, max: 100000, step: 0.1, unit: 'm', label: { cs: 'Vzdálenost', en: 'Distance' } },
];

const outputs = [
  { id: 'lumen', label: { cs: 'Světelný tok', en: 'Luminous flux' }, unit: 'lm', significant: 4 },
  { id: 'candela', label: { cs: 'Svítivost', en: 'Luminous intensity' }, unit: 'cd', significant: 4 },
  { id: 'lux', label: { cs: 'Osvětlenost ve vzdálenosti (kolmo pod světlem)', en: 'Illuminance at the distance (on axis)' }, unit: 'lx', significant: 4 },
  { id: 'solidAngle', label: { cs: 'Prostorový úhel', en: 'Solid angle' }, unit: 'sr', significant: 4 },
];

export default {
  id: 'photometry',
  kind: 'calculator',
  category: 'units-light',
  tags: [],
  name: { cs: 'Lumeny, kandely a luxy', en: 'Lumens, candelas and lux' },
  description: {
    cs: 'Vztah světelného toku, svítivosti a osvětlenosti zdroje s daným úhlem vyzařování: lm = cd × sr, kde prostorový úhel kužele je 2π(1 − cos(úhel/2)); osvětlenost ve vzdálenosti d je cd / d². Předpokládá rovnoměrný svazek a bodový zdroj; skutečná svítidla mají světlo rozložené nerovnoměrně.',
    en: 'Links the luminous flux, intensity and illuminance of a source with a given beam angle: lm = cd × sr, where the solid angle of the cone is 2π(1 − cos(angle/2)); illuminance at distance d is cd / d². Assumes an even beam and a point source; real luminaires spread light unevenly.',
  },
  keywords: {
    cs: ['lumen', 'kandela', 'lux', 'světelný tok', 'svítivost', 'osvětlenost', 'žárovka', 'led', 'úhel vyzařování'],
    en: ['lumen', 'candela', 'lux', 'luminous flux', 'luminous intensity', 'illuminance', 'bulb', 'led', 'beam angle'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { known, value, angle, distance } = read.values;
    const solidAngle = coneSolidAngle(angle);
    const candela = known === 'candela' ? value : value / solidAngle;
    return {
      values: { lumen: candela * solidAngle, candela, lux: candela / distance ** 2, solidAngle },
      warnings: [],
    };
  },
  references: [
    { title: 'BIPM: The International System of Units (SI Brochure) – candela, lumen, lux', url: 'https://www.bipm.org/en/publications/si-brochure' },
    { title: 'Wikipedia: Solid angle – cone', url: 'https://en.wikipedia.org/wiki/Solid_angle' },
  ],
};
