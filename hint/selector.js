/**
 * @file 选择器的校验
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

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
    var invalidList = me.invalidList;

    // 当前行内容
    var lineContent;

    var selector;
    var part;

    var partsLen;

    // 上一个 selector 的行号
    var lastSelectorLineNum;

    // 当前 selector 的行号
    var curSelectorLineNum;

    // 多个选择器中，每个选择器是否独占一行的标志
    // true: 是独占一行
    // false: 没有独占一行
    var perLineFlag;

    var selectors = event.selectors;
    var selectorsLen = selectors.length;

    for (var i = 0; i < selectorsLen; i++) {
        perLineFlag = true;

        selector = selectors[i];

        curSelectorLineNum = selector.line;
        if (lastSelectorLineNum === curSelectorLineNum) {
            perLineFlag = false;
        }
        lastSelectorLineNum = curSelectorLineNum;

        partsLen = selector.parts.length;

        if (!perLineFlag) {
            lineContent = util.getLineContent(selector.line, fileContent);
            var selectorPartsStr = selector.parts.join('');
            var selectorPartsStrLen = selectorPartsStr.length;

            addInvalid({
                invalidList: invalidList,
                lineContent: lineContent,
                line: selector.line,
                col: selector.col,
                midIndex: selector.col + selectorPartsStrLen,
                needColorStr: selectorPartsStr,
                info: 'When a rule contains multiple selector, '
                    + 'each selector statement must be on a separate line.'
            });
        }

        for (var j = 0; j < partsLen; j++) {
            part = selector.parts[j];

            if (part.type === parser.SELECTOR_PART_TYPE && part.elementName) {
                loopPartModifiers(part, fileContent, invalidList);
            }
        }
    }
}

/**
 * 循环 part.modifiers
 * 这样抽出来写是为了 jshint 通过
 *
 * @param {Object} part selector.parts 中的每一项
 * @param {string} fileContent 当前文件内容
 * @param {Array} invalidList 错误信息的数组
 */
function loopPartModifiers(part, fileContent, invalidList) {
    var partElementNameTextLen = part.elementName.toString().length;
    var modifiers = part.modifiers;
    for (var k = 0, modifierLen = modifiers.length; k < modifierLen; k++) {
        var modifier = modifiers[k];
        var lineContent = util.getLineContent(modifier.line, fileContent);
        if (modifier.type === 'id' || modifier.type === 'class') {
            addInvalid({
                invalidList: invalidList,
                lineContent: lineContent,
                line: modifier.line,
                col: part.elementName.col,
                midIndex: part.elementName.col + partElementNameTextLen,
                needColorStr: part.elementName.toString(),
                info: 'Not allowed to add a type selector is limited to ID, class selector.'
            });
        }
    }
}
/**
 * 把错误信息推入到 invalidList 中
 *
 * 一条错误信息示例如下:
 * line 63, col 7: `.aad, a.ddd {` Not allowed to add a type selector is limited to ID, class selector.
 * 本行的内容如下:
 * lineContent: .aad, a.ddd {
 *
 * 如上示例，出错的索引应该是 a.ddd 中的 a，这里是把 lineContent 分为了三部分，
 * 第一部分是 `.aad, ` ，第二部分是 `a` ，第三部分是 `.ddd {`
 *
 * 这么做的目的是为了精确飘红错误信息的位置，这个方法内部调用，所以不用做参数的校验了
 *
 * @param {Array.<Object>} invalidList 错误信息的数组
 * @param {string} lineContent 当前行的内容
 * @param {number} line 当前的行号
 * @param {number} col lineContent 截取的开始索引，这个值就是 selector 的 col
 * @param {number} midIndex lineContent 截取的中间索引
 * @param {string} needColorStr 需要变色的错误信息
 * @param {string} info 错误信息的描述
 */
function addInvalid(params) {

    var invalidList = params.invalidList;
    var lineContent = params.lineContent;
    var line = params.line;
    var col = params.col;
    var midIndex = params.midIndex;
    var needColorStr = params.needColorStr;
    var info = params.info;

    var endIndex = lineContent.length;

    var startStr = lineContent.slice(0, col - 1);
    var midStr = lineContent.slice(col - 1, midIndex);
    var endStr = lineContent.slice(midIndex, endIndex);

    invalidList.push({
        line: line,
        col: col,
        message: '` '
            + startStr
            + midStr
            + endStr
            + '` '
            + info,
        colorMessage: '`'
            + startStr
            + midStr.replace(
                needColorStr,
                chalk.magenta(needColorStr)
            )
            + endStr
            + '` '
            + chalk.grey(info)
    });
}

/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
module.exports = function (parser, fileContent, invalidList) {
    parser.addListener(
        'startrule',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            invalidList: invalidList
        })
    );
};
