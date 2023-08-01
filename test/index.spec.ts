import { expect } from 'chai';
import './setup';
import { Tuning } from '../src/index';

describe('Scalextric', () => {
    it('accesses Tuning module', () => {
        const edo12 = Tuning.fromEdo(12);
        expect(edo12.transposable).to.be.true;
    });
});
