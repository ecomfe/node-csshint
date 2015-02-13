/**
 * @file lib/checker.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var checker = require('../../lib/checker');


describe('checkString', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/test.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    it('should return right length', function () {
        var invalidListLen = checker.checkString(fileContent).length;
        assert.strictEqual(5, invalidListLen);
    });
});

describe('check', function () {
    var filePath = path.join(__dirname, '../fixture/test.css');
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/test.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var f = {
        path: filePath,
        content: fileContent
    };

    var errors = [];

    it('should return right length', function () {
        checker.check(
            f,
            errors,
            function () {
                assert.strictEqual(6, errors[0].messages.length);
            }
        );
    });
});
