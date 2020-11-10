import {expect} from 'chai';
import './setup';
import {Interval} from '../src/Interval';

describe('Interval', () => {
  const tolerance = 0.00005;

  it ('gets intervals in cents and savarts', () => {
    expect(Interval.fromCents(100).cents).to.be.closeTo(100, tolerance);
    expect(Interval.fromSavarts(100).savarts).to.be.closeTo(100, tolerance);
  });

  it('computes interval difference', () => {
    expect(Interval.fromCents(100).difference(Interval.fromCents(200)).cents).to.be.closeTo(-100, tolerance);
  });
});
