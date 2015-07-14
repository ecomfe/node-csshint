/**
 * @file lib/rule 的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var ruleDir = path.join(__dirname, '../../lib/rule');

var rule = {};
fs.readdirSync(ruleDir).forEach(
    function (file) {
        if (file.match(/.+\.js/g) !== null) {
            var name = file.replace('.js', '');
            rule[name] = require(ruleDir + path.sep + file);
        }
    }
);

global.CSSHINT_INVALID_ALL_COUNT = 0;

var ruleConfig = require('../../lib/config');
ruleConfig['max-error'] = 1000;

describe('always-semicolon', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/always-semicolon.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'always-semicolon';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Attribute definition must end with a semicolon'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(5).toEqual(result.messages.length);
            done();
        });
    });
});

describe('block-indent', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/block-indent1.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'block-indent';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Bad indentation, Expected `        ` but saw `     `'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('disallow-expression', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-expression.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-expression';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Disallow use `Expression`'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('disallow-important', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-important.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-important';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Try not to use the `important` statement'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('disallow-named-color', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-named-color.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-named-color';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Color values using named color value is not allowed'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('disallow-overqualified-elements', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-overqualified-elements.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-overqualified-elements';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Not allowed to add a type selector is limited to ID, class selector'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(10).toEqual(result.messages.length);
            done();
        });
    });
});

describe('disallow-quotes-in-url', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-quotes-in-url.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-quotes-in-url';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Path in the `url()` must without the quotes'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('hex-color', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/hex-color.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'hex-color';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Color value must use the sixteen hexadecimal mark forms such as `#RGB`. Don\'t use RGB、HSL expression'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('horizontal-vertical-position', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/horizontal-vertical-position.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'horizontal-vertical-position';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Must give the horizontal and vertical position'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('leading-zero', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/leading-zero.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'leading-zero';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'When value is between 0 - 1 decimal, omitting the integer part of the `0`'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('max-length', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/max-length.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'max-length';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Each line must not be greater than 120 characters'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('max-selector-nesting-level', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/max-selector-nesting-level.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'max-selector-nesting-level';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'A nested hierarchy selector should be no more than 3 levels'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('min-font-size', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/min-font-size.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'min-font-size';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'font-size should not be less than 12px'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('no-bom', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/no-bom.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'no-bom';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'CSS file should using UTF-8 coding without BOM'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('omit-protocol-in-url', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/omit-protocol-in-url.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'omit-protocol-in-url';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Path in the `url()` should remove protocol'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-after-space', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-after-space.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-after-space';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(''
                + 'Disallow contain spaces between the `attr-name` and `:`, '
                + 'Must contain spaces between `:` and `attr-value`'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(5).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-around-space', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-around-space.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-around-space';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Around the `>` selector will keep a space'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-before-space', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-before-space.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-before-space';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Must contain spaces before the `{`'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-doublequotes', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-doublequotes.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-doublequotes';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Attribute selector value must use double quotes'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-newline', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-newline.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-newline';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'When a rule contains multiple selector, each selector statement must be on a separate line'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(9).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-number', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-number.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-number';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'font-weight must be a number value'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('require-transition-property', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-transition-property.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-transition-property';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'When using the `transition`, `transition-property` should be specified'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('shorthand', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/shorthand.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'shorthand';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(''
                + 'The properties `font-family, font-size, line-height` '
                + 'in the selector `#review-head` can be replaced by font.'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('unifying-color-case-sensitive', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/unifying-color-case-sensitive.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'unifying-color-case-sensitive';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(''
                + 'The color value of the small English character. If no lower case also need to ensure that '
                + 'the same project to keep the same case, Current project case is LowerCase.'
            ).toEqual(result.messages[0].message);
            done();
        });

        global.CSSHINT_HEXCOLOR_CASE_FLAG = 1;
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(''
                + 'The color value of the small English character. If no lower case also need to ensure that '
                + 'the same project to keep the same case, Current project case is UpperCase.'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });

        global.CSSHINT_HEXCOLOR_CASE_FLAG = 1;
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });
    });
});

describe('unifying-font-family-case-sensitive', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/unifying-font-family-case-sensitive.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'unifying-font-family-case-sensitive';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        global.CSSHINT_FONTFAMILY_CASE_FLAG = {};

        postcss([plugin]).process(fileContent).then(function (result) {
            expect(''
                + '`font-family` case insensitive, but in the same project, the same` Family Name` '
                + 'case must be unified. In currently project, `Arial` should be `arial`.'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('vendor-prefixes-sort', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/vendor-prefixes-sort.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'vendor-prefixes-sort';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(''
                + '`       -webkit-box-sizing: border-box;` Property with private prefix should be '
                + 'according to the colon position alignment'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('zero-unit', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/zero-unit.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'zero-unit';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Values of 0 shouldn\'t have units specified'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });
    });
});

describe('property-not-existed', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/property-not-existed.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'property-not-existed';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Current property `-o-border-radius` is not existed'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('adjoining-classes', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/adjoining-classes.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'adjoining-classes';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Don\'t use adjoining classes'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('box-model', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/box-model.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'box-model';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Using height with `border-top` can sometimes make elements larger than you expect'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('display-property-grouping', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/display-property-grouping.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'display-property-grouping';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                '`height` can\'t be used with display: `inline`'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('duplicate-properties', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/duplicate-properties.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'duplicate-properties';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Duplicate properties must appear one after the other'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('empty-rules', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/empty-rules.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'empty-rules';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Rules without any properties specified should be removed'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });
    });
});

describe('box-sizing', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/box-sizing.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'box-sizing';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'The box-sizing properties isn\'t supported in IE6 and IE7'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('gradients', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/gradients.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'gradients';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Missing vendor-prefixed CSS gradients for '
                    + 'Firefox 3.6+: -moz-linear-gradient, Opera 11.1+: -o-linear-gradient'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('text-indent', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/text-indent.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'text-indent';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Negative text-indent doesn\'t work well with RTL.'
                    + 'If you use text-indent for image replacement explicitly set direction for that item to ltr'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('fallback-colors', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/fallback-colors.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'fallback-colors';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Fallback color (hex or RGB) should precede RGBA colorFor older browsers '
                + 'that don\'t support RGBA, HSL, or HSLA, provide a fallback color'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('star-property-hack', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/star-property-hack.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'star-property-hack';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect('Disallow properties with a star prefix').toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('underscore-property-hack', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/underscore-property-hack.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'underscore-property-hack';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect('Disallow properties with a underscore prefix').toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('bulletproof-font-face', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/bulletproof-font-face.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'bulletproof-font-face';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                '`    src: url(\'harlowsi-webfont.eot?\') format(\'eot\'),` @font-face declaration doesn\'t '
                    + 'follow the fontspring bulletproof syntax'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('font-face', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/font-face.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'font-face';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                '@font-face declarations must not be greater than 5, current file @font-face declarations is 6'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('import', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/import.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'import';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Don\'t use @import, use <link> instead'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('regex-selectors', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/regex-selectors.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'regex-selectors';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Selectors that look like regular expressions are slow and should be avoided'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(8).toEqual(result.messages.length);
            done();
        });
    });
});

describe('universal-selector', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/universal-selector.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'universal-selector';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Don\'t use universal selector because it\'s slow'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(5).toEqual(result.messages.length);
            done();
        });
    });
});

describe('unqualified-attributes', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/unqualified-attributes.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'unqualified-attributes';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Unqualified attribute selectors are known to be slow'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('duplicate-background-images', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/duplicate-background-images.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'duplicate-background-images';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Background image `sprite.png` was used multiple times, first declared at line 3, col 5. '
                + 'Every background-image should be unique. Use a common class for e.g. sprites'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('floats', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/floats.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'floats';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                '`float` must not be greater than 10, current file `float` is 12'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('font-sizes', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/font-sizes.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'font-sizes';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                '`font-size` must not be greater than 10, current file `font-size` is 12'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(1).toEqual(result.messages.length);
            done();
        });
    });
});

describe('ids', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/ids.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'ids';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Selectors should not contain IDs'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(4).toEqual(result.messages.length);
            done();
        });
    });
});

describe('outline-none', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/outline-none.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'outline-none';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Outlines should only be modified using :focus'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(3).toEqual(result.messages.length);
            done();
        });
    });
});

describe('qualified-headings', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/qualified-headings.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'qualified-headings';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Headings should not be qualified (namespaced)'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});

describe('unique-headings', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/unique-headings.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'unique-headings';

    var plugin = rule[ruleName]({
        ruleVal: ruleConfig[ruleName],
        fileContent: fileContent,
        maxError: ruleConfig['max-error'] || 100
    });

    it('should return right message', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(
                'Headings should be defined only once'
            ).toEqual(result.messages[0].message);
            done();
        });
    });

    it('should return right message length', function (done) {
        postcss([plugin]).process(fileContent).then(function (result) {
            expect(2).toEqual(result.messages.length);
            done();
        });
    });
});
