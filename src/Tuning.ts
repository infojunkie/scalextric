import {Helpers} from './Helpers';
import {Interval} from './Interval';
import Fraction from 'fraction.js';

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
 * - its index ∈ [0, N-1]
 * - its octave ∈ ℤ
 * such that t = index(t) + N * octave(t)
 *
 * Tones can be named: these are the "note names" such as C, D, E, etc.
 * Also, tone increments can be named: these are the accidentals such as ♯, ♭, ♮, etc.
 *
 * We will represent note names in Scientific Pitch Notation
 * https://en.wikipedia.org/wiki/Scientific_pitch_notation
 * extended to recognize different accidental symbols
 */
export class Tuning {
  /**
   * CONSTRUCTOR
   *
   * @param label: tuning label
   * @param intervals: tuning intervals, including unison
   * The last element of this array will be considered to be the repeater (e.g. 2/1 the octave).
   */
  constructor(public label: string, public intervals: Interval[]) {}

  /**
   * Create a tuning from ratios or cents.
   *
   * @param label: as per constructor
   * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers
   * @returns tuning object
   */
  static fromIntervals(label: string, intervals: (number|string)[]) {
    return new Tuning(label, intervals.map(interval => {
      if (typeof interval == 'string') {
        return new Interval(new Fraction(interval));
      }
      else {
        return Interval.fromCents(interval);
      }
    }));
  }

  /**
   * STEPS OF A TUNING
   *
   * @returns count of tones in the tuning
   */
  get steps(): number {
    return this.intervals.length - 1;
  }

  /**
   * TUNE A TONE
   *
   * @param tone: tone to be tuned
   * @returns frequency ratio of the tone with respect to root tone
   */
  tune(tone: TuningTone): Interval {
    // Get the ratio difference between the target tone and the root tone, raised to the difference in octave.
    // The octave is always the last tone as per the definition of the `intervals` array.
    return new Interval(
      this.intervals[tone.pitchClass].ratio
      .mul(this.intervals[this.steps].ratio.pow(tone.octave))
    );
  }

  /**
   * TUNING DIFFERENCE
   * Compute the difference in cents between this tuning and another
   *
   * @param reference: tuning to compare against - must contain same amount of steps
   * @returns array of interval differences in cents
   */
  difference(reference: Tuning): Interval[] {
    return this.intervals.map((interval, index) =>
      reference.intervals[index].diff(interval)
    );
  }

  /**
   * Generate a tuning intervals array based on equal divisions of the octave.
   * The intervals are calculated in cents, because they will be converted to ratios
   * inside the Tuning constructor.
   */
  static intervalsEdo(divisions: number): Interval[] {
    return Array.from(Array(divisions + 1)).map((_, i) => {
      return Interval.fromCents(1200 / divisions * i);
    });
  }
}

/**
 * Map of note names to tone indexes.
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
 * Map of accidentals to tone increments.
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

/**
 * Tuning extension to support note naming and parsing.
 */
export class TuningNomenclature {
  regex: RegExp;
  regexNoAccidentals: RegExp;
  /**
   * @param tuning: the tuning
   * @param notes: map of note names to tone indexes
   * @param accidentals: map of accidentals to tone increments
   */
  constructor(
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

    // `regexNoAccidentals` is a regex for note names only, to be used when an accidental is not found during parsing.
    this.regexNoAccidentals = new RegExp(
      '^(' + Object.keys(this.notes).map(Helpers.escapeRegExp).join('|') + ')' +
      '\\D*' +
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
      console.error(`Could not parse note ${note}. Trying without accidentals...`);
      const match2 = this.regexNoAccidentals.exec(note);
      if (match2) {
        return new TuningTone(
          this.tuning,
          this.notes[ match2[1] ],
          parseInt(match2[2], 10)
        );
      }
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
 * Tone in a tuning.
 */
export class TuningTone {
  constructor(public tuning: Tuning, public pitchClass: number, public octave: number) {}

  get pitch(): number {
    return this.pitchClass + this.octave * this.tuning.steps;
  }

  static fromPitch(tuning: Tuning, pitch: number): TuningTone {
    return new TuningTone(tuning, pitch % tuning.steps, Math.trunc(pitch / tuning.steps));
  }
}
