import assert, { AssertionError } from 'node:assert';

/**
 * Tests that actual number or array of numbers is within given tolerance of expected number or array of numbers.
 */
assert.closeTo = function(actual, expected, tolerance, message) {
  function err(a, e) {
    if (message instanceof Error) {
      throw message;
    }
    else {
      throw new AssertionError({
        message: message ?? `The actual value does not fall within tolerance of the expected value.`,
        actual: a,
        expected: e
      });
    }
  }
  if (typeof actual === 'number' && typeof expected === 'number') {
    if (Math.abs(actual - expected) > tolerance) {
      err(actual, expected);
    }
  }
  else if (Array.isArray(actual) && Array.isArray(expected) && actual.length === expected.length) {
    actual.forEach((a, i) => {
      if (Math.abs(a - expected[i]) > tolerance) {
        err(a, expected[i]);
      }
    });
  }
  else {

  }
  return true;
}

export default assert;
