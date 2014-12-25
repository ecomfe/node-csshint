/**
 * @file lib/rule 的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var parserlib = require('parserlib');

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

var ruleConfig = require('../../lib/config');

var parser = new parserlib.css.Parser({
    starHack: true,         // 允许 * hack
    ieFilters: true,        // ie < 8 允许 filter properties
    underscoreHack: true,   // 允许 _ hack
    strict: false           // 为 true 时则 parserlib 的 error recovery 不可用
                            // 并且首次出现语法错误时就终止
});

describe('adjoining-classes', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/adjoining-classes.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'adjoining-classes';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`.foo.bar {` Don\'t use adjoining classes',
            invalidList[0].message
        );
    });
});

describe('always-semicolon', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/always-semicolon.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'always-semicolon';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    margin: 0` Attribute definition must end with a semicolon',
            invalidList[0].message
        );
    });
});

describe('block-indent', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/block-indent.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'block-indent';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`\theight: 10;` Use `4` spaces as an indent level. Use `2` spaces or `tab` character is not allowed',
            invalidList[0].message
        );
    });
});

describe('box-model', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/box-model.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'box-model';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            'Using height with `border` can sometimes make elements larger than you expect',
            invalidList[0].message
        );
    });
});

describe('box-sizing', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/box-sizing.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'box-sizing';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`            box-sizing: border-box;` box-sizing doesn\'t work in IE6 and IE7',
            invalidList[0].message
        );
    });
});

describe('bulletproof-font-face', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/bulletproof-font-face.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'bulletproof-font-face';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    src: url(\'harlowsi-webfont.eot?\') format(\'eot\'),` @font-face declaration doesn\'t '
                + 'follow the fontspring bulletproof syntax',
            invalidList[0].message
        );
    });
});

describe('disallow-expression', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-expression.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-expression';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    width: expression(onmouseover=this.style.backgroundColor="#F5F5F5";` Disallow use `Expression`',
            invalidList[0].message
        );
    });
});

describe('disallow-important', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-important.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-important';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    color:red !important;height: 100px !important;` Try not to use the `important` statement',
            invalidList[0].message
        );
    });
});

describe('disallow-named-color', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-named-color.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-named-color';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    color: red;` Color values using named color value is not allowed',
            invalidList[0].message
        );
    });
});

describe('disallow-overqualified-elements', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-overqualified-elements.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-overqualified-elements';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`p.bb .testp {` Not allowed to add a type selector is limited to ID, class selector',
            invalidList[0].message
        );
    });
});

describe('disallow-quotes-in-url', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/disallow-quotes-in-url.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'disallow-quotes-in-url';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    background:#fff url("http://cwsir.sinaapp.com/banner.jpg") no-repeat center 0;` '
                + 'Path in the `url()` must without the quotes',
            invalidList[0].message
        );
    });
});

describe('hex-color', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/hex-color.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'hex-color';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    color: rgb(255, 255, 255);` Color value must use the sixteen hexadecimal mark forms such as `#RGB`. '
                + 'Don\'t use RGB、HSL expression',
            invalidList[0].message
        );
    });
});

describe('horizontal-vertical-position', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/horizontal-vertical-position.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'horizontal-vertical-position';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    background-position: bottom; /* 50% 0% */` Must give the horizontal and vertical position',
            invalidList[0].message
        );
    });
});

describe('leading-zero', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/leading-zero.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'leading-zero';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    width: 0.5px;` When value is between 0 - 1 decimal, omitting the integer part of the `0`',
            invalidList[0].message
        );
    });
});

describe('max-length', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/max-length.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'max-length';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            'Each line must not be greater than 120 characters',
            invalidList[0].message
        );
    });
});

describe('max-selector-nesting-level', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/max-selector-nesting-level.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'max-selector-nesting-level';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`body > div > span > a,` A nested hierarchy selector should be no more than 3 levels',
            invalidList[0].message
        );
    });
});

describe('min-font-size', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/min-font-size.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'min-font-size';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    font-size: 11px;` font-size should not be less than 12px',
            invalidList[0].message
        );
    });
});

describe('no-bom', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/no-bom.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'no-bom';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            'CSS file should using UTF-8 coding without BOM',
            invalidList[0].message
        );
    });
});

describe('omit-protocol-in-url', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/omit-protocol-in-url.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'omit-protocol-in-url';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    background:#fff url("http://cwsir.sinaapp.com/banner.jpg") no-repeat center 0;` '
                + 'Path in the `url()` should remove protocol',
            invalidList[0].message
        );
    });
});

describe('require-after-space', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-after-space.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-after-space';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    font-family: Arial,sans-serif,cas;` Must contain spaces after `,` in `attr-value`',
            invalidList[0].message
        );
    });
});

describe('require-around-space', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-around-space.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-around-space';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`div~span>p {` Around the `~` selector will keep a space',
            invalidList[0].message
        );
    });
});

describe('require-before-space', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-before-space.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-before-space';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`.hetu_top_nav_body{` Must contain spaces before the `{`',
            invalidList[0].message
        );
    });
});

describe('require-doublequotes', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-doublequotes.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-doublequotes';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`html[lang|=zh] q:before {` Attribute selector value must use double quotes',
            invalidList[0].message
        );
    });
});

describe('require-newline', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-newline.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-newline';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`@media handheld and (min-width:360px), screen and (min-width:480px) {` `Media Query` if there is '
                + 'more than one comma separated condition, should put each on a separate line condition',
            invalidList[0].message
        );
    });
});

describe('require-number', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-number.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-number';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    font-weight: bold;` font-weight must be a number value',
            invalidList[0].message
        );
    });
});

describe('require-transition-property', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/require-transition-property.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'require-transition-property';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    transition: all 1s;` When using the `transition`, `transition-property` should be specified',
            invalidList[0].message
        );
    });
});

describe('shorthand', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/shorthand.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'shorthand';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            'The properties `font-family, font-size, line-height` in the selector '
                + '`#review-head` can be replaced by font.',
            invalidList[0].message
        );
    });
});

describe('unifying-color-case-sensitive', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/unifying-color-case-sensitive.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'unifying-color-case-sensitive';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    color: #fff;` The color value of the small English character. If no lower case also '
                + 'need to ensure that the same project to keep the same case, Current project case is Upper Case',
            invalidList[0].message
        );
    });
});

describe('vendor-prefixes-sort', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/vendor-prefixes-sort.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'vendor-prefixes-sort';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            'Current property `-ms-animation` is not existed',
            invalidList[0].message
        );
    });
});

describe('zero-unit', function () {
    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/zero-unit.css'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    var ruleName = 'zero-unit';
    var invalidList = [];

    it('should return right message', function () {
        invalidList = rule[ruleName](parser, fileContent, ruleName, ruleConfig[ruleName], invalidList);
        parser.parse(fileContent);
        assert.strictEqual(
            '`    width: 0px ;` Values of 0 shouldn\'t have units specified',
            invalidList[0].message
        );
    });
});
