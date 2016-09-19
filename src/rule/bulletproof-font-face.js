/**
 * @file bulletproof-font-face 的检测逻辑
 *       Rule: Use the bulletproof @font-face syntax to avoid 404's in old IE
 *       (http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax)
 *       https://github.com/CSSLint/csslint/wiki/Bulletproof-font-face
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
const RULENAME = 'bulletproof-font-face';

const PATTERN = /^\s?url\(['"].+\.eot\?.*['"]\)\s*format\(['"]embedded-opentype['"]\)[\s\S]*$/i;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = '@font-face declaration doesn\'t follow the fontspring bulletproof syntax';

let firstSrc = true;
let failedDecl = false;

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
            css.walkAtRules(atRule => {
                if (atRule.name !== 'font-face') {
                    return;
                }

                firstSrc = true;
                failedDecl = false;

                atRule.walkDecls(decl => {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }

                    const {prop, value} = decl;

                    if (prop === 'src') {
                        if (!value.match(PATTERN) && firstSrc) {
                            failedDecl = decl;
                            firstSrc = false;
                        }
                        else if (value.match(PATTERN) && !firstSrc) {
                            failedDecl = false;
                        }
                    }
                });

                if (failedDecl) {
                    const source = failedDecl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column;
                    result.warn(RULENAME, {
                        node: atRule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: '`'
                            + lineContent
                            + '` '
                            + MSG,
                        colorMessage: '`'
                            + changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                            + chalk.grey(MSG)
                    });

                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        }
    }
);
