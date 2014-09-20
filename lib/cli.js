/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var edp = require('edp-core');

var sys = require('../package');
var util = require('./util');

var chalk = require('chalk');

var parserlib = require('parserlib');

/**
 * 校验结果报告
 *
 * @inner
 * @param {Object} errors 按文件类型为 key，值为对应的校验错误信息列表的对象
 */
function report(errors) {
    var t12 = true;

    if (errors.length) {
        errors.forEach(
            function (error) {
                edp.log.info(error.path);
                error.messages.forEach(
                    function (message) {
                        var msg = '→ ';
                        // 全局性的错误可能没有位置信息
                        if (typeof message.line === 'number') {
                            msg += ('line ' + message.line);
                            if (typeof message.col === 'number') {
                                msg += (', col ' + message.col);
                            }
                            msg += ': ';
                        }

                        msg += message.message;
                        edp.log.warn(msg);
                    }
                );
            }
        );
        t12 = false;
    }

    if (t12) {
        edp.log.info('Congratulations! Everything gone well, you are T12!');
    }
    else {
        process.exit(1);
    }
}

/**
 * 显示默认的信息
 */
function showDefaultInfo() {
    console.log('');
    console.log((sys.name + ' v' + sys.version));
    console.log(chalk.bold.green(util.formatMsg(sys.description)));
}

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
exports.parse = function (args) {

    var T = require('./test');
    var t = new T();
    t.show();
    return;

    args = args.slice(2);

    // 不带参数时，默认检测当前目录下所有的 css 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    // 错误信息的集合
    var errors = [];

    var patterns = [
        '**/*.css',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    var candidates = util.getCandidates(args, patterns);

    if (candidates.length) {

        var count = candidates.length;

        /**
         * 每个文件的校验结果回调，主要用于统计校验完成情况
         *
         * @inner
         */
        var callback = function () {
            count--;
            if (!count) {
                report(errors);
            }
        };


        var parser = new parserlib.css.Parser({
            starHack: true,         // 允许 * hack
            ieFilters: true,        // ie < 8 允许 filter properties
            underscoreHack: true,   // 允许 _ hack
            strict: false           // 为 true 时则 parserlib 的 error recovery 不可用
                                    // 并且首次出现语法错误时就终止
        });


        var content = fs.readFileSync(
            'test.css',
            'utf-8'
        ).replace(/\r\n?/g, '\n');

        parser.addListener("startrule", function(event){
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

            // console.log(chalk.red(require('util').inspect(event, { showHidden: true, depth: null })));
        });

        // parser.addListener("property", function(event){
        //     console.log(chalk.green(require('util').inspect(event, { showHidden: true, depth: null })));
        // });

        try {
            parser.parse(content);
        } catch (ex) {
            console.warn(ex);
            // reporter.error("Fatal error, cannot continue: " + ex.message, ex.line, ex.col, {});
        }

        // 遍历每个需要检测的 css 文件
        // candidates.forEach(
        //     function (candidate) {
        //         var file = {
        //             // 因此这里把 文件的换行分隔符统一换成 \n
        //             content: fs.readFileSync(
        //                 candidate,
        //                 'utf-8'
        //             ).replace(/\r\n?/g, '\n'),
        //             path: candidate
        //         };

        //         // require('./checker').check(file, errors, callback);
        //     }
        // );
    }

};
