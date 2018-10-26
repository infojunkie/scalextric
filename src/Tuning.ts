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
export default class Tuning {
  nomenclature: TuningNomenclature;
  regex: RegExp;
  regexNoAccidentals: RegExp;
  reference: ToneGenerator;
  steps: number;
  intervals: Array<number>;

  /**
   * CONSTRUCTOR
   *
   * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers.
   *  This array should NOT include the unison (1/1) interval.
   *  The last element of this array will be considered to be the repeater (e.g. 2/1 the octave).
   *
   * @param nomenclature: maps of note names and accidentals to tone indexes
   * ```
   * nomenclature: {
   *   notes: {
   *     'C': 0,
   *     'D': 2,
   *     'E': 4,
   *     'F': 5,
   *     'G': 7,
   *     'A': 9,
   *     'B': 11,
   *   },
   *   accidentals: {
   *     '#': +1,
   *     'b': -1,
   *     'n':  0,
   *     ...
   *   }
   * }
   * ```
   *
   * @param reference: reference note in scientific pitch notation
   */
  constructor(intervals: Array<any>, nomenclature: TuningNomenclature, reference: string) {
    this.nomenclature = nomenclature;

    // Precalculated values
    // `regex` is the regular expression that is dynamically built to
    // recognize notes in scientific pitch notation, given the nomenclature supplied by the caller.
    this.regex = new RegExp(
      '^(' + Object.keys(nomenclature.notes).map(Helpers.escapeRegExp).join('|') + ')' +
      '(' + Object.keys(nomenclature.accidentals).map(Helpers.escapeRegExp).sort((a,b) => b.length - a.length).join('|') + ')?' +
      '(-?\\d)$',
      'i'
    );

    // `regexNoAccidentals` is a regex for note names only, to be used when an accidental is not found during parsing.
    this.regexNoAccidentals = new RegExp(
      '^(' + Object.keys(nomenclature.notes).map(Helpers.escapeRegExp).join('|') + ')' +
      '\\D*' +
      '(-?\\d)$',
      'i'
    );

    // `reference` is the reference note information (index, octave)
    this.reference = this.parse(reference);

    // the internal `intervals` holds the interval multipliers in ratio form
    // with the unison added to simplify the code.
    this.steps = intervals.length;
    this.intervals = intervals.splice(1, 0, 0).map(i => {
      if (typeof i === "string") {
        const fraction = i.split('/');
        return Number(fraction[0]) / Number(fraction[1]);
      } else {
        return Tuning.centsToRatio(i);
      }
    });
  }

  /**
   * TUNE A NOTE
   *
   * @param note: target note in scientific pitch notation
   * @return: frequency ratio of the note with respect to reference
   */
  tune(note): number {
    const n = this.parse(note);
    if (!n) return;

    // Get the ratio difference between the target note and the reference note, raised to the difference in octave.
    // The octave is always the last tone as per the definition of the `intervals` array.
    return Math.pow(this.intervals[this.intervals.length-1], n.octave - this.reference.octave) * this.intervals[ n.index ] / this.intervals[ this.reference.index ];
  }

  /**
   * TONE OF A NOTE
   *
   * @param note: target note in scientific pitch notation
   * @return: tone of the note with respect to reference
   */
  tone(note: string): number {
    const n = this.parse(note);
    if (!n) return;

    return (n.index - this.reference.index) + (n.octave - this.reference.octave) * this.steps;
  }

  /**
   * PARSE A NOTE
   *
   * @param note: target note in scientific pitch notation
   * @return: tone generator
   */
  parse(note: string) {
    const match = this.regex.exec(note);
    if (match) {
      return this.normalize({
        index: this.nomenclature.notes[ match[1] ] + (match[2] ? this.nomenclature.accidentals[ match[2] ] : 0),
        octave: parseInt(match[3], 10)
      });
    }
    else {
      console.error(`Could not parse note ${note}. Trying without accidentals...`);
      const match2 = this.regexNoAccidentals.exec(note);
      if (match2) {
        return this.normalize({
          index: this.nomenclature.notes[ match2[1] ],
          octave: parseInt(match2[2], 10)
        });
      }
    }
  }

  /**
   * NORMALIZE A TONE GENERATOR
   *
   * @param generator: tone generator
   * @return: tone generator normalized such that index ∈ [0, N-1] and octave updated accordingly
   */
  normalize(generator: ToneGenerator): ToneGenerator {
    const result = generator;

    // Handle accidentals that push index across boundaries.
    if (result) {
      if (result.index < 0) {
        result.index += this.steps;
        result.octave -= 1;
      }
      else if (result.index >= this.steps) {
        result.index -= this.steps;
        result.octave += 1;
      }
    }

    return result;
  }

  /**
   * NAME A TONE
   *
   * Naming a tone is tricky.
   * First, we find its index and octave relative to the reference tone.
   * Then, we identify the nearest note name.
   *  If it matches exactly, then we're done.
   *   Otherwise, match accidentals with the distance to each note's index and record *each* match.
   * That's the tone name.
   */
  name(tone: number) {
    const generator = this.normalize({
      index: (tone % this.steps) + this.reference.index,
      octave: Math.trunc(tone / this.steps) + this.reference.octave
    });

    const names = Object.keys(this.nomenclature.notes).reduce((names, note) => {
      const delta = generator.index - this.nomenclature.notes[note];
      if (delta === 0) {
        // Note: we ignore the 'natural' accidental (delta === 0)
        names.push({note, accidental: null, octave: generator.octave});
      }
      else {
        const acc = Object.keys(this.nomenclature.accidentals).find((acc) => {
          return (delta === this.nomenclature.accidentals[acc]);
        });
        if (acc !== undefined) {
          names.push({note, accidental: acc, octave: generator.octave});
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

  /**
   * Convert frequency ratio to cents
   */
  static ratioToCents(ratio: number): number {
    return Math.round(1200 * Math.log2(ratio));
  }

  /**
   * Convert cents to frequency ratio
   */
  static centsToRatio(cents: number): number {
    return Math.pow(2, cents / 1200);
  }

  /**
   * Generate a tuning intervals array based on equal divisions of the octave.
   * The intervals are calculated in cents, because they will be converted to ratios
   * inside the Tuning constructor.
   */
  static intervalsEdo(divisions: number): Array<number> {
    return Array.from(Array(divisions)).map((_, i) => {
      return 1200 / divisions * (i+1);
    });
  }
}

export class TuningNomenclature {
  constructor(public notes: any, public accidentals: any) {}
}

export class ToneGenerator {
  constructor(public index: number, public octave: number) {}
}
