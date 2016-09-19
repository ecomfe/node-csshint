/**
 * @file always-semicolon 的检测逻辑
 *       012: [强制] 属性定义后必须以分号结尾。
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
const RULENAME = 'always-semicolon';

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Attribute definition must end with a semicolon';

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

            if (rule.raws.semicolon) {
                return;
            }

            const lastProp = rule.nodes[rule.nodes.length - 1];
            if (lastProp && lastProp.type !== 'comment') {
                const source = lastProp.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css) || '';

                const value = lastProp.important
                    ? lastProp.value + (lastProp.important ? lastProp.important : ' !important')
                    : lastProp.value;

                const colorStr = lastProp.prop + lastProp.raws.between + value;
                const col = source.start.column + colorStr.length;

                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
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
        });
    }
);
