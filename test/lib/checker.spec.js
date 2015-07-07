/**
 * @file lib/checker.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');

var checker = require('../../lib/checker');

describe('checkString', function () {
    it('should return right length with maxError', function (done) {
        var filePath = 'path/to/file.css';
        var fileContent = '/* csshint max-error: 0 */\np {\nheight: 0px\n}\n';

        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            if (invalidList && invalidList[0]) {
                var messages = invalidList[0].messages;
                expect(3).toEqual(messages.length);
            }
            done();
        });
    });

    it('should return right result for inline-disable', function (done) {
        var filePath = 'path/to/file.css';
        var fileContent = '/* csshint-disable: zero-unit */\np {\nheight: 0px;\n}\n';

        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            expect(0).toEqual(invalidList.length);
            done();
        });
    });

    it('should return right result for inline-disable all rules', function (done) {
        var filePath = 'path/to/file.css';
        var fileContent = '/* csshint-disable */\np {\nheight: 0px;\n}\n';

        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            expect(0).toEqual(invalidList.length);
            done();
        });
    });

    it('should return right length', function (done) {
        // var filePath = path.join(__dirname, '../fixture/test.css');
        // var fileContent = fs.readFileSync(
        //     filePath,
        //     'utf8'
        // ).replace(/\r\n?/g, '\n');

        var filePath = 'path/to/file.css';
        var fileContent = '\np {\nheight: 0px\n}\n';
        // var fileContent = '\nbody{}';

        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            expect(2).toEqual(invalidList[0].messages.length);
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

    it('should catch error with line', function (done) {
        var filePath = 'path/to/file.css';
        var fileContent = '\np {\nheight: 0px\n\n';

        var p = checker.checkString(fileContent, filePath);
        p.then(function () {

        }, function (invalidList) {
            var messages = invalidList[0].messages;
            expect(2).toEqual(messages[0].line);
            done();
        });
    });
});

describe('check', function () {
    it('should return right length', function (done) {
        var filePath = path.join(__dirname, '../fixture/test.css');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/test.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        // var filePath = 'path/to/file.css';
        // var fileContent = '\nbody{}';

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];

        checker.check(
            f,
            errors,
            function () {
                expect(1).toEqual(errors[0].messages.length);
                done();
            }
        );
    });

    it('should be ignore', function (done) {
        var filePath = path.join(__dirname, '../fixture/csshintignore.css');
        var fileContent = fs.readFileSync(
            filePath,
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];

        checker.check(
            f,
            errors,
            function () {
                expect(0).toEqual(errors.length);
                done();
            }
        );
    });
});
