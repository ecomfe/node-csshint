/**
 * @file max-length 的检测逻辑
 *       006: [强制] 每行不得超过 `120` 个字符，除非单行不可分割。
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
const RULENAME = 'max-length';

/**
 * 匹配 css 属性值的 url(...);
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

let excludeLines = [];

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

            excludeLines = [];

            const MSG = 'Each line must not be greater than ' + opts.ruleVal + ' characters';

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            // 排除掉 background-image: 2px 2px url(data:image/gif;base64,.....); 的情况
            css.walkDecls(decl => {
                const value = decl.value;
                if (PATTERN_URI.test(value)) {
                    excludeLines.push(decl.source.start.line);
                }
            });

            const lines = css.source.input.css.split(/\n/);

            for (let i = 0, len = lines.length; i < len; i++) {
                if (lines[i].length > opts.ruleVal
                    && excludeLines.indexOf(i + 1) === -1
                ) {
                    result.warn(RULENAME, {
                        node: css,
                        ruleName: RULENAME,
                        line: i + 1,
                        message: MSG,
                        colorMessage: chalk.grey(MSG)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            }
        }
    }
);
