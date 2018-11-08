import {Helpers} from './Helpers';
import {Interval} from './Interval';
import Fraction from 'fraction.js';

/**
 * TUNING SYSTEM
 *
 * Given a reference tone and a target tone, a tuning returns the ratio between them.
 *
 * The fundamental interval is 2/1 between the base tone and its octave.
 * Other tones subdivide the octave interval. A finite number of tones N make up the tuning.
 * Tones are indexed according to their rank in the ordered sequence of ratios
 * tone 0 => ratio 1 (unison)
 * tone 1 => ratio 1.abc (first interval)
 * tone 2 => ratio 1.def (second interval)
 * ...
 * tone N-2 => ratio 1.xyz (next-to-last interval)
 * tone N-1 => ratio 2 (octave)
 *
 * Tones can extend beyond the octave
 * e.g. tone N+1 is equivalent to tone 1, but one octave higher.
 * In addition to representing a tone as above, we can represent it by its "generator":
 * - its pitch class pc ∈ [0, N-1]
 * - its octave o ∈ ℤ
 * such that t = pc(t) + N * o(t)
 */
export class Tuning {
  /**
   * CONSTRUCTOR
   *
   * @param label: tuning label
   * @param intervals: tuning intervals
   * The intervals will be guaranteed to be sorted.
   * The first interval will be guaranteed to be the unison.
   * The last interval will be considered to be the repeater (e.g. 2/1 the octave).
   */
  constructor(public label: string, public intervals: Interval[]) {
    // TODO Sort efficiently (i.e. O(n) for already sorted)
    if (this.intervals[0].ratio.valueOf() != 1) {
      this.intervals = [new Interval(new Fraction(1)), ...this.intervals];
    }
  }

  /**
   * Create a tuning from ratios or cents.
   *
   * @param label: as per constructor
   * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers
   * @returns tuning object
   */
  static fromIntervals(label: string, intervals: (number|string)[]) {
    return new Tuning(label, intervals.map(interval => {
      if (typeof interval == 'string') {
        return new Interval(new Fraction(interval));
      }
      else {
        return Interval.fromCents(interval);
      }
    }));
  }

  /**
   * IS A TUNING TRANSPOSABLE?
   *
   * A tuning is fully transposable if all of its interval differences are equal.
   * We will consider equality to be within the range of the "just noticeable" interval (5 cents).
   */
  private _transposable: boolean;
  get transposable(): boolean {
    if (this._transposable !== undefined) return this._transposable;

    const first: Interval = this.intervals[1].difference(this.intervals[0]);
    return (this._transposable = this.intervals.slice(1).every((v, i) => {
      const next: Interval = v.difference(this.intervals[i]);
      const diff: Interval = new Interval(Helpers.flipFraction(next.difference(first).ratio, true));
      return diff.ratio.compare(Interval.JND.ratio) < 0;
    }));
  }

  /**
   * STEPS OF A TUNING
   *
   * @returns count of tones in the tuning
   */
  get steps(): number {
    return this.intervals.length - 1;
  }

  /**
   * TUNE A TONE
   *
   * @param tone: tone to be tuned
   * @returns frequency ratio of the tone with respect to root tone
   */
  tune(tone: TuningTone): Interval {
    // Get the ratio difference between the target tone and the root tone, raised to the difference in octave.
    // The octave is always the last tone as per the definition of the `intervals` array.
    return new Interval(
      this.intervals[tone.pitchClass].ratio.mul(
        this.intervals[this.steps].ratio.pow(tone.octave)
      )
    );
  }

  /**
   * TUNING DIFFERENCE
   * Compute the difference in cents between this tuning and another
   *
   * @param reference: tuning to compare against - must contain at least as many steps
   * @returns array of interval differences
   */
  difference(reference: Tuning): Interval[] {
    if (reference.steps < this.steps) throw new Error('Tuning.difference: reference has less steps than this');

    return this.intervals.map((interval, index) =>
      reference.intervals[index].difference(interval)
    );
  }

  /**
   * NEAREST TONE
   * Find the nearest tone given an interval and return difference
   *
   * @param interval: target interval
   * @returns nearest tone, interval and difference from the target
   */
  nearest(interval: Interval): {tone: TuningTone, interval: Interval, difference: Interval} {
    // Bring the interval to the base octave.
    const octave = Math.floor(Math.log2(interval.ratio.valueOf()));
    const base = new Interval(interval.ratio.div(Math.pow(2, octave)));

    // Search through the intervals to locate the nearest.
    const n = Helpers.binarySearch(this.intervals, base, (a, b) => a.ratio.compare(b.ratio));
    if (n >= 0) {
      // Exact match: return the pitch at the right octave.
      return {
        tone: new TuningTone(this, n, octave),
        interval,
        difference: new Interval(new Fraction(1))
      }
    } else {
      // Partial match: find real nearest between insertion point and previous.
      // We're guaranteed to find a previous value because the first value is always unison.
      const m = -n-1;
      const upper = this.intervals[m].difference(interval);
      const lower = this.intervals[m-1].difference(interval);
      const near = upper.ratio.compare(lower.ratio) < 0 ? m : m-1;
      const nearTone = new TuningTone(this, near, octave);
      const nearInterval = this.tune(nearTone);
      return {
        tone: nearTone,
        interval: nearInterval,
        difference: nearInterval.difference(interval)
      }
    }
  }

  /**
   * EQUAL DIVISIONS OF THE OCTAVE.
   *
   * Generate an intervals array based on equal divisions of the octave.
   * The intervals are calculated in cents, because they will be converted to ratios
   * inside the Tuning constructor.
   */
  static intervalsEdo(divisions: number): Interval[] {
    return Array.from(Array(divisions + 1)).map((_, i) => {
      return Interval.fromCents(1200 / divisions * i);
    });
  }
}

/**
 * Tone in a tuning.
 */
export class TuningTone {
  constructor(public tuning: Tuning, public pitchClass: number, public octave: number) {}

  get pitch(): number {
    return this.pitchClass + this.octave * this.tuning.steps;
  }

  static fromPitch(tuning: Tuning, pitch: number): TuningTone {
    return new TuningTone(tuning, Helpers.mod(pitch, tuning.steps), Math.floor(pitch / tuning.steps));
  }
}
