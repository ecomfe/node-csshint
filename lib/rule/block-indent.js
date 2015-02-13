/**
 * @file block-indent 的检测逻辑
 *       002: [强制] 使用 `4` 个空格做为一个缩进层级，不允许使用 `2` 个空格 或 `tab` 字符。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');
var prefixes = require('../prefixes');
var prefixList = prefixes.getPrefixList();

/**
 * tab 字符的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_TAB = 9;

/**
 * 空格的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_SPACE = 32;

/**
 * 换行的 ascii 码
 *
 * @type {number}
 */
// var ASCII_CODE_LF = 10;

/**
 * 回车的 ascii 码
 *
 * @type {number}
 */
// var ASCII_CODE_CR = 13;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Use `4` spaces as an indent level. Use `2` spaces or `tab` character is not allowed';

/**
 * 是否在 keyframes 中的标识
 *
 * @type {boolean}
 */
var inKeyFrame = false;


var inMedia = false;

var startKeyFrameRuleKeys = [];

/**
 * 字符串转为 ascii 码
 *
 * @param {string} str 待转换的字符串
 *
 * @return {Array} ascii 码集合
 */
function string2Ascii(str) {
    var ret = [];
    for (var i = 0, len = str.length; i < len; i++) {
        ret.push(str[i].charCodeAt());
    }
    return ret;
}

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startRule(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    var selectors = event.selectors;
    var len = selectors.length;

    // 上一次报错的行号
    var prevErrLineNum = -1;

    for (var i = 0; i < len; i++) {
        var selector = selectors[i];
        var selectorLine = selector.line;
        var curLineContent = util.getLineContent(selectorLine, fileContent);
        if (curLineContent && prevErrLineNum !== selectorLine) {
            var asciiList = string2Ascii(curLineContent);

            if (!inMedia) {
                if (asciiList[0] === ASCII_CODE_TAB || asciiList[0] === ASCII_CODE_SPACE) {
                    invalidList.push({
                        ruleName: ruleName,
                        line: selectorLine,
                        message: '`'
                            + curLineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + chalk.magenta(
                                curLineContent
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                    prevErrLineNum = selectorLine;
                }
            }
            else {
                if ((selector.col - 1) / 4 !== 1) {
                    invalidList.push({
                        ruleName: ruleName,
                        line: selectorLine,
                        message: '`'
                            + curLineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + chalk.magenta(
                                curLineContent
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                    prevErrLineNum = selectorLine;
                }
            }
        }
    }
}

// checkProperty 时上一次报错的行号
var propertyPrevErrLineNum = -1;

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

    var property = event.property;
    var col = property.col;
    var line = property.line;
    var lineContent = util.getLineContent(line, fileContent);

    var standardProperty = property.toString().toLowerCase().replace(/^\-(webkit|moz|ms|o)\-/g, '');
    if (prefixList.indexOf(standardProperty) < 0) {
        var push2InvalidList = function () {
            invalidList.push({
                ruleName: ruleName,
                line: line,
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
        };

        if (propertyPrevErrLineNum !== line) {
            propertyPrevErrLineNum = line;
            if (inKeyFrame || inMedia) {
                if ((col - 1) / 4 !== 2) {
                    push2InvalidList();
                }
            }
            else {
                if ((col - 1) / 4 !== 1) {
                    push2InvalidList();
                }
            }
        }
    }
}

/**
 * startkeyframerule 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startKeyFrameRule(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    startKeyFrameRuleKeys = [];
    Array.prototype.push.apply(
        startKeyFrameRuleKeys,
        event.keys
    );

    for (var i = 0, len = startKeyFrameRuleKeys.length; i < len; i++) {
        var startKeyFrameRuleKey = startKeyFrameRuleKeys[i];
        if ((startKeyFrameRuleKey.col - 1) / 4 !== 1) {
            var line = startKeyFrameRuleKey.line;
            var lineContent = util.getLineContent(line, fileContent);
            invalidList.push({
                ruleName: ruleName,
                line: line,
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
}

/**
 * startkeyframes 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startKeyFrames(event) {
    var me = this;
    var fileContent = me.fileContent;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    inKeyFrame = true;

    var frameName = event.name;

    if (event.col !== 1) {
        var line = frameName.line;
        var lineContent = util.getLineContent(line, fileContent);
        invalidList.push({
            ruleName: ruleName,
            line: line,
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

    inMedia = true;

    var medias = event.media;

    var firstMedia = medias[0];
    var firstLine = firstMedia.line;
    var firstLineContent = util.getLineContent(firstLine, fileContent);

    if (firstMedia.col !== 8) {
        invalidList.push({
            ruleName: ruleName,
            line: firstLine,
            message: '`'
                + firstLineContent
                + '` '
                + msg,
            colorMessage: '`'
                + chalk.magenta(
                    firstLineContent
                )
                + '` '
                + chalk.grey(msg)
        });
    }

    for (var i = 1, len = medias.length; i < len; i++) {
        var media = medias[i];
        if (media.line !== firstLine) {
            if (media.col !== 1) {
                var line = media.line;
                var lineContent = util.getLineContent(line, fileContent);
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
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
        'startkeyframes',
        startKeyFrames.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endkeyframes',
        function (event) {
            inKeyFrame = false;
        }
    );

    parser.addListener(
        'startmedia',
        startMedia.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endmedia',
        function (event) {
            inMedia = false;
        }
    );

    parser.addListener(
        'startkeyframerule',
        startKeyFrameRule.bind({
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
