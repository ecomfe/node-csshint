/**
 * @file require-doublequotes 的检测逻辑
 *       `attr-selector` 对应 010: [强制] 属性选择器中的值必须用双引号包围。
 *       `text-content` 对应 024: [强制] 文本内容必须用双引号包围。
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
var RULENAME = 'require-doublequotes';

/**
 * 匹配属性选择器的正则
 *
 * @type {RegExp}
 */
var PATTERN_ATTR_SELECTOR = /\[.+?\](?::[^\s>+~\.#\[]+)?/;

/**
 * 匹配 css 属性值的 url(...);
 *
 * @type {RegExp}
 */
var PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

/**
 * 错误的信息
 *
 * @type {string}
 */
var selectorAttrMsg = 'Attribute selector value must use double quotes';
var textContentMsg = 'Text content value must use double quotes';

var arrayProto = Array.prototype;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        var ruleVal = opts.ruleVal;
        var realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            if (realRuleVal.indexOf('attr-selector') > -1) {
                var invalidRules = [];
                css.eachRule(function (rule) {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }
                    var cleanSelector = rule.selector.replace(/\(.*\)/, '').replace(/:root/, '');
                    var match = cleanSelector.match(PATTERN_ATTR_SELECTOR);
                    if (match && match.length) {
                        // 判处掉没有 = 的情况，没有 = 就说明就是属性选择器，例如 input[data-test]
                        if (match[0].indexOf('=') > -1) {
                            var quoteMatch = match[0].match(/.*=((['"]).*\2).*/);
                            if (quoteMatch) {
                                if (quoteMatch[2] !== '"') {
                                    invalidRules.push(rule);
                                }
                            }
                            else {
                                invalidRules.push(rule);
                            }
                        }
                    }
                });

                invalidRules.forEach(function (invalidRule) {
                    var source = invalidRule.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);
                    var col = source.start.column;
                    result.warn(RULENAME, {
                        node: invalidRule,
                        ruleName: RULENAME,
                        errorChar: 'attr-selector',
                        line: line,
                        col: col,
                        message: selectorAttrMsg,
                        colorMessage: '`'
                            + lineContent.replace(invalidRule.selector, chalk.magenta(invalidRule.selector))
                            + '` '
                            + chalk.grey(selectorAttrMsg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                });
            }

            if (realRuleVal.indexOf('text-content') > -1) {
                var invalidDecls = [];
                css.eachDecl(function (decl) {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }
                    var parts = postcss.list.comma(decl.value);
                    for (var i = 0, len = parts.length; i < len; i++) {
                        // 排除掉 uri 的情况，例如
                        // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                        // background-image: 2px 2px url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                        // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...) 2px 2px;
                        if (!PATTERN_URI.test(parts[i])) {
                            var quoteMatch = parts[i].match(/.*(['"]).*\1/i);
                            if (quoteMatch) {
                                if (quoteMatch[1] !== '"') {
                                    invalidDecls.push(decl);
                                }
                            }
                        }
                    }
                });

                invalidDecls.forEach(function (invalidDecl) {
                    var source = invalidDecl.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);
                    var col = source.start.column + invalidDecl.prop.length + invalidDecl.between.length;
                    result.warn(RULENAME, {
                        node: invalidDecl,
                        ruleName: RULENAME,
                        errorChar: 'text-content',
                        line: line,
                        col: col,
                        message: textContentMsg,
                        colorMessage: '`'
                            + util.changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                            + chalk.grey(textContentMsg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                });
            }
        }
    };
});
