/**
 * @file no-bom 的检测逻辑
 *       001: [建议] `CSS` 文件使用无 `BOM` 的 `UTF-8` 编码。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');


/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {string} ruleName 当前检测的规则名称
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
module.exports = function (parser, fileContent, ruleName, invalidList) {

    var bufContent = new Buffer(fileContent, 'utf8');

    var hasBOM = bufContent[0] === 0xEF
        && bufContent[1] === 0xBB
        && bufContent[2] === 0xBF;

    if (hasBOM) {
        invalidList.push({
            ruleName: ruleName,
            message: ''
                + 'CSS file should using UTF-8 coding without BOM.',
            colorMessage: ''
                + chalk.grey('CSS file should using UTF-8 coding without BOM.')
        });
    }

    return invalidList;
};
