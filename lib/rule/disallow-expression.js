/**
 * @file disallow-expression 的检测逻辑
 *       050: [强制] 禁止使用 `Expression`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');

/**
 * 匹配 css 表达式的正则
 *
* @type {RegExp}
 */
var PATTERN_EXP = /expression\(/i;

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'disallow-expression';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Disallow use `Expression`';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var parts = postcss.list.space(decl.value);
                for (var i = 0, len = parts.length; i < len; i++) {
                    var part = parts[i];
                    if (PATTERN_EXP.test(part)) {
                        var source = decl.source;
                        var line = source.start.line;
                        var lineContent = util.getLineContent(line, source.input.css);
                        var col = source.start.column + decl.prop.length + decl.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(/expression/g, chalk.magenta('expression'))
                                + '` '
                                + chalk.grey(msg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                        continue;
                    }
                }

            });
        }
    };
});
