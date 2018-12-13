import {Tuning, TuningTone} from './Tuning';
import {Annotation} from './Annotation';
import {Helpers} from './Helpers';

/**
 * TONE ROW
 *
 * We define a tone row as an ordered sequence of tones. It is the basic collection of tones
 * that make up many other musical objects such as scales, chords, etc.
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
   * @param tuning: the reference tuning
   * @param tones: the tones making up the row
   * @param annotations: notes about the row
   */
  constructor(public tuning: Tuning, public tones: TuningTone[], public annotations: Annotation[] = []) {}

  /**
   * Transpose a row to a target tone.
   */
  transpose(target: TuningTone): ToneRow {
    return new ToneRow(this.tuning, this.tones.map(tone =>
      TuningTone.fromPitch(this.tuning, target.pitch + tone.pitch)
    ));
  }

  /**
   * Invert a row around an axis tone.
   */
  invert(axis: TuningTone): ToneRow {
    return new ToneRow(this.tuning, this.tones.map(tone =>
      TuningTone.fromPitch(this.tuning, axis.pitch - tone.pitch)
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
  monotonize(descending: boolean = false): ToneRow {
    return new ToneRow(this.tuning, this.tones.reduce((current, next) => {
      const last: TuningTone = current.length > 0 ? current[current.length-1] : next;
      if (!descending && next.pitch < last.pitch) {
        current.push(new TuningTone(this.tuning, next.pitchClass, last.octave + (next.pitchClass < last.pitchClass ? 1 : 0)));
      } else if (descending && next.pitch > last.pitch) {
        current.push(new TuningTone(this.tuning, next.pitchClass, last.octave + (next.pitchClass > last.pitchClass ? -1 : 0)));
      } else {
        current.push(next);
      }
      return current;
    }, new Array<TuningTone>()));
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
  static fromPitches(tuning: Tuning, pitches: number[], annotations: Annotation[] = []) {
    return new ToneRow(tuning, pitches.map(pitch =>
      TuningTone.fromPitch(tuning, pitch)
    ), annotations);
  }
}
