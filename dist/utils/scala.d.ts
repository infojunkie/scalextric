import { Tuning } from '../Tuning';
import { Interval } from '../Interval';
/**
 * Convert a Scala scale definition to a Tuning.
 * @param scala: Scala scale definition
 * @returns tuning object
 */
export declare function tuningFromScala(scala: string, source?: string): Tuning;
/**
 * Parse a Scala interval value and return it as as Interval
 * @param string Interval in any of the valid interval Scala format
 * @returns interval object
 */
export declare function intervalFromScala(interval: string): Interval;
