/**
 * @file vendor-prefixes-sort 的检测逻辑
 *       046: [强制] 带私有前缀的属性由长到短排列，按冒号位置对齐。
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
var RULENAME = 'vendor-prefixes-sort';

/**
 * 错误信息，带私有前缀的属性按冒号位置对齐
 *
 * @type {string}
 */
var colonMsg = 'Property with private prefix should be according to the colon position alignment';

/**
 * 错误信息，带私有前缀的属性由长到短排列
 *
 * @type {string}
 */
var shortMsg = 'Property with private prefix from long to short arrangement';

var countMap = {};

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal) {
            return;
        }

        countMap = {};

        css.eachDecl(function (decl) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }
            if (!isValidVendorProp(decl, result)) {
                return;
            }
        });

        for (var selector in countMap) {
            if (!countMap.hasOwnProperty(selector)) {
                continue;
            }

            for (var j in countMap[selector]) {
                if (!countMap[selector].hasOwnProperty(j)) {
                    continue;
                }
                var maxLength = 0;
                var firstColonIndex = 0;
                for (var i = 0, len = countMap[selector][j].length; i < len; i++) {
                    var item = countMap[selector][j][i];
                    var prop = item.prop;

                    if (countMap[selector][prop.replace(/^\-(webkit|moz|ms|o)\-/g, '')].length <= 1) {
                        continue;
                    }

                    var source = item.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);

                    var length = prop.length;

                    // 第一个
                    if (maxLength === 0) {
                        maxLength = length;
                        firstColonIndex = lineContent.indexOf(':') + 1;
                    }

                    var curColonIndex = lineContent.indexOf(':') + 1;
                    if (firstColonIndex !== curColonIndex) {
                        result.warn(RULENAME, {
                            node: item,
                            ruleName: RULENAME,
                            line: line,
                            message: '`'
                                + lineContent
                                + '` '
                                + colonMsg,
                            colorMessage: '`'
                                + chalk.magenta(lineContent)
                                + '` '
                                + chalk.grey(colonMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }

                    if (maxLength < length) {
                        result.warn(RULENAME, {
                            node: item,
                            ruleName: RULENAME,
                            line: line,
                            message: '`'
                                + lineContent
                                + '` '
                                + shortMsg,
                            colorMessage: '`'
                                + chalk.magenta(lineContent)
                                + '` '
                                + chalk.grey(shortMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
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
        // 按选择器分组
        var selector = decl.parent.selector;
        var parent = decl.parent;

        while (parent.type !== 'root') {
            parent = parent.parent || {};
            if (parent.type === 'atrule') {
                selector += '-in-atrule-' + (parent.name || '');
            }
        }

        if (!countMap[selector]) {
            countMap[selector] = {};
        }
        var tmp = countMap[selector];

        if (!tmp[standardProperty]) {
            tmp[standardProperty] = [];
        }
        tmp[standardProperty].push(decl);
    }
    return true;
}
