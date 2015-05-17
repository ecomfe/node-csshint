/**
 * @file hex-color 的检测逻辑
 *       029: [强制] RGB颜色值必须使用十六进制记号形式 `#rrggbb`。不允许使用 `rgb()`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'hex-color';

/**
 * 匹配 rgb, hsl 颜色表达式的正则
 *
 * @type {RegExp}
 */
var PATTERN_COLOR_EXP = /(\brgb\b|\bhsl\b)/gi;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = ''
    + 'Color value must use the sixteen hexadecimal mark forms such as `#RGB`.'
    + ' Don\'t use RGB、HSL expression';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_COLOR_EXP.exec(decl.value))) {
                    var source = decl.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);
                    // console.warn(source);
                    var col = source.start.column + decl.prop.length + decl.between.length + match.index;
                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: msg,
                        colorMessage: '`'
                            + util.changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
                /* eslint-enable no-extra-boolean-cast */
            });
        }
    };
});
