/**
 * @file disallow-expression 的检测逻辑
 *       050: [强制] 禁止使用 `Expression`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';

/**
 * 匹配 css 表达式的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_EXP = /expression\(/i;

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'disallow-expression';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Disallow use `Expression`';

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
            css.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const parts = postcss.list.space(decl.value);
                for (let i = 0, len = parts.length; i < len; i++) {
                    const part = parts[i];
                    if (PATTERN_EXP.test(part)) {
                        const source = decl.source;
                        const line = source.start.line;
                        const lineContent = getLineContent(line, source.input.css);
                        const col = source.start.column + decl.prop.length + decl.raws.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(/expression/g, chalk.magenta('expression'))
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                        continue;
                    }
                }

            });
        }
    }
);
