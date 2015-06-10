/**
 * @file no-bom 的检测逻辑
 *       001: [建议] `CSS` 文件使用无 `BOM` 的 `UTF-8` 编码。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'no-bom';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'CSS file should using UTF-8 coding without BOM';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            var bufContent = new Buffer(opts.fileContent, 'utf8');

            var hasBOM
                = (bufContent[0] === 0xEF && bufContent[1] === 0xBB && bufContent[2] === 0xBF) // UTF-8 +BOM
                    || (bufContent[0] === 0xEF && bufContent[1] === 0xBF && bufContent[2] === 0xBD); // unicode UTF16 LE

            if (hasBOM) {
                result.warn(RULENAME, {
                    node: css,
                    ruleName: RULENAME,
                    message: msg,
                    colorMessage: chalk.grey(msg)
                });
                global.CSSHINT_INVALID_ALL_COUNT++;
            }
        }
    };
});
