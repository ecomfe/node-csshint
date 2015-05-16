/**
 * @file omit-protocol-in-url 的检测逻辑
 *       027: [建议] `url()` 函数中的绝对路径可省去协议名。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'omit-protocol-in-url';

/**
 * 匹配 css 中 url 的正则
 */
var PATTERN_URL = /\burl\s*\((["']?)([^\)]+)\1\)/g;

/**
 * 匹配 url() 中 path 的协议
 */
var PATTERN_PROTOCOL = /^((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\/\/){1}/gi;

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'Path in the `url()` should remove protocol';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            css.eachDecl(function (decl) {

                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var value = decl.value;
                var source = decl.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css);

                var match = null;
                var matchProtocol = null;

                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_URL.exec(value))) {
                    var url = match[2];
                    // decl.value 相对于 lineContent 的 index
                    var valueIndex = lineContent.indexOf(decl.value);
                    // 相对于 decl.value 的 index
                    var index = valueIndex + match.input.indexOf(url);
                    while (!!(matchProtocol = PATTERN_PROTOCOL.exec(url))) {
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: index + 1,
                            message: msg,
                            colorMessage: '`'
                                + util.changeColorByIndex(lineContent, index, matchProtocol[0])
                                + '` '
                                + chalk.grey(msg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                /* eslint-enable no-extra-boolean-cast */
            });
        }
    };
});
