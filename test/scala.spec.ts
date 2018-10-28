import * as chai from 'chai';
import {expect} from 'chai';
import {tuningFromScala} from '../src/scala';
import {Tuning} from '../src/Tuning';

chai.use(require('chai-deep-closeto'));

describe('Scala', () => {
  it('parses Scala scales', () => {
    const tuning = tuningFromScala('05-19');
    expect(tuning.intervals.map(Tuning.ratioToCents)).to.be.clsTo([0, 252.63158, 505.26316, 757.89474, 1010.52632, 1200], 0.00005);
  });
});
