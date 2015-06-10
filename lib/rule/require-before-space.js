/**
 * @file require-before-space 的检测逻辑
 *       `{` 对应 003: [强制] `选择器` 与 `{` 之间必须包含空格。
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
var RULENAME = 'require-before-space';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Must contain spaces before the `{`';

var arrayProto = Array.prototype;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        var ruleVal = opts.ruleVal;
        var realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {
            css.eachRule(function (rule) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                // 只有 { 时，才能用 between 处理，其他符号的 require-before-space 规则还未实现
                if (rule.between === '' && realRuleVal.indexOf('{') !== -1) {
                    var source = rule.source;
                    var line = source.start.line;
                    var col = source.start.column + rule.selector.length;
                    var lineContent = util.getLineContent(line, source.input.css) || '';
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        errorChar: '{',
                        line: line,
                        col: col,
                        message: msg,
                        colorMessage: '`'
                            + lineContent.replace(
                                '{',
                                chalk.magenta('{')
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        }
    };
});
