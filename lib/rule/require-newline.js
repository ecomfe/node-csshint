/**
 * @file require-newline 的检测逻辑
 *       `selector` 对应 008: [强制] 当一个 rule 包含多个 selector 时，每个选择器声明必须独占一行。
 *       `property` 对应 011: [强制] 属性定义必须另起一行。
 *       `media-query-condition` 对应 044: [强制] `Media Query` 如果有多个逗号分隔的条件时，应将每个条件放在单独一行中。
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
var RULENAME = 'require-newline';

/**
 * 判断逗号后面没有跟着换行符的正则
 * 如果未匹配，则说明逗号后面有换行符
 *
 * @type {RegExp}
 */
var PATTERN_NOTLF = /(,(?!\s*\n))/;

/**
 * 错误的信息
 *
 * @type {string}
 */
var mediaMsg = ''
    + '`Media Query` if there is more than one comma separated condition,'
    + ' should put each on a separate line condition';

var selectorMsg = ''
    + 'When a rule contains multiple selector, '
    + 'each selector statement must be on a separate line';

var propertyMsg = 'The attribute definition must be on a new line';

var arrayProto = Array.prototype;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        var ruleVal = opts.ruleVal;
        var realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            var source;
            var line;
            var lineContent;
            var col;

            if (realRuleVal.indexOf('selector') > -1) {
                css.eachRule(function (rule) {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }

                    var selector = rule.selector;
                    if (PATTERN_NOTLF.test(selector)) {
                        source = rule.source;
                        line = source.start.line;
                        lineContent = util.getLineContent(line, source.input.css);
                        col = source.start.column;
                        // 如果是 `p, i, \n.cc` 这样的选择器，那么高亮就应该把后面的 `\n.cc` 去掉
                        // 直接用 lineContent 来匹配 `p, i, \n.cc` 无法高亮
                        var colorStr = selector.replace(/\n.*/, '');
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            errorChar: 'selector',
                            line: line,
                            col: col,
                            message: selectorMsg,
                            colorMessage: '`'
                                + lineContent.replace(colorStr, chalk.magenta(colorStr))
                                + '` '
                                + chalk.grey(selectorMsg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }

                });
            }

            if (realRuleVal.indexOf('media-query-condition') > -1) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                css.eachAtRule(function (atRule) {
                    if (atRule.name !== 'media') {
                        return;
                    }
                    var params = atRule.params;
                    if (PATTERN_NOTLF.test(params)) {
                        source = atRule.source;
                        line = source.start.line;
                        lineContent = util.getLineContent(line, source.input.css);
                        col = source.start.column;

                        var colorStr = params.replace(/\n.*/, '');
                        result.warn(RULENAME, {
                            node: atRule,
                            ruleName: RULENAME,
                            errorChar: 'media-query-condition',
                            line: line,
                            col: col,
                            message: mediaMsg,
                            colorMessage: '`'
                                + lineContent.replace('@media', chalk.magenta('@media'))
                                    .replace(colorStr, chalk.magenta(colorStr))
                                + '` '
                                + chalk.grey(mediaMsg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                });
            }

            if (realRuleVal.indexOf('property') > -1) {
                css.eachDecl(function (decl) {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }

                    var before = decl.before;
                    if (before.indexOf('\n') === -1) {
                        source = decl.source;
                        line = source.start.line;
                        lineContent = util.getLineContent(line, source.input.css);
                        col = source.start.column; // + decl.prop.length + decl.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            errorChar: 'property',
                            line: line,
                            col: col,
                            message: propertyMsg,
                            colorMessage: '`'
                                + util.changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(propertyMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }

                });
            }
        }
    };
});
