/**
 * @file checker 针对 css 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var path = require('path');
var edp = require('edp-core');

var util = require('./util');

var chalk = require('chalk');

/**
 * less 检测的默认配置
 *
 * @type {Object}
 */
// var defaultConfig = require('./config');

/**
 * less parser 参数
 *
 * @type {Object}
 */
var parseOptions = {
    paths: [path.dirname('.')],
    includePath: [],
    relativeUrls: true
    // paths: [path.dirname(this.path)].concat(this.options.includePath)
};

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    if (util.isIgnored(file.path, '.lesslintignore')) {
        done();
        return;
    }

    var rcConfig = util.getConfig('.lesslintrc', file.path, defaultConfig);

    // 当前检测文件的相对路径
    var relativePath = edp.path.relative(process.cwd(), file.path);

    // 当前检测文件的绝对路径
    var absolutePath = edp.path.join(process.cwd(), relativePath);

    // 获取当前文件的目录的相对路径，并 push 到 less 的 paths 中
    // TODO: 这里应该还应该支持设置路径 parseOptions.paths.concat(this.options.includePath)
    var relativeDirPath = edp.path.relative(
        process.cwd(),
        absolutePath.slice(
            0,
            absolutePath.lastIndexOf('/')
        )
    );
    if (parseOptions.paths.indexOf(relativeDirPath) === -1) {
        parseOptions.paths.push(relativeDirPath);
    }

    var parser = new (less.Parser)(parseOptions);

    parser.parse(
        file.content,
        function (err, tree) {
            if (err) {
                // console.log(file.path);
                errors.push({
                    path: file.path,
                    messages: [
                        {
                            line: err.line,
                            message: ''
                                + '`'
                                + chalk.red('LESS Parse Error: ')
                                + 'type: '
                                + chalk.red(err.type)
                                + '` '
                                + chalk.grey(err.message)
                        }
                    ]
                });
                done();
                return;
            }

            var lesslintVisitor = new LesslintVisitor({
                fileData: file.content,
                filePath: file.path,
                detectConfigs: rcConfig
            });

            // console.log(require('util').inspect(tree, { showHidden: true, depth: null }));

            lesslintVisitor.exec(tree);

            var invalidList = lesslintVisitor.invalidList;

            if (invalidList.length) {
                errors.push({
                    path: file.path,
                    messages: invalidList
                });
            }

            done();

            try {
                tree.toCSS();
            }
            catch (e) {
                errors.push({
                    path: file.path,
                    messages: [
                        {
                            line: e.line,
                            message: ''
                                + '`'
                                + chalk.red('LESS Parse Error: ')
                                + 'type: '
                                + chalk.red(e.type)
                                + '` '
                                + chalk.grey(e.message)
                        }
                    ]
                });
                done();
                return;
            }
        }
    );


    /*function Parent(opts) {
        this.name = opts && opts.name || 'parent';
    }
    Parent.prototype.fn = function () {
        console.log('this a parent func in prototype');
    }

    function Sub(opts) {
        Parent.call(this, opts);
    }
    Sub.prototype = new Parent();

    Sub.prototype.fn = function () {
        console.log('thisasdsad');
    }

    var p = new Parent({
        name: 'ppp'
    });
    var s = new Sub();

    console.log(p);
    console.log(s);

    p.fn();
    s.fn();*/

};
