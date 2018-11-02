import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {tuningFromScala} from '../src/scala';
import {Tuning} from '../src/Tuning';

describe('Scala', () => {
  it('parses Scala scales', () => {
    const tuning = tuningFromScala(fs.readFileSync(`test/pyth_12.scl`, 'utf8'));
    expect(tuning.steps).to.be.equal(12);
    expect(tuning.intervals.map(i => i.ratio.valueOf())).to.be.clsTo([
      1,
      2187/2048,
      9/8,
      32/27,
      81/64,
      4/3,
      729/512,
      3/2,
      6561/4096,
      27/16,
      16/9,
      243/128,
      2/1
    ], 0.00005);
  });
});
