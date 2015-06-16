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
 * @param {string} indentStr 缩进的字符串
 * @param {number} startPos 缩进开始的偏移
 *
 * @return {string} 错误信息
 */
function getMsg(indentStr, startPos) {
    var str = indentStr === '\t' ? '\\t' : (indentStr.length + ' spaces');
    // return 'Bad indentation ({{gotten}} instead {{needed}})';
    return 'Bad indentation (indentation will be ' + str + '), the indentation start position is ' + startPos;
}

function getMsg1(curIndentStr, neededIndentStr) {
    return 'Bad indentation (`' + curIndentStr + '` instead `' + neededIndentStr + '`)';
}

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal || !Array.isArray(opts.ruleVal)) {
            return;
        }

        // 缩进的字符串
        var indentStr = opts.ruleVal[0];

        // 开始计算缩进的偏移量，相当于这一行的 column，和 opts.ruleVal[0] 没有关系
        var startPos = opts.ruleVal[1];

        css.eachRule(function (rule) {
            var parentRule = rule.parent;
            var atRuleList = [];
            while (parentRule.type === 'atrule') {
                atRuleList.unshift(parentRule);
                parentRule = parentRule.parent;
            }

            if (atRuleList.length) {
                atRuleList.forEach(function (ar, index) {
                    var startCol = ar.source.start.column;
                    // 判断第一行，只需要看开头的 col 是否等于 startPos
                    if (index === 0) {
                        if (startCol - 1 !== startPos) {
                            addWarn(ar, result, getMsg1(ar.before.replace(/\n/g, ''), ''));
                        }
                    }
                    // 非第一行，那么就要结合缩进 indentStr 来判断
                    else {
                        var before = ar.before;
                        // 把 before 里面的多个空行换成一个，便于之后的计算
                        before = before.replace(/\n*/, '\n');

                        // 正确的缩进字符串
                        var shouldIndentStr = '';
                        for (var i = 0; i < index; i++) {
                            shouldIndentStr += indentStr;
                        }

                        // console.warn('---' + shouldIndentStr + '---');
                        // console.warn();
                        // console.warn('---' + before.replace(/\n/g, '') + '---');
                        // console.log(before === '\n' + shouldIndentStr);
                        if (before !== '\n' + shouldIndentStr) {
                            addWarn(ar, result,
                                getMsg1(before.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                            );
                        }

                        // 最后一个 @ 选择器，在这里处理 decl
                        if (index === atRuleList.length - 1) {
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
                                        getMsg1(before.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                                    );
                                }
                            });
                        }
                    }
                });
            }
            // 说明当前这个选择器没有 @ rule
            else {
                var ruleStartCol = rule.source.start.column;
                if (ruleStartCol - 1 !== startPos) {
                    addWarn(rule, result, getMsg1(rule.before.replace(/\n/g, ''), ''));
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
                            getMsg1(declBefore.replace(/\n/g, '').slice(0, -1), shouldIndentStr.slice(0, -1))
                        );
                    }
                });
            }
        });

        // css.eachRule(function (rule) {
        //     var atruleCount = 0;
        //     var curRule = rule.parent;
        //     while (curRule.type === 'atrule') {
        //         curRule = curRule.parent;
        //         atruleCount++;
        //     }
        //     console.warn(rule);
        //     var startCol = rule.source.start.column;
        //     if (startCol - 1 !== startPos) {
        //         // addWarn(rule, result, getMsg(indentStr, startPos));
        //     }

        //     // 选择器中的属性默认的缩进层级为 1
        //     // var indentLevel = 1;
        //     // // console.warn(startCol - 1);
        //     // rule.eachDecl(function (decl) {
        //     //     var declBefore = decl.before;
        //     //     // 把 before 里面的多个空行换成一个，便于之后的计算
        //     //     declBefore = declBefore.replace(/\n*/, '\n');

        //     //     // 正确的缩进字符串
        //     //     var shouldIndentStr = '';
        //     //     for (var i = 0; i <= indentLevel; i++) {
        //     //         shouldIndentStr += indentStr;
        //     //     }

        //     //     var length = declBefore.length;
        //     //     var hackPrefixChar = declBefore[length - 1];
        //     //     if (hackPrefixChar === '_' || hackPrefixChar === '*') {
        //     //         shouldIndentStr += hackPrefixChar;
        //     //     }

        //     //     if (declBefore !== '\n' + shouldIndentStr) {
        //     //         addWarn(decl, result,
        //     //             ''
        //     //                 + 'Bad indentation (`'
        //     //                 + declBefore.replace(/\n/g, '').slice(0, -1) // 错误的
        //     //                 + '` instead `'
        //     //                 + shouldIndentStr.slice(0, -1) // 正确的
        //     //                 + '`)'
        //     //         );
        //     //     }
        //     // });
        // });


        // css.eachDecl(function (decl) {
        //     if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
        //         return;
        //     }

        //     var parent = decl.parent;
        //     var parentParent = parent.parent;
        //     if (parentParent && parentParent.type === 'atrule') {
        //         return;
        //     }

        //     if (!isValidVendorProp(decl, result)) {
        //         return;
        //     }

        //     var prop = decl.prop;

        //     if (prefixList.indexOf(prop) > -1) {
        //         return;
        //     }

        //     var indentIndex = indentStr.length + startPos;

        //     var before = decl.before;
        //     // 把 before 里面的多个空行换成一个，便于之后的计算
        //     before = before.replace(/\n*/, '\n');

        //     var length = before.length;
        //     var hackPrefixChar = before[length - 1];

        //     // for `_` and `*` hack
        //     if (hackPrefixChar === '_' || hackPrefixChar === '*') {
        //         indentIndex += 1;
        //     }

        //     if (before[0] !== '\n' || length !== indentIndex + 1) {
        //         addWarn(decl, result, getMsg(indentStr, startPos), hackPrefixChar);
        //     }
        // });

        // css.eachAtRule(function (atRule) {
        //     if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
        //         return;
        //     }

        //     atRule.eachDecl(function (atRuleDecl) {
        //         if (!isValidVendorProp(atRuleDecl, result)) {
        //             return;
        //         }

        //         var prop = atRuleDecl.prop;

        //         if (prefixList.indexOf(prop) > -1) {
        //             return;
        //         }

        //         // 这里 atRuleDecl.parent.parent.name 为 media 以及 keyframes 一起处理
        //         var indentIndex = indentStr.length + startPos;

        //         var curDecl = atRuleDecl;
        //         while (curDecl.parent.parent.type === 'atrule') {
        //             indentIndex += indentStr.length;
        //             curDecl = curDecl.parent;
        //         }

        //         var before = atRuleDecl.before;
        //         // 把 before 里面的多个空行换成一个，便于之后的计算
        //         before = before.replace(/\n*/, '\n');

        //         var length = before.length;
        //         var hackPrefixChar = before[length - 1];

        //         // for `_` and `*` hack
        //         if (hackPrefixChar === '_' || hackPrefixChar === '*') {
        //             indentIndex += 1;
        //         }

        //         // atRuleDecl.before = '\n        '，第一个是 \n
        //         if (before[0] !== '\n' || length !== indentIndex + 1) {
        //             addWarn(atRuleDecl, result, getMsg(indentStr, startPos), hackPrefixChar);
        //         }
        //     });
        // });
    };
});

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
 * @param {string} hackPrefixChar 属性 hack 的前缀，`_` 或者 `*`
 * @param {string} msg 错误信息
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
