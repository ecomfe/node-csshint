/**
 * @file lib/prefixes.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chai from 'chai';
import path from 'path';

'use strict';

let prefixes = require(path.join(__dirname, '../../lib', 'prefixes'));

const expect = chai.expect;

/* globals describe, it */

describe('prefixes test suite\n', () => {
    describe('prefixes', function () {
        it('should be a array', function () {
            expect(Object.prototype.toString.call(prefixes.getPrefixList())).to.equal('[object Array]');
        });

        it('should be a object', function () {
            expect(typeof prefixes.getPrefixMap()).to.equal('object');
        });
    });
});
