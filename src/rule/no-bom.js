/**
 * @file no-bom 的检测逻辑
 *       001: [建议] `CSS` 文件使用无 `BOM` 的 `UTF-8` 编码。
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
const RULENAME = 'no-bom';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'CSS file should using UTF-8 coding without BOM';

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

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const bufContent = new Buffer(opts.fileContent, 'utf8');

            const hasBOM
                = (bufContent[0] === 0xEF && bufContent[1] === 0xBB && bufContent[2] === 0xBF) // UTF-8 +BOM
                    || (bufContent[0] === 0xEF && bufContent[1] === 0xBF && bufContent[2] === 0xBD); // unicode UTF16 LE

            if (hasBOM) {
                result.warn(RULENAME, {
                    node: css,
                    ruleName: RULENAME,
                    message: MSG,
                    colorMessage: chalk.grey(MSG)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        }
    }
);
