/**
 * @file min-font-size 的检测逻辑
 *       037: [强制] 需要在 Windows 平台显示的中文内容，其字号应不小于 `12px`。
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
const RULENAME = 'min-font-size';

/**
 * 数字正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_NUMERIC = /^\d+[\.\d]*$/;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'font-size should not be less than ';

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

        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        const msgWithVal = MSG + opts.ruleVal + 'px';

        css.walkDecls(decl => {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (decl.prop === 'font-size') {
                if (parseFloat(decl.value) < opts.ruleVal) {
                    const source = decl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const val = postcss.list.split(decl.value, 'px')[0];
                    if (PATTERN_NUMERIC.test(val)) {
                        const col = source.start.column + decl.prop.length + decl.raws.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msgWithVal,
                            colorMessage: '`'
                                + changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(msgWithVal)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    }
);
