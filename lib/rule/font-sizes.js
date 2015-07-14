/**
 * @file font-sizes 的检测逻辑
 *       Too many font-size declarations, abstraction needed
 *       https://github.com/CSSLint/csslint/wiki/Don't-use-too-many-font-size-declarations
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'font-sizes';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = '`font-size` must not be greater than ';

var fontSizeCount = 0;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        // isNaN(null) === false
        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        fontSizeCount = 0;

        css.eachDecl(function (decl) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            var prop = decl.prop;
            if (prop === 'font-size') {
                fontSizeCount++;
            }
        });

        if (fontSizeCount > opts.ruleVal) {
            var str = msg + opts.ruleVal + ', current file `font-size` is ' + fontSizeCount;
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
