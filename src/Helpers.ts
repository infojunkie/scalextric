import {Fraction} from 'mathjs';

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
  export function primes(max: number): number[] {
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
      (f.abs().compare(1) > 0 ? f.inverse() : f) ;
  }

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
  export function binarySearch<T>(ar: Array<T>, el: T, comp: (a: T, b: T) => number): number {
    let m = 0;
    let n = ar.length - 1;
    while (m <= n) {
      const k = (n + m) >> 1;
      const cmp = comp(el, ar[k]);
      if (cmp > 0) {
        m = k + 1;
      } else if (cmp < 0) {
        n = k - 1;
      } else {
        return k;
      }
    }
    return ~m;
  }

  /**
   * Check array equality.
   * https://stackoverflow.com/q/7837456/209184
   */
  export function arrayEqual<T>(ar1: Array<T>, ar2: Array<T>, comp: (a: T, b: T) => number): boolean {
    return (
      ar1.length === ar2.length &&
      ar1.every((value, index) => comp(value, ar2[index]) === 0)
    );
  }

  /**
   * Return array with unique values.
   * https://stackoverflow.com/a/17903018/209184
   */
  export function arrayUnique<T>(ar: Array<T>): Array<T> {
    return [...new Set(ar)];
  }

  /**
   * Always-positive Modulo function. The built-in % operator computes the Remainder.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
   * https://stackoverflow.com/a/17323608/209184
   */
  export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
}
