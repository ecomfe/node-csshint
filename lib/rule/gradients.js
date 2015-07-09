/**
 * @file gradients 的检测逻辑
 *       When using a vendor-prefixed gradient, make sure to use them all
 *       https://github.com/CSSLint/csslint/wiki/Require-all-gradient-definitions
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
var RULENAME = 'gradients';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Missing vendor-prefixed CSS gradients for ';

var gradients = {};

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {

            gradients = {
                moz: 0,
                webkit: 0,
                oldWebkit: 0,
                o: 0
            };

            rule.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var value = decl.value;
                if (/\-(moz|o|webkit)(?:\-(?:linear|radial))\-gradient/i.test(value)) {
                    gradients[RegExp.$1] = 1;
                }
                else if (/\-webkit\-gradient/i.test(value)) {
                    gradients.oldWebkit = 1;
                }
            });

            var missing = [];

            if (!gradients.moz) {
                missing.push('Firefox 3.6+: -moz-linear-gradient');
            }

            if (!gradients.webkit) {
                missing.push('Webkit (Safari 5+, Chrome): -webkit-linear-gradient');
            }

            if (!gradients.oldWebkit) {
                missing.push('Old Webkit (Safari 4+, Chrome): -webkit-gradient');
            }

            if (!gradients.o) {
                missing.push('Opera 11.1+: -o-linear-gradient');
            }

            if (missing.length && missing.length < 4) {
                var source = rule.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css);
                var col = source.start.column;
                var str = msg + missing.join(', ');
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: str,
                    colorMessage: '`'
                        + lineContent.replace(
                            rule.selector,
                            chalk.magenta(rule.selector)
                        )
                        + '` '
                        + chalk.grey(str)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });
    };
});
