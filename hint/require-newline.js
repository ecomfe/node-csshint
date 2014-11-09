/**
 * @file require-newline 的检测逻辑
 *       `selector` 对应 008: [强制] 当一个 rule 包含多个 selector 时，每个选择器声明必须独占一行。
 *       `property` 对应 011: [强制] 属性定义必须另起一行。
 *       `media-query-condition` 对应 044: [强制] `Media Query` 如果有多个逗号分隔的条件时，应将每个条件放在单独一行中。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var mediaMsg = ''
    + '`Media Query` if there is more than one comma separated condition,'
    + ' should put each on a separate line condition.';

var selectorMsg = ''
    + 'When a rule contains multiple selector, '
    + 'each selector statement must be on a separate line.';

var propertyMsg = ''
    + 'The attribute definition must be on a new line';

/**
 * startmedia 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startMedia(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var firstMediaLine = 0;
    var media = event.media;
    var len = media.length;
    if (len > 1) {
        for (var i = 0; i < len; i++) {
            var m = media[i];
            var line = m.line;
            var col = m.col;
            if (firstMediaLine !== 0
                && firstMediaLine === line
            ) {
                var lineContent = util.getLineContent(line, fileContent);
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    errorChar: 'media-query-condition',
                    message: '`'
                        + lineContent
                        + '` '
                        + mediaMsg,
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, m.text)
                        + '` '
                        + chalk.grey(mediaMsg)
                });
            }
            else {
                firstMediaLine = line;
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
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var firstSelectorLine = 0;
    var selectors = event.selectors;
    var len = selectors.length;
    if (len > 1) {
        for (var i = 0; i < len; i++) {
            var selector = selectors[i];
            var line = selector.line;
            var col = selector.col;
            if (firstSelectorLine !== 0
                && firstSelectorLine === line
            ) {
                var lineContent = util.getLineContent(line, fileContent);
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: col,
                    errorChar: 'selector',
                    message: '`'
                        + lineContent
                        + '` '
                        + selectorMsg,
                    colorMessage: '`'
                        + util.changeColorByIndex(lineContent, col - 1, selector.text)
                        + '` '
                        + chalk.grey(selectorMsg)
                });
            }
            else {
                firstSelectorLine = line;
            }
        }
    }
}

var firstPropertyLine = 0;

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

    var line = event.line;
    var col = event.col;
    if (firstPropertyLine !== 0
        && firstPropertyLine === line
    ) {
        var lineContent = util.getLineContent(line, fileContent);
        invalidList.push({
            ruleName: ruleName,
            line: line,
            col: col,
            errorChar: 'property',
            message: '`'
                + lineContent
                + '` '
                + propertyMsg,
            colorMessage: '`'
                + util.changeColorByIndex(lineContent, col - 1, event.property.text)
                + '` '
                + chalk.grey(propertyMsg)
        });
    }
    else {
        firstPropertyLine = line;
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

    if (realRuleVal.indexOf('media-query-condition') > -1) {
        parser.addListener(
            'startmedia',
            startMedia.bind({
                parser: parser,
                fileContent: fileContent,
                ruleName: ruleName,
                ruleVal: realRuleVal,
                invalidList: invalidList
            })
        );
    }

    if (realRuleVal.indexOf('selector') > -1) {
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
    }

    if (realRuleVal.indexOf('property') > -1) {
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
    }

    return invalidList;
};
