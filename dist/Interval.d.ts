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
export declare class Interval {
    ratio: Fraction;
    constructor(ratio: Fraction);
    get cents(): number;
    get savarts(): number;
    difference(reference: Interval): Interval;
    static fromRatio(ratio: string): Interval;
    static fromCents(cents: number): Interval;
    static fromSavarts(savarts: number): Interval;
    static compare(a: Interval, b: Interval): number;
    static JND: Interval;
}
