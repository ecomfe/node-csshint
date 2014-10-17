/**
 * @file disallow-named-color 的检测逻辑
 *       031: [强制] 颜色值不允许使用命名色值。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');
var colors = require('../lib/colors');

var msg = 'Color values using named color value is not allowed';

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

    // console.log(event.value.toString());
    // console.log(colors);
    for (var i = 0; i < len; i++) {
        var part = parts[i];
        if (part.type === 'color') {
            var text = part.text.toLowerCase();
            if (colors.hasOwnProperty(text)) {
                var line = part.line;
                var lineContent = util.getLineContent(line, fileContent);
                var col = part.col;
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    errorChar: ';',
                    message: '`'
                        + lineContent
                        + '` '
                        + msg,
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, part.text)
                        + '` '
                        + chalk.grey(msg)
                });
            }
            // console.log(colors.hasOwnProperty(text));
            // console.log(part, text);
        }
    }

    // for (var i = 0; i < len; i++) {
    //     var part = parts[i];
    //     if (
    //         (part.units || part.type === 'percentage')
    //         && part.value === 0
    //         && part.type !== 'time'
    //     ) {
    //         var line = part.line;
    //         var lineContent = util.getLineContent(line, fileContent);
    //         var col = part.col;

    //         invalidList.push({
    //             ruleName: ruleName,
    //             line: line,
    //             col: col,
    //             errorChar: ';',
    //             message: '`'
    //                 + lineContent
    //                 + '` '
    //                 + msg,
    //             colorMessage: '`'
    //                 + util.changeColorByIndex(lineContent, col, part.text)
    //                 + '` '
    //                 + chalk.grey(msg)
    //         });
    //     }
    // }

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
