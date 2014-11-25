/**
 * @file omit-protocol-in-url 的检测逻辑
 *       027: [建议] `url()` 函数中的绝对路径可省去协议名。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');

var msg = 'Path in the `url()` should remove protocol';

/**
 * 匹配 url() 中 path 的协议
 */
var pattern = /^((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\/\/){1}/gi;

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
        if (part.type === 'uri') {
            var line = part.line;
            var lineContent = util.getLineContent(line, fileContent);
            var uri = part.uri;
            var match = null;

            /* eslint-disable no-extra-boolean-cast */
            while (!!(match = pattern.exec(uri))) {
                invalidList.push({
                    ruleName: ruleName,
                    line: line,
                    col: part.col + 4,  // 4 是指 url( 的长度，如果有引号，那么还应该 + 1
                    message: '`'
                        + lineContent
                        + '` '
                        + msg,
                    colorMessage: '`'
                        + util.changeColorByIndex(uri, match.index, match[1])
                        + '` '
                        + chalk.grey(msg)
                });
            }
            /* eslint-enable no-extra-boolean-cast */
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
        'property',
        checkProperty.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    return invalidList;
};
