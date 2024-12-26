import { Tuning, Tone } from './Tuning';
import { escapeRegExp, mod } from './utils/helpers';
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
export class Solmization {
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
  constructor(
    public tuning: Tuning,
    public notes: {[note: string]: number},
    public accidentals: {[accidental: string]: number}
  ) {
    // parseMap associates pitch classes with all possible combinations of note letters and accidentals.
    this.parseMap = new Multimap<string, number>();
    Object.keys(notes).forEach(note => {
      this.parseMap.set(note, notes[note]);
      Object.keys(accidentals).forEach(accidental => {
        this.parseMap.set(`${note}${accidental}`, mod(notes[note] + accidentals[accidental], tuning.steps));
      });
    });

    // nameMap associates pitch classes with a subset of combinations, by selecting the FIRST accidental symbol
    // for each tone step.
    this.nameMap = new Multimap<string, number>();
    Object.keys(notes).forEach(note => {
      const steps = [0]; // The entry below sets the natural note, i.e. step == 0
      this.nameMap.set(note, notes[note]);
      Object.keys(accidentals).forEach(accidental => {
        if (!steps.includes(accidentals[accidental])) {
          this.nameMap.set(`${note}${accidental}`, mod(notes[note] + accidentals[accidental], tuning.steps));
          steps.push(accidentals[accidental]);
        }
      });
    });

    // Create a regex that parses all possible combinations.
    this.regex = new RegExp(
      '^(' + Array.from(this.parseMap.keys()).map(escapeRegExp).join('|') + ')' +
      '(-?\\d)$',
      'i'
    );
  }

  /**
   * NAME A TONE
   *
   * @param tone Tone to be named
   * @returns Array of strings representing the enharmonic namings of the tone
   */
  name(tone: Tone): string[] {
    const names = [...this.nameMap.getKey(tone.pitchClass)];
    return names.sort((a, b) => a.length - b.length).map(name => `${name}${tone.octave}`);
  }

  /**
   * PARSE A NOTE
   *
   * @param note Target note in scientific pitch notation
   * @returns Corresponding tone in the tuning
   */
  parse(note: string): Tone {
    const match = this.regex.exec(note);
    if (!match) {
      throw new Error(`[Solmization.parse] Could not match note ${note}`);
    }
    return new Tone(this.tuning, this.parseMap.get(match[1]), parseInt(match[2], 10));
  }
}
