/**
 * @file ids 的检测逻辑
 *       Selectors should not contain IDs
 *       https://github.com/CSSLint/csslint/wiki/Disallow-IDs-in-selectors
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
var RULENAME = 'ids';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Selectors should not contain IDs';

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
                // 去掉 attr 选择器
                selectorInGroup = selectorInGroup.replace(/\[.+?\](?::[^\s>+~\.#\[]+)?/g, '');
                // console.warn(selectorInGroup, selectorInGroup.match(/#[^\s>+~\.#\[]+/));
                var match = selectorInGroup.match(/#[^\s>+~\.#\[]+/);
                if (match) {
                    if (selectorInGroup.slice(0, 1) === '\n') {
                        line = line + 1;
                        lineContent = util.getLineContent(line, source.input.css);
                        col = col + match.index - 1;
                    }
                    else {
                        col = col + match.index;
                    }
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: msg,
                        colorMessage: '`'
                            + lineContent.replace(match[0], chalk.magenta(match[0]))
                            + '` '
                            + chalk.grey(msg)
                    });
                }
            }
        });
    };
});
