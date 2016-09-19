/**
 * @file duplicate-background-images 的检测逻辑
 *       Every background-image should be unique. Use a common class for e.g. sprites
 *       https://github.com/CSSLint/csslint/wiki/Disallow-duplicate-background-images
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
const RULENAME = 'duplicate-background-images';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const msg = 'Every background-image should be unique. Use a common class for e.g. sprites';

/**
 * 匹配 css 中 url 的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_URL = /\burl\s*\((["']?)([^\)]+)\1\)/g;

let stack = {};

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

        stack = {};

        css.walkDecls(decl => {

            let prop = decl.prop;
            if (prop.match(/background/i)) {
                const value = decl.value;
                let match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_URL.exec(value))) {
                    if (typeof stack[match[2]] === 'undefined') {
                        stack[match[2]] = decl;
                    }
                    else {
                        const str = 'Background image `'
                            + match[2]
                            + '` was used multiple times, first declared at line '
                            + stack[match[2]].source.start.line
                            + ', col '
                            + stack[match[2]].source.start.column
                            + '. '
                            + msg;

                        const colorStr = 'Background image `'
                            + chalk.magenta(match[2])
                            + '` was used multiple times, first declared at line '
                            + stack[match[2]].source.start.line
                            + ', col '
                            + stack[match[2]].source.start.column
                            + '. '
                            + chalk.grey(msg);

                        const source = decl.source;
                        const line = source.start.line;
                        const lineContent = getLineContent(line, source.input.css);
                        const col = lineContent.indexOf(match[2]) + 1;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: str,
                            colorMessage: colorStr
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                /* eslint-enable no-extra-boolean-cast */
            }
        });
    }
);
