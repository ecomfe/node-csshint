/**
 * @file empty-rules 的检测逻辑
 *       Rules without any properties specified should be removed
 *       https://github.com/CSSLint/csslint/wiki/Disallow-empty-rules
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
var RULENAME = 'empty-rules';

var propertyCount = 0;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Rules without any properties specified should be removed';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {
            propertyCount = 0;

            rule.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }
                propertyCount++;
            });

            if (propertyCount === 0) {
                var source = rule.source;
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
                            rule.selector,
                            chalk.magenta(rule.selector)
                        )
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });
    };
});
