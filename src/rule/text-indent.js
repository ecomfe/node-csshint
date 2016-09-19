/**
 * @file text-indent 的检测逻辑
 *       Checks for text indent less than -99px
 *       https://github.com/CSSLint/csslint/wiki/Disallow-negative-text-indent
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, getPropertyValue} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'text-indent';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const msg = ''
    + 'Negative text-indent doesn\'t work well with RTL.'
    + 'If you use text-indent for image replacement explicitly set direction for that item to ltr';

let textIndentDecl;
let direction;

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

            textIndentDecl = false;
            direction = 'inherit';

            rule.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }
                const prop = decl.prop;
                const value = getPropertyValue(decl.value);

                if (prop === 'text-indent' && value[0].value < -99) {
                    textIndentDecl = decl;
                }
                else if (prop === 'direction' && value.value === 'ltr') {
                    direction = 'ltr';
                }
            });

            if (textIndentDecl && direction !== 'ltr') {
                const source = textIndentDecl.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css);
                const col = source.start.column;
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: msg,
                    colorMessage: '`'
                        + lineContent.replace(
                            textIndentDecl.prop,
                            chalk.magenta(textIndentDecl.prop)
                        )
                        + '` '
                        + chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });
    }
);
