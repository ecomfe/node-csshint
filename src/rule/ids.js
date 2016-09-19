/**
 * @file ids 的检测逻辑
 *       Selectors should not contain IDs
 *       https://github.com/CSSLint/csslint/wiki/Disallow-IDs-in-selectors
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
const RULENAME = 'ids';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Selectors should not contain IDs';

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

        css.walkRules(rule => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const selector = rule.selector;
            const selectorGroup = selector.split(',');
            const source = rule.source;
            let line = source.start.line;
            let col = source.start.column;
            let lineContent = getLineContent(line, source.input.css);

            for (let i = 0, len = selectorGroup.length; i < len; i++) {
                let selectorInGroup = selectorGroup[i] || '';
                // 去掉 attr 选择器
                selectorInGroup = selectorInGroup.replace(/\[.+?\](?::[^\s>+~\.#\[]+)?/g, '');
                const match = selectorInGroup.match(/#[^\s>+~\.#\[]+/);
                if (match) {
                    if (selectorInGroup.slice(0, 1) === '\n') {
                        line = line + 1;
                        lineContent = getLineContent(line, source.input.css);
                        col = col + match.index - 1;
                    }
                    else {
                        col = col + match.index;
                    }
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + lineContent.replace(match[0], chalk.magenta(match[0]))
                            + '` '
                            + chalk.grey(MSG)
                    });
                }
            }
        });
    }
);
