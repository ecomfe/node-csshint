/**
 * @file require-doublequotes 的检测逻辑
 *       `attr-selector` 对应 010: [强制] 属性选择器中的值必须用双引号包围。
 *       `text-content` 对应 024: [强制] 文本内容必须用双引号包围。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, changeColorByStartAndEndIndex} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'require-doublequotes';

/**
 * 匹配属性选择器的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_ATTR_SELECTOR = /\[.+?\](?::[^\s>+~\.#\[]+)?/;

/**
 * 匹配 css 属性值的 url(...);
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

/**
 * 错误的信息
 *
 * @type {string}
 */
const selectorAttrMsg = 'Attribute selector value must use double quotes';
const textContentMsg = 'Text content value must use double quotes';

const arrayProto = Array.prototype;

/**
 * 具体的检测逻辑
 *
 * @param {Object} opts 参数
 * @param {*} opts.ruleVal 当前规则具体配置的值
 * @param {string} opts.fileContent 文件内容
 * @param {string} opts.filePath 文件路径
 */
export const check = postcss.plugin(RULENAME, opts =>
    (css, result) => {
        const ruleVal = opts.ruleVal;
        const realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            if (realRuleVal.indexOf('attr-selector') > -1) {
                const invalidRules = [];
                css.walkRules(rule => {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }
                    const cleanSelector = rule.selector.replace(/\(.*\)/, '').replace(/:root/, '');
                    const match = cleanSelector.match(PATTERN_ATTR_SELECTOR);
                    if (match && match.length) {
                        // 判处掉没有 = 的情况，没有 = 就说明就是属性选择器，例如 input[data-test]
                        if (match[0].indexOf('=') > -1) {
                            const quoteMatch = match[0].match(/.*=((['"]).*\2).*/);
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

                invalidRules.forEach(invalidRule => {
                    const {source, selector} = invalidRule;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column;
                    result.warn(RULENAME, {
                        node: invalidRule,
                        ruleName: RULENAME,
                        errorChar: 'attr-selector',
                        line: line,
                        col: col,
                        message: selectorAttrMsg,
                        colorMessage: '`'
                            + lineContent.replace(selector, chalk.magenta(selector))
                            + '` '
                            + chalk.grey(selectorAttrMsg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                });
            }

            if (realRuleVal.indexOf('text-content') > -1) {
                const invalidDecls = [];
                css.walkDecls(decl => {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }
                    const parts = postcss.list.comma(decl.value);
                    for (let i = 0, len = parts.length; i < len; i++) {
                        // 排除掉 uri 的情况，例如
                        // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                        // background-image: 2px 2px url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                        // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...) 2px 2px;
                        if (!PATTERN_URI.test(parts[i])) {
                            const quoteMatch = parts[i].match(/.*(['"]).*\1/i);
                            if (quoteMatch) {
                                if (quoteMatch[1] !== '"') {
                                    invalidDecls.push(decl);
                                }
                            }
                        }
                    }
                });

                invalidDecls.forEach(invalidDecl => {
                    const source = invalidDecl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column + invalidDecl.prop.length + invalidDecl.raws.between.length;
                    result.warn(RULENAME, {
                        node: invalidDecl,
                        ruleName: RULENAME,
                        errorChar: 'text-content',
                        line: line,
                        col: col,
                        message: textContentMsg,
                        colorMessage: '`'
                            + changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                            + chalk.grey(textContentMsg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                });
            }
        }
    }
);
