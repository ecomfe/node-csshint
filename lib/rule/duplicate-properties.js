/**
 * @file duplicate-properties 的检测逻辑
 *       Duplicate properties must appear one after the other
 *       https://github.com/CSSLint/csslint/wiki/Disallow-duplicate-properties
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
var RULENAME = 'duplicate-properties';

var msg = 'Duplicate properties must appear one after the other';

var properties = {};
var lastProperty = '';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {
            properties = {};

            rule.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var prop = decl.prop;
                var value = decl.value;
                if (properties[prop] && (lastProperty !== prop || properties[prop] === value)) {
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
                            + chalk.magenta(lineContent)
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }

                properties[prop] = value;
                lastProperty = prop;
            });
        });
    };
});
