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
export declare class Tuning {
    intervals: Interval[];
    annotations: Annotation[];
    /**
     * CONSTRUCTOR
     *
     * @param intervals: tuning intervals
     * The intervals will be guaranteed to be sorted.
     * The first interval will be _guaranteed_ to be the unison.
     * The last interval will be _assumed_ to be the repeater (e.g. 2/1 the octave).
     * @param annotations: notes about the tuning
     */
    constructor(intervals: Interval[], annotations?: Annotation[]);
    /**
     * Create a tuning from ratios or cents.
     *
     * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers
     * @param annotations: as per constructor
     * @returns tuning object
     */
    static fromIntervals(intervals: (number | string)[], annotations?: Annotation[]): Tuning;
    /**
     * IS A TUNING TRANSPOSABLE?
     *
     * A tuning is fully transposable if all of its interval differences are equal.
     * We will consider equality to be within the range of the "just noticeable" interval (5 cents).
     */
    private _transposable;
    get transposable(): boolean;
    /**
     * STEPS OF A TUNING
     *
     * @returns count of tones in the tuning
     */
    get steps(): number;
    /**
     * OCTAVE OF A TUNING
     *
     * @returns the last interval in the tuning, which is considered to be the octave
     */
    get octave(): Interval;
    /**
     * TUNE A TONE
     *
     * @param tone: tone to be tuned
     * @returns frequency ratio of the tone with respect to root tone
     */
    tune(tone: TuningTone): Interval;
    /**
     * NEAREST TONE
     * Find the nearest tone given an interval and return difference
     *
     * @param interval: target interval
     * @returns nearest tone, interval and difference from the target
     */
    nearest(interval: Interval): {
        tone: TuningTone;
        interval: Interval;
        difference: Interval;
    };
    /**
     * EQUAL DIVISIONS OF THE OCTAVE.
     *
     * Generate an intervals array based on equal divisions of the octave.
     * The intervals are calculated in cents, because they will be converted to ratios
     * inside the Tuning constructor.
     */
    static intervalsEdo(divisions: number): Interval[];
}
/**
 * Tone in a tuning.
 */
export declare class TuningTone {
    tuning: Tuning;
    pitchClass: number;
    octave: number;
    constructor(tuning: Tuning, pitchClass: number, octave: number);
    get pitch(): number;
    get tune(): Interval;
    static fromPitch(tuning: Tuning, pitch: number): TuningTone;
}
