/**
 * @file shorthand 的检测逻辑
 *       `property` 对应 015: [建议] 在可以使用缩写的情况下，尽量使用属性缩写。
 *       `color` 对应 030: [强制] 颜色值可以缩写时，必须使用缩写形式。
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
const RULENAME = 'shorthand';

/**
 * 匹配 #aaccaa 之类的颜色值
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COLOR = /^#([\da-f])\1([\da-f])\2([\da-f])\3$/i;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const COLOR_MSG = 'Color value can be abbreviated, must use the abbreviation form';

const arrayProto = Array.prototype;

const propertiesToCheck = {};

const mapping = {
    margin: [
        'margin-top',
        'margin-bottom',
        'margin-left',
        'margin-right'
    ],
    padding: [
        'padding-top',
        'padding-bottom',
        'padding-left',
        'padding-right'
    ],
    font: [
        'font-family',
        'font-size',
        'line-height'
    ]
};

(() => {
    /* eslint-disable fecs-use-for-of, fecs-valid-map-set */
    for (let prop in mapping) {
        if (mapping.hasOwnProperty(prop)) {
            for (let i = 0, len = mapping[prop].length; i < len; i++) {
                propertiesToCheck[mapping[prop][i]] = prop;
            }
        }
    }
    /* eslint-enable fecs-use-for-of, fecs-valid-map-set */
})();

/**
 * 获取 property 的错误信息
 *
 * @param {string} propertyStr 出错的属性字符串
 * @param {string} selector 这些出错的属性所在的选择器的名称
 * @param {string} replaceProperty 应该要替换的属性
 *
 * @return {Object} 包含 msg 和 colorMsg 属性的对象
 */
const getPropertyMsg = (propertyStr, selector, replaceProperty) => {
    return {
        msg: ''
            + 'The properties `'
            + propertyStr
            + '` in the selector `'
            + selector
            + '` can be replaced by '
            + replaceProperty
            + '.',
        colorMsg: chalk.grey(''
            + 'The properties `'
            + chalk.magenta(propertyStr)
            + '` in the selector `'
            + chalk.magenta(selector)
            + '` can be replaced by '
            + chalk.magenta(replaceProperty)
            + '.')
    };
};

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
        const ruleVal = opts.ruleVal;
        const realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {
            if (realRuleVal.indexOf('color') > -1) {

                lineCache = 0;

                css.walkDecls(decl => {
                    const parts = postcss.list.space(decl.value);
                    for (let i = 0, len = parts.length; i < len; i++) {
                        const part = parts[i];
                        if (PATTERN_COLOR.test(part)) {
                            const source = decl.source;
                            if (lineCache !== source.start.line) {
                                lineCache = source.start.line;
                                const line = source.start.line;
                                const lineContent = getLineContent(line, source.input.css);
                                const col = source.start.column + decl.prop.length + decl.raws.between.length;
                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: 'color',
                                    line: line,
                                    col: col,
                                    message: COLOR_MSG,
                                    colorMessage: '`'
                                        + changeColorByStartAndEndIndex(
                                            lineContent, col, source.end.column
                                        )
                                        + '` '
                                        + chalk.grey(COLOR_MSG)
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                            }
                        }
                    }
                });
            }

            if (realRuleVal.indexOf('property') > -1) {
                let tmp = {};
                css.walkRules(rule => {
                    tmp = {};
                    const {nodes, selector} = rule;
                    for (let i = 0, len = nodes.length; i < len; i++) {
                        const decl = nodes[i];
                        if (decl.type === 'decl') {
                            const prop = decl.prop;
                            const v = propertiesToCheck[prop];
                            if (!v) {
                                continue;
                            }

                            if (!tmp[v]) {
                                tmp[v] = 1;
                            }
                            else {
                                tmp[v] += 1;
                            }

                            if (tmp[v] >= mapping[v].length) {
                                const source = decl.source;
                                const line = source.start.line;
                                const col = source.start.column;

                                const msg = getPropertyMsg(mapping[v].join(', '), selector, v);

                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: 'property',
                                    line: line,
                                    col: col,
                                    message: msg.msg,
                                    colorMessage: msg.colorMsg
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                                break;
                            }
                        }
                    }
                });
            }
        }
    }
);
