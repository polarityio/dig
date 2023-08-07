'use strict';

var php = require('locutus/php/network')
var ip2long = php.ip2long;
var long2ip = php.long2ip;
var math = Math;
var Calculator = require( 'ip-subnet-calculator' );

var CIDR = function CIDR() {
    if (!(this instanceof CIDR)) {
        return new CIDR();
    }
};

/**
 * Finds the appropriate block or
 * bucket for the given IP to be
 * inserted in. Another way
 * @param key
 * @param ip
 */
var block = function(collection, key, ip) {
    if (!collection) {
        collection = {};
    }

    if (!collection[key]) {
        collection[key] = [];
    }

    collection[key].push(ip);
};

/**
 * Returns the IP range (start & end)
 * for a given IP/CIDR
 * @param ip
 * @returns {Object}
 */
CIDR.prototype.range = function(ip) {
    if (!(ip.indexOf('/') > -1)) {
        return null;
    }

    var range = {};
    var parts = ip.split('/');

    if ((parts[1] > 32)) {
        return null;
    }

    range.start = long2ip((ip2long(parts[0])) & ((-1 << (32 - +parts[1]))));
    range.end = long2ip((ip2long(range.start)) + math.pow(2, (32 - +parts[1])) - 1);

    return range;
};

/**
 * Returns a list of
 * ip values within the range of a
 * given cidr block.
 *
 * @param ip
 * @return {Array}
 */
CIDR.prototype.list = function(ip) {
    if (typeof (ip) === 'undefined') {
        return null;
    }

    var range = this.range(ip);

    if (!range) {
        return null;
    }

    var _ip2long = ip2long;
    var _long2ip = long2ip;
    var list = [];
    var index = 0;
    var startLong = _ip2long(range.start);
    var endLong = _ip2long(range.end);

    list[index++] = range.start;

    while((startLong++ < endLong)) {
        list[index++] = _long2ip(startLong);
    }

    return list;
};

var convertAndSort = function(ips) {
    var len = ips.length;
    var _ip2long = ip2long;
    var current = null;

    for (var i=0; i<len; i++) {
        current = ips[i];
        if (current) {
            ips[i] = _ip2long(current);
        }
    }

    ips = ips.sort();
    return ips;
}

/**
 * Filter the array by grouping
 * IPs where all 32 bits are contiguous
 * 127.0.0.0, 127.0.0.1, 127.0.0.2, etc
 * @returns {Object}
 */
CIDR.prototype.filter = function(ips) {
    if (!(ips instanceof Array) || ips.length <= 0) {
        return null;
    }

    ips = convertAndSort(ips);

    var key = 0;
    var cont = true;
    var len = ips.length;
    var previous = null;
    var current = null;
    var next = null;
    var results = {};

    if (ips.length === 1) {
        return block(results, 0, long2ip(ips[0]));
    }

    for (var i=0; i<len; i++) {
        current = ips[i];
        next = ips[i+1];
        previous = current;

        if (!cont) {
            key += 1;
        }

        if (next) {
            if ((next - current) === 1) {
                block(results, key, long2ip(current));
                cont = true;
            } else {
                block(results, key, long2ip(current));
                cont = false;
            }
        } else {
            if (previous) {
                if ((current - previous) === 1) {
                    block(results, key, long2ip(current));
                    cont = true;
                } else {
                    block(results, ++key, long2ip(current));
                }
            }
        }
    }

    return results;
};

/**
 * Returns arrays grouped
 * contiguously.
 *
 * @returns {Array}
 */
CIDR.prototype.getBlocks = function(ips) {
    var blocks = this.filter(ips);
    var results = [];

    for (var i in blocks) {
        var block = blocks[i];

        if (block.length === 1) {
            results.push(block[0]);
            continue;
        }

        var start = block.shift();
        var end = block.pop();
        var ranges = Calculator.calculate(start, end);

        for (var j in ranges) {
            results.push(ranges[j].ipLowStr + '/' + ranges[j].prefixSize);
        }
    }

    return results;
};

module.exports = CIDR;
