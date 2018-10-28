import {Helpers} from './Helpers';

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
  intervals: number[];

  /**
   * CONSTRUCTOR
   *
   * @param description: string containing information about the tuning
   *
   * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers.
   *  This array should NOT include the unison (1/1) interval.
   *  The last element of this array will be considered to be the repeater (e.g. 2/1 the octave).
   *
   * @param reference: reference note in scientific pitch notation
   */
  constructor(
    public description: string,
    intervals: any[],
    public reference
  ) {
    // `intervals` holds the interval multipliers in ratio form
    // with the unison added to simplify the code.
    this.intervals = [0, ...intervals].map(i => {
      if (typeof i === "string") {
        const fraction = i.split('/');
        return parseInt(fraction[0], 10) / parseInt(fraction[1], 10);
      } else {
        return Tuning.centsToRatio(i);
      }
    });
  }

  /**
   * STEPS OF A TUNING
   *
   * @return: count of tones in the tuning
   */
  get steps(): number {
    return this.intervals.length - 1;
  }

  /**
   * TUNE A TONE
   *
   * @param tone: tone to be tuned
   * @return: frequency ratio of the tone with respect to reference
   */
  tune(tone): number {
    // Get the ratio difference between the target note and the reference note, raised to the difference in octave.
    // The octave is always the last tone as per the definition of the `intervals` array.
    return Math.pow(this.intervals[this.steps], tone.octave - this.reference.octave) * this.intervals[ tone.index ] / this.intervals[ this.reference.index ];
  }

  /**
   * Convert frequency ratio to cents.
   */
  static ratioToCents(ratio: number): number {
    return 1200 * Math.log2(ratio);
  }

  /**
   * Convert cents to frequency ratio.
   */
  static centsToRatio(cents: number): number {
    return Math.pow(2, cents / 1200);
  }

  /**
   * Generate a tuning intervals array based on equal divisions of the octave.
   * The intervals are calculated in cents, because they will be converted to ratios
   * inside the Tuning constructor.
   */
  static intervalsEdo(divisions: number): number[] {
    return Array.from(Array(divisions)).map((_, i) => {
      return 1200 / divisions * (i+1);
    });
  }
}

/**
 * Tuning extension to support note naming and parsing.
 */
export class TuningNomenclature extends Tuning {
  regex: RegExp;
  regexNoAccidentals: RegExp;
  /**
   * @param
   * @param notes: map of note names to tone indexes
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
   *
   * @param accidentals: map of accidentals to tone increments
   * ```
   * {
   *   '#': +1,
   *   'b': -1,
   *   'n':  0,
   * }
   * ```
   */
  constructor(
    description: string,
    _intervals: any[],
    reference,
    public notes: any,
    public accidentals: any)
  {
    super(description, _intervals, reference);

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
   * @return: tone generator
   */
  parse(note: string): TuningTone {
    const match = this.regex.exec(note);
    if (match) {
      return TuningTone.fromGenerator(
        this,
        this.notes[ match[1] ] + (match[2] ? this.accidentals[ match[2] ] : 0),
        parseInt(match[3], 10)
      );
    }
    else {
      console.error(`Could not parse note ${note}. Trying without accidentals...`);
      const match2 = this.regexNoAccidentals.exec(note);
      if (match2) {
        return TuningTone.fromGenerator(
          this,
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
   * @return array of strings representing the enharmonic namings of the tone
   */
  name(tone: TuningTone): string[] {
    const names = Object.keys(this.notes).reduce((names, note) => {
      const delta = tone.index - this.notes[note];
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
  constructor(public tone: number, public index: number, public octave: number) {}

  static fromGenerator(tuning: Tuning, _index: number, _octave: number): TuningTone {
    let index = _index;
    let octave = _octave;
    if (_index < 0) {
      index += tuning.steps;
      octave -= 1;
    }
    else if (_index >= tuning.steps) {
      index -= tuning.steps;
      octave += 1;
    }
    return new TuningTone(
      (index - tuning.reference.index) + (octave - tuning.reference.octave) * tuning.steps,
      index,
      octave
    );
  }

  static fromTone(tuning: Tuning, tone: number): TuningTone {
    return TuningTone.fromGenerator(
      tuning,
      (tone % tuning.steps) + tuning.reference.index,
      Math.trunc(tone / tuning.steps) + tuning.reference.octave
    );
  }
}
