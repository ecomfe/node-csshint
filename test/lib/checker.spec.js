/**
 * @file lib/checker.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');

var checker = require('../../lib/checker');


describe('checkString', function () {
    it('should return right length', function (done) {
        var filePath = path.join(__dirname, '../fixture/test.css');
        var fileContent = fs.readFileSync(
            filePath,
            'utf8'
        ).replace(/\r\n?/g, '\n');
        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            expect(1).toEqual(invalidList[0].messages.length);
            done();
        });
    });

    it('should return right errorChar', function (done) {
        var filePath = path.join(__dirname, '../fixture/error-char.css');
        var fileContent = fs.readFileSync(
            filePath,
            'utf8'
        ).replace(/\r\n?/g, '\n');
        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            var messages = invalidList[0].messages;
            expect(':').toEqual(messages[0].errorChar);
            done();
        });
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

    it('should return right length', function (done) {
        checker.check(
            f,
            errors,
            function () {
                expect(1).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});
