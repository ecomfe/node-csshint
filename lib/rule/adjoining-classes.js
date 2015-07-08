/**
 * @file adjoining-classes 的检测逻辑
 *       Don't use adjoining classes 例如 .foo.bar
 *       https://github.com/CSSLint/csslint/wiki/Disallow-adjoining-classes
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
var RULENAME = 'adjoining-classes';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
var PATTERN_COMBINATORS = /[\s>+~,[]+/;

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'Don\'t use adjoining classes';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            var segments = rule.selector.split(PATTERN_COMBINATORS);

            for (var i = 0, len = segments.length; i < len; i++) {
                var segment = segments[i];
                if (segment.split('.').length > 2) {
                    var source = rule.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css) || '';
                    var colorStr = segment;
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
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
            }
        });
    };
});
