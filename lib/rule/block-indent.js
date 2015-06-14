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
 *
 * @return {string} 错误信息
 */
function getMsg(indentStr) {
    var str = indentStr === '\t' ? '\\t' : (indentStr.length + ' spaces');
    return 'Use `' + str + '` as an indent level.';
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

        if (opts.ruleVal) {
            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var parent = decl.parent;
                var parentParent = parent.parent;
                if (parentParent && parentParent.type === 'atrule') {
                    return;
                }

                if (!isValidVendorProp(decl, result)) {
                    return;
                }

                var prop = decl.prop;

                if (prefixList.indexOf(prop) > -1) {
                    return;
                }

                var indentIndex = indentStr.length + startPos;

                var before = decl.before;
                // 把 before 里面的多个空行换成一个，便于之后的计算
                before = before.replace(/\n*/, '\n');

                var length = before.length;
                var hackPrefixChar = before[length - 1];

                // for `_` and `*` hack
                if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                    indentIndex += 1;
                }

                if (before[0] !== '\n' || length !== indentIndex + 1) {
                    addWarn(decl, result, hackPrefixChar, getMsg(indentStr, startPos));
                }
            });

            css.eachAtRule(function (atRule) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                atRule.eachDecl(function (atRuleDecl) {
                    if (!isValidVendorProp(atRuleDecl, result)) {
                        return;
                    }

                    var prop = atRuleDecl.prop;

                    if (prefixList.indexOf(prop) > -1) {
                        return;
                    }

                    // 这里 atRuleDecl.parent.parent.name 为 media 以及 keyframes 一起处理
                    var indentIndex = indentStr.length + startPos;

                    var curDecl = atRuleDecl;
                    while (curDecl.parent.parent.type === 'atrule') {
                        indentIndex += indentStr.length;
                        curDecl = curDecl.parent;
                    }

                    var before = atRuleDecl.before;
                    // 把 before 里面的多个空行换成一个，便于之后的计算
                    before = before.replace(/\n*/, '\n');

                    var length = before.length;
                    var hackPrefixChar = before[length - 1];

                    // for `_` and `*` hack
                    if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                        indentIndex += 1;
                    }

                    // atRuleDecl.before = '\n        '，第一个是 \n
                    if (before[0] !== '\n' || length !== indentIndex + 1) {
                        addWarn(atRuleDecl, result, hackPrefixChar, getMsg(indentStr, startPos));
                    }
                });
            });
        }
    };
});

/**
 * 判断是否是合法的 css 属性名称
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
 * @param {Object} decl decl 对象
 * @param {Object} result postcss 转换的结果对象
 * @param {string} hackPrefixChar 属性 hack 的前缀，`_` 或者 `*`
 * @param {string} msg 错误信息
 */
function addWarn(decl, result, hackPrefixChar, msg) {
    var source = decl.source;
    var line = source.start.line;
    if (lineCache !== line) {
        lineCache = line;
        var col = source.start.column;

        var lineContent = util.getLineContent(line, source.input.css) || '';
        var colorStr = (hackPrefixChar || '') + decl.prop + decl.between + decl.value;
        colorStr = colorStr.replace(/\n/g, '');

        result.warn(RULENAME, {
            node: decl,
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
