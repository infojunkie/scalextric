const expect = require('chai').expect;

const Scalextric = require('../dist/scalextric');

describe('Scalextric Bundle', () => {
    it('accesses Tuning module', () => {
        const edo12 = Scalextric.Tuning.fromEdo(12);
        expect(edo12.transposable).to.be.true;
    });
});
