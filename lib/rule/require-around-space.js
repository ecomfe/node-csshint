/**
 * @file require-around-space 的检测逻辑
 *       `>`, `+`, `~` 对应 009: [强制] `>`、`+`、`~` 选择器的两边各保留一个空格。
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
var RULENAME = 'require-around-space';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
// var PATTERN_COMBINATORS = /[>+~]+/g;
// var PATTERN_COMBINATORS = /[^\s>+~]+/g;
var PATTERN_COMBINATORS = /[^\s>+~=]+/g; // 排除 ~=, +=, >=
// var PATTERN_COMBINATORS = /[>+~]+/g;
// var PATTERN_COMBINATORS = /(\s+>\s)*(\s+~\s)*(\s+\+\s)*/;

/**
 * 获取错误信息
 *
 * @param {string} combinator 组合的字符
 *
 * @return {string} 错误信息
 */
function getMsg(combinator) {
    return ''
        + 'Around the `'
        + combinator
        + '` selector will keep a space';
}

var arrayProto = Array.prototype;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        var ruleVal = opts.ruleVal;
        var realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            var invalidList = [];
            css.eachRule(function (rule) {
                var selector = rule.selector;

                // 排除掉 .aaa:nth-child(4n+1) 这样的选择器
                selector = selector.replace(/\([\s\S]*?\)/g, '');

                var segments = selector.split(PATTERN_COMBINATORS);
                var len = segments.length;

                for (var i = 0; i < len; i++) {
                    var segment = segments[i];

                    if (!segment) {
                        continue;
                    }

                    var lastChar = segment.slice(-1);
                    var firstChar = segment.slice(0, 1);
                    if (segment) {
                        segment = util.trim(segment);
                        if (realRuleVal.indexOf(segment) <= -1) {
                            continue;
                        }

                        if (i === 0) {
                            if (lastChar !== ' ') {
                                invalidList.push({
                                    invalidChar: segment,
                                    rule: rule
                                });
                                continue;
                            }
                        }
                        else if (i === len - 1) {
                            if (firstChar !== ' ') {
                                invalidList.push({
                                    invalidChar: segment,
                                    rule: rule
                                });
                                continue;
                            }
                        }
                        else {
                            if (lastChar !== ' ' || firstChar !== ' ') {
                                invalidList.push({
                                    invalidChar: segment,
                                    rule: rule
                                });
                                continue;
                            }
                        }
                    }
                }
            });

            invalidList.forEach(function (invalidRule) {
                var invalidChar = invalidRule.invalidChar;
                var msg = getMsg(invalidRule.invalidChar);
                var rule = invalidRule.rule;
                var source = rule.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css);
                var col = lineContent.indexOf(invalidChar);
                result.warn(RULENAME, {
                    node: invalidRule.rule,
                    ruleName: RULENAME,
                    errorChar: invalidChar,
                    line: line,
                    col: col + 1,
                    message: msg,
                    colorMessage: '`'
                        + lineContent.replace(invalidChar, chalk.magenta(invalidChar))
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            });
        }

    };
});
