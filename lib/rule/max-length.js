/**
 * @file max-length 的检测逻辑
 *       006: [强制] 每行不得超过 `120` 个字符，除非单行不可分割。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');

var excludeLines = [];

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {

    var parts = event.value.parts;
    var len = parts.length;

    for (var i = 0; i < len; i++) {
        var part = parts[i];
        if (part.type === 'uri') {
            excludeLines.push(part.line);
        }
    }
}

/**
 * endstylesheet 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 * endstylesheet 本质上没有特殊的意义
 * 可以看作是 css 文件 parser 完毕后的一个回调
 *
 * 后续可以统计 !impartant 个数
 *
 * @param {Object} event 事件对象
 */
function endstylesheetFunc(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var ruleVal = me.ruleVal;
    var invalidList = me.invalidList;

    // 前面已经将换行符统一处理成 `\n` 了
    var lines = fileContent.split(/\n/);
    for (var i = 0, len = lines.length; i < len; i++) {
        if (lines[i].length > ruleVal
            && excludeLines.indexOf(i + 1) === -1
        ) {
            invalidList.push({
                line: i + 1,
                ruleName: ruleName,
                message: ''
                    + 'Each line must not be greater than ' + ruleVal + ' characters',
                colorMessage: ''
                    + chalk.grey('Each line must not be greater than ' + ruleVal + ' characters')
            });
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

    if (!ruleVal || isNaN(ruleVal)) {
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

    parser.addListener(
        'endstylesheet',
        endstylesheetFunc.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
