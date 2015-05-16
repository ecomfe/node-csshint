/**
 * @file property-not-existed 的检测逻辑，检测属性是否存在
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var prefixes = require('../prefixes');

var prefixList = prefixes.getPrefixList();

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'property-not-existed';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var prop = decl.prop;
                var standardProperty = prop.replace(/^\-(webkit|moz|ms|o)\-/g, '');
                // 标准模式在 prefixList 中，那么如果 propertyName 不在 prefixList 中
                // 即这个属性用错了，例如 -o-animation
                if (prefixList.indexOf(standardProperty) > -1) {
                    if (prefixList.indexOf(prop) <= -1) {

                        var source = decl.source;
                        var line = source.start.line;
                        var col = source.start.column;

                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: ''
                                + 'Current property '
                                + '`'
                                + prop
                                + '` '
                                + 'is not existed',
                            colorMessage: ''
                                + 'Current property '
                                + '`'
                                + chalk.magenta(prop)
                                + '` '
                                + 'is not existed'
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }

            });
        }
    };
});
