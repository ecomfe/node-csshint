/**
 * @file star-property-hack 的检测逻辑
 *       Checks for the star property hack (targets IE6/7)
 *       https://github.com/CSSLint/csslint/wiki/Disallow-star-hack
 * @author ielgnaw(wuji0223@gmail.com)
 */

import postcss from 'postcss';

import {getLineContent, changeColorByStartAndEndIndex} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'star-property-hack';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Disallow properties with a star prefix';

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

            css.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const before = decl.raws.before;

                if (before.slice(-1) === '*') {
                    const source = decl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column;
                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                    });

                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        }
    }
);
