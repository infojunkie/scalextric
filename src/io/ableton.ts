import { Solmization } from '../Solmization';
import { parseList } from '../helpers';
import { tuningFromScala } from './scala';

const ABLETON_VERSION = 'Ableton 12.1';

/**
 * Parse an Ableton tuning definition to a Solmization.
 * @see https://help.ableton.com/hc/en-us/articles/10998372840220-ASCL-Specification
 *
 * @param ableton Ableton tuning definition
 * @param source Source string, defaults to latest Ableton version
 * @returns Solmization instance
 */
export function solmizationFromAbleton(ableton: string, source: string = ABLETON_VERSION): Solmization {
  const tuning = tuningFromScala(ableton, source);
  if (tuning.metadata) {
    const matches = tuning.metadata.description?.matchAll(/@ABL\s+([\w]+)\s+(.*?)$/gm);
    const notes = {};
    for (const match of matches) {
      switch (match[1]) {
        case 'NOTE_NAMES':
          parseList(match[2]).forEach((n, i) => {
            notes[n] = i;
          });
          break;
        case 'REFERENCE_PITCH': {
          const ref = parseList(match[2]);
          tuning.metadata.reference = {
            pitchClass: parseInt(ref[0]),
            octave: parseInt(ref[1]),
            frequency: parseFloat(ref[2])
          }
          break;
        }
        case 'SOURCE':
          tuning.metadata.source = match[2];
          break;
        case 'LINK':
        default:
          console.warn(`[solmizationFromAbleton] Unhandled directive @ABL ${match[1]}. Ignoring.`);
      }
    }
    return new Solmization(tuning, notes, {});
  }
  throw new Error(`[solmizationFromAbleton] Error in Ableton format: No metadata found in tuning.`)
}
