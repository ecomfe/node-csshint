/**
 * @file require-before-space 的检测逻辑
 *       `{` 对应 003: [强制] `选择器` 与 `{` 之间必须包含空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');

/**
 * 注释正则
 *
 * @type {RegExp}
 */
// var commentPattern = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

var msg = 'Must contain spaces before the `{`';

/**
 * 检测字符前面是否有空格
 *
 * @param {string} c 待检测的字符
 * @param {string} fileContent 文件内容
 *
 * @return {Array} 有空格的集合
 */
function checkBeforeSpace(c, fileContent) {
    var ret = [];
    // var noBeforeSpacePattern = new RegExp('([^\\s]*[^\\s])(' + c + ')', 'gmi');
    var noBeforeSpacePattern = new RegExp('(.*[^\\s])(' + c + ')', 'gmi');
    var match = null;

    // var inCommentPattern;// = new RegExp('\\/\\*+\\n*\\s*aaaa\\n*\\*+\\/', 'gmi');
    // console.log(inCommentPattern.test('/* aaaa*/'));
    // var a = ''
    //     // + '/*\n'
    //     // +   '.a{\n'
    //     // +       'color: #fff;\n'
    //     // +   '}\n'
    //     // + '*/';
    //     // + '.a{'
    //     + '.pingo-right .empty-content {'

    // /\/\*+\n*\r*\s*\.a{/gim
    // /\/\*+\n*\r*\s*\.a{\n*\*+\//gim

    /* eslint-disable no-extra-boolean-cast */
    while (!!(match = noBeforeSpacePattern.exec(fileContent))) {
        var matchStr = match[0];
        var matchChar = match[2];
        // console.warn(matchStr);
        if (matchStr.slice(0, 2) !== '/*') {
            var index = matchStr.length - matchChar.length + 1;
            ret.push({
                i: index, // 这个 index 是字符在当前字符串的索引
                lineIndex: match.index, // 用于获取行号的 index
                v: matchChar,
                matchStr: matchStr
            });
        }
        // inCommentPattern = new RegExp(
        //     '\\/\\*+\\n*\\r*\\s*'
        //         + matchStr.replace('(', '\\(').replace('.', '\\.').replace('*', '\\*'),
        //     'gmi'
        // );
        // if (!inCommentPattern.test(fileContent)) {
        //     var index = matchStr.length - matchChar.length + 1;
        //     ret.push({
        //         i: index, // 这个 index 是字符在当前字符串的索引
        //         lineIndex: match.index, // 用于获取行号的 index
        //         v: matchChar,
        //         matchStr: matchStr
        //     });
        // }
    }
    /* eslint-enable no-extra-boolean-cast */

    return ret;
}

/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {string} ruleName 当前检测的规则名称
 * @param {string} ruleVal 当前检测规则对应的配置值
 * @param {Array.<Object>} invalidList 不合法文件集合
 *
 * @return {Array.<Object>} 不合法文件集合
 */
module.exports = function (parser, fileContent, ruleName, ruleVal, invalidList) {

    // var match = null;
    // var match = commentPattern.exec(fileContent) || [''];
    // var deltaLine = match.length - 1;

    // var originalFileContent = fileContent;
    // fileContent = fileContent.replace(commentPattern, '');
    // console.warn(originalFileContent);

    var ret = [];
    // require-before-space 对应的配置是数组
    if (Array.isArray(ruleVal)) {
        for (var m = 0, rLen = ruleVal.length; m < rLen; m++) {
            ret.push(checkBeforeSpace(ruleVal[m], fileContent));
        }
    }
    else {
        ret.push(checkBeforeSpace(ruleVal, fileContent));
    }

    // console.warn(ret);

    for (var i = 0, len = ret.length; i < len; i++) {
        for (var j = 0, jLen = ret[i].length; j < jLen; j++) {
            var line = util.getLine(ret[i][j].lineIndex, fileContent);
            var matchStr = ret[i][j].matchStr;
            var matchV = ret[i][j].v;
            invalidList.push({
                ruleName: ruleName,
                line: line,
                col: ret[i][j].i,
                errorChar: matchV,  // 出错的那个具体的字符
                message: '`'
                    + matchStr
                    + '` '
                    + msg,
                colorMessage: '`'
                    + matchStr.replace(
                        matchV,
                        chalk.magenta(matchV)
                    )
                    + '` '
                    + chalk.grey(msg)
            });
        }
    }

    return invalidList;
};
