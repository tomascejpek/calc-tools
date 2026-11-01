/**
 * Thin lens equation and magnification.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'focal', type: 'number', default: 50, min: -1e7, max: 1e7, step: 1, unit: 'mm', label: { cs: 'Ohnisková vzdálenost f (rozptylka záporná)', en: 'Focal length f (negative for a diverging lens)' } },
  { id: 'object', type: 'number', default: 2000, min: 0.001, max: 1e12, step: 10, unit: 'mm', label: { cs: 'Vzdálenost předmětu a', en: 'Object distance a' } },
  { id: 'size', type: 'number', default: 1700, min: 0, max: 1e12, step: 10, unit: 'mm', label: { cs: 'Velikost předmětu', en: 'Object size' } },
];

const outputs = [
  { id: 'image', label: { cs: 'Vzdálenost obrazu a′', en: 'Image distance a′' }, unit: 'mm', significant: 6 },
  { id: 'magnification', label: { cs: 'Příčné zvětšení', en: 'Magnification' }, unit: '×', significant: 6 },
  { id: 'imageSize', label: { cs: 'Velikost obrazu', en: 'Image size' }, unit: 'mm', significant: 6 },
  { id: 'dioptres', label: { cs: 'Optická mohutnost', en: 'Optical power' }, unit: 'D', significant: 6 },
  { id: 'kind', type: 'text', label: { cs: 'Obraz', en: 'Image' } },
];

export default {
  id: 'thin-lens',
  kind: 'calculator',
  category: 'physics-waves',
  tags: ['physics'],
  name: { cs: 'Čočka (zobrazovací rovnice)', en: 'Thin lens equation' },
  description: {
    cs: 'Zobrazení tenkou čočkou: 1/f = 1/a + 1/a′, zvětšení Z = −a′/a. Kladná vzdálenost obrazu znamená skutečný převrácený obraz za čočkou, záporná zdánlivý vzpřímený obraz před ní (lupa). Optická mohutnost v dioptriích je 1000 / f v mm.',
    en: 'Imaging by a thin lens: 1/f = 1/a + 1/a′, magnification m = −a′/a. A positive image distance means a real inverted image behind the lens, a negative one a virtual upright image in front of it (magnifier). Optical power in dioptres is 1000 / f in mm.',
  },
  keywords: {
    cs: ['čočka', 'spojka', 'rozptylka', 'ohnisko', 'ohnisková vzdálenost', 'zvětšení', 'zobrazovací rovnice', 'dioptrie'],
    en: ['lens', 'thin lens', 'converging lens', 'diverging lens', 'focal length', 'magnification', 'lens equation', 'dioptre'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { focal, object, size } = read.values;
    if (focal === 0) return emptyResult(outputs, [{ cs: 'Ohnisková vzdálenost nesmí být nula.', en: 'The focal length must not be zero.' }]);
    if (Math.abs(object - focal) < 1e-12 * Math.abs(focal)) {
      return emptyResult(outputs, [{ cs: 'Předmět v ohnisku se zobrazí do nekonečna.', en: 'An object at the focal point is imaged at infinity.' }]);
    }
    const image = 1 / (1 / focal - 1 / object);
    const magnification = -image / object;
    const kind = image > 0
      ? { cs: 'skutečný, převrácený', en: 'real, inverted' }
      : { cs: 'zdánlivý, vzpřímený', en: 'virtual, upright' };
    return { values: { image, magnification, imageSize: size * magnification, dioptres: 1000 / focal, kind }, warnings: [] };
  },
  references: [{ title: 'Hecht, E.: Optics, 5th ed. – thin lenses' }],
};
