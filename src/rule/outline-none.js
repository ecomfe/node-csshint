/**
 * @file outline-none 的检测逻辑
 *       Use of outline: none or outline: 0 should be limited to :focus rules
 *       https://github.com/CSSLint/csslint/wiki/Disallow-outline:none
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'outline-none';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const msg1 = 'Outlines should only be modified using :focus';
const msg2 = 'Outlines shouldn\'t be hidden unless other visual changes are made';

let lastRule;

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

        if (!opts.ruleVal) {
            return;
        }

        css.walkRules(rule => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const selector = rule.selector;
            if (selector) {
                lastRule = {
                    rule: rule,
                    selector: selector,
                    propCount: 0,
                    outline: false
                };
            }
            else {
                lastRule = null;
            }

            rule.walkDecls(decl => {
                const {prop, value} = decl;
                if (lastRule) {
                    lastRule.propCount++;
                    if (prop === 'outline' && (value === 'none' || value.toString() === '0')) {
                        lastRule.outline = true;
                    }
                }
            });

            if (lastRule) {
                if (lastRule.outline) {
                    const source = lastRule.rule.source;
                    const line = source.start.line;
                    const col = source.start.column;
                    const lineContent = getLineContent(line, source.input.css);
                    if (lastRule.selector.toLowerCase().indexOf(':focus') === -1) {
                        result.warn(RULENAME, {
                            node: lastRule.rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg1,
                            colorMessage: '`'
                                + lineContent.replace(selector, chalk.magenta(selector))
                                + '` '
                                + chalk.grey(msg1)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                    else if (lastRule.propCount === 1) {
                        result.warn(RULENAME, {
                            node: lastRule.rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg2,
                            colorMessage: '`'
                                + lineContent.replace(selector, chalk.magenta(selector))
                                + '` '
                                + chalk.grey(msg2)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    }
);
