/**
 * lib/util.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var util = require('../../lib/util');

describe('times', function () {
    var count = 1;
    it('should return right count', function () {
        util.times(
            3,
            function () {
                count++;
            }
        );
        assert.strictEqual(4, count);
    });
});

describe('formatMsg', function () {
    it('should return format message', function () {
        var message = util.formatMsg(
            'This is a message',
            5
        );
        assert.strictEqual('     This is a message', message);
    });
});


describe('line, lineContent, location', function () {
    var candidateIndex = 10;
    var candidateLineNumber = 3;

    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/test.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    it('should return right linenumber', function () {
        var lineNumber = util.getLine(candidateIndex, fileContent);
        assert.strictEqual(candidateLineNumber, lineNumber);
    });

    it('should return right linecontent', function () {
        var lineContent = util.getLineContent(candidateLineNumber, fileContent);
        assert.strictEqual('    color: red;', lineContent);
    });

    it('should return right linecontent by index', function () {
        var lineContent = util.getLineContentByIndex(candidateIndex, fileContent);
        assert.strictEqual('    color: red;', lineContent);
    });

    it('should return right location', function () {
        assert.deepEqual({line: 2, column: 0}, util.getLocation(candidateIndex, fileContent));
    });
});

describe('trim', function () {
    it('should return tirm string', function () {
        var str = '   aaaa   ';
        assert.strictEqual('aaaa', util.trim(str));
    });
});
