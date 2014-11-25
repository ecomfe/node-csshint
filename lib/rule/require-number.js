/**
 * @file require-number 的检测逻辑
 *       `font-weight` 对应 039: [强制] `font-weight` 属性必须使用数值方式描述。
 *       `line-height` 对应 040: [建议] `line-height` 在定义文本段落时，应使用数值。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');

var msg = ' must be a number value';

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
    var ruleVal = me.ruleVal;
    var invalidList = me.invalidList;

    var propertyName = event.property.text;
    if (ruleVal.indexOf(propertyName) !== -1) {
        var propertyVal = event.value.text;
        if (isNaN(propertyVal)) {
            var parts = event.value.parts;
            var len = parts.length;
            for (var i = 0; i < len; i++) {
                var part = parts[i];
                if (part.type !== 'percentage') {
                    var line = event.line;
                    var lineContent = util.getLineContent(line, fileContent);
                    var col = event.value.col;
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: col,
                        errorChar: propertyName,
                        message: '`'
                            + lineContent
                            + '` '
                            + propertyName
                            + msg,
                        colorMessage: '`'
                            + util.changeColorByIndex(lineContent, col - 1, propertyVal)
                            + '` '
                            + chalk.grey(
                                propertyName + msg
                            )
                    });
                }
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

    // ruleVal 可能是字符串，所以这里判断下，放入到 realRuleVal 数组中
    var realRuleVal = [];

    if (!Array.isArray(ruleVal)) {
        realRuleVal.push(ruleVal);
    }
    else {
        realRuleVal = realRuleVal.concat(ruleVal);
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
