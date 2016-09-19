/**
 * @file require-around-space 的检测逻辑
 *       `>`, `+`, `~` 对应 009: [强制] `>`、`+`、`~` 选择器的两边各保留一个空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, trim} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'require-around-space';

/**
 * css 组合的正则匹配
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COMBINATORS = /[^\s>+~=]+/g; // 排除 ~=, +=, >=

/**
 * 获取错误信息
 *
 * @param {string} combinator 组合的字符
 *
 * @return {string} 错误信息
 */
const getMsg = combinator =>
    ''
        + 'Around the `'
        + combinator
        + '` selector will keep a space';

const arrayProto = Array.prototype;

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

        const ruleVal = opts.ruleVal;
        const realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            const invalidList = [];
            css.walkRules(rule => {
                /* jshint maxcomplexity: 11 */
                let selector = rule.selector;

                // 排除掉 .aaa:nth-child(4n+1) 这样的选择器
                selector = selector.replace(/\([\s\S]*?\)/g, '');

                const segments = selector.split(PATTERN_COMBINATORS);
                const len = segments.length;

                for (let i = 0; i < len; i++) {
                    let segment = segments[i];

                    if (!segment) {
                        continue;
                    }

                    const lastChar = segment.slice(-1);
                    const firstChar = segment.slice(0, 1);
                    if (segment) {
                        segment = trim(segment);
                        if (realRuleVal.indexOf(segment) <= -1) {
                            continue;
                        }

                        if (i === 0) {
                            if (lastChar !== ' ') {
                                invalidList.push({
                                    invalidChar: segment,
                                    rule: rule
                                });
                                continue;
                            }
                        }
                        else if (i === len - 1) {
                            if (firstChar !== ' ') {
                                invalidList.push({
                                    invalidChar: segment,
                                    rule: rule
                                });
                                continue;
                            }
                        }
                        else {
                            if (lastChar !== ' ' || firstChar !== ' ') {
                                invalidList.push({
                                    invalidChar: segment,
                                    rule: rule
                                });
                                continue;
                            }
                        }
                    }
                }
            });

            invalidList.forEach(invalidRule => {
                const {invalidChar, rule} = invalidRule;
                const msg = getMsg(invalidRule.invalidChar);
                const source = rule.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css);
                const col = lineContent.indexOf(invalidChar);
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    errorChar: invalidChar,
                    line: line,
                    col: col + 1,
                    message: msg,
                    colorMessage: '`'
                        + lineContent.replace(invalidChar, chalk.magenta(invalidChar))
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            });
        }
    }
);
