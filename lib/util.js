/**
 * @file 常用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var edp = require('edp-core');
var chalk = require('chalk');

var WHITESPACE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;

/**
 * 调用给定的迭代函数 n 次,每一次传递 index 参数，调用迭代函数。
 * from underscore
 *
 * @param {number} n 迭代次数
 * @param {Function} iterator 处理函数
 * @param {Object} context 上下文
 */
exports.times = function (n, iterator, context) {
    var accum = new Array(Math.max(0, n));
    for (var i = 0; i < n; i++) {
        accum[i] = iterator.call(context, i);
    }
    return accum;
};

/**
 * 格式化信息
 *
 * @param {string} msg 输出的信息
 * @param {number} spaceCount 信息前面空格的个数即缩进的长度
 *
 * @return {string} 格式化后的信息
 */
exports.formatMsg = function (msg, spaceCount) {
    var space = '';
    spaceCount = spaceCount || 0;
    exports.times(
        spaceCount,
        function () {
            space += ' ';
        }
    );
    return space + msg;
};

/**
 * 获取行号
 *
 * @param {number} index 索引
 * @param {string} data 文件内容
 */
exports.getLine = function (index, data) {
    var str = data.slice(0, index);
    return (str.match(/\n/g) || '').length + 1;
};

/**
 * 根据行号获取当前行的内容
 *
 * @param {number} line 行号
 * @param {string} fileData 文件内容
 *
 * @return {string} 当前行内容
 */
// exports.getLineContent = function (line, fileData) {
//     // 去掉前面的缩进
//     return fileData.split('\n')[line - 1].replace(/\s*/, '');
// };

exports.getLineContent = function (line, fileData, isReplaceSpace) {
    var content = fileData.split('\n')[line - 1];
    if (isReplaceSpace) {
        content = content.replace(/\s*/, '');
    }
    return content;
};


/**
 * 根据索引获取当前行的内容
 *
 * @param {number} index 索引
 * @param {string} fileData 文件内容
 *
 * @return {string} 当前行内容
 */
exports.getLineContentByIndex = function (index, fileData) {
    return exports.getLineContent(exports.getLine(index, fileData), fileData);
};

/**
 * 删除目标字符串两端的空白字符
 *
 * @param {string} source 目标字符串
 * @return {string} 删除两端空白字符后的字符串
 */
exports.trim = function (source) {
    if (!source) {
        return '';
    }

    return String(source).replace(WHITESPACE, '');
};

/**
 * 根据索引获取位置
 * from less/lib/less/parser.js
 *
 * @param {number} index 索引
 * @param {string} inputStream 文件内容
 *
 * @return {Object} 位置信息
 */
exports.getLocation = function (index, inputStream) {
    var n = index + 1;
    var line = null;
    var column = -1;

    while (--n >= 0 && inputStream.charAt(n) !== '\n') {
        column++;
    }

    if (typeof index === 'number') {
        line = (inputStream.slice(0, index).match(/\n/g) || '').length;
    }

    return {
        line: line,
        column: column
    };
};

/**
 * 根据索引把一行内容中的某个子串变色
 * 直接用正则匹配的话，可能会把这一行所有的 colorStr 给变色，所以要通过索引来判断
 *
 * @param {string} source 源字符串
 * @param {number} startIndex 开始的索引，通常是 col
 * @param {string} colorStr 要变色的字符串
 */
exports.changeColorByIndex = function (source, startIndex, colorStr) {
    var colorStrLen = colorStr.length;
    var endIndex = startIndex + colorStrLen;
    return ''
        + source.slice(0, startIndex) // colorStr 前面的部分
        + chalk.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
        + source.slice(endIndex, source.length) // colorStr 后面的部分
}

/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} patterns minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
exports.getCandidates = function(args, patterns) {
    var candidates = [];

    args = args.filter(function(item) {
        return item !== '.';
    });

    if (!args.length) {
        candidates = edp.glob.sync(patterns);
    }
    else {
        for (var i = 0; i < args.length; i++) {
            var target = args[i];
            if (!fs.existsSync(target)) {
                edp.log.warn('No such file or directory %s', target);
                continue;
            }

            var stat = fs.statSync(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(
                    candidates,
                    edp.glob.sync(target + '/' + patterns[0]));
            }
            else if (stat.isFile()) {
                candidates.push(target);
            }
        }
    }

    return candidates;
};


/**
 * @return {Array.<string>}
 */
exports.getIgnorePatterns = function(file) {
    if (!fs.existsSync(file)) {
        return [];
    }

    var patterns = fs.readFileSync(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter(function(item) {
        return item.trim().length > 0 && item[0] !== '#';
    });
};

var _IGNORE_CACHE = {};
/**
 * 判断一下是否应该忽略这个文件.
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
exports.isIgnored = function(file, name) {
    var ignorePatterns = null;

    name = name || '.jshintignore';
    file = edp.path.resolve(file);

    var key = name + '@'  + edp.path.dirname(file);
    if (_IGNORE_CACHE[key]) {
        ignorePatterns = _IGNORE_CACHE[key];
    }
    else {
        var options = {
            name: name,
            factory: function(item) {
                var config = {};
                exports.getIgnorePatterns(item).forEach(function(line) {
                    config[line] = true;
                });
                return config;
            }
        };
        var ignorePatterns = edp.util.getConfig(
            edp.path.dirname(file),
            options
        );

        _IGNORE_CACHE[key] = ignorePatterns;
    }

    var bizOrPkgRoot = process.cwd();
    try {
        bizOrPkgRoot = edp.path.getRootDirectory();
    }
    catch (ex) {
    }

    var dirname = edp.path.relative(bizOrPkgRoot, file);
    var isMatch = edp.glob.match(dirname, Object.keys(ignorePatterns));

    return isMatch;
};


/**
 * 目录配置信息的缓存数据
 * @ignore
 */
var _CONFIG_CACHE = {};

/**
 * 读取默认的配置信息，可以缓存一下.
 *
 * @param {string} configName 配置文件的名称.
 * @param {string} file 文件名称.
 * @param {Object=} defaultConfig 默认的配置信息.
 */
exports.getConfig = function(configName, file, defaultConfig) {
    var dir = edp.path.dirname(edp.path.resolve(file));
    var key = configName + '@' + dir;

    if (_CONFIG_CACHE[key]) {
        return _CONFIG_CACHE[key];
    }

    var options = {
        name: configName,
        defaultConfig: defaultConfig,
        factory: function(item) {
            if (!fs.existsSync(item)) {
                return null;
            }

            return JSON.parse(fs.readFileSync(item, 'utf-8'));
        }
    };

    var value = edp.util.getConfig(dir, options);

    _CONFIG_CACHE[key] = value;

    return value;
};

