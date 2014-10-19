/**
 * @file leading-zero 的检测逻辑
 *       025: [强制] 当数值为 0 - 1 之间的小数时，省略整数部分的 `0`。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg = 'When value is between 0 - 1 decimal, omitting the integer part of the `0`';

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var parts = event.value.parts;
    var len = parts.length;

    for (var i = 0; i < len; i++) {
        var part = parts[i];
        var value = part.value;
        if (!isNaN(value)
            && value > 0
            && value < 1
        ) {
            var text = part.text;
            if (text.slice(0, 1) === '0') {
                var line = part.line;
                var lineContent = util.getLineContent(line, fileContent);
                var col = part.col;
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    message: '`'
                        + lineContent
                        + '` '
                        + msg,
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, text.slice(0, 1))
                        + '` '
                        + chalk.grey(msg)
                });
            }
        }
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

    if (!ruleVal) {
        return invalidList;
    }

    parser.addListener(
        'property',
        checkProperty.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
