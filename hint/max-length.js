/**
 * @file max-length 的检测逻辑
 *       006: [强制] 每行不得超过 `120` 个字符，除非单行不可分割。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');

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

    if (!ruleVal || isNaN(ruleVal)) {
        return invalidList;
    }

    // 前面已经将换行符统一处理成 `\n` 了
    var lines = fileContent.split(/\n/);
    for (var i = 0, len = lines.length; i < len; i++) {
        if (lines[i].length > ruleVal) {
            invalidList.push({
                line: i + 1,
                ruleName: ruleName,
                message: ''
                    + 'Each line must not be greater than ' + ruleVal + ' characters',
                colorMessage: ''
                    + chalk.grey('Each line must not be greater than ' + ruleVal + ' characters')
            });
        }
    }

    return invalidList;
};
