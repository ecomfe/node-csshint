/**
 * @file disallow-important 的检测逻辑
 *       019: [建议] 尽量不使用 `!important` 声明。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');

// 错误信息
var msg = 'Try not to use the `important` statement';

module.exports = postcss.plugin('disallow-important', function (options) {

    return function (css, result) {
        css.eachDecl(function (decl) {
            if (decl.important) {
                result.warn(msg, {
                    node: decl
                });
            }
        });
    };
});
