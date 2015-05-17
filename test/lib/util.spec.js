/**
 * @file lib/util.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');

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
        expect(4).toEqual(count);
    });
});

describe('formatMsg', function () {
    it('should return format message', function () {
        var message = util.formatMsg(
            'This is a message',
            5
        );
        expect('     This is a message').toEqual(message);
    });
});


describe('line, lineContent, location', function () {
    var candidateIndex = 10;
    var candidateLineNumber = 2;

    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/test.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    it('should return right linenumber', function () {
        var lineNumber = util.getLine(candidateIndex, fileContent);
        expect(candidateLineNumber).toEqual(lineNumber);
    });

    it('should return right linecontent', function () {
        var lineContent = util.getLineContent(candidateLineNumber, fileContent);
        expect(
            '    background: url(http://cwsir.sinaapp.com/CWSirExtensions/images/sprite_ico.png) no-repeat;'
        ).toEqual(lineContent);
    });

    it('should return right linecontent by index', function () {
        var lineContent = util.getLineContentByIndex(candidateIndex, fileContent);
        expect(
            '    background: url(http://cwsir.sinaapp.com/CWSirExtensions/images/sprite_ico.png) no-repeat;'
        ).toEqual(lineContent);
    });

    it('should return right location', function () {
        expect({line: 1, column: 3}).toEqual(util.getLocation(candidateIndex, fileContent));
    });
});

describe('trim', function () {
    it('should return tirm string', function () {
        var str = '   aaaa   ';
        expect('aaaa').toEqual(util.trim(str));
    });
});
