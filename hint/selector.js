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
    var data = this;
    var parser = data.parser;
    var fileContent = data.fileContent;
    var invalidList = data.invalidList;

    // 当前行内容
    var lineContent;

    var selector;
    var part;
    var modifier;

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
        if (lastSelectorLineNum == curSelectorLineNum) {
            perLineFlag = false;
        }
        lastSelectorLineNum = curSelectorLineNum;

        partsLen = selector.parts.length;

        if (!perLineFlag) {
            lineContent = util.getLineContent(selector.line, fileContent);
            var selectorPartsStr = selector.parts.join('');
            var selectorPartsStrLen = selectorPartsStr.length;

            // util.addInvalid(
            //     invalidList,
            //     line: selector.line,
            //     col: selector.col,
            //     message:
            // );

            invalidList.push({
                line: selector.line,
                col: selector.col,
                message: '`'
                    + lineContent.slice(0, selector.col - 1)
                    + lineContent.slice(selector.col - 1, selector.col + selectorPartsStrLen).replace(
                        selectorPartsStr,
                        chalk.magenta(selectorPartsStr)
                    )
                    + lineContent.slice(selector.col + selectorPartsStrLen, lineContent.length)
                    + '` '
                    + chalk.grey(''
                        + 'When a rule contains multiple selector, '
                        + 'each selector statement must be on a separate line.'
                    )
            });
        }

        for (var j = 0; j < partsLen; j++) {
            part = selector.parts[j];

            if (part.type == parser.SELECTOR_PART_TYPE && part.elementName) {
                var partElementNameTextLen = part.elementName.text.length;

                for (var k = 0, modifierLen = part.modifiers.length; k < modifierLen; k++) {
                    modifier = part.modifiers[k];
                    if (modifier.type === 'id' || modifier.type === 'class') {
                        lineContent = util.getLineContent(modifier.line, fileContent);
                        invalidList.push({
                            line: modifier.line,
                            col: part.elementName.col,
                            message: '`'
                                + lineContent.slice(0, part.elementName.col - 1)
                                + lineContent.slice(
                                    part.elementName.col - 1,
                                    part.elementName.col + partElementNameTextLen
                                ).replace(
                                    part.elementName.text,
                                    chalk.magenta(part.elementName.text)
                                )
                                + lineContent.slice(part.elementName.col + partElementNameTextLen, lineContent.length)
                                + '` '
                                + chalk.grey(''
                                    + 'Not allowed to add a type selector is limited to ID, class selector. '
                                    // + 'You should use `'
                                    // + chalk.green(modifier.text)
                                    // + '`.'
                                )
                        });
                    }
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
