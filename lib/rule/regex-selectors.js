/**
 * @file regex-selectors 的检测逻辑
 *       Selectors that look like regular expressions are slow and should be avoided
 *       https://github.com/CSSLint/csslint/wiki/Disallow-selectors-that-look-like-regular-expressions
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
var RULENAME = 'regex-selectors';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Selectors that look like regular expressions are slow and should be avoided';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

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
                    var attrs = selectorInGroup.match(/\[.+?\](?::[^\s>+~\.#\[]+)?/g);
                    if (!attrs) {
                        continue;
                    }

                    if (selectorInGroup.slice(0, 1) === '\n') {
                        line = line + 1;
                        lineContent = util.getLineContent(line, source.input.css);
                    }

                    for (var j = 0, attrsLen = attrs.length; j < attrsLen; j++) {
                        var attr = attrs[j];
                        if (/([\~\|\^\$\*]=)/.test(attr)) {
                            var col = lineContent.indexOf(attr) + 1;
                            result.warn(RULENAME, {
                                node: rule,
                                ruleName: RULENAME,
                                line: line,
                                col: col,
                                message: msg,
                                colorMessage: '`'
                                    + lineContent.replace(attr, chalk.magenta(attr))
                                    + '` '
                                    + chalk.grey(msg)
                            });

                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }

                }
            });
        }
    };
});
