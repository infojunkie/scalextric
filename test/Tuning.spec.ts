import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {Tuning, TuningTone} from '../src/Tuning';
import {tuningFromScala} from '../src/utils/scala';

describe('Tuning', () => {
  const tolerance = 0.00005;
  const edo12 = new Tuning('12-tET', Tuning.intervalsEdo(12));
  const pyth12 = tuningFromScala(fs.readFileSync(`test/pyth_12.scl`, 'utf8'));
  const rast = Tuning.fromIntervals('Rast on C', [
    '1/1',
    '55/49',
    '27/22',
    '147/110',
    '3/2',
    '165/98',
    '25/14',
    '81/44',
    '441/220',
    '2/1'
  ]);

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
    ], tolerance);
  });

  it('tunes', () => {
    expect(rast.tune(new TuningTone(rast, 1, 1)).ratio.valueOf()).to.be.closeTo(2*55/49, tolerance);
  });

  it('detect transposable tunings', () => {
    expect(edo12.transposable).to.be.true;
    expect(pyth12.transposable).to.be.false;
    // exercize the memoization
    expect(pyth12.transposable).to.be.false;
  })
});
