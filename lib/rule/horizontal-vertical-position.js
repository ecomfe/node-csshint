/**
 * @file horizontal-vertical-position 的检测逻辑
 *       033: [强制] 必须同时给出水平和垂直方向的位置。
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
var RULENAME = 'horizontal-vertical-position';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Must give the horizontal and vertical position';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                if (decl.prop === 'background-position') {
                    var parts = postcss.list.space(decl.value);
                    if (parts.length < 2) {
                        var source = decl.source;
                        var line = source.start.line;
                        var lineContent = util.getLineContent(line, source.input.css);
                        var col = source.start.column + decl.prop.length + decl.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msg,
                            colorMessage: '`'
                                + util.changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
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
