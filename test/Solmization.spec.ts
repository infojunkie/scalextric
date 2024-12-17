import assert from 'node:assert';
import { describe, it } from 'node:test';
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
    assert.deepStrictEqual(Array.from(solmization.nameMap.keys())
    .reduce((obj, k) => {
      obj[k] = solmization.nameMap.get(k);
      return obj;
    }, {}), {
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
    assert.deepStrictEqual(solmization.name(Tone.fromPitch(edo12, 1)).sort(), ['D♭0', 'C♯0'].sort());
  });
  it('parses notes', () => {
    assert.strictEqual(solmization.parse('C#0').pitch, 1);
    assert.throws(() => { solmization.parse('Hello') });
  });
});
