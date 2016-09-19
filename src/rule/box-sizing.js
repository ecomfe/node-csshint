/**
 * @file box-sizing 的检测逻辑
 *       The box-sizing properties isn't supported in IE6 and IE7
 *       https://github.com/CSSLint/csslint/wiki/Disallow-box-sizing
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
const RULENAME = 'box-sizing';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'The box-sizing properties isn\'t supported in IE6 and IE7';

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
            rule.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const prop = decl.prop;
                if (prop === 'box-sizing') {
                    const source = decl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column;
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + lineContent.replace(
                                prop,
                                chalk.magenta(prop)
                            )
                            + '` '
                            + chalk.grey(MSG)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        });
    }
);
