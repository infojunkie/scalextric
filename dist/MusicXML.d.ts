import { ToneRow } from './ToneRow';
/**
 * Export various Scalextric objects to as a MusicXML string.
 */
export declare class MusicXML {
    private title;
    private objects;
    static defaultOptions: {
        divisions: number;
        time: {
            beats: number;
            beatType: number;
        };
    };
    constructor(title: string, objects: ToneRow[]);
    convert(): any;
    private convertDocument;
    /**
     * Convert tone rows to MusicXML measures.
     *
     * - Each tone row starts a new measure
     * - Convert each tone in the tone row to a quarter-tone
     * - Open a new measure as needed
     * - When the tone row is complete:
     *   - Fill the current measure with rests
     *   - Close with a section barline
     *   - Start a new system
     *
     * @returns array of measures.
     */
    private convertObjects;
    private static convertDate;
}
