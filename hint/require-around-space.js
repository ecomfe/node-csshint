/**
 * @file require-around-space 的检测逻辑
 *       `>`, `+`, `~` 对应 009: [强制] `>`、`+`、`~` 选择器的两边各保留一个空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var combinatorTypes = [
    'adjacent-sibling', // +
    'sibling', // ~
    'child' // >
];

function getMsg(combinator) {
    return ''
        + 'Around the `'
        + combinator
        + '` selector will keep a space';
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
    var ruleVal = me.ruleVal;
    var invalidList = me.invalidList;

    // console.warn(ruleVal);

    var selectors = event.selectors;
    var len = selectors.length;

    for (var i = 0; i < len; i++) {
        var selector = selectors[i];
        var parts = selector.parts;

        for (var j = 0, partsLen = parts.length; j < partsLen; j++) {
            var part = parts[j];
            var partText = part.text.toLowerCase();
            if (ruleVal.indexOf(partText) !== -1
                && combinatorTypes.indexOf(part.type) !== -1
            ) {

                // 例如
                // div>span 这个选择器中
                // prevPart 和 nextPart 实际上分别是 div 和 span
                // 如果这俩不存在，那么 css 语法本身是会报错的
                // 因此这里不判断这俩是否存在
                var prevPart = parts[j - 1];
                var nextPart = parts[j + 1];

                var partCol = part.col;

                if (
                    (nextPart.col - partCol <= 1)
                    || (partCol - (prevPart.col + prevPart.text.length - 1) <= 1)
                ) {
                    var line = part.line;
                    var lineContent = util.getLineContent(line, fileContent);
                    var msg = getMsg(partText);
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: partCol,
                        errorChar: partText,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + util.changeColorByIndex(lineContent, partCol - 1, partText)
                            + '` '
                            + chalk.grey(msg)
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

    return invalidList;
};
