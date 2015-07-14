/**
 * @file 常用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var edp = require('edp-core');
var chalk = require('chalk');
var postcss = require('postcss');

var colors = require('./colors');

var WHITESPACE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;

/**
 * 数组去重
 *
 * @param {Array} arr 需要去掉重复项的数组
 *
 * @return {Array} 结果数组
 */
exports.arrUnique = function (arr) {
    var ret = [];
    var obj = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        if (!obj[arr[i]]) {
            ret.push(arr[i]);
            obj[arr[i]] = 1;
        }
    }
    return ret;
};

/**
 * 调用给定的迭代函数 n 次,每一次传递 index 参数，调用迭代函数。
 * from underscore
 *
 * @param {number} n 迭代次数
 * @param {Function} iterator 处理函数
 * @param {Object} context 上下文
 *
 * @return {Array} 结果集
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
 *
 * @return {number} 行号
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
 *
 * @return {string} 改变颜色后的字符串
 */
exports.changeColorByIndex = function (source, startIndex, colorStr) {
    var ret = '';
    if (source) {
        var colorStrLen = colorStr.length;
        var endIndex = startIndex + colorStrLen;
        ret = ''
            + source.slice(0, startIndex) // colorStr 前面的部分
            + chalk.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
            + source.slice(endIndex, source.length); // colorStr 后面的部分
    }
    return ret;
};

/**
 * 根据开始和结束的索引来高亮字符串的字串
 *
 * @param {string} source 源字符串
 * @param {number} startIndex 开始的索引
 * @param {number} endIndex 结束的索引
 *
 * @return {string} 改变颜色后的字符串
 */
exports.changeColorByStartAndEndIndex = function (source, startIndex, endIndex) {
    if (!source) {
        return '';
    }

    startIndex -= 1;
    endIndex -= 1;

    return ''
        + source.slice(0, startIndex) // colorStr 前面的部分
        + chalk.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
        + source.slice(endIndex, source.length); // colorStr 后面的部分
};

/**
 * 获取 css 属性值的信息
 *
 * @param {string} text css 属性值
 *
 * @return {Array} 信息对象
 */
/* eslint-disable fecs-max-statements */
exports.getPropertyValue = function (text) {
    var parts = [];

    var arr = postcss.list.space(String(text));

    for (var i = 0, len = arr.length; i < len; i++) {
        var part = {};
        part.text = arr[i];

        var temp;

        // dimension
        if (/^([+\-]?[\d\.]+)([a-z]+)$/i.test(arr[i])) {
            part.value = +RegExp.$1;
            part.units = RegExp.$2;

            switch (part.units.toLowerCase()) {
                case 'em':
                case 'rem':
                case 'ex':
                case 'px':
                case 'cm':
                case 'mm':
                case 'in':
                case 'pt':
                case 'pc':
                case 'ch':
                case 'vh':
                case 'vw':
                case 'vmax':
                case 'vmin':
                    part.type = 'length';
                    break;

                case 'deg':
                case 'rad':
                case 'grad':
                    part.type = 'angle';
                    break;

                case 'ms':
                case 's':
                    part.type = 'time';
                    break;

                case 'hz':
                case 'khz':
                    part.type = 'frequency';
                    break;

                case 'dpi':
                case 'dpcm':
                    part.type = 'resolution';
                    break;

                default:
                    part.type = 'dimension';
            }
        }
        // percentage
        else if (/^([+\-]?[\d\.]+)%$/i.test(arr[i])) {
            part.type = 'percentage';
            part.value = +RegExp.$1;
        }
        // integer
        else if (/^([+\-]?\d+)$/i.test(arr[i])) {
            part.type = 'integer';
            part.value = +RegExp.$1;
        }
        // number
        else if (/^([+\-]?[\d\.]+)$/i.test(arr[i])) {
            part.type = 'number';
            part.value = +RegExp.$1;
        }
        // hexcolor
        else if (/^#([a-f0-9]{3,6})/i.test(arr[i])) {
            part.type = 'color';
            temp = RegExp.$1;
            if (temp.length === 3) {
                part.red = parseInt(temp.charAt(0) + temp.charAt(0), 16);
                part.green = parseInt(temp.charAt(1) + temp.charAt(1), 16);
                part.blue = parseInt(temp.charAt(2) + temp.charAt(2), 16);
            }
            else {
                part.red = parseInt(temp.substring(0, 2), 16);
                part.green = parseInt(temp.substring(2, 4), 16);
                part.blue = parseInt(temp.substring(4, 6), 16);
            }
        }
        // rgb() color with absolute numbers
        else if (/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i.test(arr[i])) {
            part.type = 'color';
            part.red = +RegExp.$1;
            part.green = +RegExp.$2;
            part.blue = +RegExp.$3;
        }
        // rgb() color with percentages
        else if (/^rgb\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(arr[i])) {
            part.type = 'color';
            part.red = +RegExp.$1 * 255 / 100;
            part.green = +RegExp.$2 * 255 / 100;
            part.blue = +RegExp.$3 * 255 / 100;
        }
        // rgba() color with absolute numbers
        else if (/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i.test(arr[i])) {
            part.type = 'color';
            part.red = +RegExp.$1;
            part.green = +RegExp.$2;
            part.blue = +RegExp.$3;
            part.alpha = +RegExp.$4;
        }
        // rgba() color with percentages
        else if (/^rgba\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(arr[i])) {
            part.type = 'color';
            part.red = +RegExp.$1 * 255 / 100;
            part.green = +RegExp.$2 * 255 / 100;
            part.blue = +RegExp.$3 * 255 / 100;
            part.alpha = +RegExp.$4;
        }
        // hsl()
        else if (/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(arr[i])) {
            part.type = 'color';
            part.hue = +RegExp.$1;
            part.saturation = +RegExp.$2 / 100;
            part.lightness = +RegExp.$3 / 100;
        }
        // hsla() color with percentages
        else if (/^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(arr[i])) {
            part.type = 'color';
            part.hue  = +RegExp.$1;
            part.saturation = +RegExp.$2 / 100;
            part.lightness = +RegExp.$3 / 100;
            part.alpha = +RegExp.$4;
        }
        // URI
        else if (/^url\(["']?([^\)"']+)["']?\)/i.test(arr[i])) {
            part.type = 'uri';
            part.uri = RegExp.$1;
        }
        else if (/^([^\(]+)\(/i.test(arr[i])) {
            part.type = 'function';
            part.name = RegExp.$1;
            part.value = arr[i];
        }
        // string
        else if (/^["'][^"']*["']/.test(arr[i])) {
            part.type = 'string';
            /* jshint evil: true */
            /* eslint-disable fecs-no-eval, no-eval */
            part.value = eval(arr[i]);
            /* eslint-enable fecs-no-eval, no-eval */
        }
        // named color
        else if (colors[arr[i].toLowerCase()]) {
            part.type = 'color';
            temp = colors[arr[i].toLowerCase()].substring(1);
            part.red  = parseInt(temp.substring(0, 2), 16);
            part.green = parseInt(temp.substring(2, 4), 16);
            part.blue = parseInt(temp.substring(4, 6), 16);
        }
        else if (/^[\,\/]$/.test(arr[i])) {
            part.type = 'operator';
            part.value = arr[i];
        }
        else if (/^[a-z\-_\u0080-\uFFFF][a-z0-9\-_\u0080-\uFFFF]*$/i.test(arr[i])) {
            part.type = 'identifier';
            part.value = arr[i];
        }

        parts.push(part);
    }

    return parts;
};
/* eslint-enable fecs-max-statements */

/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} patterns minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
exports.getCandidates = function (args, patterns) {
    var candidates = [];

    args = args.filter(function (item) {
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
 * 获取忽略的匹配
 *
 * @param {Object} file 文件对象
 *
 * @return {Array} 忽略的数组
 */
exports.getIgnorePatterns = function (file) {
    if (!fs.existsSync(file)) {
        return [];
    }

    var patterns = fs.readFileSync(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter(function (item) {
        return item.trim().length > 0 && item[0] !== '#';
    });
};

var _IGNORE_CACHE = {};

/**
 * 判断一下是否应该忽略这个文件.
 *
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean} 是否忽略
 */
exports.isIgnored = function (file, name) {
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
            factory: function (item) {
                var config = {};
                exports.getIgnorePatterns(item).forEach(function (line) {
                    config[line] = true;
                });
                return config;
            }
        };
        ignorePatterns = edp.util.getConfig(
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
 *
 * @return {Object} 配置
 */
exports.getConfig = function (configName, file, defaultConfig) {
    var dir = edp.path.dirname(edp.path.resolve(file));
    var key = configName + '@' + dir;
    /* istanbul ignore if  */
    if (_CONFIG_CACHE[key]) {
        return _CONFIG_CACHE[key];
    }

    var options = {
        name: configName,
        defaultConfig: defaultConfig,
        factory: function (item) {
            /* istanbul ignore if  */
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
