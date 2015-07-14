/**
 * @file universal-selector 的检测逻辑
 *       Don't use universal selector because it's slow
 *       https://github.com/CSSLint/csslint/wiki/Disallow-universal-selector
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
var RULENAME = 'universal-selector';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
var PATTERN_COMBINATORS = /[\s>+~]+/g;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Don\'t use universal selector because it\'s slow';

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
            var lineContent = util.getLineContent(line, source.input.css);

            for (var i = 0, len = selectorGroup.length; i < len; i++) {
                var selectorInGroup = selectorGroup[i] || '';
                // 去掉 attr 选择器
                selectorInGroup = selectorInGroup.replace(/\[.+?\](?::[^\s>+~\.#\[]+)?/g, '');

                var segments = selectorInGroup.split(PATTERN_COMBINATORS);
                var l = segments.length;
                if (l) {
                    if (segments[l - 1] === '*') {
                        if (selectorInGroup.slice(0, 1) === '\n') {
                            line = line + 1;
                            lineContent = util.getLineContent(line, source.input.css);
                        }
                        var col = lineContent.indexOf(segments[l - 1]) + 1;
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(segments[l - 1], chalk.magenta(segments[l - 1]))
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
