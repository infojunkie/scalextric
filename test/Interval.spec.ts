import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {Interval} from '../src/Interval';

describe('Interval', () => {
  it ('gets intervals in cents and savarts', () => {
    expect(Interval.fromCents(100).cents).to.be.closeTo(100, 0.00005);
    expect(Interval.fromSavarts(100).savarts).to.be.closeTo(100, 0.00005);
  });

  it('computes interval difference', () => {
    expect(Interval.fromCents(100).diff(Interval.fromCents(200)).cents).to.be.closeTo(-100, 0.00005);
  });
});
