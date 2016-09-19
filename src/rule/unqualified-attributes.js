/**
 * @file unqualified-attributes 的检测逻辑
 *       Unqualified attribute selectors are known to be slow
 *       https://github.com/CSSLint/csslint/wiki/Disallow-unqualified-attribute-selectors
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
const RULENAME = 'unqualified-attributes';

/**
 * css 组合的正则匹配
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COMBINATORS = /[\s>+~]+/g;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Unqualified attribute selectors are known to be slow';

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
            let lineContent = getLineContent(line, source.input.css);

            for (let i = 0, len = selectorGroup.length; i < len; i++) {
                const selectorInGroup = selectorGroup[i] || '';
                const segments = selectorInGroup.split(PATTERN_COMBINATORS);
                const l = segments.length;
                if (l) {
                    var last = segments[l - 1];
                    if (last.match(/\[.+?\](?::[^\s>+~\.#\[]+)?/g)) {
                        if (selectorInGroup.slice(0, 1) === '\n') {
                            line = line + 1;
                            lineContent = getLineContent(line, source.input.css);
                        }
                        var col = lineContent.indexOf(segments[l - 1]) + 1;
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(segments[l - 1], chalk.magenta(segments[l - 1]))
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
