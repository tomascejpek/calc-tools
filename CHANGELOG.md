# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## [0.1.1] – 2026-10-27

### Fixed

- English texts showed Czech units (`% obj.`, `% hm.`, `obj. CO₂`). A `unit`
  may now be a text per language (`{ cs, en }`) as well as a plain string;
  `localize()` accepts both.

## [0.1.0] – 2026-10-27

### Added

- Tool interface for converters and calculators, `index.js` registry with
  `tools`, `categories`, `getTool()` and diacritics-insensitive `search()`.
- Helpers `convert()`, `calculate()` and `readInputs()` with bilingual warnings
  and decimal-comma input.
- Converters: gravity (SG, °P, °Bx), beer colour (EBC, SRM, °L), temperature,
  volume, mass, pressure, CO₂ (volumes, g/l), ABV ⇄ ABW.
- Calculators: alcohol content from OG/FG, alcohol from degree Plato, alcohol
  grams and standard drinks, IBU by Tinseth, priming sugar, keg carbonation.
- Python package `calc_tools` shipping the modules as Django static files.
- Demo page and GitHub Actions tests on Node 20 and 22.
