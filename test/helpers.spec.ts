import assert from 'node:assert';
import { describe, it } from 'node:test';
import Fraction from 'fraction.js';
import {
  arrayEqual,
  arrayUnique,
  arrayRange,
  binarySearch,
  escapeRegExp,
  flipFraction,
  mod,
  primes,
  roundTo,
  parseList
} from '../src/utils/helpers';

describe('Helper function', () => {
  it('escapes regex strings', () => {
    assert.strictEqual('This is a \\*bold\\* \\(move\\)\\.', escapeRegExp('This is a *bold* (move).'));
  });

  it('computes the primes up to 20', () => {
    assert.deepStrictEqual([2, 3, 5, 7, 11, 13, 17, 19], primes(20));
  });

  it('flips fractions', () => {
    assert.ok(flipFraction(new Fraction(1/2)).equals(1/2));
    assert.ok(flipFraction(new Fraction(1/2), true).equals(2));
    assert.ok(flipFraction(new Fraction(2)).equals(1/2));
    assert.ok(flipFraction(new Fraction(2), true).equals(2));

    assert.ok(flipFraction(new Fraction(-1/2)).equals(-1/2));
    assert.ok(flipFraction(new Fraction(-1/2), true).equals(-2));
    assert.ok(flipFraction(new Fraction(-2)).equals(-1/2));
    assert.ok(flipFraction(new Fraction(-2), true).equals(-2));
  });

  it('binary searches', () => {
    // https://stackoverflow.com/a/29018745/209184
    const ar = [1, 2, 2, 2, 5, 9, 11, 12, 12, 12, 12, 15, 20, 20, 20, 25, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 80];
    for (let i = 0; i <= 100; i++) {
      const n = binarySearch(ar, i, (a,b) => a-b);
      assert.ok(!(
        (n >= 0 && ar[n] !== i) ||
        (n < 0 && (~n < ar.length && ar[~n] <= i)) ||
        (n < 0 && (~n-1 >= 0 && ar[~n-1] >= i))
      ));
    }
  });

  it('compares arrays', () => {
    assert.ok(arrayEqual([], [], (a,b) => a-b));
    assert.ok(!arrayEqual([0], [1], (a,b) => a-b));
    assert.ok(arrayEqual([1,2,3], [1,2,3], (a,b) => a-b));
    assert.ok(!arrayEqual([1,2,3], [1,2,3,4], (a,b) => a-b));
    assert.ok(!arrayEqual([1,2,3], [1,3,2], (a,b) => a-b));
  })

  it('computes mathematical modulus', () => {
    assert.strictEqual(mod(-13, 64), 51);
  });

  it('returns unique arrays', () => {
    assert.ok(arrayEqual(
      arrayUnique([1,1,2,2,3,3,3]),
      [1,2,3],
      (a,b) => a-b
    ));
  });

  it('returns array ranges', () => {
    assert.ok(arrayEqual(
      arrayRange(5), [0,1,2,3,4], (a,b) => a-b
    ));
    assert.ok(arrayEqual(
      arrayRange(5, 2), [2,3,4,5,6], (a,b) => a-b
    ));
    assert.ok(arrayEqual(
      arrayRange(0, 2), [], (a,b) => a-b
    ));
  });

  it('rounds to nearest decimal', () => {
    assert.strictEqual(roundTo(5.12345, 0.25), 5.00);
    assert.strictEqual(roundTo(3.23, 0.25), 3.25);
    assert.strictEqual(roundTo(3.13, 0.25), 3.25);
    assert.strictEqual(roundTo(3.1247, 0.25), 3.00);
  });

  it('parses lists of strings with or without quotes', () => {
    assert.deepStrictEqual(parseList('pop rock "hard rock" "\\"dream\\" pop"'), ['pop', 'rock', 'hard rock', '"dream" pop']);
  });
});
