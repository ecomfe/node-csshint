/**
 * @file leading-zero 的检测逻辑
 *       025: [强制] 当数值为 0 - 1 之间的小数时，省略整数部分的 `0`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, changeColorByIndex} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'leading-zero';


/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const msg = 'When value is between 0 - 1 decimal, omitting the integer part of the `0`';

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
        if (opts.ruleVal) {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            css.walkDecls(decl => {
                const parts = postcss.list.space(decl.value);
                const source = decl.source;
                const line = source.start.line;
                for (let i = 0, len = parts.length; i < len; i++) {
                    const part = parts[i];
                    const numericVal = parseFloat(part);
                    if (numericVal < 1 && numericVal > 0) {
                        if (part.slice(0, 2) === '0.') {
                            const lineContent = getLineContent(line, source.input.css);
                            result.warn(RULENAME, {
                                node: decl,
                                ruleName: RULENAME,
                                line: line,
                                col: lineContent.indexOf(part) + 1,
                                message: msg,
                                colorMessage: '`'
                                    + changeColorByIndex(lineContent, lineContent.indexOf(part), part)
                                    + '` '
                                    + chalk.grey(msg)
                            });
                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }
                }
            });
        }
    }
);
