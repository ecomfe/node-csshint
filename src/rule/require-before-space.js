/**
 * @file require-before-space 的检测逻辑
 *       `{` 对应 003: [强制] `选择器` 与 `{` 之间必须包含空格。
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
const RULENAME = 'require-before-space';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Must contain spaces before the `{`';

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
            css.walkRules(rule => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                // 只有 { 时，才能用 between 处理，其他符号的 require-before-space 规则还未实现
                if (rule.raws.between === '' && realRuleVal.indexOf('{') !== -1) {
                    const source = rule.source;
                    const line = source.start.line;
                    const col = source.start.column + rule.selector.length;
                    const lineContent = getLineContent(line, source.input.css) || '';
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        errorChar: '{',
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + lineContent.replace(
                                '{',
                                chalk.magenta('{')
                            )
                            + '` '
                            + chalk.grey(MSG)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        }
    }
);
