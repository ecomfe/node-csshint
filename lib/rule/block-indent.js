/**
 * @file block-indent 的检测逻辑
 *       002: [强制] 使用 `4` 个空格做为一个缩进层级，不允许使用 `2` 个空格 或 `tab` 字符。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');
var prefixes = require('../prefixes');

var prefixList = prefixes.getPrefixList();

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'block-indent';

/**
 * 获取错误信息
 *
 * @param {string} curIndentStr 当前的缩进的字符串（错误的）
 * @param {string} neededIndentStr 期望的的缩进的字符串（正确的）
 *
 * @return {string} 错误信息
 */
function getMsg(curIndentStr, neededIndentStr) {
    // return 'Bad indentation (`' + curIndentStr + '` instead `' + neededIndentStr + '`)';
    return 'Bad indentation, Expected `' + neededIndentStr + '` but saw `' + curIndentStr + '`';
}

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!Array.isArray(opts.ruleVal)) {
            return;
        }

        // 缩进的字符串
        var indentStr = opts.ruleVal[0];

        // 开始计算缩进的偏移量，相当于这一行的 column，和 opts.ruleVal[0] 没有关系
        var startPos = opts.ruleVal[1];

        css.eachRule(function (rule) {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            // 这里用 atRuleList 对 atRule 做一下处理是因为 postcss 默认是从 decl -> atrule -> rule -> root
            // 即从里向外的顺序处理的，但是我们这里需要知道由里向外的层级，我们需要知道层级的开始以及结束点
            // 因此 atRuleList.unshift 这样倒序过来
            var atRuleList = [];
            var parentRule = rule.parent;
            while (parentRule.type === 'atrule') {
                atRuleList.unshift(parentRule);
                parentRule = parentRule.parent;
            }

            atRuleListIterator.call(atRuleList, result, rule, indentStr, startPos);
        });
    };
});

/**
 * 对 atRuleList 的处理，上下文是 atRuleList
 *
 * @param {Object} result postcss result 对象
 * @param {Object} rule css.eachRule 里的 rule 对象
 * @param {string} indentStr 缩进的字符串
 * @param {number} startPos 开始计算缩进的偏移量，相当于这一行的 column，和 indentStr 没有关系
 */
function atRuleListIterator(result, rule, indentStr, startPos) {
    var atRuleList = this;
    // 说明当前这个选择器没有 atRule
    if (!atRuleList.length) {
        var ruleStartCol = rule.source.start.column;
        if (ruleStartCol - 1 !== startPos) {
            addWarn(rule, result, getMsg(rule.before.replace(/\n/g, ''), ''));
        }

        // 选择器中的属性默认的缩进层级为 1
        var indentLevel = 1;
        rule.eachDecl(function (decl) {
            if (!isValidVendorProp(decl, result)) {
                return;
            }

            if (prefixList.indexOf(decl.prop) > -1) {
                return;
            }

            var declBefore = decl.before;
            // 把 before 里面的多个空行换成一个，便于之后的计算
            declBefore = declBefore.replace(/\n*/, '\n');

            // 正确的缩进字符串
            var shouldIndentStr = '';
            for (var i = 0; i < indentLevel; i++) {
                shouldIndentStr += indentStr;
            }

            var length = declBefore.length;
            var hackPrefixChar = declBefore[length - 1];
            if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                shouldIndentStr += hackPrefixChar;
            }

            // console.warn('---' + shouldIndentStr + '---');
            // console.warn();
            // console.warn('---' + declBefore.replace(/\n/g, '') + '---');
            // console.log(declBefore === '\n' + shouldIndentStr);

            if (declBefore !== '\n' + shouldIndentStr) {
                addWarn(decl, result,
                    getMsg(declBefore.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                );
            }
        });
    }

    // 对 atRule 处理
    atRuleList.forEach(function (ar, index) {
        var arBefore = ar.before;
        // 把 arBefore 里面的多个空行换成一个，便于之后的计算
        arBefore = arBefore.replace(/\n*/, '\n');

        var startCol = ar.source.start.column;

        // 判断第一行，只需要看开头的 col 是否等于 startPos
        if (index === 0) {
            if (startCol - 1 !== startPos) {
                addWarn(ar, result, getMsg(arBefore.replace(/\n/g, ''), ''));
            }
        }
        // 非第一行的 @ 选择器，那么开头就必须有缩进，缩进根据 indentStr 来计算
        else {
            // 正确的缩进字符串
            var shouldIndentStr = '';
            for (var i = 0; i < index; i++) {
                shouldIndentStr += indentStr;
            }

            // console.warn('---' + shouldIndentStr + '---');
            // console.warn();
            // console.warn('---' + arBefore.replace(/\n/g, '') + '---');
            // console.log(arBefore === '\n' + shouldIndentStr);
            if (arBefore !== '\n' + shouldIndentStr) {
                addWarn(ar, result,
                    getMsg(arBefore.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                );
            }
        }

        // 最后一个 @ 选择器，在这里处理 arRule 里的 decl 以及 arRule 里的 rule
        if (index === atRuleList.length - 1) {
            var ruleBefore = rule.before;
            // 把 ruleBefore 里面的多个空行换成一个，便于之后的计算
            ruleBefore = ruleBefore.replace(/\n*/, '\n');

            // 正确的缩进字符串
            var ruleShouldIndentStr = '';
            for (var q = 0; q <= index; q++) {
                ruleShouldIndentStr += indentStr;
            }

            // console.warn('---' + ruleShouldIndentStr + '---');
            // console.warn();
            // console.warn('---' + ruleBefore.replace(/\n/g, '') + '---');
            // console.log(ruleBefore === '\n' + ruleShouldIndentStr);
            if (ruleBefore !== '\n' + ruleShouldIndentStr) {
                addWarn(rule, result,
                    getMsg(ruleBefore.replace(/\n/g, '').slice(0, -1), ruleShouldIndentStr.slice(0, -1))
                );
            }

            // 处理 arRule 里面的 decl，其实这里用 rule.eachDecl 也可以
            ar.eachDecl(function (decl) {
                if (!isValidVendorProp(decl, result)) {
                    return;
                }

                if (prefixList.indexOf(decl.prop) > -1) {
                    return;
                }

                var before = decl.before;
                // 把 before 里面的多个空行换成一个，便于之后的计算
                before = before.replace(/\n*/, '\n');

                // 正确的缩进字符串
                var shouldIndentStr = '';
                // 属性时 index 要加 1，因为这个 index 是 rule 的 index，而属性和 rule 之间要有一个缩进
                for (var i = 0; i <= index + 1; i++) {
                    shouldIndentStr += indentStr;
                }

                var length = before.length;
                var hackPrefixChar = before[length - 1];
                if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                    shouldIndentStr += hackPrefixChar;
                }

                // console.warn('---' + shouldIndentStr + '---');
                // console.warn();
                // console.warn('---' + before.replace(/\n/g, '') + '---');
                // console.log(before === '\n' + shouldIndentStr);
                if (before !== '\n' + shouldIndentStr) {
                    addWarn(decl, result,
                        getMsg(before.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                    );
                }
            });
        }
    });
}

/**
 * 对 atRuleList 的处理，上下文是 css.eachRule 里的 rule
 *
 * @param {Object} ar atRule 对象
 * @param {number} index atRule 对象在 atRuleList 中的索引
 */
// function atRuleListHandler(ar, index) {
//     var arBefore = ar.before;
//     // 把 arBefore 里面的多个空行换成一个，便于之后的计算
//     arBefore = arBefore.replace(/\n*/, '\n');

//     var startCol = ar.source.start.column;

//     // 判断第一行，只需要看开头的 col 是否等于 startPos
//     if (index === 0) {
//         if (startCol - 1 !== startPos) {
//             addWarn(ar, result, getMsg(arBefore.replace(/\n/g, ''), ''));
//         }
//     }
//     // 非第一行的 @ 选择器，那么开头就必须有缩进，缩进根据 indentStr 来计算
//     else {
//         // 正确的缩进字符串
//         var shouldIndentStr = '';
//         for (var i = 0; i < index; i++) {
//             shouldIndentStr += indentStr;
//         }

//         // console.warn('---' + shouldIndentStr + '---');
//         // console.warn();
//         // console.warn('---' + arBefore.replace(/\n/g, '') + '---');
//         // console.log(arBefore === '\n' + shouldIndentStr);
//         if (arBefore !== '\n' + shouldIndentStr) {
//             addWarn(ar, result,
//                 getMsg(arBefore.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
//             );
//         }
//     }

//     // 最后一个 @ 选择器，在这里处理 arRule 里的 decl 以及 arRule 里的 rule
//     if (index === atRuleList.length - 1) {
//         var rule = this;
//         var ruleBefore = rule.before;
//         // 把 ruleBefore 里面的多个空行换成一个，便于之后的计算
//         ruleBefore = ruleBefore.replace(/\n*/, '\n');

//         // 正确的缩进字符串
//         var ruleShouldIndentStr = '';
//         for (var q = 0; q <= index; q++) {
//             ruleShouldIndentStr += indentStr;
//         }

//         // console.warn('---' + ruleShouldIndentStr + '---');
//         // console.warn();
//         // console.warn('---' + ruleBefore.replace(/\n/g, '') + '---');
//         // console.log(ruleBefore === '\n' + ruleShouldIndentStr);
//         if (ruleBefore !== '\n' + ruleShouldIndentStr) {
//             addWarn(rule, result,
//                 getMsg(ruleBefore.replace(/\n/g, '').slice(0, -1), ruleShouldIndentStr.slice(0, -1))
//             );
//         }

//         // 处理 arRule 里面的 decl，其实这里用 rule.eachDecl 也可以
//         ar.eachDecl(function (decl) {
//             if (!isValidVendorProp(decl, result)) {
//                 return;
//             }

//             if (prefixList.indexOf(decl.prop) > -1) {
//                 return;
//             }

//             var before = decl.before;
//             // 把 before 里面的多个空行换成一个，便于之后的计算
//             before = before.replace(/\n*/, '\n');

//             // 正确的缩进字符串
//             var shouldIndentStr = '';
//             // 属性时 index 要加 1，因为这个 index 是 rule 的 index，而属性和 rule 之间要有一个缩进
//             for (var i = 0; i <= index + 1; i++) {
//                 shouldIndentStr += indentStr;
//             }

//             var length = before.length;
//             var hackPrefixChar = before[length - 1];
//             if (hackPrefixChar === '_' || hackPrefixChar === '*') {
//                 shouldIndentStr += hackPrefixChar;
//             }

//             // console.warn('---' + shouldIndentStr + '---');
//             // console.warn();
//             // console.warn('---' + before.replace(/\n/g, '') + '---');
//             // console.log(before === '\n' + shouldIndentStr);
//             if (before !== '\n' + shouldIndentStr) {
//                 addWarn(decl, result,
//                     getMsg(before.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
//                 );
//             }
//         });
//     }
// }

/**
 * 判断是否是合法的带前缀的 css 属性名称
 *
 * @param {Object} decl postcss 节点对象
 * @param {Object} result postcss result 对象
 *
 * @return {boolean} 结果
 */
function isValidVendorProp(decl, result) {
    var prop = decl.prop;
    var standardProperty = prop.replace(/^\-(webkit|moz|ms|o)\-/g, '');
    // 标准模式在 prefixList 中，那么如果 propertyName 不在 prefixList 中
    // 即这个属性用错了，例如 -o-animation
    if (prefixList.indexOf(standardProperty) > -1) {
        if (prefixList.indexOf(prop) <= -1) {
            return false;
        }
    }
    return true;
}

var lineCache = 0;

/**
 * 对 decl 的处理
 *
 * @param {Object} node node 对象，可能是 decl 也可能是 rule
 * @param {Object} result postcss 转换的结果对象
 * @param {string} msg 错误信息
 * @param {string} hackPrefixChar 属性 hack 的前缀，`_` 或者 `*`
 */
function addWarn(node, result, msg, hackPrefixChar) {
    var source = node.source;
    var line = source.start.line;
    if (lineCache !== line) {
        lineCache = line;
        var col = source.start.column;

        var lineContent = util.getLineContent(line, source.input.css) || '';
        var colorStr = '';

        if (node.selector) {
            colorStr = node.selector;
        }
        else if (node.type === 'atrule') {
            colorStr = lineContent;
        }
        else {
            colorStr = (hackPrefixChar || '') + node.prop + node.between + node.value;
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
}
