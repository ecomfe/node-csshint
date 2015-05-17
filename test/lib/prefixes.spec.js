/**
 * @file lib/prefixes.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var prefixes = require('../../lib/prefixes');

describe('prefixes', function () {
    it('should be a array', function () {
        expect('[object Array]').toEqual(Object.prototype.toString.call(prefixes.getPrefixList()));
    });

    it('should be a object', function () {
        expect('object').toEqual(typeof prefixes.getPrefixMap());
    });
});
