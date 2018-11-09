import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {Tuning, TuningTone} from '../src/Tuning';
import {tuningFromScala} from '../src/utils/scala';
import {Interval} from '../src/Interval';

describe('Tuning', () => {
  const tolerance = 0.00005;
  const edo12 = new Tuning('12-tET', Tuning.intervalsEdo(12));
  const pyth12 = tuningFromScala(fs.readFileSync(`test/pyth_12.scl`, 'utf8'));
  const rast = Tuning.fromIntervals('Arabic Rast with perde rast on C by Dr. Ozan Yarman', [
    '55/49',
    '27/22',
    '147/110',
    '3/2',
    '165/98',
    '25/14',
    '81/44',
    '441/220'
  ]);

  it('validates input intervals', () => {
    expect(rast.intervals[0].ratio.valueOf()).to.equal(1);
  });

  it('tunes', () => {
    expect(rast.tune(new TuningTone(rast, 1, 1)).ratio.valueOf()).to.be.closeTo(441/220*55/49, tolerance);
  });

  it('detects transposable tunings', () => {
    expect(edo12.transposable).to.be.true;
    expect(pyth12.transposable).to.be.false;
    // exercize the memoization
    expect(pyth12.transposable).to.be.false;
  });

  it('computes tuning differences', () => {
    expect(edo12.difference.bind(edo12, rast)).to.throw();
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

  it('finds the nearest tone', () => {
    const nearestG0 = edo12.nearest(edo12.tune(TuningTone.fromPitch(edo12, 7)));
    expect(nearestG0.tone.pitch).to.be.equal(7);
    expect(nearestG0.interval.ratio.valueOf()).to.be.equal(edo12.intervals[7].ratio.valueOf());
    expect(nearestG0.difference.cents).to.be.equal(0);

    const nearestG1 = edo12.nearest(edo12.tune(new TuningTone(edo12, 7, 1)));
    expect(nearestG1.tone.pitchClass).to.be.equal(7);
    expect(nearestG1.tone.octave).to.be.equal(1);
    expect(nearestG1.difference.cents).to.be.equal(0);

    const nearestGm1 = edo12.nearest(edo12.tune(TuningTone.fromPitch(edo12, -5)));
    expect(nearestGm1.tone.pitchClass).to.be.equal(7);
    expect(nearestGm1.tone.octave).to.be.equal(-1);
    expect(nearestGm1.difference.cents).to.be.equal(0);

    const nearestGp0 = edo12.nearest(pyth12.tune(TuningTone.fromPitch(pyth12, 7)));
    expect(nearestGp0.tone.pitch).to.be.equal(7);
    expect(nearestGp0.interval.ratio.valueOf()).to.be.equal(edo12.intervals[7].ratio.valueOf());
    expect(nearestGp0.difference.cents).to.be.closeTo(-1.955, tolerance);

    // Fudge a tuning to be closer to the upper interval, not the lower one.
    const edo12_fudged = new Tuning('fudged 12-tEt', edo12.intervals.map((i,n) =>
      Interval.fromCents(i.cents + (n > 0 && n < 12 ? 90 : 0))
    ));

    const nearestGp1 = edo12.nearest(edo12_fudged.tune(new TuningTone(edo12_fudged, 1, 1)));
    expect(nearestGp1.tone.pitchClass).to.be.equal(2);
    expect(nearestGp1.tone.octave).to.be.equal(1);
    expect(nearestGp1.difference.cents).to.be.closeTo(10, tolerance);
  });
});
