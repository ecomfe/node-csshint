/**
 * @file unifying-color-case-sensitive 的检测逻辑
 *       032: [建议] 颜色值中的英文字符采用小写。如不用小写也需要保证同一项目内保持大小写一致。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');

var msg = ''
    + 'The color value of the small English character. '
    + 'If no lower case also need to ensure that the same project to keep the same case';

/**
 * 大小写标志位，同一项目要统一
 * 0: 小写
 * 1: 大写
 *
 * @type {number}
 */
var caseFlag;

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
        var text = part.text;

        // 是颜色并且是 hexColor
        if (part.type === 'color'
            && /^#([a-fA-Z0-9]{3,6})/.test(text)
            && !/^#([0-9]{3,6})/.test(text) // 排除掉 #000 纯数字的情况
        ) {
            var line = part.line;
            var lineContent = util.getLineContent(line, fileContent);
            var col = part.col;

            // 当前这个颜色值里的字母全是小写 #fafafa
            if (/^#([a-z0-9]{3,6})$/.test(text)) {
                if (caseFlag === undefined) {
                    caseFlag = 0;
                }
                // 说明之前已经检测过的颜色值里面的字母应该是大写
                if (caseFlag === 1) {
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: col,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg
                            + ', Current project case is Upper Case',
                        colorMessage: '`'
                            + util.changeColorByIndex(lineContent, col, text)
                            + '` '
                            + chalk.grey(
                                msg + ', Current project case is Upper Case'
                            )
                    });
                }
            }
            // 当前这个颜色值里面的字母全是大写 #FAFAFA
            else if (/^#([A-Z0-9]{3,6})$/.test(text)) {
                if (caseFlag === undefined) {
                    caseFlag = 1;
                }
                // 说明之前已经检测过的颜色值里面的字母应该是大写
                if (caseFlag === 0) {
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: col,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg
                            + ', Current project case is Lower Case',
                        colorMessage: '`'
                            + util.changeColorByIndex(lineContent, col, text)
                            + '` '
                            + chalk.grey(
                                msg + ', Current project case is Lower Case'
                            )
                    });
                }
            }
            // 当前这个颜色值里面的字母有大写也有小写 #faFafA
            else {
                var str = msg;
                if (caseFlag === 0) {
                    str += ', Current project case is Lower Case';
                }
                else if (caseFlag === 1) {
                    str += ', Current project case is Upper Case';
                }
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    message: '`'
                        + lineContent
                        + '` '
                        + str,
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col, text)
                        + '` '
                        + chalk.grey(
                            str
                        )
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
 *
 * @return {Array.<Object>} 不合法文件集合
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
