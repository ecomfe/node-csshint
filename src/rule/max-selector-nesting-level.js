/**
 * @file max-selector-nesting-level 的检测逻辑
 *       014: [建议] 选择器的嵌套层级应不大于 3 级，位置靠后的限定条件应尽可能精确。
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
const RULENAME = 'max-selector-nesting-level';

/**
 * css 组合的正则匹配
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COMBINATORS = /[\s>+~]+/g;

/**
 * 获取错误信息
 *
 * @param {number} level 层级数量
 *
 * @return {string} 错误信息
 */
const getMsg = level => {
    return ''
        + 'A nested hierarchy selector should be no more than '
        + level
        + ' levels';
};

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

        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        const msg = getMsg(opts.ruleVal);

        css.walkRules(rule => {
            const selector = rule.selector;
            const selectorGroup = selector.split(',');

            for (let i = 0, len = selectorGroup.length; i < len; i++) {
                let selectorInGroup = selectorGroup[i] || '';

                // 去掉 attr 选择器
                selectorInGroup = selectorInGroup.replace(/\[.+?\](?::[^\s>+~\.#\[]+)?/g, '');

                // 先去掉 selectorInGroup 的前后空格，如果有空格，那么 segments 的第一个 item 是空，但是会增加 length
                const segments = selectorInGroup.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, '').split(
                    PATTERN_COMBINATORS
                );

                if (segments.length > opts.ruleVal) {
                    const newLineMatch = selectorInGroup.match(/\n/g);
                    let extraLine = 0;
                    if (newLineMatch) {
                        extraLine += newLineMatch.length;
                    }

                    const source = rule.source;
                    const line = source.start.line + extraLine;
                    const lineContent = getLineContent(line, source.input.css);

                    // 这里去掉 \n 是为了变色
                    selectorInGroup = selectorInGroup.replace(/\n/g, '');

                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        message: msg,
                        colorMessage: '`'
                            + lineContent.replace(selectorInGroup, chalk.magenta(selectorInGroup))
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            }
        });
    }
);
