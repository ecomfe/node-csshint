/**
 * @file box-sizing 的检测逻辑
 *       The box-sizing properties isn't supported in IE6 and IE7
 *       https://github.com/CSSLint/csslint/wiki/Disallow-box-sizing
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
var RULENAME = 'box-sizing';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'The box-sizing properties isn\'t supported in IE6 and IE7';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {

            rule.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var prop = decl.prop;
                if (prop === 'box-sizing') {
                    var source = decl.source;
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
                                prop,
                                chalk.magenta(prop)
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        });
    };
});
