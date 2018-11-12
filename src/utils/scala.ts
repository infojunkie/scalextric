import * as ScalaScale from 'aural-scala';
import {Tuning, TuningTone} from '../Tuning';
import {Annotation} from '../Annotation';

/**
 * Convert a Scala scale definition to a Tuning.
 * @param scala: Scala scale definition
 * @returns tuning object
 */
export function tuningFromScala(scala: string): Tuning {
  const scale = ScalaScale.parse(scala);
  return Tuning.fromIntervals(
    [0, ...scale.intervals],
    [
      new Annotation('label', scale.description),
      new Annotation('description', scale.comments.join('\r\n'))
    ].filter(a => a.value)
  );
}
