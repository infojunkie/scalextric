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
export class ToneRow {
  /**
   * CONSTRUCTOR
   *
   * @param tuning The reference tuning
   * @param tones The tones making up the row
   * @param metadata Row metadata (label, description, source)
   */
  constructor(public tuning: Tuning, public tones: Tone[], public metadata?: Metadata) {
    // Verify that tones are valid by detecting repeating pitch classes.
    if (tones.some((tone, index) => !!tones.slice(index + 1).find(t => t.pitchClass === tone.pitchClass))) {
      throw Error(`Found repeating pitch class in tone row.`);
    }
  }

  /**
   * Transpose a row to a target tone.
   */
  transpose(target: Tone): ToneRow {
    return new ToneRow(this.tuning, this.tones.map(tone =>
      Tone.fromPitch(this.tuning, target.pitch + tone.pitch)
    ));
  }

  /**
   * Invert a row around an axis tone.
   */
  invert(axis: Tone): ToneRow {
    return new ToneRow(this.tuning, this.tones.map(tone =>
      Tone.fromPitch(this.tuning, axis.pitch - tone.pitch)
    ));
  }

  /**
   * Reverse a row.
   */
  reverse(): ToneRow {
    return new ToneRow(this.tuning, [...this.tones].reverse());
  }

  /**
   * Rotate a row by cycling it a number of times.
   */
  rotate(cycles: number): ToneRow {
    const c = cycles % this.tones.length;
    return new ToneRow(this.tuning, [...this.tones.slice(c), ...this.tones.slice(0, c)]);
  }

  /**
   * Monotonize a row, ensuring it is stricly ascending or descending, by raising or dropping pitch octaves.
   *
   * rotate.monotonize => chord inversion
   */
  monotonize(descending = false): ToneRow {
    return new ToneRow(this.tuning, this.tones.reduce((current, next) => {
      const last: Tone = current.length > 0 ? current[current.length-1] : next;
      if (!descending && next.pitch < last.pitch) {
        current.push(new Tone(this.tuning, next.pitchClass, last.octave + (next.pitchClass < last.pitchClass ? 1 : 0)));
      } else if (descending && next.pitch > last.pitch) {
        current.push(new Tone(this.tuning, next.pitchClass, last.octave + (next.pitchClass > last.pitchClass ? -1 : 0)));
      } else {
        current.push(next);
      }
      return current;
    }, []));
  }

  /**
   * Get the pitches of the tone row.
   */
  get pitches(): number[] {
    return this.tones.map(tone => tone.pitch);
  }

  /**
   * Create a tone row from given pitches.
   */
  static fromPitches(tuning: Tuning, pitches: number[], metadata?: Metadata): ToneRow {
    return new ToneRow(tuning, pitches.map(pitch =>
      Tone.fromPitch(tuning, pitch)
    ), metadata);
  }

  /**
   * Create a tone row from given pitches.
   */
  static fromPitchClasses(tuning: Tuning, pitchClasses: number[], octave: number, metadata?: Metadata): ToneRow {
    return new ToneRow(tuning, pitchClasses.map(pitchClass =>
      new Tone(tuning, pitchClass, octave)
    ), metadata);
  }
}

export class ToneRowSolmized extends ToneRow {
  constructor(public tuning: Tuning, public solmization: Solmization, public tones: Tone[], public metadata?: Metadata) {
    super(tuning, tones, metadata);
  }

  static fromToneRow(row: ToneRow, solmization: Solmization): ToneRowSolmized {
    return new ToneRowSolmized(row.tuning, solmization, row.tones, row.metadata);
  }
}
