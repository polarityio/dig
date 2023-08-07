var chai = require('chai');
var expect = chai.expect;
var ips = require(__dirname + '/fixtures/ips').ips;
var CIDR = require(__dirname + '/../src/index');

/**
 * @link http://winterofdiscontent.net/IPSubnetCalculator/
 */
describe('cidr.getBlocks()', function() {
    it('should return 6 results', function(done) {
        var cidr = new CIDR();
        var results = cidr.getBlocks(ips.slice());

        expect(results.length).to.equal(6);
        expect((results.indexOf('127.0.0.0/30') > -1)).to.equal(true);
        expect((results.indexOf('127.0.0.4/31') > -1)).to.equal(true);
        expect((results.indexOf('127.0.0.6/32') > -1)).to.equal(true);

        expect((results.indexOf('127.0.1.1/32') > -1)).to.equal(true);
        expect((results.indexOf('127.0.1.2/31') > -1)).to.equal(true);

        // verify our dangler is included as a single IP
        expect((results.indexOf('127.0.1.5') > -1)).to.equal(true);

        return done();
    });
});;
