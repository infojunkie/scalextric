import { Tuning } from '../Tuning';
import { Solmization } from '../Solmization';
/**
 * Convert a Scala scale definition to a Tuning.
 * @see https://www.huygens-fokker.org/scala/scl_format.html
 *
 * @param scala Scala scale definition
 * @param source Source string, defaults to latest Scala archive version
 * @returns Tuning instance
 */
export declare function tuningFromScala(scala: string, source?: string): Tuning;
/**
 * Parse an Ableton tuning definition to a Solmization.
 * @see https://help.ableton.com/hc/en-us/articles/10998372840220-ASCL-Specification
 *
 * @param ableton Ableton tuning definition
 * @param source Source string, defaults to latest Ableton version
 * @returns Solmization instance
 */
export declare function solmizationFromAbleton(ableton: string, source?: string): Solmization;
