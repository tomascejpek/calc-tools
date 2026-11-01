/**
 * Weight of sheets, bars, tubes and profiles by dimensions and density.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Densities, kg/m³. */
export const MATERIAL_DENSITY = {
  steel: 7850, stainless: 7930, castIron: 7200, aluminium: 2700, copper: 8960, brass: 8500,
  titanium: 4510, zinc: 7140, lead: 11340, pvc: 1400, pe: 950, plexiglass: 1190, glass: 2500,
  spruce: 450, oak: 700, concrete: 2400,
};

/**
 * Cross-section area, mm².
 * @param {string} shape
 * @param {{ a: number, b: number, thickness: number }} size a = width or outer diameter, b = height
 * @returns {number | null} null for impossible walls
 */
export function sectionArea(shape, { a, b, thickness }) {
  switch (shape) {
    case 'plate': return a * thickness;
    case 'round': return Math.PI * a * a / 4;
    case 'tube': return thickness * 2 >= a ? null : Math.PI / 4 * (a * a - (a - 2 * thickness) ** 2);
    case 'square': return a * a;
    case 'rectangle': return a * b;
    case 'hollowRectangle': return thickness * 2 >= Math.min(a, b) ? null : a * b - (a - 2 * thickness) * (b - 2 * thickness);
    case 'hexagon': return Math.sqrt(3) / 2 * a * a;
    case 'angle': return thickness >= Math.min(a, b) ? null : thickness * (a + b - thickness);
    default: return null;
  }
}

const size = (/** @type {string} */ id, /** @type {number} */ value, /** @type {string} */ cs, /** @type {string} */ en) => ({
  id, type: 'number', default: value, min: 0, max: 1e7, step: 1, unit: 'mm', label: { cs, en },
});

const inputs = [
  {
    id: 'shape', type: 'select', default: 'tube', label: { cs: 'Tvar', en: 'Shape' },
    options: [
      { value: 'plate', label: { cs: 'plech, deska, pásovina (šířka a × tloušťka)', en: 'sheet, plate, flat bar (width a × thickness)' } },
      { value: 'round', label: { cs: 'kulatina (průměr a)', en: 'round bar (diameter a)' } },
      { value: 'tube', label: { cs: 'trubka (vnější průměr a, stěna)', en: 'tube (outer diameter a, wall)' } },
      { value: 'square', label: { cs: 'čtyřhran (strana a)', en: 'square bar (side a)' } },
      { value: 'rectangle', label: { cs: 'plný obdélník (a × b)', en: 'solid rectangle (a × b)' } },
      { value: 'hollowRectangle', label: { cs: 'jäkl – uzavřený profil (a × b, stěna)', en: 'hollow section (a × b, wall)' } },
      { value: 'hexagon', label: { cs: 'šestihran (rozměr přes plochy a)', en: 'hexagon bar (across flats a)' } },
      { value: 'angle', label: { cs: 'úhelník L (ramena a × b, tloušťka)', en: 'angle L (legs a × b, thickness)' } },
    ],
  },
  {
    id: 'material', type: 'select', default: 'steel', label: { cs: 'Materiál', en: 'Material' },
    options: [
      { value: 'steel', label: { cs: 'ocel (7850 kg/m³)', en: 'steel (7850 kg/m³)' } },
      { value: 'stainless', label: { cs: 'nerezová ocel (7930)', en: 'stainless steel (7930)' } },
      { value: 'castIron', label: { cs: 'litina (7200)', en: 'cast iron (7200)' } },
      { value: 'aluminium', label: { cs: 'hliník (2700)', en: 'aluminium (2700)' } },
      { value: 'copper', label: { cs: 'měď (8960)', en: 'copper (8960)' } },
      { value: 'brass', label: { cs: 'mosaz (8500)', en: 'brass (8500)' } },
      { value: 'titanium', label: { cs: 'titan (4510)', en: 'titanium (4510)' } },
      { value: 'zinc', label: { cs: 'zinek (7140)', en: 'zinc (7140)' } },
      { value: 'lead', label: { cs: 'olovo (11 340)', en: 'lead (11,340)' } },
      { value: 'pvc', label: { cs: 'PVC (1400)', en: 'PVC (1400)' } },
      { value: 'pe', label: { cs: 'polyethylen (950)', en: 'polyethylene (950)' } },
      { value: 'plexiglass', label: { cs: 'plexisklo (1190)', en: 'acrylic (1190)' } },
      { value: 'glass', label: { cs: 'sklo (2500)', en: 'glass (2500)' } },
      { value: 'spruce', label: { cs: 'smrk, suchý (450)', en: 'spruce, dry (450)' } },
      { value: 'oak', label: { cs: 'dub, suchý (700)', en: 'oak, dry (700)' } },
      { value: 'concrete', label: { cs: 'beton (2400)', en: 'concrete (2400)' } },
      { value: 'custom', label: { cs: 'zadám hustotu', en: 'custom density' } },
    ],
  },
  { id: 'density', type: 'number', default: 7850, min: 1, max: 25000, step: 10, unit: 'kg/m³', label: { cs: 'Vlastní hustota', en: 'Custom density' } },
  size('a', 48.3, 'Rozměr a (šířka, průměr)', 'Size a (width, diameter)'),
  size('b', 40, 'Rozměr b (výška profilu)', 'Size b (section height)'),
  size('thickness', 3.2, 'Tloušťka nebo stěna', 'Thickness or wall'),
  { id: 'length', type: 'number', default: 6, min: 0, max: 1e6, step: 0.1, unit: 'm', label: { cs: 'Délka', en: 'Length' } },
  { id: 'count', type: 'number', default: 1, min: 0, max: 1e6, step: 1, label: { cs: 'Počet kusů', en: 'Pieces' } },
];

const outputs = [
  { id: 'mass', label: { cs: 'Hmotnost celkem', en: 'Total mass' }, unit: 'kg', significant: 5 },
  { id: 'perMetre', label: { cs: 'Hmotnost na metr', en: 'Mass per metre' }, unit: 'kg/m', significant: 5 },
  { id: 'area', label: { cs: 'Průřez', en: 'Cross-section' }, unit: 'mm²', significant: 5 },
];

export default {
  id: 'material-weight',
  kind: 'calculator',
  category: 'eng-material',
  tags: ['engineering'],
  name: { cs: 'Hmotnost materiálu (plech, trubka, profil)', en: 'Material weight (sheet, tube, profile)' },
  description: {
    cs: 'Hmotnost plechu, kulatiny, trubky, jäklu, šestihranu nebo úhelníku z rozměrů průřezu, délky a hustoty materiálu. Úhelník a profily se počítají s ostrými hranami bez zaoblení, takže skutečné válcované profily jsou o pár procent lehčí – pro přesné hodnoty použijte tabulky výrobce.',
    en: 'Weight of a sheet, round bar, tube, hollow section, hexagon or angle from the cross-section, length and density. Angles and hollow sections are taken with sharp corners, so real rolled sections are a few percent lighter – for exact values use the maker\'s tables.',
  },
  keywords: {
    cs: ['hmotnost materiálu', 'váha plechu', 'váha trubky', 'jäkl', 'profil', 'kulatina', 'ocel', 'hliník', 'kg/m'],
    en: ['material weight', 'steel weight', 'sheet weight', 'tube weight', 'hollow section', 'round bar', 'kg per metre'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { shape, material, length, count } = read.values;
    const density = material === 'custom' ? read.values.density : MATERIAL_DENSITY[/** @type {keyof typeof MATERIAL_DENSITY} */ (material)];
    const area = sectionArea(shape, /** @type {any} */ (read.values));
    if (area === null) return emptyResult(outputs, [{ cs: 'Stěna je silnější než polovina profilu.', en: 'The wall is thicker than half the section.' }]);
    const perMetre = area * 1e-6 * density;
    return { values: { mass: perMetre * length * count, perMetre, area }, warnings: [] };
  },
  references: [{ title: 'EN 10219-2 / EN 10255 – dimensions of hollow sections and tubes; Engineering ToolBox: densities of metals', url: 'https://www.engineeringtoolbox.com/metal-alloys-densities-d_50.html' }],
};
