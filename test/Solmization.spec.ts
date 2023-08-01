import { expect } from 'chai';
import './setup';
import { Tuning, Tone } from '../src/Tuning';
import { Solmization } from '../src/Solmization';

describe('Solmization', () => {
  const edo12 = Tuning.fromEdo(12);
  const solmization = new Solmization(edo12, {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11
  }, {
    '♯': +1,
    '#': +1,
    '♭': -1,
    'b': -1,
    '♮':  0
   });
  it('generates correct maps from notes/accidentals combinations', () => {
    expect(Array.from(solmization.nameMap.keys())
    .reduce((obj, k) => {
      obj[k] = solmization.nameMap.get(k);
      return obj;
    }, {}))
    .to.deep.equal({
      'C': 0,
      'C♯': 1,
      'C♭': 11,
      'D': 2,
      'D♯': 3,
      'D♭': 1,
      'E': 4,
      'E♯': 5,
      'E♭': 3,
      'F': 5,
      'F♯': 6,
      'F♭': 4,
      'G': 7,
      'G♯': 8,
      'G♭': 6,
      'A': 9,
      'A♯': 10,
      'A♭': 8,
      'B': 11,
      'B♯': 0,
      'B♭': 10
    });
  });
  it('names notes', () => {
    expect(solmization.name(Tone.fromPitch(edo12, 1)).sort()).to.deep.equal(['D♭0', 'C♯0'].sort());
  });
  it('parses notes', () => {
    expect(solmization.parse('C#0').pitch).to.equal(1);
    expect(() => { solmization.parse('Hello') }).to.throw();
  });
});
