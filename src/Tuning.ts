import Fraction from 'fraction.js';
import { binarySearch, flipFraction, mod } from './utils/helpers';
import { Annotation } from './utils/Annotation';
import { Interval } from './Interval';

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
   * @param intervals: tuning intervals
   * The intervals will be _guaranteed_ to be sorted.
   * The first interval will be _guaranteed_ to be the unison.
   * The last interval will be _assumed_ to be the repeater (e.g. 2/1 the octave).
   * @param annotations: annotations about the tuning
   */
  constructor(public intervals: Interval[], public annotations: Annotation[] = []) {
    this.intervals.sort(Interval.compare);
    if (this.intervals[0].ratio.valueOf() != 1) {
      this.intervals = [new Interval(new Fraction(1)), ...this.intervals];
    }
  }

  /**
   * Create a tuning from ratios or cents.
   *
   * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers
   * @param annotations: as per constructor
   * @returns tuning object
   */
  static fromIntervals(intervals: (number|string)[], annotations: Annotation[] = []): Tuning {
    return new Tuning(intervals.map(interval => {
      if (typeof interval == 'string') {
        return new Interval(new Fraction(interval));
      }
      else {
        return Interval.fromCents(interval);
      }
    }), annotations);
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
      const diff: Interval = new Interval(flipFraction(next.difference(first).ratio, true));
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
   * OCTAVE OF A TUNING
   *
   * @returns the last interval in the tuning, which is considered to be the octave
   */
  get octave(): Interval {
    return this.intervals[this.steps];
  }

  /**
   * TUNE A TONE
   *
   * @param tone: tone to be tuned
   * @returns frequency ratio of the tone with respect to root tone
   */
  tune(tone: Tone): Interval {
    // Get the ratio difference between the target tone and the root tone, raised to the difference in octave.
    // The octave is always the last tone as per the definition of the `intervals` array.
    return new Interval(
      this.intervals[tone.pitchClass].ratio.mul(this.octave.ratio.pow(tone.octave))
    );
  }

  /**
   * NEAREST TONE
   * Find the nearest tone given an interval and return difference
   *
   * @param interval: target interval
   * @returns nearest tone, interval and difference from the target
   */
  nearest(interval: Interval): {tone: Tone, interval: Interval, difference: Interval} {
    // Bring the interval to the base octave.
    const octave = Math.floor(Math.log(interval.ratio.valueOf()) / Math.log(this.octave.ratio.valueOf()));
    const base = new Interval(interval.ratio.div(this.octave.ratio.pow(octave)));

    // Search through the intervals to locate the nearest.
    const n = binarySearch(this.intervals, base, Interval.compare);
    if (n >= 0) {
      // Exact match: return the pitch at the right octave.
      return {
        tone: new Tone(this, n, octave),
        interval,
        difference: new Interval(new Fraction(1))
      }
    } else {
      // Partial match: find real nearest between insertion point and previous.
      // We're guaranteed to find a previous value because the first value is always unison.
      const m = ~n;
      const lower = Math.abs(this.intervals[m-1].difference(base).cents);
      const upper = Math.abs(this.intervals[m].difference(base).cents);
      const nearest = lower < upper ? m-1 : m;
      const nearestTone = new Tone(this, nearest, octave);
      const nearestInterval = this.tune(nearestTone);
      return {
        tone: nearestTone,
        interval: nearestInterval,
        difference: nearestInterval.difference(interval)
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
  static fromEdo(divisions: number): Tuning {
    return new Tuning(Array.from(Array(divisions + 1)).map((_, i) => {
      return Interval.fromCents(1200 / divisions * i);
    }));
  }
}

/**
 * Tone in a tuning.
 */
export class Tone {
  constructor(public tuning: Tuning, public pitchClass: number, public octave: number) {
    // TODO Verify that pitch class is valid.
  }

  get pitch(): number {
    return this.pitchClass + this.octave * this.tuning.steps;
  }

  get tune(): Interval {
    return this.tuning.tune(this);
  }

  static fromPitch(tuning: Tuning, pitch: number): Tone {
    return new Tone(tuning, mod(pitch, tuning.steps), Math.floor(pitch / tuning.steps));
  }
}
