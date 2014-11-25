/**
 * @file block-indent 的检测逻辑
 *       002: [强制] 使用 `4` 个空格做为一个缩进层级，不允许使用 `2` 个空格 或 `tab` 字符。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');
var prefixes = require('../prefixes');
var prefixList = prefixes.getPrefixList();

/**
 * tab 字符的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_TAB = 9;

/**
 * 空格的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_SPACE = 32;

/**
 * 换行的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_LF = 10;

/**
 * 回车的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_CR = 13;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Use `4` spaces as an indent level. Use `2` spaces or `tab` character is not allowed';

/**
 * 字符串转为 ascii 码
 *
 * @param {string} str 待转换的字符串
 *
 * @return {Array} ascii 码集合
 */
function string2Ascii(str) {
    var ret = [];
    for (var i = 0, len = str.length; i < len; i++) {
        ret.push(str[i].charCodeAt());
    }
    return ret;
}

/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {string} ruleName 当前检测的规则名称
 * @param {string} ruleVal 当前检测规则对应的配置值
 * @param {Array.<Object>} invalidList 不合法文件集合
 *
 * @return {Array.<Object>} 不合法文件集合
 */
module.exports = function (parser, fileContent, ruleName, ruleVal, invalidList) {

    if (!ruleVal) {
        return invalidList;
    }

    var asciiList = string2Ascii(fileContent);
    var length = asciiList.length;

    // 空格连续出现的次数
    var spaceCount = 0;

    // 前一个字符是否是空格的标识
    var prevAsciiIsSpace = false;

    for (var i = 0; i < length; i++) {
        var ascii = asciiList[i];
        var nextAscii = asciiList[i + 1];

        var line;
        var lineContent;
        var r;
        var colorStr;

        // 说明当前这个字符是换行或者回车
        if (ascii === ASCII_CODE_LF || ascii === ASCII_CODE_CR) {
            if (nextAscii === ASCII_CODE_TAB) {
                line = util.getLine(i + 1, fileContent);
                lineContent = util.getLineContent(line, fileContent);
                /\s*(.*):.*/g.test(lineContent);
                r = RegExp.$1;
                if (prefixList.indexOf(r) > -1) {
                    return;
                }
                colorStr = String.fromCharCode(nextAscii) + lineContent;
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    message: '`'
                        + colorStr
                        + '` '
                        + msg,
                    colorMessage: '`'
                        + chalk.magenta(
                            colorStr
                        )
                        + '` '
                        + chalk.grey(msg)
                });
            }

            if (nextAscii === ASCII_CODE_SPACE) {
                spaceCount++;
                prevAsciiIsSpace = true;
            }
        }

        if (ascii === ASCII_CODE_SPACE && prevAsciiIsSpace) {
            if (nextAscii !== ASCII_CODE_SPACE) {
                if (spaceCount !== 4) {
                    line = util.getLine(i + 1, fileContent);
                    lineContent = util.getLineContent(line, fileContent);
                    /\s*(.*):.*/g.test(lineContent);
                    r = RegExp.$1;
                    if (prefixList.indexOf(r) > -1) {
                        return;
                    }

                    colorStr = String.fromCharCode(ascii) + lineContent;
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        message: '`'
                            + colorStr
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + chalk.magenta(
                                colorStr
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                }
                spaceCount = 0;
                prevAsciiIsSpace = false;
            }
            else {
                spaceCount++;
            }
        }

    }

    return invalidList;
};
