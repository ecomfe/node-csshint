/**
 * @file disallow-important 的检测逻辑
 *       019: [建议] 尽量不使用 `!important` 声明。
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
var RULENAME = 'disallow-important';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Try not to use the `important` statement';

/**
 * 记录行号的临时变量，例如
 * color:red !important;height: 100px !important;
 * 这段 css ，希望的是这一行只报一次 !important 的错误，这一次把这一行里面的 !important 全部高亮
 *
 * @type {number}
 */
var lineCache = 0;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (opts.ruleVal) {

            lineCache = 0;

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }
                if (decl.important) {
                    var source = decl.source;
                    var line = source.start.line;

                    // lineCache === line 时，说明是同一行的，那么就不报了
                    if (lineCache !== line) {
                        lineCache = line;
                        // var col = source.start.column;
                        var lineContent = util.getLineContent(line, source.input.css) || '';
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            // col: col,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(
                                    /!important/gi,
                                    chalk.magenta('!important')
                                )
                                + '` '
                                + chalk.grey(msg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            });
        }
    };
});
