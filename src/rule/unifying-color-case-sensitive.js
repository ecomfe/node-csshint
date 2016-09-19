/**
 * @file unifying-color-case-sensitive 的检测逻辑
 *       032: [建议] 颜色值中的英文字符采用小写。如不用小写也需要保证同一项目内保持大小写一致。
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
const RULENAME = 'unifying-color-case-sensitive';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = ''
    + 'The color value of the small English character. '
    + 'If no lower case also need to ensure that the same project to keep the same case';

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

            let source;
            let line;
            let lineContent;
            let col;

            css.walkDecls(decl => {
                /* jshint maxstatements: 42, maxcomplexity: 12 */
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const value = decl.value;

                if (!/#([a-fA-Z0-9]{3,6})/.test(value) // 排除非 hexColor
                    || /^#([0-9]{6})/.test(value) // 排除 #000000 纯数字的情况
                ) {
                    return;
                }

                const simpleColorStr = RegExp.$1;

                // 当前这个颜色值里的字母全是小写 #fafafa
                if (/^([a-z0-9]{3,6})$/.test(simpleColorStr)) {
                    if (global.CSSHINT_HEXCOLOR_CASE_FLAG === undefined) {
                        global.CSSHINT_HEXCOLOR_CASE_FLAG = 0;
                    }

                    // 说明之前已经检测过的颜色值里面的字母应该是大写
                    if (global.CSSHINT_HEXCOLOR_CASE_FLAG === 1) {
                        source = decl.source;
                        line = source.start.line;
                        lineContent = getLineContent(line, source.input.css);
                        col = source.start.column + decl.prop.length + decl.raws.between.length;
                        const upperCaseMsg =  MSG + ', Current project case is UpperCase.';
                        const upperCaseColorMsg =  MSG + ', Current project case is ' + chalk.magenta('UpperCase.');

                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: upperCaseMsg,
                            colorMessage: '`'
                                + changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(upperCaseColorMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                // 当前这个颜色值里面的字母全是大写 #FAFAFA
                else if (/^([A-Z0-9]{3,6})$/.test(simpleColorStr)) {
                    if (global.CSSHINT_HEXCOLOR_CASE_FLAG === undefined) {
                        global.CSSHINT_HEXCOLOR_CASE_FLAG = 1;
                    }
                    // 说明之前已经检测过的颜色值里面的字母应该是大写
                    if (global.CSSHINT_HEXCOLOR_CASE_FLAG === 0) {
                        source = decl.source;
                        line = source.start.line;
                        lineContent = getLineContent(line, source.input.css);
                        col = source.start.column + decl.prop.length + decl.raws.between.length;
                        const lowerCaseMsg =  MSG + ', Current project case is LowerCase.';
                        const lowerCaseColorMsg =  MSG + ', Current project case is ' + chalk.magenta('LowerCase.');

                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: lowerCaseMsg,
                            colorMessage: '`'
                                + changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(lowerCaseColorMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                // 当前这个颜色值里面的字母有大写也有小写 #faFafA
                else {
                    let str = MSG;
                    let colorStr = MSG;
                    if (global.CSSHINT_HEXCOLOR_CASE_FLAG === 0) {
                        str += ', Current project case is LowerCase.';
                        colorStr += ', Current project case is ' + chalk.magenta('LowerCase.');
                    }
                    else if (global.CSSHINT_HEXCOLOR_CASE_FLAG === 1) {
                        str += ', Current project case is UpperCase.';
                        colorStr += ', Current project case is ' + chalk.magenta('UpperCase.');
                    }
                    source = decl.source;
                    line = source.start.line;
                    lineContent = getLineContent(line, source.input.css);
                    col = source.start.column + decl.prop.length + decl.raws.between.length;

                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: str,
                        colorMessage: '`'
                            + changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                            + chalk.grey(colorStr)
                    });

                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        }
    }
);
