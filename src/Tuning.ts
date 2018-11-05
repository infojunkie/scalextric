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
 * - its index ∈ [0, N-1]
 * - its octave ∈ ℤ
 * such that t = index(t) + N * octave(t)
 */
export class Tuning {
  /**
   * CONSTRUCTOR
   *
   * @param label: tuning label
   * @param intervals: tuning intervals, including unison
   * The last element of this array will be considered to be the repeater (e.g. 2/1 the octave).
   */
  constructor(public label: string, public intervals: Interval[]) {}

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
   */
  private _transposable: boolean;
  get transposable(): boolean {
    if (this._transposable !== undefined) return this._transposable;

    // A tuning is fully transposable if all of its interval differences are equal.
    // We will consider equality to be within the range of the "just noticeable" interval.
    const first: Interval = this.intervals[1].difference(this.intervals[0]);
    return (this._transposable = this.intervals.slice(1).every((v, i) => {
      const next: Interval = v.difference(this.intervals[i]);
      const diff: Interval = next.ratio.compare(first.ratio) > 0 ? next.difference(first) : first.difference(next);
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
      this.intervals[tone.pitchClass].ratio
      .mul(this.intervals[this.steps].ratio.pow(tone.octave))
    );
  }

  /**
   * TUNING DIFFERENCE
   * Compute the difference in cents between this tuning and another
   *
   * @param reference: tuning to compare against - must contain same amount of steps
   * @returns array of interval differences in cents
   */
  difference(reference: Tuning): Interval[] {
    return this.intervals.map((interval, index) =>
      reference.intervals[index].difference(interval)
    );
  }

  /**
   * Generate a tuning intervals array based on equal divisions of the octave.
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
    return new TuningTone(tuning, pitch % tuning.steps, Math.trunc(pitch / tuning.steps));
  }
}
