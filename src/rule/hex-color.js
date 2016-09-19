/**
 * @file hex-color 的检测逻辑
 *       029: [强制] RGB颜色值必须使用十六进制记号形式 `#rrggbb`。不允许使用 `rgb()`。
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
const RULENAME = 'hex-color';

/**
 * 匹配 rgb, hsl 颜色表达式的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COLOR_EXP = /(\brgb\b|\bhsl\b)/gi;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = ''
    + 'Color value must use the sixteen hexadecimal mark forms such as `#RGB`.'
    + ' Don\'t use RGB、HSL expression';

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

                let match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_COLOR_EXP.exec(decl.value))) {
                    const source = decl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column + decl.prop.length + decl.raws.between.length + match.index;
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
                /* eslint-enable no-extra-boolean-cast */
            });
        }
    }
);
