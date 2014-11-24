var assert = require('assert');

var prefixes = require('../../lib/prefixes');

describe('prefixes', function () {
    it('should be a array', function () {
        assert.strictEqual(
            '[object Array]',
            Object.prototype.toString.call(prefixes.getPrefixList())
        );
    });

    it('should be a object', function () {
        assert.strictEqual(
            'object',
            typeof prefixes.getPrefixMap()
        );
    });
});
