/**
 * @file zero-unit 的检测逻辑
 *       028: [强制] 长度为 `0` 时须省略单位。 (也只有长度单位可省)
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');

/**
 * css 长度单位集合
 * https://developer.mozilla.org/en-US/docs/Web/CSS/length
 *
 * @type {Array}
 */
var LENGTH_UNITS = [
    // Relative length units
    'em', 'ex', 'ch', 'rem', // Font-relative lengths
    'vh', 'vw', 'vmin', 'vmax', // Viewport-percentage lengths

    // Absolute length units
    'px', 'mm', 'cm', 'in', 'pt', 'pc'
];

/**
 * 数字正则
 *
 * @type {RegExp}
 */
var PATTERN_NUMERIC = /\d+[\.\d]*/;

var msg = 'Values of 0 shouldn\'t have units specified';

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'zero-unit';

/**
 * 行号的缓存，防止同一行多次报错
 *
 * @type {number}
 */
var lineCache = 0;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            lineCache = 0;

            css.eachDecl(function (decl) {
                var parts = postcss.list.space(decl.value);
                for (var i = 0, len = parts.length; i < len; i++) {
                    var part = parts[i];
                    var numericVal = parseFloat(part);
                    if (numericVal === 0) {
                        var unit = part.replace(PATTERN_NUMERIC, '');
                        var source = decl.source;
                        var line = source.start.line;
                        if (LENGTH_UNITS.indexOf(unit) > -1 && lineCache !== line) {
                            lineCache = line;
                            var lineContent = util.getLineContent(line, source.input.css);
                            result.warn(RULENAME, {
                                node: decl,
                                ruleName: RULENAME,
                                line: line,
                                col: source.start.column + decl.prop.length + decl.between.length,
                                message: msg,
                                colorMessage: '`'
                                    + lineContent.replace(
                                        decl.value,
                                        chalk.magenta(decl.value)
                                    )
                                    + '` '
                                    + chalk.grey(msg)
                            });
                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }
                }
            });
        }
    };
});
