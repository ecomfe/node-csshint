/**
 * @file duplicate-background-images 的检测逻辑
 *       Every background-image should be unique. Use a common class for e.g. sprites
 *       https://github.com/CSSLint/csslint/wiki/Disallow-duplicate-background-images
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
var RULENAME = 'duplicate-background-images';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Every background-image should be unique. Use a common class for e.g. sprites';

/**
 * 匹配 css 中 url 的正则
 */
var PATTERN_URL = /\burl\s*\((["']?)([^\)]+)\1\)/g;

var stack = {};

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal) {
            return;
        }

        stack = {};

        css.eachDecl(function (decl) {

            var prop = decl.prop;
            if (prop.match(/background/i)) {
                var value = decl.value;
                var match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_URL.exec(value))) {
                    if (typeof stack[match[2]] === 'undefined') {
                        stack[match[2]] = decl;
                    }
                    else {
                        var str = 'Background image `'
                            + match[2]
                            + '` was used multiple times, first declared at line '
                            + stack[match[2]].source.start.line
                            + ', col '
                            + stack[match[2]].source.start.column
                            + '. '
                            + msg;

                        var colorStr = 'Background image `'
                            + chalk.magenta(match[2])
                            + '` was used multiple times, first declared at line '
                            + stack[match[2]].source.start.line
                            + ', col '
                            + stack[match[2]].source.start.column
                            + '. '
                            + chalk.grey(msg);

                        var source = decl.source;
                        var line = source.start.line;
                        var lineContent = util.getLineContent(line, source.input.css);
                        var col = lineContent.indexOf(match[2]) + 1;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: str,
                            colorMessage: colorStr
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                /* eslint-enable no-extra-boolean-cast */
            }
        });
    };
});
