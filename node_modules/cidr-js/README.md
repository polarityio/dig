# cidr-js
Node module for for expanding cidr blocks in a list of IP (a-z) or just the range (start &amp; end)

## Install
```bash
npm install cidr-js
```

## Example Usage
Get just the start and end IPs

```javascript
var CIDR = require('cidr-js');
var cidr = new CIDR();

var block = '127.0.0.0/31';
var results = cidr.range(block);

// should return ['127.0.0.0', '127.0.0.1']
```

Get a list of ips in a given range
```javascript
var CIDR = require('cidr-js');
var cidr = new CIDR();
var block = '127.0.0.0/30';
var results = cidr.list(block);

// should return [ '127.0.0.0', '127.0.0.1', '127.0.0.2', '127.0.0.3' ]
```

Filter a list of ips into contiguous blocks
```javascript
var ips = [
    // contiguous block
    '127.0.0.0',
    '127.0.0.1',
    '127.0.0.2',
    '127.0.0.3',
    '127.0.0.4',
    '127.0.0.5',
    '127.0.0.6',

    // new contiguous block
    '127.0.1.1',
    '127.0.1.2',
    '127.0.1.3',

    // dangling block
    '127.0.1.5'
];

var CIDR = require('cidr-js');
var cidr = new CIDR();
var results = cidr.filter(ips);

// should return
{
  '12700': [
    '127.0.0.1',
    '127.0.0.2',
    '127.0.0.3',
    '127.0.0.4',
    '127.0.0.5',
    '127.0.0.6'
  ],
  '12701': [
    '127.0.1.1',
    '127.0.1.2',
    '127.0.1.3'
  ],
  '127015': [
    '127.0.1.5'
  ]
}
```

Get IP blocks from a list of IPs
```javascript
var ips = [
    // contiguous block
    '127.0.0.0',
    '127.0.0.1',
    '127.0.0.2',
    '127.0.0.3',
    '127.0.0.4',
    '127.0.0.5',
    '127.0.0.6',

    // new contiguous block
    '127.0.1.1',
    '127.0.1.2',
    '127.0.1.3',

    // dangling block
    '127.0.1.5'
];
var CIDR = require('cidr-js');
var cidr = new CIDR();
var results = cidr.getBlocks(ips);

// should return
[
  '127.0.0.0/30',
  '127.0.0.4/31',
  '127.0.0.6/32',
  '127.0.1.1/32',
  '127.0.1.2/31',
  '127.0.1.5'
]
```

## Testing
```bash
npm test
```
