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
            '    -webkit-animation: spin 2s infinite linear;'
        ).toEqual(lineContent);

        var lineContent1 = util.getLineContent(candidateLineNumber, fileContent, true);
        expect(
            '-webkit-animation: spin 2s infinite linear;'
        ).toEqual(lineContent1);
    });

    it('should return right linecontent by index', function () {
        var lineContent = util.getLineContentByIndex(candidateIndex, fileContent);
        expect(
            '    -webkit-animation: spin 2s infinite linear;'
        ).toEqual(lineContent);
    });

    it('should return right location', function () {
        expect({line: 1, column: 1}).toEqual(util.getLocation(candidateIndex, fileContent));
    });
});

describe('trim', function () {
    it('should return tirm string', function () {
        var str = '   aaaa   ';
        expect('aaaa').toEqual(util.trim(str));

        expect('').toEqual(util.trim());
    });
});

describe('array unique', function () {
    it('should return right result', function () {
        var arr = [1, 2, 3, 4, '5', '5', 3];
        expect([1, 2, 3, 4, '5']).toEqual(util.arrUnique(arr));
    });
});

describe('changeColorByStartAndEndIndex', function () {
    it('should return right result', function () {
        expect('').toEqual(util.changeColorByStartAndEndIndex('', 1, 3));
    });
});

describe('getCandidates', function () {
    it('should return right result', function () {
        var patterns = [
            '**/always-semicolon.css',
            '!**/{output,node_modules,asset,dist,release,doc,dep,report}/**'
        ];

        var candidates = util.getCandidates([], patterns);
        expect(1).toEqual(candidates.length);
        expect('test/fixture/always-semicolon.css').toEqual(candidates[0]);

        var patterns1 = [
            'always-semicolon.css'
        ];
        var candidates1 = util.getCandidates(['test/fixture'], patterns1);
        expect(1).toEqual(candidates1.length);
        expect('test/fixture/always-semicolon.css').toEqual(candidates1[0]);

        var candidates2 = util.getCandidates(['test/fixture/always-semicolon.css']);
        expect(1).toEqual(candidates2.length);
        expect('test/fixture/always-semicolon.css').toEqual(candidates2[0]);

        var notExistCandidates = util.getCandidates(['test/fixture1'], patterns1);
        expect(0).toEqual(notExistCandidates.length);
    });
});

describe('getIgnorePatterns', function () {
    it('should return right result', function () {
        expect([]).toEqual(util.getIgnorePatterns('test/fixture/aaaa.css'));
    });
});

describe('getPropertyValue', function () {
    it('should return right result', function () {
        expect([{text: '123dd', value: 123, units: 'dd', type: 'dimension'}]).toEqual(util.getPropertyValue('123dd'));
        expect([{text: '123deg', value: 123, units: 'deg', type: 'angle'}]).toEqual(util.getPropertyValue('123deg'));
        expect([{text: '123s', value: 123, units: 's', type: 'time'}]).toEqual(util.getPropertyValue('123s'));
        expect([{text: '123hz', value: 123, units: 'hz', type: 'frequency'}]).toEqual(util.getPropertyValue('123hz'));
        expect([{text: '123dpi', value: 123, units: 'dpi', type: 'resolution'}]).toEqual(
            util.getPropertyValue('123dpi')
        );
        expect([{text: '50%', value: 50, type: 'percentage'}]).toEqual(util.getPropertyValue('50%'));
        expect([{text: '50', value: 50, type: 'integer'}]).toEqual(util.getPropertyValue(50));
        expect([{text: '50.1', value: 50.1, type: 'number'}]).toEqual(util.getPropertyValue(50.1));
        expect([{text: '#aaaaaa', red: 170, green: 170, blue: 170, type: 'color'}]).toEqual(
            util.getPropertyValue('#aaaaaa')
        );
        expect([{text: '#aaa', red: 170, green: 170, blue: 170, type: 'color'}]).toEqual(util.getPropertyValue('#aaa'));
        expect([{text: 'rgb(170, 170, 170)', red: 170, green: 170, blue: 170, type: 'color'}]).toEqual(
            util.getPropertyValue('rgb(170, 170, 170)')
        );
        expect([{text: 'rgb(5%, 5%, 5%)', red: 12.75, green: 12.75, blue: 12.75, type: 'color'}]).toEqual(
            util.getPropertyValue('rgb(5%, 5%, 5%)')
        );
        expect([{text: 'rgba(170, 170, 170, 1)', red: 170, green: 170, blue: 170, alpha: 1, type: 'color'}]).toEqual(
            util.getPropertyValue('rgba(170, 170, 170, 1)')
        );
        expect([{text: 'rgba(5%, 5%, 5%, 1)', red: 12.75, green: 12.75, blue: 12.75, alpha: 1, type: 'color'}]).toEqual(
            util.getPropertyValue('rgba(5%, 5%, 5%, 1)')
        );
        expect([{text: 'hsl(170, 20%, 20%)', hue: 170, saturation: 0.2, lightness: 0.2, type: 'color'}]).toEqual(
            util.getPropertyValue('hsl(170, 20%, 20%)')
        );
        expect(
            [{text: 'hsla(170, 20%, 20%, 1)', hue: 170, saturation: 0.2, lightness: 0.2, alpha: 1, type: 'color'}]
        ).toEqual(
            util.getPropertyValue('hsla(170, 20%, 20%, 1)')
        );
        expect([{text: 'url(http://www.baidu.com)', uri: 'http://www.baidu.com', type: 'uri'}]).toEqual(
            util.getPropertyValue('url(http://www.baidu.com)')
        );
        expect([{text: 'aaa(1234)', name: 'aaa', value: 'aaa(1234)', type: 'function'}]).toEqual(
            util.getPropertyValue('aaa(1234)')
        );
        expect([{text: '"aaa"', value: 'aaa', type: 'string'}]).toEqual(
            util.getPropertyValue('"aaa"')
        );
        expect([{text: 'yellow', red: 255, green: 255, blue: 0, type: 'color'}]).toEqual(
            util.getPropertyValue('yellow')
        );
        expect([{text: ',', value: ',', type: 'operator'}]).toEqual(
            util.getPropertyValue(',')
        );
        expect([{text: 'a-a', value: 'a-a', type: 'identifier'}]).toEqual(
            util.getPropertyValue('a-a')
        );
    });
});
