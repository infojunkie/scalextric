import { Solmization } from '../Solmization';
/**
 * Parse an Ableton tuning definition to a Solmization.
 * @see https://help.ableton.com/hc/en-us/articles/10998372840220-ASCL-Specification
 *
 * @param ableton Ableton tuning definition
 * @param source Source string, defaults to latest Ableton version
 * @returns Solmization instance
 */
export declare function solmizationFromAbleton(ableton: string, source?: string): Solmization;
