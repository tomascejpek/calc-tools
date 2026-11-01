/**
 * Tool categories and a registry built from a list of tools, shared by the
 * entry points (index.js for all tools, beer.js for brewing).
 * @module core/registry
 */

import { searchTools } from './search.js';

/** All tool categories in display order. */
export const CATEGORIES = [
  { id: 'units-basic', name: { cs: 'Základní jednotky', en: 'Basic units' } },
  { id: 'units-mechanics', name: { cs: 'Mechanika', en: 'Mechanics' } },
  { id: 'units-concentration', name: { cs: 'Hustota a koncentrace', en: 'Density and concentration' } },
  { id: 'units-heat', name: { cs: 'Teplo', en: 'Heat' } },
  { id: 'units-flow', name: { cs: 'Průtok', en: 'Flow' } },
  { id: 'units-electric', name: { cs: 'Elektřina', en: 'Electricity' } },
  { id: 'units-light', name: { cs: 'Světlo a záření', en: 'Light and radiation' } },
  { id: 'units-other', name: { cs: 'Ostatní jednotky', en: 'Other units' } },
  { id: 'math-arithmetic', name: { cs: 'Aritmetika', en: 'Arithmetic' } },
  { id: 'math-numbers', name: { cs: 'Teorie čísel', en: 'Number theory' } },
  { id: 'math-algebra', name: { cs: 'Algebra', en: 'Algebra' } },
  { id: 'math-geometry', name: { cs: 'Geometrie', en: 'Geometry' } },
  { id: 'math-combinatorics', name: { cs: 'Kombinatorika', en: 'Combinatorics' } },
  { id: 'math-statistics', name: { cs: 'Statistika', en: 'Statistics' } },
  { id: 'finance', name: { cs: 'Finanční matematika', en: 'Financial mathematics' } },
  { id: 'physics-mechanics', name: { cs: 'Fyzika – mechanika', en: 'Physics – mechanics' } },
  { id: 'physics-fluids', name: { cs: 'Fyzika – kapaliny', en: 'Physics – fluids' } },
  { id: 'physics-thermal', name: { cs: 'Fyzika – termika', en: 'Physics – heat' } },
  { id: 'physics-gases', name: { cs: 'Fyzika – plyny', en: 'Physics – gases' } },
  { id: 'physics-electric', name: { cs: 'Fyzika – elektřina', en: 'Physics – electricity' } },
  { id: 'physics-waves', name: { cs: 'Fyzika – optika, vlnění a akustika', en: 'Physics – optics, waves and acoustics' } },
  { id: 'physics-astro', name: { cs: 'Fyzika – relativita a astronomie', en: 'Physics – relativity and astronomy' } },
  { id: 'chemistry-stoichiometry', name: { cs: 'Chemie – stechiometrie', en: 'Chemistry – stoichiometry' } },
  { id: 'chemistry-solutions', name: { cs: 'Chemie – roztoky', en: 'Chemistry – solutions' } },
  { id: 'chemistry-ph', name: { cs: 'Chemie – pH', en: 'Chemistry – pH' } },
  { id: 'chemistry-gases', name: { cs: 'Chemie – plyny', en: 'Chemistry – gases' } },
  { id: 'chemistry-kinetics', name: { cs: 'Chemie – kinetika', en: 'Chemistry – kinetics' } },
  { id: 'chemistry-thermo', name: { cs: 'Chemie – termochemie', en: 'Chemistry – thermochemistry' } },
  { id: 'sanitation', name: { cs: 'Sanitace', en: 'Sanitation' } },
  { id: 'food-baking', name: { cs: 'Pečení', en: 'Baking' } },
  { id: 'food-kitchen', name: { cs: 'Kuchyně', en: 'Kitchen' } },
  { id: 'food-preserving', name: { cs: 'Konzervace', en: 'Preserving' } },
  { id: 'nutrition', name: { cs: 'Výživa', en: 'Nutrition' } },
  { id: 'alcohol-health', name: { cs: 'Alkohol a zdraví', en: 'Alcohol and health' } },
  { id: 'eng-material', name: { cs: 'Technika – materiál', en: 'Engineering – materials' } },
  { id: 'eng-mechanical', name: { cs: 'Technika – strojírenství', en: 'Engineering – mechanical' } },
  { id: 'eng-building', name: { cs: 'Technika – stavební fyzika', en: 'Engineering – building physics' } },
  { id: 'eng-air', name: { cs: 'Technika – vzduch', en: 'Engineering – air' } },
  { id: 'eng-electric', name: { cs: 'Technika – elektroinstalace', en: 'Engineering – electrical installation' } },
  { id: 'environment', name: { cs: 'Meteorologie a životní prostředí', en: 'Weather and environment' } },
  { id: 'units', name: { cs: 'Pivovarské jednotky', en: 'Brewing units' } },
  { id: 'mash', name: { cs: 'Rmutování', en: 'Mashing' } },
  { id: 'water', name: { cs: 'Voda – objemy', en: 'Water volumes' } },
  { id: 'efficiency', name: { cs: 'Výtěžnost', en: 'Efficiency' } },
  { id: 'corrections', name: { cs: 'Korekce a měření', en: 'Corrections and readings' } },
  { id: 'hops', name: { cs: 'Hořkost', en: 'Bitterness' } },
  { id: 'color', name: { cs: 'Barva', en: 'Colour' } },
  { id: 'yeast', name: { cs: 'Kvasnice', en: 'Yeast' } },
  { id: 'fermentation', name: { cs: 'Kvašení a alkohol', en: 'Fermentation and alcohol' } },
  { id: 'water-chemistry', name: { cs: 'Voda – chemie', en: 'Water chemistry' } },
  { id: 'packaging', name: { cs: 'Stáčení a výčep', en: 'Packaging and dispensing' } },
  { id: 'wine', name: { cs: 'Víno a destiláty', en: 'Wine and spirits' } },
  { id: 'mead', name: { cs: 'Medovina a cider', en: 'Mead and cider' } },
];

/**
 * Orders tools by category and gives the categories they use, lookup by id
 * and full-text search over just these tools.
 * @template {{ id: string, category: string }} T
 * @param {T[]} list
 */
export function createRegistry(list) {
  const position = (/** @type {string} */ id) => CATEGORIES.findIndex((category) => category.id === id);
  for (const tool of list) {
    if (position(tool.category) < 0) throw new Error(`Unknown category ${tool.category} of ${tool.id}`);
  }
  // Array.prototype.sort is stable, so tools keep their order within a category
  const tools = [...list].sort((a, b) => position(a.category) - position(b.category));
  const used = new Set(tools.map((tool) => tool.category));
  const categories = CATEGORIES.filter((category) => used.has(category.id));

  return {
    tools,
    /** Categories of these tools in display order. */
    categories,
    /** @param {string} id */
    getTool(id) {
      return tools.find((tool) => tool.id === id);
    },
    /**
     * Tools matching a query in the given language and in English, ignoring
     * diacritics and case, ordered by relevance. An empty query returns all tools.
     * @param {string} query
     * @param {string} [lang]
     */
    search(query, lang = 'cs') {
      return searchTools(tools, query, lang);
    },
  };
}
