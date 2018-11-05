import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {Tuning} from '../src/Tuning';
import {tuningFromScala} from '../src/scala';

describe('Tuning', () => {
  const edo12 = new Tuning('12-tET', Tuning.intervalsEdo(12));
  const pyth12 = tuningFromScala(fs.readFileSync(`test/pyth_12.scl`, 'utf8'));

  it('computes tuning differences', () => {
    expect(pyth12.difference(edo12).map(i => i.cents)).to.be.clsTo([
      0,
      -13.685,
      -3.91,
      5.865,
      -7.82,
      1.955,
      -11.73,
      -1.955,
      -15.64,
      -5.865,
      3.91,
      -9.775,
      0
    ], 0.00005);
  });

  it('detect transposable tunings', () => {
    expect(edo12.transposable).to.be.true;
    expect(pyth12.transposable).to.be.false;
  })
});
