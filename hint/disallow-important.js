/**
 * @file disallow-important 的检测逻辑
 *       019: [建议] 尽量不使用 `!important` 声明。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

var msg = 'Try not to use the `important` statement';

/**
 * !important 声明的标记
 * number 类型，可以统计 important 的总个数
 * 后续可以统计 !impartant 个数
 *
 * @type {number}
 */
// var allImportants = 0;

/**
 * 记录行号的临时变量，例如
 * color:red !important;height: 100px !important;
 * 这段 css ，希望的是这一行只报一次 !important 的错误，这一次把这一行里面的 !important 全部高亮
 *
 * @type {number}
 */
var lineCache = 0;

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
    var lineContent = util.getLineContent(line, fileContent);

    if (event.important === true) {
        // allImportants++; // 后续可以统计 !impartant 个数

        // lineCache === line 时，说明是同一行的，那么就不报了
        if (lineCache !== line) {
            lineCache = line;
            invalidList.push({
                ruleName: ruleName,
                line: line,
                errorChar: '!important',
                message: '`'
                    + lineContent
                    + '` '
                    + msg,
                colorMessage: '`'
                    + lineContent.replace(
                        /!important/gi,
                        chalk.magenta('!important')
                    )
                    + '` '
                    + chalk.grey(msg)
            });
        }
    }
}

/**
 * endstylesheet 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 * endstylesheet 本质上没有特殊的意义
 * 可以看作是 css 文件 parser 完毕后的一个回调
 *
 * 后续可以统计 !impartant 个数
 *
 * @param {Object} event 事件对象
 */
// function endstylesheetFunc(event) {
//     if (allImportants !== 0) {
//     }
// }

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
        'property',
        checkProperty.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    // 后续可以统计 !impartant 个数
    // parser.addListener(
    //     'endstylesheet',
    //     endstylesheetFunc.bind({
    //         parser: parser,
    //         fileContent: fileContent,
    //         ruleName: ruleName,
    //         ruleVal: ruleVal,
    //         invalidList: invalidList
    //     })
    // );

    return invalidList;
};
