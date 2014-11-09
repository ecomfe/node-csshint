/**
 * @file bulletproof-font-face 的检测逻辑
 *       Use the bulletproof @font-face syntax to avoid 404's in old IE
 *       (http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax)
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg = '@font-face declaration doesn\'t follow the fontspring bulletproof syntax';

var fontFaceRule = false;

var firstSrc = true;
var ruleFailed = false;

var errorLine;
var errorCol;

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {
    // If we aren't inside an @font-face declaration then just return
    if (!fontFaceRule) {
        return;
    }

    var propertyName = event.property.toString().toLowerCase();
    var value = event.value.toString();

    // Set the errorLine and errorCol numbers for use in the endfontface listener
    errorLine = event.line;
    errorCol = event.col;

    // This is the property that we care about, we can ignore the rest
    if (propertyName === 'src') {
        var regex = /^\s?url\(['"].+\.eot\?.*['"]\)\s*format\(['"]embedded-opentype['"]\).*$/i;
        // We need to handle the advanced syntax with two src properties
        if (!value.match(regex) && firstSrc) {
            ruleFailed = true;
            firstSrc = false;
        }
        else if (value.match(regex) && !firstSrc) {
            ruleFailed = false;
        }
    }
}

/**
 * startfontface 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startFontface(event) {
    fontFaceRule = true;
}

/**
 * endfontface 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function endFontface(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    fontFaceRule = false;
    if (ruleFailed) {
        var lineContent = util.getLineContent(errorLine, fileContent);
        invalidList.push({
            ruleName: ruleName,
            line: errorLine,
            col: errorCol,
            message: '`'
                + lineContent
                + '` '
                + msg,
            colorMessage: '`'
                + chalk.magenta(
                    lineContent
                )
                + '` '
                + chalk.grey(msg)
        });
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
        'startfontface',
        startFontface.bind({
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

    // Back to normal rules that we don't need to test
    parser.addListener(
        'endfontface',
        endFontface.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
