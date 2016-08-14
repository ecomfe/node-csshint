/**
 * @file font-face 的检测逻辑
 *       Too many different web fonts in the same stylesheet
 *       https://github.com/CSSLint/csslint/wiki/Don't-use-too-many-web-fonts
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'font-face';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = '@font-face declarations must not be greater than ';

var fontFaceCount = 0;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        // isNaN(null) === false
        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        fontFaceCount = 0;

        css.walkAtRules(function (atRule) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (atRule.name === 'font-face') {
                fontFaceCount++;
            }
        });

        if (fontFaceCount > opts.ruleVal) {
            var str = msg + opts.ruleVal + ', current file @font-face declarations is ' + fontFaceCount;
            result.warn(RULENAME, {
                node: css,
                ruleName: RULENAME,
                message: str,
                colorMessage: chalk.grey(str)
            });

            global.CSSHINT_INVALID_ALL_COUNT++;
        }
    };
});
