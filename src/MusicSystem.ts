import {Tuning, TuningTone} from './Tuning';
import {Helpers} from './Helpers';

/**
 * MUSIC SYSTEM
 *
 * A music system describes the musical objects used in various music traditions.
 * Musical objects include notes, sequences (e.g. intervals, triads, scales), melody modes, etc.
 *
 * The music system defines a canonical tuning that is typically associated with the traditional practice.
 * Other tunings can be mapped to a given music system by matching (exactly or approximately) the tones
 * with the system's canonical tuning.
 *
 * To name notes, we use a common representation based on Scientific Pitch Notation (SPN):
 * - Standard note letters C, D, E, F, G, A, B
 * - An extensible set of accidentals
 * System-specific note names are mapped to SPN notes to allow for inter-music portability.
 * Common sequences are also listed as sequences of SPN notes.
 *
 * Note that the music system itself does not define the tone ratios of the notes: this is the job
 * of the tuning mapping, whether canonical or derived.
 */
export class MusicSystem {
  /**
   * @param label: system label
   * @param canonical: the system's canonical tuning
   * @param nomenclatrue: the note and sequence naming map
   */
  constructor(
    public label: string,
    public canonical: Tuning,
    public nomenclature: NomenclatureMap
  ) {}
}

/**
 * Map of system-specific names to SPN note sequences.
 * A one-note sequence is the note itself.
 * System-specific names should be localizable.
 */
export interface NomenclatureMap {
  [name: string]: string[];
}

/**
 * Tuning map.
 */
export class TuningMap {
  regex: RegExp;

  /**
   * @param system: the music system
   * @param tuning: the tuning
   * @param notes: map of note names to tone indexes
   * @param accidentals: map of accidentals to tone increments
   */
  constructor(
    public system: MusicSystem,
    public tuning: Tuning,
    public notes: TuningNoteMap,
    public accidentals: TuningAccidentalMap
  ) {
    // Precalculated values
    // `regex` is the regular expression that is dynamically built to
    // recognize notes in scientific pitch notation, given the nomenclature supplied by the caller.
    this.regex = new RegExp(
      '^(' + Object.keys(this.notes).map(Helpers.escapeRegExp).join('|') + ')' +
      '(' + Object.keys(this.accidentals).map(Helpers.escapeRegExp).sort((a,b) => b.length - a.length).join('|') + ')?' +
      '(-?\\d)$',
      'i'
    );
  }

  /**
   * PARSE A NOTE
   *
   * @param note: target note in scientific pitch notation
   * @returns tone generator
   */
  parse(note: string): TuningTone {
    const match = this.regex.exec(note);
    if (match) {
      return new TuningTone(
        this.tuning,
        this.notes[ match[1] ] + (match[2] ? this.accidentals[ match[2] ] : 0),
        parseInt(match[3], 10)
      );
    }
    else {
      console.error(`Could not parse note ${note}.`);
    }
  }

  /**
   * NAME A TONE
   *
   * @param tone: tone to be named
   * @returns array of strings representing the enharmonic namings of the tone
   */
  name(tone: TuningTone): string[] {
    const names = Object.keys(this.notes).reduce((names, note) => {
      const delta = tone.pitchClass - this.notes[note];
      if (delta === 0) {
        // Note: we ignore the 'natural' accidental (delta === 0)
        names.push({note, accidental: null, octave: tone.octave});
      }
      else {
        const acc = Object.keys(this.accidentals).find((acc) => {
          return (delta === this.accidentals[acc]);
        });
        if (acc !== undefined) {
          names.push({note, accidental: acc, octave: tone.octave});
        }
      }
      return names;
    }, []);

    if (!names.length) {
      console.error(`Could not name tone ${tone}.`);
      return null;
    }
    return names;
  }
}

/**
 * Map of note letters to tone indexes.
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
 * ```
 */
export interface TuningNoteMap {
  [note: string]: number;
}

/**
 * Map of note accidentals to tone increments.
 * ```
 * {
 *   '#': +1,
 *   'b': -1,
 *   'n':  0,
 * }
 * ```
 */
export interface TuningAccidentalMap {
  [accidental: string]: number;
}
