declare module Chai {
  export interface Assertion {
    clsTo(property: number[], tolerance: number): void;
  }
}
