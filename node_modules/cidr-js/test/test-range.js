var chai = require('chai');
var expect = chai.expect;
var CIDR = require(__dirname + '/../src/index');

describe('cidr.range()', function() {
    it('should return the same start and end range', function() {
        var block = '127.0.0.0/32';
        var cidr = new CIDR();
        var results = cidr.range(block);
        expect(results.start).to.equal(results.end);
    });

    it('should return the same two distinct ips', function() {
        var block = '127.0.0.0/31';
        var cidr = new CIDR();
        var results = cidr.range(block);
        expect(results.start).to.not.equal(results.end);
        expect(results.start).to.equal('127.0.0.0');
        expect(results.end).to.equal('127.0.0.1');
    });

    it('should return null with invalid CIDR /33', function() {
        var block = '127.0.0.0/33';
        var cidr = new CIDR();
        var results = cidr.list(block);
        expect(results).to.equal(null);
    });
});