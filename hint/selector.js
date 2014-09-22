/**
 * @file 选择器的校验
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../lib/util');

/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {Array.<Object>} invalidList 不合法文件集合
 */
module.exports = function (parser, fileContent, invalidList) {
    parser.addListener('startrule', function(event){
        var selectors = event.selectors,
            selector,
            part,
            modifier,
            classCount,
            i, j, k;

        for (i=0; i < selectors.length; i++){
            selector = selectors[i];
            for (j=0; j < selector.parts.length; j++){
                part = selector.parts[j];
                if (part.type == parser.SELECTOR_PART_TYPE){
                    classCount = 0;
                    for (k=0; k < part.modifiers.length; k++){
                        modifier = part.modifiers[k];
                        if (modifier.type == 'class'){
                            classCount++;
                        }
                        if (classCount > 1){
                            var lineContent = util.getLineContent(part.line, fileContent);
                            console.log(lineContent.replace(
                                lineContent.slice(0, part.col + 1),
                                chalk.magenta(lineContent.slice(0, part.col + 1))
                            ))
                            invalidList.push({
                                line: part.line,
                                col: part.col,
                                message: '`'
                                    + lineContent.replace(
                                        lineContent.slice(0, part.col + 1),
                                        chalk.magenta(lineContent.slice(0, part.col + 1))
                                    )
                                    + '` '
                                    + chalk.grey('Don\'t use adjoining classes.')
                            });
                        }
                    }
                }
            }
        }

        // var selectors = event.selectors,
        //     selector,
        //     part,
        //     modifier,
        //     classCount,
        //     i, j, k;

        // for (i=0; i < selectors.length; i++){
        //     selector = selectors[i];
        //     for (j=0; j < selector.parts.length; j++){
        //         part = selector.parts[j];
        //         if (part.type == parser.SELECTOR_PART_TYPE){
        //             classCount = 0;
        //             for (k=0; k < part.modifiers.length; k++){
        //                 modifier = part.modifiers[k];
        //                 if (modifier.type == "class"){
        //                     classCount++;
        //                 }
        //                 if (classCount > 1){
        //                     console.log("Don't use adjoining classes.", part.line, part.col);
        //                 }
        //             }
        //         }
        //     }
        // }

        // var selectors = event.selectors,
        //     selector,
        //     part,
        //     modifier,
        //     idCount,
        //     i, j, k;

        // for (i=0; i < selectors.length; i++){
        //     selector = selectors[i];
        //     idCount = 0;

        //     for (j=0; j < selector.parts.length; j++){
        //         part = selector.parts[j];
        //         if (part.type == parser.SELECTOR_PART_TYPE){
        //             for (k=0; k < part.modifiers.length; k++){
        //                 modifier = part.modifiers[k];
        //                 if (modifier.type == "id"){
        //                     idCount++;
        //                 }
        //             }
        //         }
        //     }
        //     if (idCount == 1){
        //         console.log("Don't use IDs in selectors.", selector.line, selector.col);
        //     } else if (idCount > 1){
        //         console.log(idCount + " IDs in the selector, really?", selector.line, selector.col);
        //     }
        // }

        var selectors = event.selectors;
        // console.log(selectors);
        console.log(chalk.green(require('util').inspect(selectors, { showHidden: true, depth: null })));
        console.log();


    });
}
