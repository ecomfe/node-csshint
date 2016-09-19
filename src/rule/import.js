/**
 * @file import 的检测逻辑
 *       Don't use @import, use <link> instead
 *       https://github.com/CSSLint/csslint/wiki/Disallow-@import
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
const RULENAME = 'import';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Don\'t use @import, use <link> instead';

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

        css.walkAtRules(atRule => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (atRule.name === 'import') {
                const source = atRule.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css);
                const col = source.start.column;
                result.warn(RULENAME, {
                    node: atRule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: MSG,
                    colorMessage: '`'
                        + lineContent.replace(/@import/g, chalk.magenta('@import'))
                        + '` '
                        + chalk.grey(MSG)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });
    }
);
