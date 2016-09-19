/**
 * @file regex-selectors 的检测逻辑
 *       Selectors that look like regular expressions are slow and should be avoided
 *       https://github.com/CSSLint/csslint/wiki/Disallow-selectors-that-look-like-regular-expressions
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
const RULENAME = 'regex-selectors';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Selectors that look like regular expressions are slow and should be avoided';

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

            css.walkRules(rule => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const {selector, source} = rule;

                const selectorGroup = selector.split(',');
                let line = source.start.line;
                let lineContent = getLineContent(line, source.input.css);

                for (let i = 0, len = selectorGroup.length; i < len; i++) {
                    const selectorInGroup = selectorGroup[i] || '';
                    const attrs = selectorInGroup.match(/\[.+?\](?::[^\s>+~\.#\[]+)?/g);
                    if (!attrs) {
                        continue;
                    }

                    if (selectorInGroup.slice(0, 1) === '\n') {
                        line = line + 1;
                        lineContent = getLineContent(line, source.input.css);
                    }

                    for (let j = 0, attrsLen = attrs.length; j < attrsLen; j++) {
                        const attr = attrs[j];
                        if (/([\~\|\^\$\*]=)/.test(attr)) {
                            const col = lineContent.indexOf(attr) + 1;
                            result.warn(RULENAME, {
                                node: rule,
                                ruleName: RULENAME,
                                line: line,
                                col: col,
                                message: MSG,
                                colorMessage: '`'
                                    + lineContent.replace(attr, chalk.magenta(attr))
                                    + '` '
                                    + chalk.grey(MSG)
                            });

                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }

                }
            });
        }
    }
);
