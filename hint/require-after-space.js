/**
 * @file require-after-space 的检测逻辑
 *       `:` 对应 004: [强制] `属性名` 与之后的 `:` 之间不允许包含空格， `:` 与 `属性值` 之间必须包含空格。
 *       `,` 对应 005: [强制] `列表型属性值` 书写在单行时，`,` 后必须跟一个空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty11(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var parts = event.value.parts;
    var len = parts.length;

    for (var i = 0; i < len; i++) {
        var part = parts[i];
        if (part.type === 'operator') {
            var nextPart = parts[i + 1];
            var col = part.col;
            if ((nextPart.col - col) <= 1) {
                var line = part.line;
                var lineContent = util.getLineContent(line, fileContent);
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    errorChar: ',',
                    message: '`'
                        + lineContent
                        + '` '
                        + 'Must contain spaces after the `,`',
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, part.text)
                        + '` '
                        + chalk.grey('Must contain spaces after the `,`')
                });
            }
        }
    }
}


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

    var parts = event.value.parts;
    var len = parts.length;
    var match = null;
    for (var i = 0; i < len; i++) {
        var part = parts[i];
        var lineContent = util.getLineContent(part.line, fileContent);
        var items = lineContent.split(';');
        for (var j = 0, jLen = items.length; j < jLen; j++) {
            var s = items[j];
            if (s.indexOf(':') > -1 && !/.*[^\s]:\s+/.test(s)) {
                invalidList.push({
                    ruleName: ruleName,
                    line: part.line,
                    errorChar: ':',
                    message: '`'
                        + lineContent
                        + '` '
                        + 'Disallow contain spaces between the `attr-name` and `:`, '
                        + 'Must contain spaces between `:` and `attr-value`',
                    colorMessage: '`'
                        + lineContent.replace(s, chalk.magenta(s))
                        + '` '
                        + chalk.grey(''
                            + 'Disallow contain spaces between the `attr-name` and `:`, '
                            + 'Must contain spaces between `:` and `attr-value`'
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
            ruleVal: realRuleVal,
            invalidList: invalidList
        })
    );



    console.log(realRuleVal);

    // 暂时先只处理 `,`
    // if (realRuleVal.indexOf(',') !== -1) {
    //     parser.addListener(
    //         'property',
    //         checkProperty.bind({
    //             parser: parser,
    //             fileContent: fileContent,
    //             ruleName: ruleName,
    //             ruleVal: realRuleVal,
    //             invalidList: invalidList
    //         })
    //     );
    // }

    return invalidList;
};
