import {Tuning, TuningTone} from './Tuning';
import {Helpers} from './Helpers';

/**
 * TONE ROW
 *
 * We define a tone row as an ordered set of tones. It is the basic collection of tones
 * that make up many other musical objects such as scales, chords, etc.
 *
 * This definition extends the usual definition of "tone row" used in serial composition
 * https://en.wikipedia.org/wiki/Tone_row
 *
 * It allows us to reuse the standard tone row operations (invert, reverse, transpose, rotate)
 * on other musical objects.
 */
export class ToneRow {
  constructor(public tuning: Tuning, public prime: TuningTone[]) {}

  /**
   * Transpose a row to an axis tone.
   */
  transpose(axis: TuningTone): ToneRow {
    return new ToneRow(this.tuning, this.prime.map(tone =>
      TuningTone.fromPitch(this.tuning, axis.pitch + tone.pitch)
    ));
  }

  /**
   * Invert a row around an axis tone.
   */
  invert(axis: TuningTone): ToneRow {
    return new ToneRow(this.tuning, this.prime.map(tone =>
      TuningTone.fromPitch(this.tuning, axis.pitch - tone.pitch)
    ));
  }

  /**
   * Reverse a row.
   */
  reverse(): ToneRow {
    return new ToneRow(this.tuning, [...this.prime].reverse());
  }

  /**
   * Rotate a row by cycling a number of times.
   */
  rotate(cycles: number): ToneRow {
    const c = cycles % this.prime.length;
    return new ToneRow(this.tuning, [...this.prime.slice(c), ...this.prime.slice(0, c)]);
  }

  /**
   * Monotonize a row, ensuring it is stricly ascending or descending, by raising or dropping pitch octaves.
   */
  monotonize(descending: boolean = false): ToneRow {
    return new ToneRow(this.tuning, this.prime.reduce((current, next) => {
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
    return this.prime.map(tone => tone.pitch);
  }

  /**
   * Create a tone row from given pitches.
   */
  static fromPitches(tuning: Tuning, pitches: number[]) {
    return new ToneRow(tuning, pitches.map(pitch =>
      TuningTone.fromPitch(tuning, pitch)
    ));
  }
}
