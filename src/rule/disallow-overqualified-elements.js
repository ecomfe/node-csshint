/**
 * @file disallow-overqualified-elements 的检测逻辑
 *       013: [强制] 如无必要，不得为 `id`、`class` 选择器添加类型选择器进行限定。
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
const RULENAME = 'disallow-overqualified-elements';

/**
 * css 组合的正则匹配
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COMBINATORS = /[\s>+~,[]+/;

/**
 * css selector 开始字符的正则匹配
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_STARTCHARS = /[\.#\[]+/;

const PATTERN_PERCENT = /^((-|\+)?\d{1,2}(\.\d+)?|100)%$/;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Not allowed to add a type selector is limited to ID, class selector';

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

                if (!isNaN(rule.selector) || PATTERN_PERCENT.test(rule.selector)) {
                    return;
                }

                const source = rule.source;
                const line = source.start.line;

                const lineContent = getLineContent(line, source.input.css) || '';

                const segments = rule.selector.split(PATTERN_COMBINATORS);
                for (let i = 0, len = segments.length; i < len; i++) {
                    const items = segments[i].split(PATTERN_STARTCHARS);
                    if (items[0] !== '' && items.length > 1) {
                        result.warn(RULENAME, {
                            node: rule,
                            ruleName: RULENAME,
                            line: line,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    segments[i],
                                    segments[i].replace(items[0], chalk.magenta(items[0]))
                                )
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            });
        }
    }
);
