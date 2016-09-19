/**
 * @file font-sizes 的检测逻辑
 *       Too many font-size declarations, abstraction needed
 *       https://github.com/CSSLint/csslint/wiki/Don't-use-too-many-font-size-declarations
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
const RULENAME = 'font-sizes';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = '`font-size` must not be greater than ';

let fontSizeCount = 0;

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

        fontSizeCount = 0;

        css.walkDecls(decl => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const prop = decl.prop;
            if (prop === 'font-size') {
                fontSizeCount++;
            }
        });

        if (fontSizeCount > opts.ruleVal) {
            const str = MSG + opts.ruleVal + ', current file `font-size` is ' + fontSizeCount;
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
