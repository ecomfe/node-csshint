/**
 * @file disallow-important 的检测逻辑
 *       019: [建议] 尽量不使用 `!important` 声明。
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
const RULENAME = 'disallow-important';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Try not to use the `important` statement';

/**
 * 记录行号的临时变量，例如
 * color:red !important;height: 100px !important;
 * 这段 css ，希望的是这一行只报一次 !important 的错误，这一次把这一行里面的 !important 全部高亮
 *
 * @type {number}
 */
let lineCache = 0;

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

            lineCache = 0;

            css.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }
                if (decl.important) {
                    const source = decl.source;
                    const line = source.start.line;

                    // lineCache === line 时，说明是同一行的，那么就不报了
                    if (lineCache !== line) {
                        lineCache = line;
                        const lineContent = getLineContent(line, source.input.css) || '';
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    /!important/gi,
                                    chalk.magenta('!important')
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
