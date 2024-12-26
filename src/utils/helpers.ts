import Fraction from 'fraction.js';

/**
 * Escape a string to be used in regular expression.
 *
 * @param str String to escape
 * @returns escaped, RegExp-ready string
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Get primes up to a given integer.
 * Uses the Sieve of Eratosthenes https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
 *
 * @param max Number to reach
 * @returns all primes up to max
 * @see https://stackoverflow.com/a/12287599/209184
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
export function flipFraction(f: Fraction, greaterThanOne = false): Fraction {
  return greaterThanOne ?
    (f.abs().compare(1) < 0 ? f.inverse() : f) :
    (f.abs().compare(1) > 0 ? f.inverse() : f) ;
}

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
export function binarySearch<T>(ar: ReadonlyArray<T>, el: T, comp: (a: T, b: T) => number): number {
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
 *
 * @see https://stackoverflow.com/q/7837456/209184
 */
export function arrayEqual<T>(ar1: ReadonlyArray<T>, ar2: ReadonlyArray<T>, comp: (a: T, b: T) => number): boolean {
  return (
    ar1.length === ar2.length &&
    ar1.every((value, index) => comp(value, ar2[index]) === 0)
  );
}

/**
 * Return array with unique values.
 *
 * @see https://stackoverflow.com/a/17903018/209184
 */
export function arrayUnique<T>(ar: ReadonlyArray<T>): ReadonlyArray<T> {
  return [...new Set(ar)];
}

/**
 * Always-positive modulo function. The built-in % operator actually computes the remainder.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 * @see https://stackoverflow.com/a/17323608/209184
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Array range.
 *
 * @see https://stackoverflow.com/a/10050831/209184
 */
export function arrayRange(size: number, startAt = 0): ReadonlyArray<number> {
  return [...Array(size).keys()].map(i => i + startAt);
}

/**
 * Round to nearest decimal.
 *
 * @see https://stackoverflow.com/a/27861660/209184
 */
export function roundTo(n: number, r: number): number {
  const inv = 1 / r;
  return Math.round(n * inv) / inv;
}

/**
 * Parse a string of whitespace-separated keywords, possibly including escaped quotes.
 *
 * @param list String of whitespace-separated keywords
 * @returns Array of keywords
 * @see https://stackoverflow.com/a/46946420
 */
export function parseList(list: string): string[] {
  return list.match(/\\?.|^$/g).reduce((p, c) => {
    if (c === '"') {
      p.quote = !p.quote;
    } else if (!p.quote && c === ' ') {
      p.a.push('');
    } else {
      p.a[p.a.length-1] += c.replace(/\\(.)/, "$1");
    }
    return  p;
  }, {a: [''], quote: false}).a;
}
