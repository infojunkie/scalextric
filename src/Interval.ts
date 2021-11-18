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
 * - a number of savarts (https://en.wikipedia.org/wiki/Savart)
 * - ...and more
 *
 * It can also be named, depending on the nomenclature being used.
 *
 */

export class Interval {
  constructor(public ratio: Fraction) {}
  get cents(): number { return 1200 * Math.log2(this.ratio.valueOf()); }
  get savarts(): number { return 1000 * Math.log10(this.ratio.valueOf()); }
  difference(reference: Interval): Interval { return new Interval(this.ratio.div(reference.ratio)); }
  static fromRatio(ratio: string): Interval { return new Interval(new Fraction(ratio)); }
  static fromCents(cents: number): Interval { return new Interval(new Fraction(Math.pow(2, cents / 1200))); }
  static fromSavarts(savarts: number): Interval { return new Interval(new Fraction(Math.pow(10, savarts / 1000))); }
  static compare(a: Interval, b: Interval): number { return a.ratio.compare(b.ratio); }
  static JND: Interval = Interval.fromCents(5); // https://en.wikipedia.org/wiki/Just-noticeable_difference
}
