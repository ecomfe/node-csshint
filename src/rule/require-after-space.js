/**
 * @file require-after-space 的检测逻辑
 *       `:` 对应 004: [强制] `属性名` 与之后的 `:` 之间不允许包含空格， `:` 与 `属性值` 之间必须包含空格。
 *       `,` 对应 005: [强制] `列表型属性值` 书写在单行时，`,` 后必须跟一个空格。
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
const RULENAME = 'require-after-space';

/**
 * 冒号
 *
 * @const
 * @type {string}
 */
const COLON = ':';

/**
 * 逗号
 *
 * @const
 * @type {string}
 */
const COMMA = ',';

/**
 * 匹配 css 属性值的 url(...);
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

/**
 * 冒号的错误信息
 *
 * @const
 * @type {string}
 */
const COLON_MSG = ''
    + 'Disallow contain spaces between the `attr-name` and `:`, '
    + 'Must contain spaces between `:` and `attr-value`';

/**
 * 逗号的错误信息
 *
 * @const
 * @type {string}
 */
const COMMA_MSG = 'Must contain spaces after `,` in `attr-value`';

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

            css.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const source = decl.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css) || '';

                if (realRuleVal.indexOf(COLON) !== -1) {
                    const between = decl.raws.between;

                    if (between.slice(0, 1) !== ':' // `属性名` 与之后的 `:` 之间包含空格了
                        || between.slice(-1) === ':' // `:` 与 `属性值` 之间不包含空格
                    ) {
                        const colorStr = decl.prop + decl.raws.between + decl.value;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            errorChar: COLON,
                            line: line,
                            message: COLON_MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    colorStr,
                                    chalk.magenta(colorStr)
                                )
                                + '` '
                                + chalk.grey(COLON_MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }

                if (realRuleVal.indexOf(COMMA) !== -1) {

                    const value = decl.value;

                    // 排除掉 uri 的情况，例如
                    // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                    // background-image: 2px 2px url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                    // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...) 2px 2px;
                    if (!PATTERN_URI.test(value)) {
                        const items = lineContent.split(';');
                        for (let j = 0, jLen = items.length; j < jLen; j++) {
                            const s = items[j];
                            if (s.indexOf(',') > -1
                                && /.*,(?!\s)/.test(s)
                                && s.length !== lineContent.length // s.length === lineContent.length 的情况表示当前行结束了
                            ) {
                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: COMMA,
                                    line: line,
                                    message: COMMA_MSG,
                                    colorMessage: '`'
                                        + lineContent.replace(
                                            value,
                                            chalk.magenta(value)
                                        )
                                        + '` '
                                        + chalk.grey(COMMA_MSG)
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                            }
                        }
                    }
                }

            });
        }
    }
);
