/**
 * @file unique-headings 的检测逻辑
 *       Headings should be defined only once
 *       https://github.com/CSSLint/csslint/wiki/Headings-should-only-be-defined-once
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
const RULENAME = 'unique-headings';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Headings should be defined only once';

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

        const headings = {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0
        };

        css.walkRules(rule => {
            /* jshint maxstatements: 26 */
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const {selector, source} = rule;
            const selectorGroup = selector.split(',');
            let line = source.start.line;
            let col = source.start.column;
            let lineContent = getLineContent(line, source.input.css);

            for (let i = 0, len = selectorGroup.length; i < len; i++) {
                const selectorInGroup = selectorGroup[i] || '';
                const segments = selectorInGroup.split(PATTERN_COMBINATORS);
                const segmentLen = segments.length;

                const lastSegment = segments[segmentLen - 1];
                if (!lastSegment.match(':') && headings.hasOwnProperty(lastSegment)) {
                    headings[lastSegment]++;
                    if (headings[lastSegment] > 1) {
                        const newLineMatch = selectorInGroup.match(/\n/g);
                        let extraLine = 0;
                        if (newLineMatch) {
                            extraLine += newLineMatch.length;
                            line = line + extraLine;
                            lineContent = getLineContent(line, source.input.css);
                            col = col + lineContent.indexOf(lastSegment);
                        }
                        else {
                            col = lineContent.indexOf(lastSegment) + 1;
                        }
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(lastSegment, chalk.magenta(lastSegment))
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
