import Fraction from 'fraction.js';
/**
 * Escape a string to be used in regular expression.
 *
 * @param str String to escape
 * @returns escaped, RegExp-ready string
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
 */
export declare function escapeRegExp(str: string): string;
/**
 * Get primes up to a given integer.
 * Uses the Sieve of Eratosthenes https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
 *
 * @param max Number to reach
 * @returns all primes up to max
 * @see https://stackoverflow.com/a/12287599/209184
 */
export declare function primes(max: number): number[];
/**
 * Ensure a |fraction| < 1 or > 1.
 */
export declare function flipFraction(f: Fraction, greaterThanOne?: boolean): Fraction;
/**
 * Binary search in an array.
 *
 * @param ar Elements array that is sorted
 * @param el Target element
 * @param comp Comparison function (a,b) => n with
 *        n > 0 if a > b
 *        n < 0 if a < b
 *        n = 0 if a = b
 * @returns Index m >= 0 if match is found, m < 0 if not found with insertion point = -m-1.
 * @see https://stackoverflow.com/a/29018745/209184
 */
export declare function binarySearch<T>(ar: ReadonlyArray<T>, el: T, comp: (a: T, b: T) => number): number;
/**
 * Check array equality.
 *
 * @see https://stackoverflow.com/q/7837456/209184
 */
export declare function arrayEqual<T>(ar1: ReadonlyArray<T>, ar2: ReadonlyArray<T>, comp: (a: T, b: T) => number): boolean;
/**
 * Return array with unique values.
 *
 * @see https://stackoverflow.com/a/17903018/209184
 */
export declare function arrayUnique<T>(ar: ReadonlyArray<T>): ReadonlyArray<T>;
/**
 * Always-positive modulo function. The built-in % operator actually computes the remainder.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 * @see https://stackoverflow.com/a/17323608/209184
 */
export declare function mod(n: number, m: number): number;
/**
 * Array range.
 *
 * @see https://stackoverflow.com/a/10050831/209184
 */
export declare function arrayRange(size: number, startAt?: number): ReadonlyArray<number>;
/**
 * Round to nearest decimal.
 *
 * @see https://stackoverflow.com/a/27861660/209184
 */
export declare function roundTo(n: number, r: number): number;
/**
 * Parse a string of whitespace-separated keywords, possibly including escaped quotes.
 *
 * @param list String of whitespace-separated keywords
 * @returns Array of keywords
 * @see https://stackoverflow.com/a/46946420
 */
export declare function parseList(list: string): string[];
