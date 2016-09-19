/**
 * @file gradients 的检测逻辑
 *       When using a vendor-prefixed gradient, make sure to use them all
 *       https://github.com/CSSLint/csslint/wiki/Require-all-gradient-definitions
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
const RULENAME = 'gradients';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Missing vendor-prefixed CSS gradients for ';

let gradients = {};

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

            gradients = {
                moz: 0,
                webkit: 0,
                oldWebkit: 0,
                o: 0
            };

            rule.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const value = decl.value;
                if (/\-(moz|o|webkit)(?:\-(?:linear|radial))\-gradient/i.test(value)) {
                    gradients[RegExp.$1] = 1;
                }
                else if (/\-webkit\-gradient/i.test(value)) {
                    gradients.oldWebkit = 1;
                }
            });

            const missing = [];

            if (!gradients.moz) {
                missing.push('Firefox 3.6+: -moz-linear-gradient');
            }

            if (!gradients.webkit) {
                missing.push('Webkit (Safari 5+, Chrome): -webkit-linear-gradient');
            }

            if (!gradients.oldWebkit) {
                missing.push('Old Webkit (Safari 4+, Chrome): -webkit-gradient');
            }

            if (!gradients.o) {
                missing.push('Opera 11.1+: -o-linear-gradient');
            }

            if (missing.length && missing.length < 4) {
                const source = rule.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css);
                const col = source.start.column;
                const str = MSG + missing.join(', ');
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: line,
                    col: col,
                    message: str,
                    colorMessage: '`'
                        + lineContent.replace(
                            rule.selector,
                            chalk.magenta(rule.selector)
                        )
                        + '` '
                        + chalk.grey(str)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        });
    }
);
