/**
 * @file block-indent 的检测逻辑
 *       002: [强制] 使用 `4` 个空格做为一个缩进层级，不允许使用 `2` 个空格 或 `tab` 字符。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

/**
 * startrule 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startRule(event) {
    var me = this;
    // console.warn(event);
    // console.log(require('util').inspect(event, { showHidden: true, depth: null }));
}


/**
 * tab 字符的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_TAB = 9;

/**
 * 空格的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_SPACE = 32;

/**
 * 换行的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_LF = 10;

/**
 * 回车的 ascii 码
 *
 * @type {number}
 */
var ASCII_CODE_CR = 13;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'Use `4` spaces as an indent level. Use `2` spaces or `tab` character is not allowed.';

/**
 * 字符串转为 ascii 码
 *
 * @param {string} str 待转换的字符串
 */
function string2Ascii(str) {
	var ret = [];
	for (var i = 0, len = str.length; i < len; i++) {
		ret.push(str[i].charCodeAt());
	}
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
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
module.exports = function (parser, fileContent, ruleName, invalidList) {

	var asciiList = string2Ascii(fileContent);
	var length = asciiList.length;

    // 空格连续出现的次数
    var spaceCount = 0;

    // 空格连续出现的最大次数
    var spaceMaxCount = 0;

    // 空格连续出现最多次时，最后一个空格的索引
    var spaceMaxIndex = 0;

    // 前一个字符是否是空格的标识
    var prevAsciiIsSpace = false;

	for (var i = 0; i < length; i++) {
		var ascii = asciiList[i];
        var nextAscii = asciiList[i + 1];

        // 说明当前这个字符是换行或者回车
        if (ascii === ASCII_CODE_LF || ascii === ASCII_CODE_CR) {
            if (nextAscii === ASCII_CODE_TAB) {
                var line = util.getLine(i + 1, fileContent);
                var lineContent = util.getLineContent(line, fileContent);
                var colorStr = String.fromCharCode(nextAscii)
                    + lineContent.split(/[\.#;{]/)[0]; // 这里的 split 是为了把开头的第一个完整单词输出出来

                invalidList.push({
                    line: line,
                    col: i,
                    message: '`'
                        + colorStr
                        + '` '
                        + msg,
                    colorMessage: '`'
                        + chalk.magenta(
                            colorStr
                        )
                        + '` '
                        + chalk.grey(msg)
                });
            }

            if (nextAscii === ASCII_CODE_SPACE) {
                spaceCount++;
                prevAsciiIsSpace = true;
            }
        }

        if (ascii === ASCII_CODE_SPACE && prevAsciiIsSpace) {
            if (nextAscii !== ASCII_CODE_SPACE) {
                prevAsciiIsSpace = false;
            }
            else {
                spaceCount++;
            }
        }

        console.warn(spaceCount);
    }



        // console.log(ascii, nextAscii);
  //       var prevAscii = asciiList[i - 1];

  //       if (ascii === ASCII_CODE_SPACE) {
  //           spaceCount++;
  //       }
  //       else {
  //           if (spaceCount > spaceMaxCount) {
  //               if (prevAscii === ASCII_CODE_LF
  //                   || prevAscii === ASCII_CODE_CR
  //                   || prevAscii === ASCII_CODE_SPACE
  //               ) {
  //                   spaceMaxCount = spaceCount;
  //                   spaceMaxIndex = i;
  //               }
  //           }
  //           spaceCount = 0;
  //       }

		// // 存在 tab 字符，那么看看它前面是不是换行或者回车
		// // 如果是，说明是作为缩进来使用的
		// if (ascii === ASCII_CODE_TAB) {
		// 	if (prevAscii === ASCII_CODE_LF || prevAscii === ASCII_CODE_CR) {
		// 		var line = util.getLine(i, fileContent);
		// 		var lineContent = util.getLineContent(line, fileContent);
		// 		var colorStr = String.fromCharCode(ascii)
		// 			+ lineContent.split(/[\.#:{ ]/)[0]; // 这里的 split 是为了把开头的第一个完整单词输出出来

		// 		invalidList.push({
	 //                line: line,
	 //                col: i,
	 //                message: '`'
	 //                	+ colorStr
	 //                    + '` '
	 //                    + msg,
	 //                colorMessage: '`'
	 //                    + chalk.magenta(
	 //                		colorStr
	 //                	)
	 //                    + '` '
	 //                    + chalk.grey(msg)
	 //            });
		// 	}
		// }
	// }

    // console.warn(spaceMaxIndex);

    // // 最后一个空格的索引减去空格连续出现的最大次数就可以得到第一个空格的索引
    // var firstSpaceIndex = spaceMaxIndex - spaceMaxCount;

    // // 判断第一个空格的前面是否是回车或者换行
    // // 如果是，说明是作为缩进来使用的
    // var beforeFirstSpaceCharAscii = fileContent.charAt(firstSpaceIndex - 1).charCodeAt();

    // // 作为缩进来使用并且空格的次数不等于四次
    // if (spaceMaxCount !== 4
    //     &&
    //     (
    //         beforeFirstSpaceCharAscii === ASCII_CODE_LF
    //         || beforeFirstSpaceCharAscii === ASCII_CODE_CR
    //     )
    // ) {
    //     var line = util.getLine(firstSpaceIndex, fileContent);
    //     var lineContent = util.getLineContent(line, fileContent);
    //     var colorStr = String.fromCharCode(32)
    //         + lineContent.split(/[\.#{;]/)[0]; // 这里的 split 是为了把开头的第一个完整单词输出出来

    //     invalidList.push({
    //         line: line,
    //         col: firstSpaceIndex,
    //         message: '`'
    //             + colorStr
    //             + '` '
    //             + msg,
    //         colorMessage: '`'
    //             + chalk.magenta(
    //                 colorStr
    //             )
    //             + '` '
    //             + chalk.grey(msg)
    //     });
    // }

    return invalidList;
};
