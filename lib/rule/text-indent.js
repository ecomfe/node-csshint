/**
 * @file text-indent 的检测逻辑
 *       Checks for text indent less than -99px
 *       https://github.com/CSSLint/csslint/wiki/Disallow-negative-text-indent
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
var RULENAME = 'text-indent';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = ''
    + 'Negative text-indent doesn\'t work well with RTL.'
    + 'If you use text-indent for image replacement explicitly set direction for that item to ltr';

var textIndentDecl;
var direction;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {

            textIndentDecl = false;
            direction = 'inherit';

            rule.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var prop = decl.prop;
                var value = util.getPropertyValue(decl.value);

                if (prop === 'text-indent' && value[0].value < -99) {
                    textIndentDecl = decl;
                }
                else if (prop === 'direction' && value.value === 'ltr') {
                    direction = 'ltr';
                }
            });

            if (textIndentDecl && direction !== 'ltr') {
                var source = textIndentDecl.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css);
                var col = source.start.column;
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: msg,
                    colorMessage: '`'
                        + lineContent.replace(
                            textIndentDecl.prop,
                            chalk.magenta(textIndentDecl.prop)
                        )
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }

        });
    };
});
