/**
 * @file unifying-font-family-case-sensitive 的检测逻辑
 *       036: [强制] `font-family` 不区分大小写，但在同一个项目中，同样的 `Family Name` 大小写必须统一。
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
const RULENAME = 'unifying-font-family-case-sensitive';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = '`font-family` case insensitive, but in the same project, the same` Family Name` case must be unified.';

/**
 * 获取错误信息
 *
 * @param {string} curFontFamily 当前检测的这个 font-family 值
 * @param {string} projFontFamily 项目级别对应的这个 font-family 值
 *
 * @return {Object} 错误信息
 */
const getMsg = (curFontFamily, projFontFamily) => {
    return {
        msg: MSG
            + ' In currently project, '
            + '`'
            + curFontFamily
            + '` should be `'
            +   projFontFamily
            + '`.',
        colorMsg: MSG
            + ' In currently project, '
            + '`'
            + chalk.magenta(curFontFamily)
            + '` should be `'
            + chalk.magenta(projFontFamily)
            + '`.'
    };
};

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

        css.walkDecls(decl => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            const prop = decl.prop;

            if (prop === 'font-family') {
                const parts = postcss.list.space(decl.value);
                for (let i = 0, len = parts.length; i < len; i++) {
                    const part = parts[i].replace(/['",]/g, '');
                    const partLowerCase = part.toLowerCase();

                    if (!global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase]) {
                        global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase] = part;
                    }
                    else {
                        if (global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase] !== part) {
                            const source = decl.source;
                            const line = source.start.line;
                            const lineContent = getLineContent(line, source.input.css);
                            const col = lineContent.indexOf(part) + 1;

                            const m = getMsg(part, global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase]);

                            result.warn(RULENAME, {
                                node: decl,
                                ruleName: RULENAME,
                                line: line,
                                col: col,
                                message: m.msg,
                                colorMessage: '`'
                                    + lineContent.replace(part, chalk.magenta(part))
                                    + '` '
                                    + chalk.grey(m.colorMsg)
                            });
                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }
                }
            }
        });
    }
);
