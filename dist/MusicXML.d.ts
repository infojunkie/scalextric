import { ToneRow } from './ToneRow';
/**
 * Export various Scalextric objects to as a MusicXML document.
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
    static notes: {
        C: number;
        D: number;
        E: number;
        F: number;
        G: number;
        A: number;
        B: number;
    };
    static accidentalValues: {
        '#': number;
        b: number;
    };
    static accidentalNames: {
        '#': string;
        b: string;
    };
    static noteTypes: {
        8: string;
        4: string;
        2: string;
        1: string;
    };
    private options;
    private tuning;
    private tuningNotation;
    constructor(title: string, objects: ToneRow[], options?: {});
    convert(): string;
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
    private convertBar;
    private convertMeasure;
    private convertNote;
    private static convertDate;
}
