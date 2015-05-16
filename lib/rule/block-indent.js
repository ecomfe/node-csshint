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
// var prefixMap = prefixes.getPrefixMap();
// console.warn(prefixMap);


/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'block-indent';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Use `4` spaces as an indent level. Use `2` spaces or `tab` character is not allowed';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
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

                var indentIndex = 4;
                var length = decl.before.length;
                var hackPrefixChar = decl.before[length - 1];

                // for `_` and `*` hack
                if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                    indentIndex += 1;
                }

                if (decl.before[0] !== '\n' || length !== indentIndex + 1) {
                    addWarn(decl, result, hackPrefixChar);
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
                    var indentIndex = 4;
                    var curDecl = atRuleDecl;
                    while (curDecl.parent.type !== 'atrule') {
                        indentIndex += 4;
                        curDecl = curDecl.parent;
                    }

                    var length = atRuleDecl.before.length;
                    var hackPrefixChar = atRuleDecl.before[length - 1];

                    // for `_` and `*` hack
                    if (hackPrefixChar === '_' || hackPrefixChar === '*') {
                        indentIndex += 1;
                    }

                    // atRuleDecl.before = '\n        '，第一个是 \n
                    if (atRuleDecl.before[0] !== '\n' || atRuleDecl.before.length !== indentIndex + 1) {
                        addWarn(atRuleDecl, result, hackPrefixChar);
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

/**
 * 对 decl 的处理
 *
 * @param {Object} decl decl 对象
 * @param {Object} result postcss 转换的结果对象
 * @param {string} hackPrefixChar 属性 hack 的前缀，`_` 或者 `*`
 */
function addWarn(decl, result, hackPrefixChar) {
    var source = decl.source;
    var line = source.start.line;
    var col = source.start.column;

    var lineContent = util.getLineContent(line, source.input.css) || '';
    var colorStr = (hackPrefixChar || '') + decl.prop + decl.between + decl.value;
    colorStr = colorStr.replace(/\n/g, '');

    result.warn(msg, {
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
