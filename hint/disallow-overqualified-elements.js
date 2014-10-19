/**
 * @file disallow-overqualified-elements 的检测逻辑
 *       013: [强制] 如无必要，不得为 `id`、`class` 选择器添加类型选择器进行限定。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg = 'Not allowed to add a type selector is limited to ID, class selector';

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startRule(event) {
    var me = this;
    var parser = me.parser;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var selectors = event.selectors;
    var len = selectors.length;

    for (var i = 0; i < len; i++) {
        var selector = selectors[i];
        var parts = selector.parts;
        var partsLen = parts.length;
        for (var j = 0; j < partsLen; j++) {
            var part = selector.parts[j];

            if (part.type === parser.SELECTOR_PART_TYPE && part.elementName) {
                loopPartModifiers(part, ruleName, fileContent, invalidList);
            }
        }
    }
}


/**
 * 循环 part.modifiers
 * 这样抽出来写是为了 jshint 通过
 *
 * @param {Object} part selector.parts 中的每一项
 * @param {string} ruleName 当前检测的规则名称
 * @param {string} fileContent 当前文件内容
 * @param {Array} invalidList 错误信息的数组
 */
function loopPartModifiers(part, ruleName, fileContent, invalidList) {
    var partElementNameText = part.elementName.toString();
    var modifiers = part.modifiers;
    var col = part.elementName.col;
    for (var k = 0, modifierLen = modifiers.length; k < modifierLen; k++) {
        var modifier = modifiers[k];
        var line = modifier.line;
        var lineContent = util.getLineContent(line, fileContent);
        if (modifier.type === 'id' || modifier.type === 'class') {
            invalidList.push({
                ruleName: ruleName,
                line: line,
                col: col,
                message: '`'
                    + lineContent
                    + '` '
                    + msg,
                colorMessage: '`'
                    + util.changeColorByIndex(lineContent, col - 1, partElementNameText)
                    + '` '
                    + chalk.grey(msg)
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
 */
module.exports = function (parser, fileContent, ruleName, ruleVal, invalidList) {

    if (!ruleVal) {
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
