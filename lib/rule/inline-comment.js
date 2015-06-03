/**
 * @file inline-comment
 *       检测 csshint-disable, csshint-enable 的行内注释
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
var RULENAME = 'inline-comment';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = '111111111111';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        var nodes = css.nodes;

        if (!nodes) {
            return;
        }

        nodes.forEach(function (node) {
            // console.warn(node);
        });

        css.eachComment(function (comment) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            // console.warn(comment);

            // var source = decl.source;
            // var line = source.start.line;
            // var lineContent = util.getLineContent(line, source.input.css);
            // var col = source.start.column + decl.prop.length + decl.between.length;
            // console.warn(source);
            // console.warn();
            // result.warn(msg, {
            //     node: decl,
            //     ruleName: RULENAME,
            //     line: line,
            //     // col: col,
            //     message: msg,
            //     colorMessage: '`'
            //         + util.changeColorByStartAndEndIndex(
            //             lineContent, col, source.end.column
            //         )
            //         + '` '
            //         + chalk.grey(msg)
            //     // magenta
            // });

            // // postcss.list.space(decl.value);
            // global.CSSHINT_INVALID_ALL_COUNT++;

        });
    };
});
