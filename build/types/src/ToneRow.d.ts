import { Tuning, Tone, Metadata } from './Tuning';
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
    metadata?: Metadata;
    /**
     * CONSTRUCTOR
     *
     * @param tuning The reference tuning
     * @param tones The tones making up the row
     * @param metadata Row metadata (label, description, source)
     */
    constructor(tuning: Tuning, tones: Tone[], metadata?: Metadata);
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
    static fromPitches(tuning: Tuning, pitches: number[], metadata?: Metadata): ToneRow;
    /**
     * Create a tone row from given pitches.
     */
    static fromPitchClasses(tuning: Tuning, pitchClasses: number[], octave: number, metadata?: Metadata): ToneRow;
}
export declare class ToneRowSolmized extends ToneRow {
    tuning: Tuning;
    solmization: Solmization;
    tones: Tone[];
    metadata?: Metadata;
    constructor(tuning: Tuning, solmization: Solmization, tones: Tone[], metadata?: Metadata);
    static fromToneRow(row: ToneRow, solmization: Solmization): ToneRowSolmized;
}
