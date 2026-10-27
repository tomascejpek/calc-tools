import { test } from 'node:test';
import assert from 'node:assert/strict';

import { search, tools } from '../calc_tools/static/calc_tools/index.js';
import { normalize } from '../calc_tools/static/calc_tools/core/search.js';

const ids = (/** @type {any[]} */ found) => found.map((tool) => tool.id);

test('normalize strips diacritics and case', () => {
  assert.equal(normalize('Stupňovitost ŘÍZ'), 'stupnovitost riz');
});

test('search ignores diacritics and case', () => {
  assert.ok(ids(search('stupnovitost')).includes('gravity'));
  assert.ok(ids(search('STUPŇOVITOST')).includes('degree-to-abv'));
  assert.ok(ids(search('horkost')).includes('ibu'));
  assert.ok(ids(search('nacukrovani')).includes('priming-sugar'));
  assert.ok(ids(search('desítka')).includes('degree-to-abv'));
});

test('search ranks a name match above keywords and the description', () => {
  assert.equal(search('hořkost')[0].id, 'ibu');
  assert.equal(search('teploty')[0].id, 'temperature');
  assert.equal(search('sycení')[0].id, 'keg-carbonation');
});

test('search matches English in both languages and every word of the query', () => {
  assert.equal(search('bitterness', 'en')[0].id, 'ibu');
  assert.ok(ids(search('priming', 'cs')).includes('priming-sugar'));
  assert.deepEqual(ids(search('cukr lahve')), ['priming-sugar']);
  assert.deepEqual(search('xyzzy'), []);
});

test('empty query returns all tools', () => {
  assert.deepEqual(ids(search('')), ids(tools));
  assert.deepEqual(ids(search('   ', 'en')), ids(tools));
});
