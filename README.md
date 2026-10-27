# calc-tools

Calculators and unit converters written as plain data plus pure functions.
A page reads the tool descriptions and builds the forms itself, so the same
tools serve any UI. Brewing tools come first; other fields will follow.

- Pure ES modules (ES2020), no runtime dependencies, no build step, types in JSDoc.
- Bilingual texts (Czech and English).
- Installable with pip as Django static files.

## Tools

| Category | Tools |
|---|---|
| Unit conversions | gravity (SG, °P, °Bx), beer colour (EBC, SRM, °L), temperature, volume, mass, pressure, CO₂ (volumes, g/l), ABV ⇄ ABW |
| Beer | alcohol from OG/FG, alcohol from degree Plato, alcohol grams and standard drinks, IBU (Tinseth), priming sugar, keg carbonation |

Every tool lists the sources of its formulas in `references`.

## Use in JavaScript

```js
import { tools, getTool, search, convert, calculate, localize } from './calc_tools/static/calc_tools/index.js';

// Converter: enter a value in one unit, get all units
convert(getTool('gravity'), '12', 'plato');
// → { values: { sg: 1.0484, plato: 12, brix: 12 }, warnings: [] }

// Calculator: inputs → outputs; missing inputs take their defaults
calculate(getTool('abv'), { og: 1.050, fg: 1.010 });
// → { values: { abv: 5.25, abw: 4.12, … }, warnings: [] }

search('stupnovitost', 'cs');   // diacritics and case do not matter
localize(getTool('ibu').name, 'cs'); // 'Hořkost (IBU)'
```

Numbers come back as `number` (or `null` when the input is invalid or out of
range; `warnings` then says why, in `cs` and `en`). Rounding to `precision`
and the decimal comma are up to the UI. A `unit` is either a plain string
(`'SG'`, `'g'`) or a text per language; `localize(unit, lang)` handles both. Inputs may be numbers or strings with a
decimal comma or dot.

The pure formulas are exported too, e.g. `sgToPlato` from `core/units.js`
or `tinsethIbu` from `tools/beer/ibu.js`.

## Use in Django

```
# requirements.txt
calc-tools @ git+https://github.com/tomascejpek/calc-tools.git@0.1.1
```

```python
INSTALLED_APPS = [
    # …
    "calc_tools",
]
```

```django
{% load static %}
<script type="module">
  import { tools, search } from "{% static 'calc_tools/index.js' %}";
</script>
```

`collectstatic` picks the modules up. Django is not a dependency of the
package; it is imported only by `calc_tools/apps.py`.

## Tool interface

Each tool is one module with a default export.

**Converter** – equal units of one quantity:

```js
export default {
  id: 'gravity',             // unique, kebab-case, also used as the URL hash
  kind: 'converter',
  category: 'units',         // see `categories` in index.js
  tags: ['beer'],            // field; general conversions have none
  name: { cs, en }, description: { cs, en }, keywords: { cs: [], en: [] },
  units: [
    { id: 'sg', label: { cs, en }, precision: 3, min: 0.990, max: 1.200, default: 1.048 },
    // …; one unit carries `default`, the value shown first
  ],
  params: [],                // optional extra inputs, passed to toBase/fromBase
  toBase(value, unitId, params) {},
  fromBase(value, unitId, params) {},
  references: [{ title, url }],
};
```

**Calculator** – inputs to outputs:

```js
export default {
  id: 'abv', kind: 'calculator', category: 'beer', tags: ['beer'],
  name, description, keywords,
  inputs: [
    { id: 'og', type: 'number', label, unit: 'SG', default: 1.050, min, max, step },
    { id: 'method', type: 'select', label, default: 'standard', options: [{ value, label }] },
    { id: 'hops', type: 'list', label, min: 1, max: 10, fields: [/* inputs */] },
  ],
  outputs: [
    { id: 'abv', label, unit: { cs: '% obj.', en: '% ABV' }, precision: 1 }, // or a plain string such as 'SG'
    { id: 'additions', type: 'list', label, unit: 'IBU', precision: 1 }, // array of numbers
  ],
  compute(values) { return { values: {}, warnings: [] }; },
  references,
};
```

`compute`, `toBase` and `fromBase` are pure functions. Tools contain no HTML
and do not touch the DOM.

## Adding a tool

1. Copy `templates/calculator.js` to
   `calc_tools/static/calc_tools/tools/<category>/<id>.js` (for a converter,
   start from an existing one such as `tools/units/mass.js`).
2. Fill in the texts in both languages, the inputs and outputs, the formula
   and its sources. Validate inputs with `readInputs()` and return
   `emptyResult()` with warnings for invalid input; never throw.
3. Import the module in `index.js` and add it to `tools`.
4. Write tests in `test/` with values from published tables or sources.
   `test/registry.test.js` checks the texts and defaults automatically.

## Tests

```
npm test
```

Uses the built-in `node:test` runner (Node 20+); no packages to install.

## Demo

```
python -m http.server   # or: npx serve
```

Then open <http://localhost:8000/demo/>. The demo renders every tool, filters
them as you type and switches between Czech and English. It is for trying
the tools by hand, not for deployment.

## License

MIT

## Česky

Knihovna kalkulaček a převodů jednotek, zatím hlavně pivovarských. Nástroje
jsou popsané daty a čistými funkcemi; stránka z popisu sama vytvoří formulář.
Do Djanga se instaluje přes pip (viz výše) a moduly se načtou jako statické
soubory. Nový nástroj: zkopírovat `templates/calculator.js`, zaregistrovat
v `index.js`, napsat testy.
