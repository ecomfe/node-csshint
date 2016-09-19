/**
 * @file disallow-named-color 的检测逻辑
 *       031: [强制] 颜色值不允许使用命名色值。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, changeColorByStartAndEndIndex} from '../util';
import colors from '../colors';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'disallow-named-color';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Color values using named color value is not allowed';

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
                    if (colors.hasOwnProperty(part)) {
                        const source = decl.source;
                        const line = source.start.line;
                        const lineContent = getLineContent(line, source.input.css);
                        const extraLine = decl.value.indexOf(part) || 0;
                        const col = source.start.column + decl.prop.length + decl.raws.between.length + extraLine;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: MSG,
                            colorMessage: '`'
                                + changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            });
        }
    }
);
