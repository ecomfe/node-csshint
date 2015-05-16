/**
 * @file disallow-quotes-in-url 的检测逻辑
 *       026: [强制] `url()` 函数中的路径不加引号。
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
var RULENAME = 'disallow-quotes-in-url';

/**
 * 匹配 css 中 url 的正则
 */
var PATTERN_URL = /\burl\s*\((["']?)([^\)]+)\1\)/g;

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'Path in the `url()` must without the quotes';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            css.eachDecl(function (decl) {

                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var value = decl.value;
                var source = decl.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css);

                var match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_URL.exec(value))) {
                    if (match[1]) {
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: lineContent.indexOf(match[0]) + 1,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(match[0], chalk.magenta(match[0]))
                                + '` '
                                + chalk.grey(msg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                /* eslint-enable no-extra-boolean-cast */
            });
        }
    };
});
