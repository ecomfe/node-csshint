/**
 * @file min-font-size 的检测逻辑
 *       037: [强制] 需要在 Windows 平台显示的中文内容，其字号应不小于 `12px`。
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
var RULENAME = 'min-font-size';

/**
 * 数字正则
 *
 * @type {RegExp}
 */
var PATTERN_NUMERIC = /^\d+[\.\d]*$/;

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'font-size should not be less than ';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal || isNaN(opts.ruleVal)) {
            return;
        }

        var msgWithVal = msg + opts.ruleVal + 'px';

        css.eachDecl(function (decl) {

            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            if (decl.prop === 'font-size') {
                if (parseFloat(decl.value) < opts.ruleVal) {
                    var source = decl.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);
                    var val = postcss.list.split(decl.value, 'px')[0];
                    if (PATTERN_NUMERIC.test(val)) {
                        var col = source.start.column + decl.prop.length + decl.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: msgWithVal,
                            colorMessage: '`'
                                + util.changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(msgWithVal)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        });
    };
});
