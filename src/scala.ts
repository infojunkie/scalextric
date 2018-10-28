import * as ScalaScale from 'aural-scala';
import * as fs from 'fs';
import {Tuning, TuningTone} from './Tuning';

export function tuningFromScala(name, reference: TuningTone): Tuning {
  const scale = ScalaScale.parse(fs.readFileSync(`data/scl/${name}.scl`, 'utf8'));
  return new Tuning(
    scale.description,
    scale.intervals,
    reference
  );
}
