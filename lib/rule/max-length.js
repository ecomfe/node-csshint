/**
 * @file max-length 的检测逻辑
 *       006: [强制] 每行不得超过 `120` 个字符，除非单行不可分割。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'max-length';

/**
 * 匹配 css 属性值的 url(...);
 *
 * @type {RegExp}
 */
var PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

var excludeLines = [];

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            excludeLines = [];

            var msg = 'Each line must not be greater than ' + opts.ruleVal + ' characters';

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            // 排除掉 background-image: 2px 2px url(data:image/gif;base64,.....); 的情况
            css.eachDecl(function (decl) {
                var value = decl.value;
                if (PATTERN_URI.test(value)) {
                    excludeLines.push(decl.source.start.line);
                }
            });

            var lines = css.source.input.css.split(/\n/);

            for (var i = 0, len = lines.length; i < len; i++) {
                if (lines[i].length > opts.ruleVal
                    && excludeLines.indexOf(i + 1) === -1
                ) {
                    result.warn(RULENAME, {
                        node: css,
                        ruleName: RULENAME,
                        line: i + 1,
                        message: msg,
                        colorMessage: chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            }
        }
    };
});
