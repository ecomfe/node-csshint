/**
 * @file require-number 的检测逻辑
 *       `font-weight` 对应 039: [强制] `font-weight` 属性必须使用数值方式描述。
 *       `line-height` 对应 040: [建议] `line-height` 在定义文本段落时，应使用数值。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, changeColorByStartAndEndIndex} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'require-number';

const PATTERN_NUMERIC = /^\d*[\.\d%]*$/;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = ' must be a number value';

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

                const prop = decl.prop;

                if (realRuleVal.indexOf(prop) !== -1) {
                    if (!PATTERN_NUMERIC.test(decl.value)) {
                        const source = decl.source;
                        const line = source.start.line;
                        const lineContent = getLineContent(line, source.input.css);
                        const col = source.start.column + decl.prop.length + decl.raws.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            errorChar: prop,
                            line: line,
                            col: col,
                            message: prop + MSG,
                            colorMessage: '`'
                                + changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(prop + MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }

            });
        }
    }
);
