/**
 * @file import 的检测逻辑
 *       Don't use @import, use <link> instead
 *       https://github.com/CSSLint/csslint/wiki/Disallow-@import
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
var RULENAME = 'import';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Don\'t use @import, use <link> instead';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal) {
            return;
        }

        // fontFaceCount = 0;

        css.eachAtRule(function (atRule) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (atRule.name === 'import') {
                var source = atRule.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css);
                var col = source.start.column;
                result.warn(RULENAME, {
                    node: atRule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: msg,
                    colorMessage: '`'
                        + lineContent.replace(/@import/g, chalk.magenta('@import'))
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });
    };
});
