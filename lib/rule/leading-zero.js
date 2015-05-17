/**
 * @file leading-zero 的检测逻辑
 *       025: [强制] 当数值为 0 - 1 之间的小数时，省略整数部分的 `0`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');

var msg = 'When value is between 0 - 1 decimal, omitting the integer part of the `0`';

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'leading-zero';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            css.eachDecl(function (decl) {
                var parts = postcss.list.space(decl.value);
                var source = decl.source;
                var line = source.start.line;
                for (var i = 0, len = parts.length; i < len; i++) {
                    var part = parts[i];
                    var numericVal = parseFloat(part);
                    if (numericVal < 1 && numericVal > 0) {
                        if (part.slice(0, 2) === '0.') {
                            var lineContent = util.getLineContent(line, source.input.css);
                            result.warn(RULENAME, {
                                node: decl,
                                ruleName: RULENAME,
                                line: line,
                                col: lineContent.indexOf(part) + 1,
                                message: msg,
                                colorMessage: '`'
                                    + util.changeColorByIndex(lineContent, lineContent.indexOf(part), part)
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
