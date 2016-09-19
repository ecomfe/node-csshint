/**
 * @file lib/rule 的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chai from 'chai';
import path from 'path';
import postcss from 'postcss';
import {readdirSync, readFileSync} from 'fs';

'use strict';

const checker = require(path.join(__dirname, '../../lib', 'checker'));
const config = require(path.join(__dirname, '../../lib', 'config'));

const ruleConfig = Object.assign({}, config.loadConfig('.', true));
ruleConfig['max-error'] = 1000;

const ruleDir = path.join(__dirname, '../../lib/rule');

const rule = {};
readdirSync(ruleDir).forEach(file => {
    if (file.match(/.+\.js/g) !== null) {
        const name = file.replace('.js', '');
        rule[name] = require(ruleDir + path.sep + file);
    }
});

global.CSSHINT_INVALID_ALL_COUNT = 0;


const expect = chai.expect;

/* globals describe, it */

/* eslint-disable fecs-max-statements, max-nested-callbacks */
describe('rule test suite\n', () => {
    /* jshint maxstatements: 52 */
    describe('always-semicolon', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/always-semicolon.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'always-semicolon';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Attribute definition must end with a semicolon');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(5).to.equal(result.messages.length);
            })
        );
    });

    describe('block-indent', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/block-indent1.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'block-indent';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Bad indentation, Expected `8` but saw `5`');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );

        it('test: space after right brace', () => {
            const fileContent1 = readFileSync(
                path.join(__dirname, '../fixture/block-indent7.css'),
                'utf8'
            ).replace(/\r\n?/g, '\n');

            return postcss([plugin]).process(fileContent1).then(result => {
                expect(result.messages.length).to.equal(0);
            });
        });

        it('test: inline-comments set block-indent', () => {
            const fileContent1 = readFileSync(
                path.join(__dirname, '../fixture/block-indent8.css'),
                'utf8'
            ).replace(/\r\n?/g, '\n');

            const thenFunc = invalidList => {
                expect(2).to.equal(invalidList[0].messages.length);
            };

            return checker.checkString(
                fileContent1, path.join(__dirname, '../fixture/block-indent8.css'), ruleConfig
            ).then(thenFunc, thenFunc);
        });
    });

    describe('disallow-expression', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/disallow-expression.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'disallow-expression';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Disallow use `Expression`');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('disallow-important', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/disallow-important.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'disallow-important';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Try not to use the `important` statement');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('disallow-named-color', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/disallow-named-color.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'disallow-named-color';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Color values using named color value is not allowed');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('disallow-overqualified-elements', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/disallow-overqualified-elements.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'disallow-overqualified-elements';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Not allowed to add a type selector is limited to ID, class selector');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(10);
            })
        );

        it('test: percent or float', () => {
            const fileContent1 = readFileSync(
                path.join(__dirname, '../fixture/disallow-overqualified-elements1.css'),
                'utf8'
            ).replace(/\r\n?/g, '\n');

            return postcss([plugin]).process(fileContent1).then(result => {
                expect(result.messages.length).to.equal(0);
            });
        });
    });

    describe('disallow-quotes-in-url', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/disallow-quotes-in-url.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'disallow-quotes-in-url';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Path in the `url()` must without the quotes');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('hex-color', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/hex-color.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'hex-color';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'Color value must use the sixteen hexadecimal mark forms such as `#RGB`.'
                    + ' Don\'t use RGB、HSL expression'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('horizontal-vertical-position', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/horizontal-vertical-position.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'horizontal-vertical-position';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Must give the horizontal and vertical position');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('leading-zero', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/leading-zero.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'leading-zero';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('When value is between 0 - 1 decimal, omitting the integer part of the `0`');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('max-length', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/max-length.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'max-length';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Each line must not be greater than 120 characters');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('max-selector-nesting-level', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/max-selector-nesting-level.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'max-selector-nesting-level';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('A nested hierarchy selector should be no more than 3 levels');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('min-font-size', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/min-font-size.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'min-font-size';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('font-size should not be less than 12px');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('no-bom', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/no-bom.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'no-bom';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('CSS file should using UTF-8 coding without BOM');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('omit-protocol-in-url', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/omit-protocol-in-url.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'omit-protocol-in-url';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Path in the `url()` should remove protocol');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            })
        );
    });

    describe('require-after-space', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-after-space.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-after-space';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'Disallow contain spaces between the `attr-name` and `:`, '
                    + 'Must contain spaces between `:` and `attr-value`'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(5);
            })
        );
    });

    describe('require-around-space', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-around-space.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-around-space';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Around the `>` selector will keep a space');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('require-before-space', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-before-space.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-before-space';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Must contain spaces before the `{`');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('require-doublequotes', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-doublequotes.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-doublequotes';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Attribute selector value must use double quotes');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            })
        );
    });

    describe('require-newline', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-newline.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-newline';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'When a rule contains multiple selector, each selector statement must be on a separate line'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(9);
            })
        );
    });

    describe('require-number', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-number.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-number';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('font-weight must be a number value');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('require-transition-property', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/require-transition-property.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'require-transition-property';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('When using the `transition`, `transition-property` should be specified');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('shorthand', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/shorthand.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'shorthand';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'The properties `font-family, font-size, line-height` '
                    + 'in the selector `#review-head` can be replaced by font.'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('unifying-color-case-sensitive', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/unifying-color-case-sensitive.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'unifying-color-case-sensitive';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message LowerCase', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'The color value of the small English character. If no lower case also need to ensure that '
                    + 'the same project to keep the same case, Current project case is LowerCase.'
                );
            })
        );

        it('should return right message UpperCase', () => {
            global.CSSHINT_HEXCOLOR_CASE_FLAG = 1;
            return postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'The color value of the small English character. If no lower case also need to ensure that '
                    + 'the same project to keep the same case, Current project case is UpperCase.'
                );
            });
        });

        it('should return right message length LowerCase', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            })
        );

        it('should return right message length UpperCase', () => {
            global.CSSHINT_HEXCOLOR_CASE_FLAG = 1;
            return postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            });
        });
    });

    describe('unifying-font-family-case-sensitive', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/unifying-font-family-case-sensitive.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'unifying-font-family-case-sensitive';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () => {
            global.CSSHINT_FONTFAMILY_CASE_FLAG = {};

            return postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + '`font-family` case insensitive, but in the same project, the same` Family Name` '
                    + 'case must be unified. In currently project, `Arial` should be `arial`.'
                );
            });
        });

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('vendor-prefixes-sort', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/vendor-prefixes-sort.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'vendor-prefixes-sort';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + '`       -webkit-box-sizing: border-box;` Property with private prefix should be '
                    + 'according to the colon position alignment'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('zero-unit', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/zero-unit.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'zero-unit';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Values of 0 shouldn\'t have units specified');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            })
        );
    });

    describe('property-not-existed', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/property-not-existed.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'property-not-existed';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Current property `-o-border-radius` is not existed');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('adjoining-classes', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/adjoining-classes.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'adjoining-classes';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Don\'t use adjoining classes');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('box-model', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/box-model.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'box-model';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Using height with `border-top` can sometimes make elements larger than you expect');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('display-property-grouping', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/display-property-grouping.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'display-property-grouping';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('`height` can\'t be used with display: `inline`');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('duplicate-properties', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/duplicate-properties.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'duplicate-properties';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Duplicate properties must appear one after the other');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('empty-rules', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/empty-rules.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'empty-rules';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Rules without any properties specified should be removed');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            })
        );
    });

    describe('box-sizing', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/box-sizing.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'box-sizing';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('The box-sizing properties isn\'t supported in IE6 and IE7');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('gradients', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/gradients.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'gradients';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'Missing vendor-prefixed CSS gradients for '
                    + 'Firefox 3.6+: -moz-linear-gradient, Opera 11.1+: -o-linear-gradient'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('text-indent', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/text-indent.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'text-indent';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'Negative text-indent doesn\'t work well with RTL.'
                    + 'If you use text-indent for image replacement explicitly set direction for that item to ltr'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('fallback-colors', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/fallback-colors.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'fallback-colors';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'Fallback color (hex or RGB) should precede RGBA colorFor older browsers '
                    + 'that don\'t support RGBA, HSL, or HSLA, provide a fallback color'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('star-property-hack', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/star-property-hack.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'star-property-hack';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Disallow properties with a star prefix');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('underscore-property-hack', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/underscore-property-hack.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'underscore-property-hack';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Disallow properties with a underscore prefix');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('bulletproof-font-face', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/bulletproof-font-face.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'bulletproof-font-face';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + '`    src: url(\'harlowsi-webfont.eot?\') format(\'eot\'),` @font-face declaration doesn\'t '
                    + 'follow the fontspring bulletproof syntax'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('font-face', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/font-face.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'font-face';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + '@font-face declarations must not be greater than 5, current file @font-face declarations is 6'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('import', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/import.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'import';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Don\'t use @import, use <link> instead');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('regex-selectors', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/regex-selectors.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'regex-selectors';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Selectors that look like regular expressions are slow and should be avoided');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(8);
            })
        );
    });

    describe('universal-selector', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/universal-selector.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'universal-selector';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Don\'t use universal selector because it\'s slow');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(5);
            })
        );
    });

    describe('unqualified-attributes', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/unqualified-attributes.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'unqualified-attributes';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Unqualified attribute selectors are known to be slow');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('duplicate-background-images', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/duplicate-background-images.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'duplicate-background-images';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal(''
                    + 'Background image `sprite.png` was used multiple times, first declared at line 3, col 5. '
                    + 'Every background-image should be unique. Use a common class for e.g. sprites'
                );
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('floats', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/floats.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'floats';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('`float` must not be greater than 10, current file `float` is 12');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('font-sizes', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/font-sizes.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'font-sizes';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('`font-size` must not be greater than 10, current file `font-size` is 12');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(1);
            })
        );
    });

    describe('ids', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/ids.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'ids';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Selectors should not contain IDs');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(4);
            })
        );
    });

    describe('outline-none', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/outline-none.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'outline-none';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Outlines should only be modified using :focus');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(3);
            })
        );
    });

    describe('qualified-headings', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/qualified-headings.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'qualified-headings';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Headings should not be qualified (namespaced)');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });

    describe('unique-headings', () => {
        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/unique-headings.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        const ruleName = 'unique-headings';

        const plugin = rule[ruleName].check({
            ruleVal: ruleConfig[ruleName],
            fileContent: fileContent,
            maxError: ruleConfig['max-error'] || 100
        });

        it('should return right message', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(
                    result.messages[0].message
                ).to.equal('Headings should be defined only once');
            })
        );

        it('should return right message length', () =>
            postcss([plugin]).process(fileContent).then(result => {
                expect(result.messages.length).to.equal(2);
            })
        );
    });
});
/* eslint-enable fecs-max-statements, max-nested-callbacks */
