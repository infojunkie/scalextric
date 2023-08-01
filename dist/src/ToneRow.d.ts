import { Tuning, Tone } from './Tuning';
import { Annotation } from './utils/Annotation';
import { Solmization } from './Solmization';
/**
 * TONE ROW
 *
 * We define a tone row as an non-repetitive ordered sequence of tones. It is the basic collection of tones
 * that make up many other musical objects such as triads, scales, chords, etc.
 *
 * This definition extends the usual definition of "tone row" used in serial composition
 * https://en.wikipedia.org/wiki/Tone_row
 *
 * It allows us to reuse the standard tone row operations (invert, reverse, transpose, rotate)
 * on other musical objects.
 */
export declare class ToneRow {
    tuning: Tuning;
    tones: Tone[];
    annotations: Annotation[];
    /**
     * CONSTRUCTOR
     *
     * @param tuning: the reference tuning
     * @param tones: the tones making up the row
     * @param annotations: notes about the row
     */
    constructor(tuning: Tuning, tones: Tone[], annotations?: Annotation[]);
    /**
     * Transpose a row to a target tone.
     */
    transpose(target: Tone): ToneRow;
    /**
     * Invert a row around an axis tone.
     */
    invert(axis: Tone): ToneRow;
    /**
     * Reverse a row.
     */
    reverse(): ToneRow;
    /**
     * Rotate a row by cycling it a number of times.
     */
    rotate(cycles: number): ToneRow;
    /**
     * Monotonize a row, ensuring it is stricly ascending or descending, by raising or dropping pitch octaves.
     *
     * rotate.monotonize => chord inversion
     */
    monotonize(descending?: boolean): ToneRow;
    /**
     * Get the pitches of the tone row.
     */
    get pitches(): number[];
    /**
     * Create a tone row from given pitches.
     */
    static fromPitches(tuning: Tuning, pitches: number[], annotations?: Annotation[]): ToneRow;
    /**
     * Create a tone row from given pitches.
     */
    static fromPitchClasses(tuning: Tuning, pitchClasses: number[], octave: number, annotations?: Annotation[]): ToneRow;
}
export declare class ToneRowSolmized extends ToneRow {
    tuning: Tuning;
    solmization: Solmization;
    tones: Tone[];
    annotations: Annotation[];
    constructor(tuning: Tuning, solmization: Solmization, tones: Tone[], annotations?: Annotation[]);
    static fromToneRow(row: ToneRow, solmization: Solmization): ToneRowSolmized;
}
