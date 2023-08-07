describe('cidr.filter()', function() {
    var chai = require('chai');
    var expect = chai.expect;
    var ips = require(__dirname + '/fixtures/ips').ips;
    var CIDR = require(__dirname + '/../src/index');

    it('should filter the ips into contiguous blocks', function(done) {
        var cidr = new CIDR();
        var results = cidr.filter(ips.slice());
        var keys = Object.keys(results);
        expect(keys.length).to.equal(3);
        return done();
    });
});