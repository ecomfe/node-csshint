/**
 * @file qualified-headings 的检测逻辑
 *       Headings should not be qualified
 *       https://github.com/CSSLint/csslint/wiki/Disallow-qualified-headings
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
var RULENAME = 'qualified-headings';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Headings should not be qualified (namespaced)';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
var PATTERN_COMBINATORS = /[\s>+~]+/g;

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
            var selectorGroup = selector.split(',');
            var source = rule.source;
            var line = source.start.line;
            var col = source.start.column;
            var lineContent = util.getLineContent(line, source.input.css);

            for (var i = 0, len = selectorGroup.length; i < len; i++) {
                var selectorInGroup = selectorGroup[i] || '';
                var segments = selectorInGroup.split(PATTERN_COMBINATORS);

                // 跳过第一个，第一个是 h[1-6] 是合法的
                for (var j = 1, segmentLen = segments.length; j < segmentLen; j++) {
                    var segment = segments[j];
                    if (/h[1-6]/.test(segment)) {
                        if (selectorInGroup.slice(0, 1) === '\n') {
                            line = line + 1;
                            lineContent = util.getLineContent(line, source.input.css);
                        }
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col + lineContent.indexOf(segment),
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(segment, chalk.magenta(segment))
                                + '` '
                                + chalk.grey(msg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    };
});
