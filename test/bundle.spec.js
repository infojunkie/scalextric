const expect = require('chai').expect;

const Scalextric = require('../dist/scalextric');

describe('Scalextric Bundle', () => {
    it('accesses Tuning module', () => {
        console.log(Scalextric);
        const edo12 = new Scalextric.Tuning(Scalextric.Tuning.intervalsEdo(12));
        expect(edo12.transposable).to.be.true;
    });
});
