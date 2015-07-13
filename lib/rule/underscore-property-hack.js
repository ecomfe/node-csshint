/**
 * @file underscore-property-hack 的检测逻辑
 *       Checks for the underscore property hack (targets IE6)
 *       https://github.com/CSSLint/csslint/wiki/Disallow-underscore-hack
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');

var util = require('../util');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'underscore-property-hack';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Disallow properties with a underscore prefix';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var before = decl.before;

                if (before.slice(-1) === '_') {
                    var source = decl.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);
                    var col = source.start.column;
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
                    });

                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            });
        }
    };
});
