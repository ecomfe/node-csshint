/**
 * @file vendor-prefixes-sort 的检测逻辑
 *       046: [强制] 带私有前缀的属性由长到短排列，按冒号位置对齐。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');
var prefixes = require('../prefixes');

var prefixList = prefixes.getPrefixList();

var candidateProperties = [];

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {
    var propertyName = event.property.toString().toLowerCase();

    if (prefixList.indexOf(propertyName) > -1) {
        candidateProperties.push(event);
    }
}

/**
 * startrule 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startRule(event) {
    candidateProperties = [];
}

/**
 * endrule 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function endRule(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    // console.log(candidateProperties);
    // console.log();
    var maxLength = 0;
    var firstColonIndex = 0;
    for (var i = 0, len = candidateProperties.length; i < len; i++) {
        var item = candidateProperties[i];
        var length = item.property.toString().length;

        var line = item.line;
        var lineContent = util.getLineContent(line, fileContent);

        // 第一个
        if (maxLength === 0) {
            maxLength = length;
            firstColonIndex = lineContent.indexOf(':') + 1;
        }

        var curColonIndex = lineContent.indexOf(':') + 1;
        if (firstColonIndex !== curColonIndex) {
            invalidList.push({
                ruleName: ruleName,
                line: line,
                message: '`'
                    + lineContent
                    + '` '
                    + 'Property with private prefix should be according to the colon position alignment',
                colorMessage: '`'
                    + chalk.magenta(lineContent)
                    + '` '
                    + chalk.grey(
                        'Property with private prefix should be according to the colon position alignment'
                    )
            });
        }

        if (maxLength < length) {
            invalidList.push({
                ruleName: ruleName,
                line: line,
                message: '`'
                    + lineContent
                    + '` '
                    + 'Property with private prefix from long to short arrangement',
                colorMessage: '`'
                    + chalk.magenta(lineContent)
                    + '` '
                    + chalk.grey(
                        'Property with private prefix from long to short arrangement'
                    )
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
        'endrule',
        endRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
