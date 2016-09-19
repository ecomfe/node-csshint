/**
 * @file block-indent 的检测逻辑
 *       002: [强制] 使用 `4` 个空格做为一个缩进层级，不允许使用 `2` 个空格 或 `tab` 字符。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';

import {getPrefixList} from '../prefixes';

'use strict';

const prefixList = getPrefixList();

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'block-indent';

/**
 * 行号的缓存，防止同一行多次报错
 *
 * @type {number}
 */
let lineCache = 0;

/**
 * 获取错误信息
 *
 * @param {string} curIndentStr 当前的缩进的字符串（错误的）
 * @param {string} neededIndentStr 期望的的缩进的字符串（正确的）
 *
 * @return {string} 错误信息
 */
const getMsg = (curIndentStr, neededIndentStr) =>
    ''
        + 'Bad indentation, Expected `'
        + (neededIndentStr.length)
        + '` but saw `'
        + (curIndentStr.length)
        + '`';

/**
 * 判断是否是合法的带前缀的 css 属性名称
 *
 * @param {Object} decl postcss 节点对象
 *
 * @return {boolean} 结果
 */
const isValidVendorProp = decl => {
    const prop = decl.prop;
    const standardProperty = prop.replace(/^\-(webkit|moz|ms|o)\-/g, '');
    // 标准模式在 prefixList 中，那么如果 propertyName 不在 prefixList 中
    // 即这个属性用错了，例如 -o-animation
    if (prefixList.indexOf(standardProperty) > -1) {
        if (prefixList.indexOf(prop) <= -1) {
            return false;
        }
    }
    return true;
};

/**
 * 对 decl 的处理
 *
 * @param {Object} node node 对象，可能是 decl 也可能是 rule
 * @param {Object} result postcss 转换的结果对象
 * @param {string} msg 错误信息
 * @param {string} hackPrefixChar 属性 hack 的前缀，`_` 或者 `*`
 */
const addWarn = (node, result, msg, hackPrefixChar) => {
    const source = node.source;
    const line = source.start.line;
    if (lineCache !== line) {
        lineCache = line;
        const col = source.start.column;

        const lineContent = getLineContent(line, source.input.css) || '';
        let colorStr = '';

        if (node.selector) {
            colorStr = node.selector;
        }
        else if (node.type === 'atrule') {
            colorStr = lineContent;
        }
        else {
            colorStr = (hackPrefixChar || '') + node.prop + node.raws.between + node.value;
            colorStr = colorStr.replace(/\n/g, '');
        }

        result.warn(RULENAME, {
            node: node,
            ruleName: RULENAME,
            line: line,
            col: col,
            message: msg,
            colorMessage: '`'
                + lineContent.replace(
                    colorStr,
                    chalk.magenta(colorStr)
                )
                + '` '
                + chalk.grey(msg)
        });
        global.CSSHINT_INVALID_ALL_COUNT++;
    }
};

/**
 * 对 atRuleList 的处理，上下文是 atRuleList
 *
 * @param {Array} atRuleList arRule 对象集合
 * @param {Object} result postcss result 对象
 * @param {Object} rule css.walkRules 里的 rule 对象
 * @param {string} indentStr 缩进的字符串
 * @param {number} startPos 开始计算缩进的偏移量，相当于这一行的 column，和 indentStr 没有关系
 */
const atRuleListIterator = (atRuleList, result, rule, indentStr, startPos) => {
    // 说明当前这个选择器没有 atRule
    if (!atRuleList.length) {
        const ruleStartCol = rule.source.start.column;
        if (ruleStartCol - 1 !== startPos) {
            addWarn(rule, result, getMsg(rule.raws.before.replace(/\n/g, ''), ''));
        }

        // 选择器中的属性默认的缩进层级为 1
        const indentLevel = 1;
        rule.walkDecls(decl => {
            if (!isValidVendorProp(decl, result)) {
                return;
            }

            if (prefixList.indexOf(decl.prop) > -1) {
                return;
            }

            let ruleBefore = rule.raws.before;

            // 加上 \s，是为了防止如下情况
            // div {
            //     color: #fff;
            // }
            // span {
            //     color: #000;
            // }
            // 当 div 的 } 符号后有一个空格的时候，会导致 span 的第一条非注释属性报 block-indent 的错误
            // \s\s\s\n\n\s\s\s 要去掉 \n 前面的 \s，\n 后面的 \s 需要计算为下一行的开头位置，所以不能去掉
            ruleBefore = ruleBefore.replace(/\s*\n+/, '');

            // 正确的缩进字符串
            let shouldIndentStr = ruleBefore;
            for (let j = 0; j < indentLevel; j++) {
                shouldIndentStr += indentStr;
            }

            let declBefore = decl.raws.before;
            // 兼容 background-position-x: 170px;; 属性后有多个分号的情况
            declBefore = declBefore.replace(/^[^\n]*/, '');
            // 把 before 里面的多个空行换成一个，便于之后的计算
            declBefore = declBefore.replace(/\n*/, '\n');

            const length = declBefore.length;
            const hackPrefixChar = declBefore[length - 1];
            if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                shouldIndentStr += hackPrefixChar;
            }

            if (declBefore !== '\n' + shouldIndentStr) {
                addWarn(decl, result,
                    getMsg(declBefore.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                );
            }
        });
    }

    // 对 atRule 处理
    atRuleList.forEach((ar, index) => {
        const {raws, source} = ar;
        let arBefore = raws.before;
        // 兼容 background-position-x: 170px;; 属性后有多个分号的情况
        arBefore = arBefore.replace(/^[^\n]*/, '');
        // 把 arBefore 里面的多个空行换成一个，便于之后的计算
        arBefore = arBefore.replace(/\n*/, '\n');

        const startCol = source.start.column;

        // 判断第一行，只需要看开头的 col 是否等于 startPos
        if (index === 0) {
            if (startCol - 1 !== startPos) {
                addWarn(ar, result, getMsg(arBefore.replace(/\n/g, ''), ''));
            }
        }
        // 非第一行的 @ 选择器，那么开头就必须有缩进，缩进根据 indentStr 来计算
        else {
            // 正确的缩进字符串
            let shouldIndentStr = '';
            for (let i = 0; i < index; i++) {
                shouldIndentStr += indentStr;
            }

            if (arBefore !== '\n' + shouldIndentStr) {
                addWarn(ar, result,
                    getMsg(arBefore.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                );
            }
        }

        // 最后一个 @ 选择器，在这里处理 atRule 里的 decl 以及 atRule 里的 rule
        if (index === atRuleList.length - 1) {
            let ruleBefore = rule.raws.before;
            // 兼容 background-position-x: 170px;; 属性后有多个分号的情况
            ruleBefore = ruleBefore.replace(/^[^\n]*/, '');
            // 把 ruleBefore 里面的多个空行换成一个，便于之后的计算
            ruleBefore = ruleBefore.replace(/\n*/, '\n');

            // 正确的缩进字符串
            let ruleShouldIndentStr = '';
            for (let q = 0; q <= index; q++) {
                ruleShouldIndentStr += indentStr;
            }

            if (ruleBefore !== '\n' + ruleShouldIndentStr) {
                addWarn(rule, result,
                    getMsg(ruleBefore.replace(/\n/g, '').slice(0, -1), ruleShouldIndentStr.slice(0, -1))
                );
            }

            // 处理 atRule 里面的 decl，其实这里用 rule.walkDecls 也可以
            ar.walkDecls(decl => {
                if (!isValidVendorProp(decl, result)) {
                    return;
                }

                if (prefixList.indexOf(decl.prop) > -1) {
                    return;
                }

                let before = decl.raws.before;
                // 兼容 background-position-x: 170px;; 属性后有多个分号的情况
                before = before.replace(/^[^\n]*/, '');
                // 把 before 里面的多个空行换成一个，便于之后的计算
                before = before.replace(/\n*/, '\n');

                // 正确的缩进字符串
                let shouldIndentStr = '';
                // 属性时 index 要加 1，因为这个 index 是 rule 的 index，而属性和 rule 之间要有一个缩进
                for (let i = 0; i <= index + 1; i++) {
                    shouldIndentStr += indentStr;
                }

                const length = before.length;
                const hackPrefixChar = before[length - 1];
                if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                    shouldIndentStr += hackPrefixChar;
                }

                if (before !== '\n' + shouldIndentStr) {
                    addWarn(decl, result,
                        getMsg(before.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                    );
                }
            });
        }
    });
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
        if (!Array.isArray(opts.ruleVal)) {
            return;
        }


        lineCache = 0;

        // 缩进的字符串
        const indentStr = opts.ruleVal[0];

        // 开始计算缩进的偏移量，相当于这一行的 column，和 opts.ruleVal[0] 没有关系
        const startPos = opts.ruleVal[1];

        css.walkRules(rule => {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            // 这里用 atRuleList 对 atRule 做一下处理是因为 postcss 默认是从 decl -> atrule -> rule -> root
            // 即从里向外的顺序处理的，但是我们这里需要知道由里向外的层级，我们需要知道层级的开始以及结束点
            // 因此 atRuleList.unshift 这样倒序过来
            const atRuleList = [];
            let parentRule = rule.parent;
            while (parentRule.type === 'atrule') {
                atRuleList.unshift(parentRule);
                parentRule = parentRule.parent;
            }

            atRuleListIterator(atRuleList, result, rule, indentStr, startPos);
        });
    }
);
