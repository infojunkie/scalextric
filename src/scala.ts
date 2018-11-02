import * as ScalaScale from 'aural-scala';
import {Tuning, TuningTone} from './Tuning';

/**
 * Convert a Scala scale definition to a Tuning.
 * @param scala: Scala scale definition
 * @param reference: reference tone
 * @returns tuning object
 */
export function tuningFromScala(scala: string): Tuning {
  const scale = ScalaScale.parse(scala);
  return new Tuning(
    scale.description,
    scale.intervals
  );
}
