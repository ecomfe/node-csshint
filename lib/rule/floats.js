/**
 * @file floats 的检测逻辑
 *       Too many floats, you're probably using them for layout. Consider using a grid system instead
 *       https://github.com/CSSLint/csslint/wiki/Disallow-too-many-floats
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'floats';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = '`float` must not be greater than ';

var floatCount = 0;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        // isNaN(null) === false
        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        floatCount = 0;

        css.eachDecl(function (decl) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            var prop = decl.prop;
            var value = decl.value;
            if (prop === 'float' && value !== 'none') {
                floatCount++;
            }
        });

        if (floatCount > opts.ruleVal) {
            var str = msg + opts.ruleVal + ', current file `float` is ' + floatCount;
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
