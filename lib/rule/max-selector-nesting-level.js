/**
 * @file max-selector-nesting-level 的检测逻辑
 *       014: [建议] 选择器的嵌套层级应不大于 3 级，位置靠后的限定条件应尽可能精确。
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
var RULENAME = 'max-selector-nesting-level';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
var PATTERN_COMBINATORS = /[\s>+~]+/g;

/**
 * 获取错误信息
 *
 * @param {number} level 层级数量
 *
 * @return {string} 错误信息
 */
function getMsg(level) {
    return ''
        + 'A nested hierarchy selector should be no more than '
        + level
        + ' levels';
}

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        var msg = getMsg(opts.ruleVal);

        css.eachRule(function (rule) {
            var selector = rule.selector;
            var selectorGroup = selector.split(',');

            for (var i = 0, len = selectorGroup.length; i < len; i++) {
                var selectorInGroup = selectorGroup[i] || '';

                // 去掉 attr 选择器
                selectorInGroup = selectorInGroup.replace(/\[.+?\](?::[^\s>+~\.#\[]+)?/g, '');

                // 先去掉 selectorInGroup 的前后空格，如果有空格，那么 segments 的第一个 item 是空，但是会增加 length
                var segments = selectorInGroup.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, '').split(
                    PATTERN_COMBINATORS
                );

                if (segments.length > opts.ruleVal) {
                    var newLineMatch = selectorInGroup.match(/\n/g);
                    var extraLine = 0;
                    if (newLineMatch) {
                        extraLine += newLineMatch.length;
                    }

                    var source = rule.source;
                    var line = source.start.line + extraLine;
                    var lineContent = util.getLineContent(line, source.input.css);

                    // 这里去掉 \n 是为了变色
                    selectorInGroup = selectorInGroup.replace(/\n/g, '');

                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        // col: col,
                        message: msg,
                        colorMessage: '`'
                            + lineContent.replace(selectorInGroup, chalk.magenta(selectorInGroup))
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            }
        });

    };
});
