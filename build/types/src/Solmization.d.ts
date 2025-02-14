import { Tuning, Tone } from './Tuning';
import { Multimap } from './utils/Bimap';
/**
 * SOLMIZATION SYSTEM
 *
 * To name notes, we use a common representation based on Scientific Pitch Notation (SPN):
 * - Standard note letters C, D, E, F, G, A, B
 * - An extensible set of accidentals
 *
 * We define a tuning notation map that defines how notes and accidentals map to tuning tones/pitches.
 */
export declare class Solmization {
    tuning: Tuning;
    notes: {
        [note: string]: number;
    };
    accidentals: {
        [accidental: string]: number;
    };
    regex: RegExp;
    nameMap: Multimap<string, number>;
    parseMap: Multimap<string, number>;
    /**
     * CONSTRUCTOR
     *
     * @param tuning Tuning being named
     * @param notes Map of note letters to pitch classes:
     * ```
     * {
     *   'C': 0,
     *   'D': 2,
     *   'E': 4,
     *   'F': 5,
     *   'G': 7,
     *   'A': 9,
     *   'B': 11,
     * }
     * @param accidentals Map of accidentals to tone steps:
     * ```
     * {
     *   '♯': +1,
     *   '#': +1,
     *   '♭': -1,
     *   'b': -1,
     *   '♮':  0,
     *   '𝄪': +2,
     *   '𝄫': -2,
     * }
     * ```
     */
    constructor(tuning: Tuning, notes: {
        [note: string]: number;
    }, accidentals: {
        [accidental: string]: number;
    });
    /**
     * NAME A TONE
     *
     * @param tone Tone to be named
     * @returns Array of strings representing the enharmonic namings of the tone
     */
    name(tone: Tone): string[];
    /**
     * PARSE A NOTE
     *
     * @param note Target note in scientific pitch notation
     * @returns Corresponding tone in the tuning
     */
    parse(note: string): Tone;
}
