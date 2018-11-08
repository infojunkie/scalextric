import {expect} from 'chai';
import './setup';

import Fraction from 'fraction.js';
import {Helpers} from '../src/Helpers';

describe('Helpers', () => {
  it('escapes regex strings', () => {
    expect(Helpers.escapeRegExp('This is a *bold* move.')).to.equal('This is a \\*bold\\* move\\.');
  });

  it('computes the primes up to 20', () => {
    expect(Helpers.getPrimes(20)).to.deep.equal([2, 3, 5, 7, 11, 13, 17, 19]);
  });

  it('flips fractions', () => {
    expect(Helpers.flipFraction(new Fraction(1/2)).equals(1/2)).to.be.true;
    expect(Helpers.flipFraction(new Fraction(1/2), true).equals(2)).to.be.true;
    expect(Helpers.flipFraction(new Fraction(2)).equals(1/2)).to.be.true;
    expect(Helpers.flipFraction(new Fraction(2), true).equals(2)).to.be.true;

    expect(Helpers.flipFraction(new Fraction(-1/2)).equals(-1/2)).to.be.true;
    expect(Helpers.flipFraction(new Fraction(-1/2), true).equals(-2)).to.be.true;
    expect(Helpers.flipFraction(new Fraction(-2)).equals(-1/2)).to.be.true;
    expect(Helpers.flipFraction(new Fraction(-2), true).equals(-2)).to.be.true;
  });

  it('binary searches', () => {
    // https://stackoverflow.com/a/29018745/209184
    const ar = [1, 2, 2, 2, 5, 9, 11, 12, 12, 12, 12, 15, 20, 20, 20, 25, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 80];
    for (let i = 0; i <= 100; i++) {
      const n = Helpers.binarySearch(ar, i, (a,b) => a-b);
      expect(
        (n >= 0 && ar[n] !== i) ||
        (n < 0 && ((-n-1) < ar.length && ar[-n-1] <= i)) ||
        (n < 0 && (-n-2 >= 0 && ar[-n-2] >= i))
      ).to.be.false;
    }
  });

  it('computes mathematical modulus', () => {
    expect(Helpers.mod(-13, 64)).to.be.equal(51);
  });
});
