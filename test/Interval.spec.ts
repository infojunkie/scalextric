import assert from './assert';
import { describe, it } from 'node:test';
import { Interval } from '../src/Interval';

describe('Interval', () => {
  const tolerance = 0.00005;

  it ('gets intervals in cents and savarts', () => {
    assert.closeTo(Interval.fromCents(100).cents, 100, tolerance);
    assert.closeTo(Interval.fromSavarts(100).savarts, 100, tolerance);
  });

  it('computes interval difference', () => {
    assert.closeTo(Interval.fromCents(100).difference(Interval.fromCents(200)).cents, -100, tolerance);
  });
});
