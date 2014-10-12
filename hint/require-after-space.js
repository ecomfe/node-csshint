/**
 * @file require-after-space 的检测逻辑
 *       `:` 对应 004: [强制] `属性名` 与之后的 `:` 之间不允许包含空格， `:` 与 `属性值` 之间必须包含空格。
 *       `,` 对应 005: [强制] `列表型属性值` 书写在单行时，`,` 后必须跟一个空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg1 = 'Don\'t contain spaces before the `:` and must contain spaces after the `:`';
var msg2 = 'Must contain spaces after the `,`';

function showMsg(c, type) {
    if (type === 1) {
        return ''
            + 'Don\'t contain spaces before the `'
            + c
            + '` and must contain spaces after the `'
            + c
            +'`';
    }
    else {
        return ''
            + 'Must contain spaces after the `'
            + c
            + '`';
    }
}

/**
 * 检测字符前面是否有空格
 *
 * @param {string} c 待检测的字符
 */
function checkBeforeSpace(c, fileContent) {
    var ret = [];
    var beforeSpacePattern = new RegExp('[^\\s]*\\s+(' + c + ')', 'gm');
    var match = null;
    while (!!(match = beforeSpacePattern.exec(fileContent))) {
        ret.push({
            i: match.index,
            v: match[1],
            matchStr: match[0]
        });
    }
    return ret;
}

/**
 * `:`后面要排除的
 * 伪类，伪元素，`:`，以及 url 协议后面的 `//`
 *
 * @type {string}
 */
var excepts = ''
    + 'active|focus|hover|link|visited|first-child|lang|'
    + 'first-letter|first-line|before|after|'
    + '\\/\\/';

/**
 * 检测字符后面是否有空格
 *
 * @param {string} c 待检测的字符
 */
function checkAfterSpace(c, fileContent) {
    var ret = [];
    // var afterSpacePattern = new RegExp('[^\\s].*(' + c + ')[^\\s]*\\b', 'gm');
    var afterSpacePattern;
    if (c === ':') {
        afterSpacePattern = new RegExp('[^\\s].*(' + c + ')(:?!(' + excepts + '))[^\\s]*\\b', 'gm');
    }
    else {
        afterSpacePattern = new RegExp('[^\\s].*(' + c + ')[^\\s]*\\b', 'gm');
    }
    var match = null;
    while (!!(match = afterSpacePattern.exec(fileContent))) {
        var matchStr = match[0];
        ret.push({
            i: match.index,
            v: match[1],
            matchStr: match[0]
        });
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
 */
module.exports = function (parser, fileContent, ruleName, ruleVal, invalidList) {

    var ret = [];

    var beforeSpaceRet = [];
    var afterSpaceRet = [];

    // require-before-space 对应的配置是数组
    if (Array.isArray(ruleVal)) {
        for (var i = 0, len = ruleVal.length; i < len; i++) {
            beforeSpaceRet.push(checkBeforeSpace(ruleVal[i], fileContent));
            afterSpaceRet.push(checkAfterSpace(ruleVal[i], fileContent));
        }
    }
    else {
        beforeSpaceRet.push(checkBeforeSpace(ruleVal, fileContent));
        afterSpaceRet.push(checkAfterSpace(ruleVal, fileContent));
    }

    for (var i = 0, len = beforeSpaceRet.length; i < len; i++) {
        for (var j = 0, jLen = beforeSpaceRet[i].length; j < jLen; j++) {
            var line = util.getLine(beforeSpaceRet[i][j].i, fileContent);
            var matchStr = beforeSpaceRet[i][j].matchStr;
            var matchV = beforeSpaceRet[i][j].v;
            invalidList.push({
                ruleName: ruleName,
                line: line,
                col: beforeSpaceRet[i][j].i,
                errorChar: matchV,  // 出错的那个具体的字符
                message: '`'
                    + matchStr
                    + '` '
                    + showMsg(matchV, 1),
                colorMessage: '`'
                    + chalk.magenta(matchStr)
                    // + matchStr.replace(
                    //     matchV,
                    //     chalk.magenta(matchV)
                    // )
                    + '` '
                    + chalk.grey(showMsg(matchV, 1))
            });
        }
    }

    for (var i = 0, len = afterSpaceRet.length; i < len; i++) {
        for (var j = 0, jLen = afterSpaceRet[i].length; j < jLen; j++) {
            var line = util.getLine(afterSpaceRet[i][j].i, fileContent);
            var matchStr = afterSpaceRet[i][j].matchStr;
            var matchV = afterSpaceRet[i][j].v;
            invalidList.push({
                ruleName: ruleName,
                line: line,
                col: afterSpaceRet[i][j].i,
                errorChar: matchV,  // 出错的那个具体的字符
                message: '`'
                    + matchStr
                    + '` '
                    + showMsg(matchV, 2),
                colorMessage: '`'
                    + chalk.magenta(matchStr)
                    // + matchStr.replace(
                    //     matchV,
                    //     chalk.magenta(matchV)
                    // )
                    + '` '
                    + chalk.grey(showMsg(matchV, 2))
            });
        }
    }

    // console.warn(beforeSpaceRet);
    // console.log();
    // console.log(afterSpaceRet);
    return invalidList;
};
