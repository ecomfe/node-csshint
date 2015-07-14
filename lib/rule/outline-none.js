/**
 * @file outline-none 的检测逻辑
 *       Use of outline: none or outline: 0 should be limited to :focus rules
 *       https://github.com/CSSLint/csslint/wiki/Disallow-outline:none
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
var RULENAME = 'outline-none';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg1 = 'Outlines should only be modified using :focus';
var msg2 = 'Outlines shouldn\'t be hidden unless other visual changes are made';

var lastRule;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            var selector = rule.selector;
            if (selector) {
                lastRule = {
                    rule: rule,
                    selector: selector,
                    propCount: 0,
                    outline: false
                };
            }
            else {
                lastRule = null;
            }

            rule.eachDecl(function (decl) {
                var prop = decl.prop;
                var value = decl.value;
                if (lastRule) {
                    lastRule.propCount++;
                    if (prop === 'outline' && (value === 'none' || value.toString() === '0')) {
                        lastRule.outline = true;
                    }
                }
            });

            if (lastRule) {
                if (lastRule.outline) {
                    var source = lastRule.rule.source;
                    var line = source.start.line;
                    var col = source.start.column;
                    var lineContent = util.getLineContent(line, source.input.css);
                    if (lastRule.selector.toLowerCase().indexOf(':focus') === -1) {
                        result.warn(RULENAME, {
                            node: lastRule.rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg1,
                            colorMessage: '`'
                                + lineContent.replace(selector, chalk.magenta(selector))
                                + '` '
                                + chalk.grey(msg1)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                    else if (lastRule.propCount === 1) {
                        result.warn(RULENAME, {
                            node: lastRule.rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg2,
                            colorMessage: '`'
                                + lineContent.replace(selector, chalk.magenta(selector))
                                + '` '
                                + chalk.grey(msg2)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    };
});
