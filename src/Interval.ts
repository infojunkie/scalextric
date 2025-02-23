import Fraction from 'fraction.js';

/**
 * INTERVALS
 *
 * The interval is the basic building block of music.
 * It is the difference in pitch between two sounds.
 *
 * It can be represented as:
 * - a frequency ratio
 * - a number of cents (1/100 of an equally tempered semitone)
 *
 * It can also be named, depending on the nomenclature being used.
 *
 */

export class Interval {
  constructor(public ratio: Fraction, public original?: string) {}
  get cents(): number { return 1200 * Math.log2(this.ratio.valueOf()); }
  difference(reference: Interval): Interval { return new Interval(this.ratio.div(reference.ratio)); }
  static fromRatio(ratio: string): Interval { return new Interval(new Fraction(ratio), ratio); }
  static fromCents(cents: number, original?: string): Interval { return new Interval(new Fraction(Math.pow(2, cents / 1200)), original ?? `${cents} cents`); }
  static compare(a: Interval, b: Interval): number { return a.ratio.compare(b.ratio); }
  static JND: Interval = Interval.fromCents(5); // https://en.wikipedia.org/wiki/Just-noticeable_difference
}
