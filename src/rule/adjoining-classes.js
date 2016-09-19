/**
 * @file adjoining-classes 的检测逻辑
 *       Don't use adjoining classes 例如 .foo.bar
 *       https://github.com/CSSLint/csslint/wiki/Disallow-adjoining-classes
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';

'use strict';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'adjoining-classes';

/**
 * css 组合的正则匹配
 *
 * @type {RegExp}
 */
const PATTERN_COMBINATORS = /[\s>+~,[]+/;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Don\'t use adjoining classes';

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

            const segments = rule.selector.split(PATTERN_COMBINATORS);

            for (let i = 0, len = segments.length; i < len; i++) {
                const segment = segments[i];
                if (segment.split('.').length > 2) {
                    const source = rule.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css) || '';
                    const colorStr = segment;
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        message: MSG,
                        colorMessage: '`'
                            + lineContent.replace(
                                colorStr,
                                chalk.magenta(colorStr)
                            )
                            + '` '
                            + chalk.grey(MSG)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            }
        });
    }
);
