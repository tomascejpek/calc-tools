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
 * @param {any[]} inputs
 * @param {string} where
 */
function checkInputs(inputs, where) {
  for (const input of inputs) {
    bilingual(input.label, `${where} input ${input.id}`);
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
      for (const output of tool.outputs) bilingual(output.label, `${tool.id} output ${output.id}`);
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
