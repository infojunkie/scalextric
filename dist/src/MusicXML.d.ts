import { ToneRowSolmized } from './ToneRow';
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
    static accidentals: {
        '#': string;
        '\u266F': string;
        '\uE262': string;
        n: string;
        '\u266E': string;
        '\uE261': string;
        b: string;
        '\u266D': string;
        '\uE260': string;
        x: string;
        '\uD834\uDD2A': string;
        '\uE263': string;
        '##': string;
        '\u266F\u266F': string;
        '\uE269': string;
        bb: string;
        '\u266D\u266D': string;
        '\uD834\uDD2B': string;
        '\uE264': string;
        'n#': string;
        '\u266E\u266F': string;
        '\uE268': string;
        nb: string;
        '\u266E\u266D': string;
        '\uE267': string;
        '#x': string;
        '\u266F\uD834\uDD2A': string;
        '\uE265': string;
        bbb: string;
        '\u266D\u266D\u266D': string;
        '\uE266': string;
        '\uE280': string;
        '\uE282': string;
        '\uE281': string;
        '\uE283': string;
        '\uE275': string;
        '\uE274': string;
        '\uE273': string;
        '\uE272': string;
        '\uE271': string;
        '\uE270': string;
        '\uE277': string;
        '\uE276': string;
        '\uE279': string;
        '\uE278': string;
        '\uE27A': string;
        '\uE27B': string;
        '\uE446': string;
        '\uE447': string;
        '\uE442': string;
        '\uE440': string;
        '\uE443': string;
        '\uE444': string;
        '\uE441': string;
        '\uE445': string;
        '\uE450': string;
        '\uE451': string;
        '\uE452': string;
        '\uE453': string;
        '\uE454': string;
        '\uE455': string;
        '\uE456': string;
        '\uE457': string;
        '\uE461': string;
        '\uE460': string;
    };
    static durations: {
        8: string;
        4: string;
        2: string;
        1: string;
    };
    private options;
    private reference;
    constructor(title: string, objects: ToneRowSolmized[], options?: {});
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
    private convertAccidental;
    private static convertDate;
}
