# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## [0.2.0] – 2026-10-31

### Added

- Mashing: strike water temperature, step infusion, decoction.
- Water volumes: mash and sparge water from batch size, boil-off, grain
  absorption, dead space and cooling shrinkage.
- Efficiency: brewhouse efficiency, malt extract converter (% ⇄ PPG ⇄
  points·l/kg), original gravity from a recipe.
- Corrections: diluting or concentrating wort, raising gravity with sugar,
  malt extract or honey, hydrometer temperature correction, refractometer
  before and during fermentation (Sean Terrill).
- Bitterness: IBU by Rager, Garetz and Daniels besides Tinseth (new `method`,
  `boilVolume` and `elevation` inputs of `ibu`), hop stand and whirlpool IBU
  (Malowicki), hop utilisation by boil time, BU:GU.
- Colour: beer colour from a recipe (Morey).
- Yeast: pitch rate, stir plate starter (Troester), liquid yeast viability.
- Fermentation: apparent and real attenuation, real extract, alcohol by
  Balling and calories split into alcohol and carbohydrates.
- Water chemistry: residual alkalinity, sulfate to chloride ratio, brewing
  salt additions, mash pH estimate, lactic or phosphoric acid for water.
- Packaging: draught line length.
- Wine and spirits: must weight (°NM, °Oe, °Bx, °KMW), potential alcohol and
  chaptalisation, sulfiting, diluting spirit and alcoholmeter correction by
  the International Alcoholometric Tables (OIML).
- Mead and cider: honey or sugar for a target gravity, TOSNA nutrients.
- Core helpers `core/gravity.js` (SG or °P inputs), `core/ethanol.js`
  (OIML density of water–ethanol mixtures), `core/water.js` (alkalinity,
  salts, carbonate equilibrium), `extractKg()` and `platoFromExtract()` in
  `core/units.js`, `withDefaultItem()` in `core/tool.js`.
- Tests of hostile input (markup, SQL, paths, `NaN`, `1e999`, `__proto__`)
  and of ignored unexpected fields for every tool.

### Changed

- The `beer` category is split into groups: `fermentation` (abv,
  degree-to-abv, alcohol-units), `hops` (ibu) and `packaging` (priming-sugar,
  keg-carbonation). Module paths are unchanged.
- The pellet option of `ibu` no longer says "+10 %" in its label, as Daniels
  uses its own table for pellets.

### Fixed

- `readInputs()` read values inherited through an object's prototype; it now
  reads only own properties.

## [0.1.2] – 2026-10-27

### Fixed

- Pressure converter rejects values below a full vacuum (−1 atm gauge).
- Demo page no longer requests a missing favicon.

### Changed

- Every tool has at least three separate tests, including zero and
  out-of-range input.

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
