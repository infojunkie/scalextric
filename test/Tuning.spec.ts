import {expect} from 'chai';
import Tuning from '../src/Tuning';

describe('Tuning', () => {
  const edo24 = new Tuning(Tuning.intervalsEdo(24), {
    notes: {
      'C': 0, 'D': 4, 'E': 8, 'F': 10, 'G': 14, 'A': 18, 'B': 22
    },
    accidentals: {
      'n': 0, '#': 2, 'b': -2, '##': 4, 'bb': -4,
      '+': 1, '++': 3, 'bs': -1, 'bss': -3
    }
  }, 'C0');

  it('parses notes in a tuning', () => {
    expect(['C0', 'D0', 'Ebs0', 'F0', 'G0'].map(note => edo24.tone(note))).to.eql([0, 4, 7, 10, 14]);
  });
});
