/**
 * ANNOTATION
 *
 * An annotation is a generic container for metadata that can be attached to any object.
 */
export declare class Annotation {
    label: string;
    value: any;
    static findByLabel(label: string, annotations: Annotation[]): any[];
    constructor(label: string, value: any);
}
