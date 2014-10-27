/**
 * @file max-selector-nesting-level 的检测逻辑
 *       014: [建议] 选择器的嵌套层级应不大于 3 级，位置靠后的限定条件应尽可能精确。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

/**
 * 设置错误消息
 *
 * @param {number} level 层级数量
 */
function setMsg(level) {
    return ''
        + 'A nested hierarchy selector should be no more than '
        + level
        + ' levels';
}

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startRule(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var ruleVal = me.ruleVal;
    var invalidList = me.invalidList;

    var selectors = event.selectors;
    var len = selectors.length;

    var descendantCount = 0;
    var childCount = 0;

    var invalidObj;
    for (var i = 0; i < len; i++) {
        var selector = selectors[i];
        var parts = selector.parts;
        var partsLen = parts.length;

        for (var j = 0; j < partsLen; j++) {
            var part = selector.parts[j];
            if (part.type === 'descendant') {
                descendantCount++;
                if (descendantCount >= ruleVal - 1) {
                    invalidObj = selector;
                }
            }
            else if (part.type === 'child') {
                childCount++;
                if (childCount >= ruleVal - 1) {
                    invalidObj = selector;
                }
            }
        }
    }

    if (invalidObj) {
        var line = invalidObj.line;
        var col = invalidObj.col;
        var lineContent = util.getLineContent(invalidObj.line, fileContent);
        var msg = setMsg(ruleVal);
        invalidList.push({
            ruleName: ruleName,
            line: line,
            col: col,
            message: '`'
                + lineContent
                + '` '
                + msg,
            colorMessage: '`'
                + util.changeColorByIndex(lineContent, col - 1, lineContent)
                + '` '
                + chalk.grey(
                    msg
                )
        });
    }
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

    if (!ruleVal || isNaN(ruleVal)) {
        return invalidList;
    }

    parser.addListener(
        'startrule',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
