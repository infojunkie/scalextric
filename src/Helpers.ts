import Fraction from 'fraction.js';

export namespace Helpers {
  /**
   * Escape a string to be used in regular expression.
   * https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
   *
   * @param str: string to escape
   * @returns escaped, RegExp-ready string
   */
  export function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  /**
   * Get primes up to a given integer.
   * https://stackoverflow.com/a/12287599/209184
   * Uses the Sieve of Eratosthenes https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
   *
   * @param max: number to reach
   * @returns all primes up to max
   */
  export function getPrimes(max: number): number[] {
    const sieve: boolean[] = [], primes: number[] = [];
    for (let i = 2; i <= max; ++i) {
      if (!sieve[i]) {
        // i has not been marked -- it is prime
        primes.push(i);
        for (let j = i << 1; j <= max; j += i) {
           sieve[j] = true;
        }
      }
    }
    return primes;
  }

  /**
   * Ensure a |fraction| < 1 or > 1.
   */
  export function flipFraction(f: Fraction, greaterThanOne: boolean = false): Fraction {
    return greaterThanOne ?
      (f.abs().compare(1) < 0 ? f.inverse() : f) :
      (f.abs().compare(1) > 0 ? f.inverse() : f);
  }
}
