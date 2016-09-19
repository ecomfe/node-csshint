/**
 * @file lib/checker.js 的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chai from 'chai';
import path from 'path';
import {readFileSync} from 'fs';

'use strict';

let checker = require(path.join(__dirname, '../../lib', 'checker'));

const expect = chai.expect;

/* globals describe, it */
/* eslint-disable max-nested-callbacks */
describe('checker test suite\n', function () {
    this.timeout(50000);
    describe('checkString', () => {
        it('should return right length with maxError', () => {
            const filePath = 'path/to/file.css';
            const fileContent = '/* csshint max-error: 0 */\np {\nheight: 0px\n}\n';

            return checker.checkString(fileContent, filePath).then(invalidList => {
                if (invalidList && invalidList[0]) {
                    expect(invalidList[0].messages.length).to.equal(3);
                }
            });
        });

        it('should return right result for inline-disable', () => {
            const filePath = 'path/to/file.css';
            const fileContent = '/* csshint-disable: zero-unit */\np {\nheight: 0px;\n}\n';

            return checker.checkString(fileContent, filePath).then(invalidList => {
                expect(invalidList.length).to.equal(1);
                expect(invalidList[0].messages[0].ruleName).to.not.equal('zero-unit');
            });
        });

        it('should return right result for inline-disable all rules', () => {
            const filePath = 'path/to/file.css';
            const fileContent = '/* csshint-disable */\np {\nheight: 0px;\n}\n';

            return checker.checkString(fileContent, filePath).then(invalidList => {
                expect(invalidList.length).to.equal(0);
            });
        });

        it('should return right length', () => {
            const filePath = 'path/to/file.css';
            const fileContent = '\np {\nheight: 0px\n}\n';

            checker.checkString(fileContent, filePath).then(invalidList => {
                expect(3).to.equal(invalidList[0].messages.length);
            });
        });

        it('should return right errorChar', () => {
            const filePath = path.join(__dirname, '../fixture/error-char.css');
            const fileContent = readFileSync(filePath, 'utf8').replace(/\r\n?/g, '\n');

            checker.checkString(fileContent, filePath).then(invalidList => {
                const messages = invalidList[0].messages;
                expect(messages[0].errorChar).to.equal(':');
            });
        });

        it('should catch error with line', () => {
            const filePath = 'path/to/file.css';
            const fileContent = '\np {\nheight: 0px\n\n';

            return checker.checkString(fileContent, filePath).then(() => {
            }, invalidList => {
                const messages = invalidList[0].messages;
                expect(messages[0].line).to.equal(2);
            });
        });
    });

    describe('check', () => {
        it('should return right length', () => {
            const filePath = path.join(__dirname, '../fixture/test.css');
            const fileContent = readFileSync(
                path.join(__dirname, '../fixture/test.css'),
                'utf8'
            ).replace(/\r\n?/g, '\n');

            const f = {
                path: filePath,
                content: fileContent
            };

            const errors = [];

            return checker.check(f, errors,
                () => {
                    expect(errors[0].messages.length).to.equal(1);
                }
            );
        });

        it('should be ignore', () => {
            const filePath = path.join(__dirname, '../fixture/csshintignore.css');
            const fileContent = readFileSync(
                filePath,
                'utf8'
            ).replace(/\r\n?/g, '\n');

            const f = {
                path: filePath,
                content: fileContent
            };

            const errors = [];

            return checker.check(f, errors,
                () => {
                    expect(errors.length).to.equal(0);
                }
            );
        });
    });
});
/* eslint-enable max-nested-callbacks */
