/**
 * @file require-after-space 的检测逻辑
 *       `:` 对应 004: [强制] `属性名` 与之后的 `:` 之间不允许包含空格， `:` 与 `属性值` 之间必须包含空格。
 *       `,` 对应 005: [强制] `列表型属性值` 书写在单行时，`,` 后必须跟一个空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');


var COLON = ':';

var COMMA = ',';

var lineCacheComma;
var lineCacheColon;

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
    if (ruleVal.indexOf(COLON) > -1) {
        dealColon(parts, ruleName, ruleVal, fileContent, invalidList);
    }

    if (ruleVal.indexOf(COMMA) > -1) {
        dealComma(parts, ruleName, ruleVal, fileContent, invalidList);
    }

}

/**
 * 逗号的处理
 *
 * @param {Object} parts selector.parts 中的每一项
 * @param {string} ruleName 当前检测的规则名称
 * @param {string|Array} ruleVal 当前检测规则对应的配置值
 * @param {string} fileContent 当前检测文件内容
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
function dealComma(parts, ruleName, ruleVal, fileContent, invalidList) {
    var len = parts.length;
    for (var i = 0; i < len; i++) {
        var part = parts[i];
        var line = part.line;

        // 排除掉 uri 的情况，例如
        // background-image:url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
        if (part.type !== 'uri') {
            if (lineCacheComma !== line) {
                lineCacheComma = line;
                var lineContent = util.getLineContent(part.line, fileContent) || '';
                var items = lineContent.split(';');
                for (var j = 0, jLen = items.length; j < jLen; j++) {
                    var s = items[j];
                    /* jshint maxdepth: 6 */
                    if (s.indexOf(',') > -1 && /.*,(?!\s)/.test(s)) {
                        invalidList.push({
                            ruleName: ruleName,
                            line: part.line,
                            errorChar: ',',
                            message: '`'
                                + lineContent
                                + '` '
                                + 'Must contain spaces after `,` in `attr-value`',
                            colorMessage: '`'
                                + lineContent.replace(s, chalk.magenta(s))
                                + '` '
                                + chalk.grey(''
                                    + 'Must contain spaces after `,` in `attr-value`'
                                )
                        });
                    }
                }
            }
        }
    }
}


/**
 * 冒号的处理
 *
 * @param {Object} parts selector.parts 中的每一项
 * @param {string} ruleName 当前检测的规则名称
 * @param {string|Array} ruleVal 当前检测规则对应的配置值
 * @param {string} fileContent 当前检测文件内容
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
function dealColon(parts, ruleName, ruleVal, fileContent, invalidList) {
    var len = parts.length;
    for (var i = 0; i < len; i++) {
        var part = parts[i];
        var line = part.line;
        if (lineCacheColon !== line) {
            lineCacheColon = line;
            var lineContent = util.getLineContent(part.line, fileContent) || '';
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
}

/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {string} ruleName 当前检测的规则名称
 * @param {string|Array} ruleVal 当前检测规则对应的配置值
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
            ruleVal: realRuleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
