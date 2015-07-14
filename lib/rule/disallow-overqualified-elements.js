/**
 * @file disallow-overqualified-elements 的检测逻辑
 *       013: [强制] 如无必要，不得为 `id`、`class` 选择器添加类型选择器进行限定。
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
var RULENAME = 'disallow-overqualified-elements';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
var PATTERN_COMBINATORS = /[\s>+~,[]+/;

/**
 * css selector 开始字符的正则匹配
 *
 * @type {RegExp}
 */
var PATTERN_STARTCHARS = /[\.#\[]+/;

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'Not allowed to add a type selector is limited to ID, class selector';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            css.eachRule(function (rule) {

                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var source = rule.source;
                var line = source.start.line;

                var lineContent = util.getLineContent(line, source.input.css) || '';

                var segments = rule.selector.split(PATTERN_COMBINATORS);
                for (var i = 0, len = segments.length; i < len; i++) {
                    var items = segments[i].split(PATTERN_STARTCHARS);
                    if (items[0] !== '' && items.length > 1 /* && items[0].indexOf(':') === -1 */) {
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(
                                    segments[i],
                                    segments[i].replace(items[0], chalk.magenta(items[0]))
                                )
                                + '` '
                                + chalk.grey(msg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            });
        }
    };
});
