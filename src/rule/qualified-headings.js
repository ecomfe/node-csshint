/**
 * @file qualified-headings 的检测逻辑
 *       Headings should not be qualified
 *       https://github.com/CSSLint/csslint/wiki/Disallow-qualified-headings
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
const RULENAME = 'qualified-headings';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Headings should not be qualified (namespaced)';

/**
 * css 组合的正则匹配
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COMBINATORS = /[\s>+~]+/g;

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

            const {selector, source} = rule;
            const selectorGroup = selector.split(',');
            let line = source.start.line;
            const col = source.start.column;
            let lineContent = getLineContent(line, source.input.css);

            for (let i = 0, len = selectorGroup.length; i < len; i++) {
                const selectorInGroup = selectorGroup[i] || '';
                const segments = selectorInGroup.split(PATTERN_COMBINATORS);

                // 跳过第一个，第一个是 h[1-6] 是合法的
                for (let j = 1, segmentLen = segments.length; j < segmentLen; j++) {
                    const segment = segments[j];
                    if (/h[1-6]/.test(segment)) {
                        if (selectorInGroup.slice(0, 1) === '\n') {
                            line = line + 1;
                            lineContent = getLineContent(line, source.input.css);
                        }
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col + lineContent.indexOf(segment),
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(segment, chalk.magenta(segment))
                                + '` '
                                + chalk.grey(MSG)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    }
);
