import assert from 'node:assert/strict';

/**
 * @param {number | null | undefined} actual
 * @param {number} expected
 * @param {number} tolerance
 * @param {string} [message]
 */
export function near(actual, expected, tolerance, message) {
  assert.equal(typeof actual, 'number', message ?? `expected a number, got ${actual}`);
  assert.ok(
    Math.abs(/** @type {number} */ (actual) - expected) <= tolerance,
    message ?? `${actual} is not within ${tolerance} of ${expected}`,
  );
}

/**
 * Asserts every output is null and at least one bilingual warning is given.
 * @param {{ values: Record<string, unknown>, warnings: { cs: string, en: string }[] }} result
 */
export function invalid(result) {
  for (const [id, value] of Object.entries(result.values)) assert.equal(value, null, `${id} should be null`);
  assert.ok(result.warnings.length > 0, 'a warning is expected');
  for (const warning of result.warnings) {
    assert.ok(warning.cs && warning.en, 'warnings need cs and en texts');
  }
}
