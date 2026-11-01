/**
 * Amount of substance: mass ⇄ moles ⇄ number of particles.
 */

import { AVOGADRO, formulaMass, IUPAC_WEIGHTS } from '../../core/chemistry.js';
import { emptyResult, readInputs } from '../../core/tool.js';
import { BAD_FORMULA, FORMULA_INPUT } from './molar-mass.js';

const inputs = [
  { id: 'formula', ...FORMULA_INPUT, default: 'H2O', label: { cs: 'Vzorec látky', en: 'Formula' } },
  {
    id: 'known', type: 'select', default: 'mass', label: { cs: 'Znám', en: 'I know' },
    options: [
      { value: 'mass', label: { cs: 'hmotnost (g)', en: 'mass (g)' } },
      { value: 'moles', label: { cs: 'látkové množství (mol)', en: 'amount (mol)' } },
      { value: 'particles', label: { cs: 'počet částic', en: 'number of particles' } },
    ],
  },
  { id: 'value', type: 'number', default: 18, min: 0, max: 1e40, step: 1, label: { cs: 'Hodnota', en: 'Value' } },
];

const outputs = [
  { id: 'mass', label: { cs: 'Hmotnost', en: 'Mass' }, unit: 'g', significant: 6 },
  { id: 'moles', label: { cs: 'Látkové množství', en: 'Amount of substance' }, unit: 'mol', significant: 6 },
  { id: 'particles', label: { cs: 'Počet částic', en: 'Number of particles' }, significant: 6 },
  { id: 'molarMass', label: { cs: 'Molární hmotnost', en: 'Molar mass' }, unit: 'g/mol', significant: 6 },
];

export default {
  id: 'amount',
  kind: 'calculator',
  category: 'chemistry-stoichiometry',
  tags: ['chemistry'],
  name: { cs: 'Látkové množství (m ⇄ n ⇄ N)', en: 'Amount of substance (m ⇄ n ⇄ N)' },
  description: {
    cs: 'Převod mezi hmotností, látkovým množstvím a počtem částic: n = m / M, N = n · N_A. 18 g vody je asi 1 mol, tedy 6,022 · 10²³ molekul. Molární hmotnost se spočítá ze vzorce.',
    en: 'Converts between mass, amount of substance and number of particles: n = m / M, N = n · N_A. 18 g of water is about 1 mol, i.e. 6.022 · 10²³ molecules. The molar mass comes from the formula.',
  },
  keywords: {
    cs: ['látkové množství', 'mol', 'avogadrova konstanta', 'počet částic', 'hmotnost', 'molární hmotnost', 'stechiometrie'],
    en: ['amount of substance', 'mole', 'moles', 'avogadro', 'number of particles', 'mass', 'stoichiometry'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { formula, known, value } = read.values;
    const molar = formulaMass(formula);
    if (molar === null) return emptyResult(outputs, [BAD_FORMULA]);
    const moles = known === 'mass' ? value / molar : known === 'moles' ? value : value / AVOGADRO;
    return { values: { mass: moles * molar, moles, particles: moles * AVOGADRO, molarMass: molar }, warnings: [] };
  },
  references: [IUPAC_WEIGHTS, { title: 'BIPM: The International System of Units (SI Brochure) – Avogadro constant', url: 'https://www.bipm.org/en/publications/si-brochure' }],
};
