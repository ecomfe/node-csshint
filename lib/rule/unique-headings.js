/**
 * @file unique-headings 的检测逻辑
 *       Headings should be defined only once
 *       https://github.com/CSSLint/csslint/wiki/Headings-should-only-be-defined-once
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
var RULENAME = 'unique-headings';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Headings should be defined only once';

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

        var headings = {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0
        };

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
                var segmentLen = segments.length;

                var lastSegment = segments[segmentLen - 1];
                if (!lastSegment.match(':') && headings.hasOwnProperty(lastSegment)) {
                    headings[lastSegment]++;
                    if (headings[lastSegment] > 1) {
                        var newLineMatch = selectorInGroup.match(/\n/g);
                        var extraLine = 0;
                        if (newLineMatch) {
                            extraLine += newLineMatch.length;
                            line = line + extraLine;
                            lineContent = util.getLineContent(line, source.input.css);
                            col = col + lineContent.indexOf(lastSegment);
                        }
                        else {
                            col = lineContent.indexOf(lastSegment) + 1;
                        }
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(lastSegment, chalk.magenta(lastSegment))
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
