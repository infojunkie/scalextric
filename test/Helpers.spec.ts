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
});
