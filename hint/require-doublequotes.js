/**
 * @file require-doublequotes 的检测逻辑
 *       `attr-selector` 对应 010: [强制] 属性选择器中的值必须用双引号包围。
 *       `text-content` 对应 024: [强制] 文本内容必须用双引号包围。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var attrMsg = 'Attribute selector value must use double quotes';

var propertyMsg = 'Text content value must use double quotes';

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
        if (part.type === 'string') {
            var text = part.text;
            var line = part.line;
            var lineContent = util.getLineContent(line, fileContent);
            var col = part.col;
            var text = part.text.toLowerCase();

            if (text.slice(0, 1) !== '"'
                || text.slice(-1) !== '"'
            ) {
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    errorChar: 'text-content',
                    message: '`'
                        + lineContent
                        + '` '
                        + propertyMsg,
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, text)
                        + '` '
                        + chalk.grey(propertyMsg)
                });
            }
        }
    }
}

/**
 * startrule 事件回调函数
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

    for (var i = 0, len = selectors.length; i < len; i++) {
        var selector = selectors[i];
        var parts = selector.parts;
        var partsLen = parts.length;
        for (var j = 0; j < partsLen; j++) {
            var part = parts[j];
            if (part.type === parser.SELECTOR_PART_TYPE) {
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
    var modifiers = part.modifiers;
    for (var k = 0, modifierLen = modifiers.length; k < modifierLen; k++) {
        var modifier = modifiers[k];
        // console.warn(modifier);
        if (modifier.type === 'attribute') {
            var text = modifier.text;
            var line = modifier.line;
            var lineContent = util.getLineContent(line, fileContent);
            var col = modifier.col;
            // console.log(modifier);
            var match = null;
            var pattern = /^(\[\w*(~|\|)?\=)((["']?)\w*\4)\]$/g;
            while (!!(match = pattern.exec(text))) {
                if (match[4] !== '"') {
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: col + match[1].length,
                        errorChar: 'attr-selector',
                        message: '`'
                            + lineContent
                            + '` '
                            + attrMsg,
                        colorMessage: '`'
                            + util.changeColorByIndex(text, match.index, text)
                            + '` '
                            + chalk.grey(attrMsg)
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
        'startrule',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: realRuleVal,
            invalidList: invalidList
        })
    );

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

    return invalidList;
};
