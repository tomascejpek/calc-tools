/**
 * Load current and the next standard circuit breaker rating.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/** Standard rated currents of circuit breakers, A (IEC 60898-1). */
export const BREAKER_RATINGS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

const inputs = [
  {
    id: 'system', type: 'select', default: 'single', label: { cs: 'Soustava', en: 'System' },
    options: [
      { value: 'single', label: { cs: 'jednofázová 230 V', en: 'single-phase 230 V' } },
      { value: 'three', label: { cs: 'třífázová 400 V', en: 'three-phase 400 V' } },
    ],
  },
  { id: 'power', type: 'number', default: 3000, min: 1, max: 1e7, step: 100, unit: 'W', label: { cs: 'Příkon spotřebičů na okruhu', en: 'Load on the circuit' } },
  { id: 'cosphi', type: 'number', default: 1, min: 0.1, max: 1, step: 0.01, label: { cs: 'Účiník (topení 1, motory 0,8)', en: 'Power factor (heating 1, motors 0.8)' } },
  { id: 'simultaneity', type: 'number', default: 100, min: 1, max: 100, step: 5, unit: '%', label: { cs: 'Soudobost (kolik běží najednou)', en: 'Diversity (share running at once)' } },
];

const outputs = [
  { id: 'current', label: { cs: 'Proud zátěže', en: 'Load current' }, unit: 'A', significant: 4 },
  { id: 'breaker', label: { cs: 'Nejbližší vyšší jistič', en: 'Next breaker rating up' }, unit: 'A', precision: 0 },
  { id: 'load', label: { cs: 'Vytížení jističe', en: 'Breaker loading' }, unit: '%', precision: 0 },
];

const SAFETY = {
  cs: 'Jistič musí chránit vodič: proud vodiče musí být aspoň jmenovitý proud jističe (ČSN 33 2000-4-43). Průřez podle uložení určuje ČSN 33 2000-5-52; elektroinstalaci smí navrhovat a zapojovat jen osoba s elektrotechnickou kvalifikací.',
  en: 'The breaker must protect the cable: the cable rating must be at least the breaker rating (IEC 60364-4-43). The cross-section for the installation method follows IEC 60364-5-52; wiring may be designed and installed only by a qualified electrician.',
};

export default {
  id: 'circuit-breaker',
  kind: 'calculator',
  category: 'eng-electric',
  tags: ['engineering'],
  name: { cs: 'Jištění okruhu', en: 'Circuit breaker size' },
  description: {
    cs: 'Proud, který okruh odebírá, a nejbližší vyšší jmenovitý proud jističe z řady 6, 10, 13, 16, 20, 25, 32… A. Například 3 kW na 230 V je 13 A, tedy jistič 16 A. Charakteristika B se volí pro běžné zásuvky a světla, C pro motory a spotřebiče s velkým záběrovým proudem. Výpočet nenahrazuje návrh elektroinstalace.',
    en: 'The current a circuit draws and the next standard breaker rating from 6, 10, 13, 16, 20, 25, 32… A. For example 3 kW at 230 V is 13 A, hence a 16 A breaker. Curve B suits ordinary sockets and lights, C motors and loads with a high inrush current. This does not replace designing the installation.',
  },
  keywords: {
    cs: ['jištění', 'jistič', 'proud', 'okruh', 'elektroinstalace', '16 a', 'zásuvka', 'příkon'],
    en: ['circuit breaker', 'breaker size', 'mcb', 'current', 'circuit', 'electrical installation', 'fuse'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { system, power, cosphi, simultaneity } = read.values;
    const current = power * simultaneity / 100 / ((system === 'three' ? Math.sqrt(3) * 400 : 230) * cosphi);
    const breaker = BREAKER_RATINGS.find((rating) => rating >= current) ?? null;
    if (breaker === null) {
      return emptyResult(outputs, [{ cs: 'Proud přesahuje 125 A; jde o přívod, který musí navrhnout projektant.', en: 'The current exceeds 125 A; this is a supply that must be designed by an engineer.' }, SAFETY]);
    }
    return { values: { current, breaker, load: current / breaker * 100 }, warnings: [SAFETY] };
  },
  references: [
    { title: 'IEC 60898-1: Circuit-breakers for overcurrent protection for household and similar installations' },
    { title: 'ČSN 33 2000-4-43 (IEC 60364-4-43): Ochrana před nadproudy' },
  ],
};
