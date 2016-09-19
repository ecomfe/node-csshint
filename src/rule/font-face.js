/**
 * @file font-face 的检测逻辑
 *       Too many different web fonts in the same stylesheet
 *       https://github.com/CSSLint/csslint/wiki/Don't-use-too-many-web-fonts
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'font-face';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = '@font-face declarations must not be greater than ';

let fontFaceCount = 0;

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

        fontFaceCount = 0;

        css.walkAtRules(atRule => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (atRule.name === 'font-face') {
                fontFaceCount++;
            }
        });

        if (fontFaceCount > opts.ruleVal) {
            const str = MSG + opts.ruleVal + ', current file @font-face declarations is ' + fontFaceCount;
            result.warn(RULENAME, {
                node: css,
                ruleName: RULENAME,
                message: str,
                colorMessage: chalk.grey(str)
            });

            global.CSSHINT_INVALID_ALL_COUNT++;
        }
    }
);
