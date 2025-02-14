import assert from './assert';
import { describe, it } from 'node:test';
import * as fs from 'fs';
import { tuningFromScala } from '../src/utils/scala';
import { Tuning, Tone } from '../src/Tuning';
import { Interval } from '../src/Interval';

describe('Tuning', () => {
  const tolerance = 0.00005;
  const edo12 = Tuning.fromEdo(12);
  const pyth12 = tuningFromScala(fs.readFileSync(`test/data/pyth_12.scl`, 'utf8'));
  const rast = Tuning.fromIntervals([
    '55/49',
    '27/22',
    '147/110',
    '3/2',
    '165/98',
    '25/14',
    '81/44',
    '441/220'
  ]);
  const cents = Tuning.fromIntervals([0.0, 100.12, 200.34, 300.56]);

  it('validates input intervals', () => {
    assert.strictEqual(rast.intervals[0].ratio.valueOf(), 1);
  });

  it('tunes', () => {
    assert.closeTo(rast.tune(new Tone(rast, 1, 1)).ratio.valueOf(), 441/220*55/49, tolerance);
    assert.throws(() => assert.closeTo(rast.tune(new Tone(rast, 1, 1)).ratio.valueOf(), 441/220, tolerance));
  });

  it('detects transposable tunings', () => {
    assert.ok(edo12.transposable);
    assert.ok(!pyth12.transposable);
    // exercize the memoization
    assert.ok(!pyth12.transposable);
  });

  it('finds the nearest tone', () => {
    const nearestG0 = edo12.nearest(edo12.tune(Tone.fromPitch(edo12, 7)));
    assert.strictEqual(nearestG0.tone.pitch, 7);
    assert.strictEqual(nearestG0.interval.ratio.valueOf(), edo12.intervals[7].ratio.valueOf());
    assert.strictEqual(nearestG0.difference.cents, 0);

    const nearestG1 = edo12.nearest(edo12.tune(new Tone(edo12, 7, 1)));
    assert.strictEqual(nearestG1.tone.pitchClass, 7);
    assert.strictEqual(nearestG1.tone.octave, 1);
    assert.strictEqual(nearestG1.difference.cents, 0);

    const nearestGm1 = edo12.nearest(edo12.tune(Tone.fromPitch(edo12, -5)));
    assert.strictEqual(nearestGm1.tone.pitchClass, 7);
    assert.strictEqual(nearestGm1.tone.octave, -1);
    assert.strictEqual(nearestGm1.difference.cents, 0);

    const nearestGp0 = edo12.nearest(pyth12.tune(Tone.fromPitch(pyth12, 7)));
    assert.strictEqual(nearestGp0.tone.pitch, 7);
    assert.strictEqual(nearestGp0.interval.ratio.valueOf(), edo12.intervals[7].ratio.valueOf());
    assert.closeTo(nearestGp0.difference.cents, -1.955, tolerance);

    // Fudge a tuning to be closer to the upper interval, not the lower one.
    const edo12_fudged = new Tuning(edo12.intervals.map((i,n) =>
      Interval.fromCents(i.cents + (n > 0 && n < 12 ? 90 : 0))
    ));

    const nearestGp1 = edo12.nearest(edo12_fudged.tune(new Tone(edo12_fudged, 1, 1)));
    assert.strictEqual(nearestGp1.tone.pitchClass, 2);
    assert.strictEqual(nearestGp1.tone.octave, 1);
    assert.closeTo(nearestGp1.difference.cents, 10, tolerance);

    // Try a tuning whose octave is not 2.
    const nearestGp2 = edo12.nearest(rast.tune(new Tone(rast, 1, 1)));
    assert.strictEqual(nearestGp2.tone.pitchClass, 2);
    assert.strictEqual(nearestGp2.tone.octave, 1);
    assert.closeTo(nearestGp2.difference.cents, -3.91, tolerance);
  });
});
