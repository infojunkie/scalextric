import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {Tuning, TuningTone} from '../src/Tuning';
import {TuningNotation} from '../src/TuningNotation';

describe('TuningNotation', () => {
  const edo12 = new Tuning(Tuning.intervalsEdo(12));
  const tuningNotation = TuningNotation.fromNotesAccidentalsCombination(edo12,{
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11
  }, {
    '#': 1,
    'b': -1
  });
  it('generates correctly from notes/accidentals combinations', () => {
    expect(Array.from(tuningNotation.map.keys())
    .reduce((obj, k) => {
      obj[k] = tuningNotation.map.get(k);
      return obj;
    }, {}))
    .to.deep.equal({
      'C': 0,
      'C#': 1,
      'Cb': 11,
      'D': 2,
      'D#': 3,
      'Db': 1,
      'E': 4,
      'E#': 5,
      'Eb': 3,
      'F': 5,
      'F#': 6,
      'Fb': 4,
      'G': 7,
      'G#': 8,
      'Gb': 6,
      'A': 9,
      'A#': 10,
      'Ab': 8,
      'B': 11,
      'B#': 0,
      'Bb': 10
    });
  });
  it('names notes', () => {
    expect(tuningNotation.name(TuningTone.fromPitch(edo12, 1)).sort()).to.deep.equal(['Db0', 'C#0'].sort());
  });
  it('parses notes', () => {
    expect(tuningNotation.parse('C#0').pitch).to.equal(1);
    expect(() => { tuningNotation.parse('Hello') }).to.throw();
  });
});
