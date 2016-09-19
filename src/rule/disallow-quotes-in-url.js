/**
 * @file disallow-quotes-in-url 的检测逻辑
 *       026: [强制] `url()` 函数中的路径不加引号。
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
const RULENAME = 'disallow-quotes-in-url';

/**
 * 匹配 css 中 url 的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_URL = /\burl\s*\((["']?)([^\)]+)\1\)/g;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Path in the `url()` must without the quotes';

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

                const {source, value} = decl;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css);

                let match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_URL.exec(value))) {
                    if (match[1]) {
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: lineContent.indexOf(match[0]) + 1,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(match[0], chalk.magenta(match[0]))
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                /* eslint-enable no-extra-boolean-cast */
            });
        }
    }
);
