/**
 * @file zero-unit 的检测逻辑
 *       028: [强制] 长度为 `0` 时须省略单位。 (也只有长度单位可省)
 *       https://github.com/ecomfe/spec/blob/master/css-style-guide.md#强制-长度为-0-时须省略单位-也只有长度单位可省
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';

'use strict';

/**
 * 规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'zero-unit';

/**
 * css 长度单位集合
 * https://developer.mozilla.org/en-US/docs/Web/CSS/length
 *
 * @const
 * @type {Array}
 */
const LENGTH_UNITS = [
    // Relative length units
    'em', 'ex', 'ch', 'rem', // Font-relative lengths
    'vh', 'vw', 'vmin', 'vmax', // Viewport-percentage lengths
    // Absolute length units
    'px', 'mm', 'cm', 'in', 'pt', 'pc'
];

/**
 * 数字正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_NUMERIC = /\d+[\.\d]*/;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Values of 0 shouldn\'t have units specified';

/**
 * 行号的缓存，防止同一行多次报错
 *
 * @type {number}
 */
let lineCache = 0;

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
        console.log('opts: ', opts);
        if (!opts.ruleVal) {
            return;
        }

        if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
            return;
        }

        lineCache = 0;

        css.walkDecls(decl => {
            const parts = postcss.list.space(decl.value);
            for (let i = 0, len = parts.length; i < len; i++) {
                const part = parts[i];
                const numericVal = parseFloat(part);

                if (numericVal === 0) {
                    const unit = part.replace(PATTERN_NUMERIC, '');
                    const source = decl.source;
                    const line = source.start.line;

                    if (LENGTH_UNITS.indexOf(unit) > -1 && lineCache !== line) {
                        lineCache = line;
                        const lineContent = getLineContent(line, source.input.css);
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: source.start.column + decl.prop.length + decl.raws.between.length,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    decl.value,
                                    chalk.magenta(decl.value)
                                )
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    }
);
