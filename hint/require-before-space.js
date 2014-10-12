/**
 * @file require-before-space 的检测逻辑
 *       `{` 对应 003: [强制] `选择器` 与 `{` 之间必须包含空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg = 'between the selector and `{` must contain spaces';

/**
 * 检测字符前面是否有空格
 *
 * @param {string} c 待检测的字符
 */
function checkBeforeSpace(c, fileContent) {
    var ret = [];
    var noBeforeSpacePattern = new RegExp('\\w*[^\\s](' + c + ')', 'gm');
    var match = null;
    while (!!(match = noBeforeSpacePattern.exec(fileContent))) {
        ret.push({
            i: match.index,
            v: match[1],
            colorV: match[0]
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
    // require-before-space 对应的配置是数组
    if (Array.isArray(ruleVal)) {
        for (var i = 0, len = ruleVal.length; i < len; i++) {
            ret.push(checkBeforeSpace(ruleVal[i], fileContent));
        }
    }
    else {
        ret.push(checkBeforeSpace(ruleVal, fileContent));
    }

    for (var i = 0, len = ret.length; i < len; i++) {
        for (var j = 0, jLen = ret[i].length; j < jLen; j++) {
            var line = util.getLine(ret[i][j].i, fileContent);
            invalidList.push({
                ruleName: ruleName,
                line: line,
                col: ret[i][j].i,
                errorChar: ret[i][j].v,  // 出错的那个具体的字符
                message: '`'
                    + ret[i][j].colorV
                    + '` '
                    + msg,
                colorMessage: '`'
                    + chalk.magenta(
                        ret[i][j].colorV
                    )
                    + '` '
                    + chalk.grey(msg)
            });
        }
    }

    return invalidList;
};
