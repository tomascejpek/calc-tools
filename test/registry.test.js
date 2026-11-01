import { test } from 'node:test';
import assert from 'node:assert/strict';

import { categories, convert, calculate, getTool, tools } from '../calc_tools/static/calc_tools/index.js';

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * @param {any} text
 * @param {string} where
 */
function bilingual(text, where) {
  assert.ok(text && typeof text.cs === 'string' && text.cs && typeof text.en === 'string' && text.en, `${where} needs cs and en`);
}

test('tool ids are unique kebab-case and findable', () => {
  const ids = tools.map((tool) => tool.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, ID);
    assert.equal(getTool(id)?.id, id);
  }
  assert.equal(getTool('nothing'), undefined);
});

test('tools are ordered by category', () => {
  const order = categories.map((category) => category.id);
  const positions = tools.map((tool) => order.indexOf(tool.category));
  assert.ok(positions.every((position) => position >= 0), 'every category is registered');
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  for (const category of categories) bilingual(category.name, `category ${category.id}`);
});

/**
 * @param {any} unit
 * @param {string} where
 */
function checkUnit(unit, where) {
  if (unit === undefined || typeof unit === 'string') return;
  bilingual(unit, `${where} unit`);
}

/**
 * @param {any[]} inputs
 * @param {string} where
 */
function checkInputs(inputs, where) {
  for (const input of inputs) {
    bilingual(input.label, `${where} input ${input.id}`);
    checkUnit(input.unit, `${where} input ${input.id}`);
    if (input.type === 'select') {
      assert.ok(input.options.some((/** @type {any} */ option) => option.value === input.default), `${where} ${input.id} default`);
      for (const option of input.options) bilingual(option.label, `${where} option ${option.value}`);
    }
    if (input.type === 'list') checkInputs(input.fields, `${where} ${input.id}`);
  }
}

test('every tool has complete bilingual texts and references', () => {
  for (const tool of tools) {
    assert.ok(['converter', 'calculator'].includes(tool.kind), tool.id);
    assert.ok(Array.isArray(tool.tags), `${tool.id} tags`);
    bilingual(tool.name, `${tool.id} name`);
    bilingual(tool.description, `${tool.id} description`);
    assert.ok(tool.keywords.cs.length && tool.keywords.en.length, `${tool.id} keywords`);
    assert.ok(tool.references.length && tool.references.every((/** @type {any} */ ref) => ref.title), `${tool.id} references`);
    if (tool.kind === 'converter') {
      assert.ok(tool.units.length >= 2, `${tool.id} units`);
      for (const unit of tool.units) bilingual(unit.label, `${tool.id} unit ${unit.id}`);
      checkInputs(tool.params ?? [], tool.id);
    } else {
      checkInputs(tool.inputs, tool.id);
      for (const output of tool.outputs) {
        bilingual(output.label, `${tool.id} output ${output.id}`);
        checkUnit(output.unit, `${tool.id} output ${output.id}`);
      }
    }
  }
});

test('every tool works with its defaults', () => {
  for (const tool of tools) {
    if (tool.kind === 'converter') {
      const unit = tool.units.find((/** @type {any} */ candidate) => candidate.default !== undefined);
      assert.ok(unit, `${tool.id} needs a unit with a default value`);
      const result = convert(tool, unit.default, unit.id);
      assert.deepEqual(result.warnings, [], tool.id);
    } else {
      const result = calculate(tool, {});
      for (const output of tool.outputs) {
        assert.notEqual(result.values[output.id], null, `${tool.id} ${output.id}`);
      }
    }
  }
});

const HOSTILE = ['<script>alert(1)</script>', '1; DROP TABLE tools', '../../etc/passwd', 'NaN', 'Infinity', '1e999', '0x10', '__proto__'];

/**
 * Input values where every field holds the given hostile value; lists get
 * one item made the same way.
 * @param {any[]} inputs
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function hostileValues(inputs, value) {
  return Object.fromEntries(inputs.map((input) => [
    input.id,
    input.type === 'list' ? [hostileValues(input.fields, value)] : value,
  ]));
}

test('hostile input gives null outputs and warnings, never a result', () => {
  for (const tool of tools) {
    for (const value of HOSTILE) {
      const result = tool.kind === 'converter'
        ? convert(tool, value, tool.units[0].id)
        : calculate(tool, hostileValues(tool.inputs, value));
      // A tool with only text inputs may accept the value when every pattern allows
      // it (NaN is the formula of sodium nitride), but it must never echo markup
      const textOnly = tool.kind === 'calculator' && tool.inputs.every((/** @type {any} */ input) => input.type === 'text');
      if (textOnly && tool.inputs.every((/** @type {any} */ input) => !input.pattern || input.pattern.test(value))) {
        assert.doesNotMatch(JSON.stringify(result.values), /[<>]/, `${tool.id} with ${value}`);
        continue;
      }
      for (const [id, output] of Object.entries(result.values)) {
        assert.equal(output, null, `${tool.id} ${id} with ${value}`);
      }
      assert.ok(result.warnings.length > 0, `${tool.id} warns for ${value}`);
      for (const warning of result.warnings) assert.ok(warning.cs && warning.en, `${tool.id} warning texts`);
    }
  }
});

test('lists that are not arrays and unknown units are rejected', () => {
  for (const tool of tools) {
    if (tool.kind === 'converter') {
      for (const unit of ['__proto__', 'constructor', 'toString', '']) {
        assert.ok(convert(tool, 1, unit).values[tool.units[0].id] === null, `${tool.id} unit ${unit}`);
      }
      continue;
    }
    for (const input of tool.inputs.filter((/** @type {any} */ candidate) => candidate.type === 'list')) {
      const result = calculate(tool, { [input.id]: { length: 1, 0: {} } });
      assert.ok(Object.values(result.values).every((value) => value === null), `${tool.id} ${input.id}`);
    }
  }
});

test('unexpected and inherited fields are ignored (mass assignment)', () => {
  for (const tool of tools.filter((candidate) => candidate.kind === 'calculator')) {
    const plain = calculate(tool, {});
    const extra = calculate(tool, JSON.parse('{"__proto__": {"polluted": true}, "isAdmin": true, "constructor": 1}'));
    assert.deepEqual(extra, plain, tool.id);
    // A value reachable only through the prototype must not be read
    const first = tool.inputs[0];
    const inherited = Object.create({ [first.id]: first.type === 'select' ? 'nonsense' : '-1e9' });
    assert.deepEqual(calculate(tool, inherited), plain, `${tool.id} inherited ${first.id}`);
  }
  assert.equal(/** @type {any} */ ({}).polluted, undefined, 'Object.prototype stays clean');
});

test('beer.js holds exactly the tools tagged beer, in the same order', async () => {
  const beer = await import('../calc_tools/static/calc_tools/beer.js');
  const tagged = tools.filter((tool) => tool.tags.includes('beer'));
  assert.deepEqual(beer.tools.map((tool) => tool.id), tagged.map((tool) => tool.id));
  // The very same module objects, not copies
  for (const tool of beer.tools) assert.equal(tool, getTool(tool.id));
  for (const id of ['temperature', 'volume', 'mass', 'pressure', 'ibu', 'priming-sugar']) assert.ok(beer.getTool(id), id);
});

test('beer.js loads no other fields and lists only its categories', async () => {
  const beer = await import('../calc_tools/static/calc_tools/beer.js');
  for (const id of ['must-gravity', 'tosna', 'spirit-dilution', 'voltage', 'si-prefix']) assert.equal(beer.getTool(id), undefined, id);
  const used = new Set(beer.tools.map((tool) => tool.category));
  assert.deepEqual(beer.categories.map((category) => category.id), categories.filter((category) => used.has(category.id)).map((category) => category.id));
  assert.ok(!beer.categories.some((category) => ['wine', 'mead', 'units-electric'].includes(category.id)));
  // Search is limited to brewing tools
  assert.deepEqual(beer.search('lihoměr'), []);
  assert.equal(beer.search('hořkost')[0].id, 'ibu');
  assert.ok(Math.abs(beer.calculate(beer.getTool('abv'), {}).values.abv - 5.25) < 1e-9);
  // Only brewing modules are imported (no wine, mead or other unit files)
  const source = (await import('node:fs')).readFileSync(new URL('../calc_tools/static/calc_tools/beer.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /tools\/(wine|mead)\//);
});

test('createRegistry rejects unknown categories', async () => {
  const { createRegistry } = await import('../calc_tools/static/calc_tools/core/registry.js');
  assert.throws(() => createRegistry([{ id: 'x', category: 'nowhere' }]), /Unknown category/);
  assert.deepEqual(createRegistry([]).tools, []);
});
