/**
 * @file horizontal-vertical-position 的检测逻辑
 *       033: [强制] 必须同时给出水平和垂直方向的位置。
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
const RULENAME = 'horizontal-vertical-position';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Must give the horizontal and vertical position';

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

                if (decl.prop === 'background-position') {
                    const parts = postcss.list.space(decl.value);
                    if (parts.length < 2) {
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
