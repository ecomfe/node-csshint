/**
 * @file always-semicolon 的检测逻辑
 *       012: [强制] 属性定义后必须以分号结尾。
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
var RULENAME = 'always-semicolon';

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'Attribute definition must end with a semicolon';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (rule.semicolon) {
                return;
            }

            var lastProp = rule.nodes[rule.nodes.length - 1];
            if (lastProp && lastProp.type !== 'comment') {
                var source = lastProp.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css) || '';

                var value = lastProp.important
                    ? lastProp.value + (lastProp._important ? lastProp._important : ' !important')
                    : lastProp.value;

                var colorStr = lastProp.prop + lastProp.between + value;
                var col = source.start.column + colorStr.length;

                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: msg,
                    colorMessage: '`'
                        + lineContent.replace(
                            colorStr,
                            chalk.magenta(colorStr)
                        )
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });

    };
});
