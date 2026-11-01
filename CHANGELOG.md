# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Arithmetic: percentages, percent change and percentage points, rule of
  three, exact fractions, rounding to decimal places or significant digits
  by five rules.
- Number theory: GCD and LCM, primality (deterministic Miller–Rabin) and
  prime factorisation up to 2⁵³ (trial division and Pollard's rho), number
  bases 2–36 of any length, Roman numerals.
- Algebra: quadratic and cubic equations with complex roots, systems of 2 or
  3 linear equations, powers, roots and logarithms.
- Geometry: perimeter and area of shapes, volume and surface of solids,
  triangle solver (law of sines and cosines, both SSA solutions),
  Pythagorean theorem, tank volume by liquid level (upright,
  cylindroconical, horizontal; tagged `beer`, so also in `beer.js`).
- Combinatorics: factorial, permutations, variations and combinations with
  and without repetition, exact with big integers.
- Statistics: descriptive statistics with a t-based confidence interval,
  normal distribution (z-score, p-values, quantile), linear regression.
- Financial mathematics: compound interest, annuity loan, APR (RPSN) by
  Directive 2008/48/EC, VAT, margin and markup.
- Physics: accelerated motion, free fall, projectile motion, mechanical
  energy, momentum and collisions, work and power, lever and pulley;
  hydrostatic pressure, buoyancy, pipe flow, Bernoulli's equation, pipe
  pressure loss (Darcy–Weisbach with Colebrook); heat for warming, mixing
  liquids, heating time, latent heat and boil-off, wort cooling water, heat
  loss through insulation, thermal expansion (water by Kell); ideal gas law,
  gas laws, gas solubility (Henry); Ohm's law, series and parallel
  components, voltage divider, LED resistor (E12/E24), wire size by voltage
  drop, battery runtime, electricity cost; refraction with Fresnel
  reflectance, thin lens, speed of sound in air and water, Doppler effect,
  decibels; time dilation, escape and orbital velocity, orbital period,
  astronomical distances.
- Chemistry: molar mass from formulas with brackets and hydrates, amount of
  substance, balancing equations exactly (null space with rational
  arithmetic), reaction yield; dilution, cross rule, preparing solutions;
  pH of strong and weak acids and bases from the charge balance, buffers,
  Ka ⇄ pKa; gas volume at standard conditions, partial pressures; half-life
  of orders 0–2, Arrhenius equation and shelf life; reaction enthalpy by
  Hess's law, heating value of fuels; sanitizer dilution (Star San,
  iodophor, peroxide, bleach, peracetic acid).
- `core/chemistry.js` with IUPAC atomic weights of all 118 elements.
- Food and nutrition: baker's percentages, dough hydration, sourdough
  levain, kitchen measures by ingredient density, recipe scaling by servings
  or pan size, salting and curing with nitrite salts, fermentation brine,
  pasteurization units, BMI, basal metabolic rate (Mifflin–St Jeor), food
  energy by EU factors, blood alcohol (Widmark with Seidl's factor).
- Engineering and building: material weight of sheets, bars, tubes and
  profiles; concrete, mortar and plaster, paint, tiles with adhesive and
  grout; ISO metric threads with tap drills and stress area; cutting speed;
  gear and pulley ratios with belt length; ISO 286 limits and fits (holes H,
  G, F, shafts f–p, IT5–IT11, up to 500 mm); U-value of layered elements
  with the ČSN 73 0540-2 rating; surface condensation and mould risk;
  humidity and dew point (Magnus); room heating and cooling power;
  three-phase power, power factor correction and circuit breaker size.
- `alcohol-units` gains `servings`, a `standard` select (WHO 10 g, UK 8 g,
  Australia 10 g, Canada 13.45 g, USA 14 g) and a `kcal` output; the
  defaults give the same results as before.
- `beer.js` also holds the heat tools a brewer needs: heat, mixing, heating
  time, latent heat, wort cooling, thermal expansion and gas solubility,
  and the Arrhenius shelf life and sanitizer dilution.
- `core/physics.js` with constants, water density (Kell 1975), specific
  heats and celestial bodies.
- Input type `text` (with `maxLength`, `pattern` and `hint`) and output type
  `text` (a string or a text per language); the demo shows both.
- `core/special.js` (log-gamma, incomplete gamma and beta, normal and
  Student t distributions and inverses) and `core/format.js`.

### Changed

- `alcohol-units` moves from the `fermentation` category to the new
  `alcohol-health` category; pasteurization and blood alcohol are tagged
  `beer` and in `beer.js` too.
- The hostile-input test lets a tool with only text inputs accept a value its
  pattern allows (NaN is a valid formula), as long as nothing is echoed.
- An optional input that is not passed at all takes its `default`, as a form
  shows it; an empty value (`''` or `null`) is still read as `null`. No
  existing optional input had a default, so their results are unchanged.

## [0.3.0] – 2026-10-31

### Added

- Unit converters: SI prefixes from quecto to quetta, length, area, time,
  speed, acceleration, force, energy, power, torque, density, concentration
  (with solution density, substance density and molar mass), specific heat
  capacity, thermal conductivity, volume flow, mass flow, voltage, current,
  resistance, capacitance, charge (Ah ⇄ Wh at a voltage), illuminance,
  wavelength ⇄ frequency ⇄ photon energy, angle, radioactivity, radiation
  dose (Gy ⇄ Sv with the weighting factor), data sizes (kB and KiB) and fuel
  consumption.
- Calculator linking lumens, candelas and lux for a beam angle and distance.
- New units in existing converters: volume (cl, dl, m³, in³, ft³, US quart,
  UK fl oz), mass (µg, mg, ct, dag, t, grain, stone, short and long ton),
  pressure (Pa, hPa, MPa, mbar, at, mmHg, Torr, inHg, m H₂O), temperature
  (Rankine, Réaumur).
- `significant` on units and outputs: significant digits to show instead of
  decimal places; the demo honours it.
- `unitTable()`, `prefixedRows()` and `SI_PREFIXES` in `core/converter.js`.
- Entry point `beer.js` (package export `calc-tools/beer`) with the same API
  as `index.js` but only the tools tagged `beer`; the browser loads 51
  modules instead of 82. `categories` there lists only the categories used.
- `createRegistry()` and `CATEGORIES` in `core/registry.js`, shared by both
  entry points.

### Changed

- Unit categories are split into basic units, mechanics, density and
  concentration, heat, flow, electricity, light and radiation and other
  units; `units` now holds only brewing units. Temperature, volume and mass
  move to `units-heat` and `units-basic`, pressure to `units-mechanics`.
- Temperature, volume, mass, pressure, density, volume flow and specific
  heat converters are tagged `beer`.
- The converter round-trip test sets every converter parameter.

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
