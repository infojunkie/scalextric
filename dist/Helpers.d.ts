import Fraction from 'fraction.js';

export declare namespace Helpers {
    /**
     * Escape a string to be used in regular expression.
     * https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
     *
     * @param str: string to escape
     * @returns escaped, RegExp-ready string
     */
    function escapeRegExp(str: string): string;
    /**
     * Get primes up to a given integer.
     * https://stackoverflow.com/a/12287599/209184
     * Uses the Sieve of Eratosthenes https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
     *
     * @param max: number to reach
     * @returns all primes up to max
     */
    function primes(max: number): number[];
    /**
     * Ensure a |fraction| < 1 or > 1.
     */
    function flipFraction(f: Fraction, greaterThanOne?: boolean): Fraction;
    /**
     * Binary search in an array.
     * https://stackoverflow.com/a/29018745/209184
     *
     * @param ar: elements array that is sorted
     * @param el: target element
     * @param comp: comparison function (a,b) => n with
     *        n > 0 if a > b
     *        n < 0 if a < b
     *        n = 0 if a = b
     * @returns index m >= 0 if match is found, m < 0 if not found with insertion point = -m-1.
     */
    function binarySearch<T>(ar: Array<T>, el: T, comp: (a: T, b: T) => number): number;
    /**
     * Check array equality.
     * https://stackoverflow.com/q/7837456/209184
     */
    function arrayEqual<T>(ar1: Array<T>, ar2: Array<T>, comp: (a: T, b: T) => number): boolean;
    /**
     * Return array with unique values.
     * https://stackoverflow.com/a/17903018/209184
     */
    function arrayUnique<T>(ar: Array<T>): Array<T>;
    /**
     * Always-positive Modulo function. The built-in % operator computes the Remainder.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
     * https://stackoverflow.com/a/17323608/209184
     */
    function mod(n: number, m: number): number;
}
