import { Tuning } from '../Tuning';
/**
 * Convert a Scala scale definition to a Tuning.
 * @see https://www.huygens-fokker.org/scala/scl_format.html
 *
 * @param scala Scala scale definition
 * @param source Source string, defaults to latest Scala archive version
 * @returns Tuning instance
 */
export declare function tuningFromScala(scala: string, source?: string): Tuning;
