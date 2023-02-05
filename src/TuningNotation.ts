import { Tuning, TuningTone } from './Tuning';
import { escapeRegExp, mod } from './utils/helpers';
import { Multimap } from './utils/Bimap';

/**
 * NOMENCLATURE SYSTEM
 *
 * To name notes, we use a common representation based on Scientific Pitch Notation (SPN):
 * - Standard note letters C, D, E, F, G, A, B
 * - An extensible set of accidentals
 * - The octave specification
 *
 * We define a tuning notation map that defines how notes and accidentals map to tuning tones/pitches.
 */
export class TuningNotation {
  regex: RegExp;

  /**
   * CONSTRUCTOR
   *
   * @param tuning: the tuning being notated
   * @param map: the notation map that maps every note letter + accidental combination to the tuning tone
   *        - different note names that map to the same index (e.g. C# = Db => 1) should have separate entries
   *        - don't include octave numbers
   */
  constructor(public tuning: Tuning, public map: Multimap<string, number>) {
    this.regex = new RegExp(
      '^(' + Array.from(this.map.keys()).map(escapeRegExp).join('|') + ')' +
      '(-?\\d)$',
      'i'
    );
  }

  /**
   * BUILD A MAP BY COMBINING NOTES AND ACCIDENTALS
   *
   * @param tuning: as per constructor
   * @param notes: map of note letters to tone indexes:
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
   * @param accidentals: map of note accidentals to tone increments:
   * ```
   * {
   *   '#': +1,
   *   'b': -1,
   *   'n':  0,
   * }
   * ```
   */
  static fromNotesAccidentalsCombination(
    tuning: Tuning,
    notes: {[note: string]: number},
    accidentals: {[accidental: string]: number}
  ): TuningNotation {
    const map = new Multimap<string, number>();
    Object.keys(notes).forEach(note => {
      map.set(`${note}`, notes[note]);
      Object.keys(accidentals).forEach(accidental => {
        map.set(`${note}${accidental}`, mod(notes[note] + accidentals[accidental], tuning.steps));
      });
    });
    return new TuningNotation(tuning, map);
  }

  /**
   * NAME A TONE
   *
   * @param tone: tone to be named
   * @returns array of strings representing the enharmonic namings of the tone
   */
  name(tone: TuningTone): string[] {
    const names = [...this.map.getKey(tone.pitchClass)];
    return names.sort((a, b) => a.length - b.length).map(name => `${name}${tone.octave}`);
  }

  /**
   * PARSE A NOTE
   *
   * @param note: target note in scientific pitch notation
   * @returns tone generator
   */
  parse(note: string): TuningTone {
    const match = this.regex.exec(note);
    if (!match) {
      throw new Error(`[TuningNotation.parse] Could not parse note ${note}`);
    }
    return new TuningTone(this.tuning, this.map.get(match[1]), parseInt(match[2], 10));
  }
}
