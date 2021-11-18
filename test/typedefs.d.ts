declare namespace Chai {
  export interface Assertion {
    clsTo(property: number[], tolerance: number): void;
  }
}
