/**
 * @file floats 的检测逻辑
 *       Too many floats, you're probably using them for layout. Consider using a grid system instead
 *       https://github.com/CSSLint/csslint/wiki/Disallow-too-many-floats
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
const RULENAME = 'floats';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = '`float` must not be greater than ';

let floatCount = 0;

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

        floatCount = 0;

        css.walkDecls(decl => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const {prop, value} = decl;
            if (prop === 'float' && value !== 'none') {
                floatCount++;
            }
        });

        if (floatCount > opts.ruleVal) {
            const str = MSG + opts.ruleVal + ', current file `float` is ' + floatCount;
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
