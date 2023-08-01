/**
 * ANNOTATION
 *
 * An annotation is a generic container for metadata that can be attached to any object.
 */
export class Annotation {
  static findByLabel(label: string, annotations: Annotation[]): any[] {
    return annotations.filter(annotation => annotation.label === label).map(annotation => annotation.value);
  }

  constructor(public label: string, public value: any) {}
}
