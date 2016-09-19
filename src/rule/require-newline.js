/**
 * @file require-newline 的检测逻辑
 *       `selector` 对应 008: [强制] 当一个 rule 包含多个 selector 时，每个选择器声明必须独占一行。
 *       `property` 对应 011: [强制] 属性定义必须另起一行。
 *       `media-query-condition` 对应 044: [强制] `Media Query` 如果有多个逗号分隔的条件时，应将每个条件放在单独一行中。
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
const RULENAME = 'require-newline';

/**
 * 判断逗号后面没有跟着换行符的正则
 * 如果未匹配，则说明逗号后面有换行符
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_NOTLF = /(,(?!\s*\n))/;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const mediaMsg = ''
    + '`Media Query` if there is more than one comma separated condition,'
    + ' should put each on a separate line condition';

const selectorMsg = ''
    + 'When a rule contains multiple selector, '
    + 'each selector statement must be on a separate line';

const propertyMsg = 'The attribute definition must be on a new line';

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

            let source;
            let line;
            let lineContent;
            let col;

            if (realRuleVal.indexOf('selector') > -1) {
                css.walkRules(rule => {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }

                    const selector = rule.selector;
                    if (PATTERN_NOTLF.test(selector)) {
                        source = rule.source;
                        line = source.start.line;
                        lineContent = getLineContent(line, source.input.css);
                        col = source.start.column;
                        // 如果是 `p, i, \n.cc` 这样的选择器，那么高亮就应该把后面的 `\n.cc` 去掉
                        // 直接用 lineContent 来匹配 `p, i, \n.cc` 无法高亮
                        const colorStr = selector.replace(/\n.*/, '');
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

                css.walkAtRules(atRule => {
                    if (atRule.name !== 'media') {
                        return;
                    }
                    const params = atRule.params;
                    if (PATTERN_NOTLF.test(params)) {
                        source = atRule.source;
                        line = source.start.line;
                        lineContent = getLineContent(line, source.input.css);
                        col = source.start.column;

                        const colorStr = params.replace(/\n.*/, '');
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
                css.walkDecls(decl => {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }

                    const before = decl.raws.before;
                    if (before.indexOf('\n') === -1) {
                        source = decl.source;
                        line = source.start.line;
                        lineContent = getLineContent(line, source.input.css);
                        col = source.start.column;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            errorChar: 'property',
                            line: line,
                            col: col,
                            message: propertyMsg,
                            colorMessage: '`'
                                + changeColorByStartAndEndIndex(
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
    }
);
