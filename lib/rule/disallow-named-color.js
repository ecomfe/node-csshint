/**
 * @file disallow-named-color 的检测逻辑
 *       031: [强制] 颜色值不允许使用命名色值。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');
var colors = require('../colors');

var util = require('../util');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'disallow-named-color';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Color values using named color value is not allowed';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var parts = postcss.list.space(decl.value);
                for (var i = 0, len = parts.length; i < len; i++) {
                    var part = parts[i];
                    if (colors.hasOwnProperty(part)) {
                        var source = decl.source;
                        var line = source.start.line;
                        var lineContent = util.getLineContent(line, source.input.css);
                        var extraLine = decl.value.indexOf(part) || 0;
                        var col = source.start.column + decl.prop.length + decl.between.length + extraLine;
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
