/**
 * @file require-transition-property 的检测逻辑
 *       041: [强制] 使用 `transition` 时应指定 `transition-property`。
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
var RULENAME = 'require-transition-property';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'When using the `transition`, `transition-property` should be specified';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {

                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var prop = decl.prop;

                if (prop === 'transition') {
                    var parts = postcss.list.space(decl.value);
                    if (parts.indexOf('all') > -1) {
                        var source = decl.source;
                        var line = source.start.line;
                        var lineContent = util.getLineContent(line, source.input.css);
                        // var col = source.start.column + decl.prop.length + decl.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            // col: col,
                            message: msg,
                            colorMessage: '`'
                                + lineContent.replace(/\ball\b/g, chalk.magenta('all'))
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
