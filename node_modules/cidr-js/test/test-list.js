var chai = require('chai');
var expect = chai.expect;
var CIDR = require(__dirname + '/../src/index');

describe('cidr.list()', function() {
    it('should return a list of 256 IPs for /24 block', function() {
        var block = '127.0.0.0/24';
        var cidr = new CIDR();
        var results = cidr.list(block);
        expect(results.length).to.equal(256);
    });

    it('should return a list of 65,536 IPs for /16 block', function() {
        var block = '127.0.0.0/16';
        var cidr = new CIDR();
        var results = cidr.list(block);
        expect(results.length).to.equal(65536);
    });

    it('should return a list of 16,777,216 IPs for /8 block', function() {
        // this one will take a bit to run...
        this.timeout(20000);
        var block = '127.0.0.0/8';
        var cidr = new CIDR();
        var results = cidr.list(block);
        expect(results.length).to.equal(16777216);
    });
});