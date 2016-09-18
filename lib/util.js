'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.trim = trim;
exports.formatMsg = formatMsg;
exports.getCandidates = getCandidates;
exports.getIgnorePatterns = getIgnorePatterns;
exports.isIgnored = isIgnored;
exports.getLineContent = getLineContent;
exports.changeColorByIndex = changeColorByIndex;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _edpCore = require('edp-core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'use strict'; /**
               * @file 通用方法
               * @author ielgnaw(wuji0223@gmail.com)
               */

var WHITESPACE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;

/**
 * 删除目标字符串两端的空白字符
 *
 * @param {string} source 目标字符串
 * @return {string} 删除两端空白字符后的字符串
 */
function trim(source) {
    if (!source) {
        return '';
    }

    return String(source).replace(WHITESPACE, '');
}

/**
 * 调用给定的迭代函数 n 次,每一次传递 index 参数，调用迭代函数。
 * from underscore
 *
 * @param {number} n 迭代次数
 * @param {Function} iterator 处理函数
 * @param {Object} context 上下文
 *
 * @return {Array} 结果
 */
function times(n, iterator, context) {
    var accum = new Array(Math.max(0, n));
    for (var i = 0; i < n; i++) {
        accum[i] = iterator.call(context, i);
    }
    return accum;
}

/**
 * 格式化信息
 *
 * @param {string} msg 输出的信息
 * @param {number} spaceCount 信息前面空格的个数即缩进的长度
 *
 * @return {string} 格式化后的信息
 */
function formatMsg(msg) {
    var spaceCount = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    var space = '';
    times(spaceCount, function () {
        space += ' ';
    });
    return space + msg;
}

/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} patterns minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
function getCandidates(args, patterns) {
    var candidates = [];

    args = args.filter(function (item) {
        return item !== '.';
    });

    if (!args.length) {
        candidates = _edpCore.glob.sync(patterns);
    } else {
        var i = -1;
        var len = args.length;
        while (++i < len) {
            var target = args[i];
            if (!(0, _fs.existsSync)(target)) {
                _edpCore.log.warn('No such file or directory %s', target);
                continue;
            }

            var stat = (0, _fs.statSync)(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(candidates, _edpCore.glob.sync(target + '/' + patterns[0]));
            }
            /* istanbul ignore else */
            else if (stat.isFile()) {
                    candidates.push(target);
                }
        }
    }

    return candidates;
}

/**
 * 获取忽略的 pattern
 *
 * @param {string} file 文件路径
 *
 * @return {Array.<string>} 结果
 */
function getIgnorePatterns(file) {
    if (!(0, _fs.existsSync)(file)) {
        return [];
    }

    var patterns = (0, _fs.readFileSync)(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter(function (item) {
        return item.trim().length > 0 && item[0] !== '#';
    });
}

var _IGNORE_CACHE = {};

/**
 * 判断一下是否应该忽略这个文件.
 *
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
function isIgnored(file) {
    var name = arguments.length <= 1 || arguments[1] === undefined ? '.csshintignore' : arguments[1];

    var ignorePatterns = null;

    file = _edpCore.path.resolve(file);

    var key = name + '@' + _edpCore.path.dirname(file);
    if (_IGNORE_CACHE[key]) {
        ignorePatterns = _IGNORE_CACHE[key];
    } else {
        var options = {
            name: name,
            factory: function factory(item) {
                var config = {};
                getIgnorePatterns(item).forEach(function (line) {
                    config[line] = true;
                });
                return config;
            }
        };
        ignorePatterns = _edpCore.util.getConfig(_edpCore.path.dirname(file), options);

        _IGNORE_CACHE[key] = ignorePatterns;
    }

    var bizOrPkgRoot = process.cwd();

    try {
        bizOrPkgRoot = _edpCore.path.getRootDirectory();
    } catch (ex) {}

    var dirname = _edpCore.path.relative(bizOrPkgRoot, file);
    var isMatch = _edpCore.glob.match(dirname, Object.keys(ignorePatterns));

    return isMatch;
}

/**
 * 根据行号获取当前行的内容
 *
 * @param {number} line 行号
 * @param {string} fileData 文件内容
 * @param {boolean} isReplaceSpace 是否去掉空格
 *
 * @return {string} 当前行内容
 */
function getLineContent(line, fileData, isReplaceSpace) {
    var content = fileData.split('\n')[line - 1];
    if (isReplaceSpace) {
        content = content.replace(/\s*/, '');
    }
    return content;
}

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
function changeColorByIndex(source, startIndex, colorStr) {
    var ret = '';
    if (source) {
        var colorStrLen = colorStr.length;
        var endIndex = startIndex + colorStrLen;
        ret = '' + source.slice(0, startIndex) // colorStr 前面的部分
        + _chalk2.default.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
        + source.slice(endIndex, source.length); // colorStr 后面的部分
    }
    return ret;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbInRyaW0iLCJmb3JtYXRNc2ciLCJnZXRDYW5kaWRhdGVzIiwiZ2V0SWdub3JlUGF0dGVybnMiLCJpc0lnbm9yZWQiLCJnZXRMaW5lQ29udGVudCIsImNoYW5nZUNvbG9yQnlJbmRleCIsIldISVRFU1BBQ0UiLCJzb3VyY2UiLCJTdHJpbmciLCJyZXBsYWNlIiwidGltZXMiLCJuIiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiYWNjdW0iLCJBcnJheSIsIk1hdGgiLCJtYXgiLCJpIiwiY2FsbCIsIm1zZyIsInNwYWNlQ291bnQiLCJzcGFjZSIsImFyZ3MiLCJwYXR0ZXJucyIsImNhbmRpZGF0ZXMiLCJmaWx0ZXIiLCJpdGVtIiwibGVuZ3RoIiwic3luYyIsImxlbiIsInRhcmdldCIsIndhcm4iLCJzdGF0IiwiaXNEaXJlY3RvcnkiLCJwdXNoIiwiYXBwbHkiLCJpc0ZpbGUiLCJmaWxlIiwic3BsaXQiLCJfSUdOT1JFX0NBQ0hFIiwibmFtZSIsImlnbm9yZVBhdHRlcm5zIiwicmVzb2x2ZSIsImtleSIsImRpcm5hbWUiLCJvcHRpb25zIiwiZmFjdG9yeSIsImNvbmZpZyIsImZvckVhY2giLCJsaW5lIiwiZ2V0Q29uZmlnIiwiYml6T3JQa2dSb290IiwicHJvY2VzcyIsImN3ZCIsImdldFJvb3REaXJlY3RvcnkiLCJleCIsInJlbGF0aXZlIiwiaXNNYXRjaCIsIm1hdGNoIiwiT2JqZWN0Iiwia2V5cyIsImZpbGVEYXRhIiwiaXNSZXBsYWNlU3BhY2UiLCJjb250ZW50Iiwic3RhcnRJbmRleCIsImNvbG9yU3RyIiwicmV0IiwiY29sb3JTdHJMZW4iLCJlbmRJbmRleCIsInNsaWNlIiwibWFnZW50YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7UUFtQmdCQSxJLEdBQUFBLEk7UUFtQ0FDLFMsR0FBQUEsUztRQWdCQUMsYSxHQUFBQSxhO1FBMkNBQyxpQixHQUFBQSxpQjtRQWtCQUMsUyxHQUFBQSxTO1FBbURBQyxjLEdBQUFBLGM7UUFrQkFDLGtCLEdBQUFBLGtCOztBQW5NaEI7Ozs7QUFDQTs7QUFDQTs7OztBQUVBLGEsQ0FUQTs7Ozs7QUFXQSxJQUFNQyxhQUFhLG9DQUFuQjs7QUFFQTs7Ozs7O0FBTU8sU0FBU1AsSUFBVCxDQUFjUSxNQUFkLEVBQXNCO0FBQ3pCLFFBQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1QsZUFBTyxFQUFQO0FBQ0g7O0FBRUQsV0FBT0MsT0FBT0QsTUFBUCxFQUFlRSxPQUFmLENBQXVCSCxVQUF2QixFQUFtQyxFQUFuQyxDQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7QUFVQSxTQUFTSSxLQUFULENBQWVDLENBQWYsRUFBa0JDLFFBQWxCLEVBQTRCQyxPQUE1QixFQUFxQztBQUNqQyxRQUFNQyxRQUFRLElBQUlDLEtBQUosQ0FBVUMsS0FBS0MsR0FBTCxDQUFTLENBQVQsRUFBWU4sQ0FBWixDQUFWLENBQWQ7QUFDQSxTQUFLLElBQUlPLElBQUksQ0FBYixFQUFnQkEsSUFBSVAsQ0FBcEIsRUFBdUJPLEdBQXZCLEVBQTRCO0FBQ3hCSixjQUFNSSxDQUFOLElBQVdOLFNBQVNPLElBQVQsQ0FBY04sT0FBZCxFQUF1QkssQ0FBdkIsQ0FBWDtBQUNIO0FBQ0QsV0FBT0osS0FBUDtBQUNIOztBQUdEOzs7Ozs7OztBQVFPLFNBQVNkLFNBQVQsQ0FBbUJvQixHQUFuQixFQUF3QztBQUFBLFFBQWhCQyxVQUFnQix5REFBSCxDQUFHOztBQUMzQyxRQUFJQyxRQUFRLEVBQVo7QUFDQVosVUFBTVcsVUFBTixFQUFrQixZQUFNO0FBQ3BCQyxpQkFBUyxHQUFUO0FBQ0gsS0FGRDtBQUdBLFdBQU9BLFFBQVFGLEdBQWY7QUFDSDs7QUFFRDs7Ozs7Ozs7QUFRTyxTQUFTbkIsYUFBVCxDQUF1QnNCLElBQXZCLEVBQTZCQyxRQUE3QixFQUF1QztBQUMxQyxRQUFJQyxhQUFhLEVBQWpCOztBQUVBRixXQUFPQSxLQUFLRyxNQUFMLENBQVk7QUFBQSxlQUFRQyxTQUFTLEdBQWpCO0FBQUEsS0FBWixDQUFQOztBQUVBLFFBQUksQ0FBQ0osS0FBS0ssTUFBVixFQUFrQjtBQUNkSCxxQkFBYSxjQUFLSSxJQUFMLENBQVVMLFFBQVYsQ0FBYjtBQUNILEtBRkQsTUFHSztBQUNELFlBQUlOLElBQUksQ0FBQyxDQUFUO0FBQ0EsWUFBSVksTUFBTVAsS0FBS0ssTUFBZjtBQUNBLGVBQU8sRUFBRVYsQ0FBRixHQUFNWSxHQUFiLEVBQWtCO0FBQ2QsZ0JBQUlDLFNBQVNSLEtBQUtMLENBQUwsQ0FBYjtBQUNBLGdCQUFJLENBQUMsb0JBQVdhLE1BQVgsQ0FBTCxFQUF5QjtBQUNyQiw2QkFBSUMsSUFBSixDQUFTLDhCQUFULEVBQXlDRCxNQUF6QztBQUNBO0FBQ0g7O0FBRUQsZ0JBQUlFLE9BQU8sa0JBQVNGLE1BQVQsQ0FBWDtBQUNBLGdCQUFJRSxLQUFLQyxXQUFMLEVBQUosRUFBd0I7QUFDcEJILHlCQUFTQSxPQUFPdEIsT0FBUCxDQUFlLFdBQWYsRUFBNEIsRUFBNUIsQ0FBVDtBQUNBZ0IsMkJBQVdVLElBQVgsQ0FBZ0JDLEtBQWhCLENBQ0lYLFVBREosRUFFSSxjQUFLSSxJQUFMLENBQVVFLFNBQVMsR0FBVCxHQUFlUCxTQUFTLENBQVQsQ0FBekIsQ0FGSjtBQUlIO0FBQ0Q7QUFQQSxpQkFRSyxJQUFJUyxLQUFLSSxNQUFMLEVBQUosRUFBbUI7QUFDcEJaLCtCQUFXVSxJQUFYLENBQWdCSixNQUFoQjtBQUNIO0FBQ0o7QUFDSjs7QUFFRCxXQUFPTixVQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7QUFPTyxTQUFTdkIsaUJBQVQsQ0FBMkJvQyxJQUEzQixFQUFpQztBQUNwQyxRQUFJLENBQUMsb0JBQVdBLElBQVgsQ0FBTCxFQUF1QjtBQUNuQixlQUFPLEVBQVA7QUFDSDs7QUFFRCxRQUFJZCxXQUFXLHNCQUFhYyxJQUFiLEVBQW1CLE9BQW5CLEVBQTRCQyxLQUE1QixDQUFrQyxRQUFsQyxDQUFmO0FBQ0EsV0FBT2YsU0FBU0UsTUFBVCxDQUFnQjtBQUFBLGVBQVFDLEtBQUs1QixJQUFMLEdBQVk2QixNQUFaLEdBQXFCLENBQXJCLElBQTBCRCxLQUFLLENBQUwsTUFBWSxHQUE5QztBQUFBLEtBQWhCLENBQVA7QUFDSDs7QUFFRCxJQUFNYSxnQkFBZ0IsRUFBdEI7O0FBRUE7Ozs7Ozs7QUFPTyxTQUFTckMsU0FBVCxDQUFtQm1DLElBQW5CLEVBQWtEO0FBQUEsUUFBekJHLElBQXlCLHlEQUFsQixnQkFBa0I7O0FBQ3JELFFBQUlDLGlCQUFpQixJQUFyQjs7QUFFQUosV0FBTyxjQUFRSyxPQUFSLENBQWdCTCxJQUFoQixDQUFQOztBQUVBLFFBQUlNLE1BQU1ILE9BQU8sR0FBUCxHQUFjLGNBQVFJLE9BQVIsQ0FBZ0JQLElBQWhCLENBQXhCO0FBQ0EsUUFBSUUsY0FBY0ksR0FBZCxDQUFKLEVBQXdCO0FBQ3BCRix5QkFBaUJGLGNBQWNJLEdBQWQsQ0FBakI7QUFDSCxLQUZELE1BR0s7QUFDRCxZQUFJRSxVQUFVO0FBQ1ZMLGtCQUFNQSxJQURJO0FBRVZNLG1CQUZVLG1CQUVGcEIsSUFGRSxFQUVJO0FBQ1Ysb0JBQUlxQixTQUFTLEVBQWI7QUFDQTlDLGtDQUFrQnlCLElBQWxCLEVBQXdCc0IsT0FBeEIsQ0FBZ0MsZ0JBQVE7QUFDcENELDJCQUFPRSxJQUFQLElBQWUsSUFBZjtBQUNILGlCQUZEO0FBR0EsdUJBQU9GLE1BQVA7QUFDSDtBQVJTLFNBQWQ7QUFVQU4seUJBQWlCLGNBQVFTLFNBQVIsQ0FDYixjQUFRTixPQUFSLENBQWdCUCxJQUFoQixDQURhLEVBRWJRLE9BRmEsQ0FBakI7O0FBS0FOLHNCQUFjSSxHQUFkLElBQXFCRixjQUFyQjtBQUNIOztBQUVELFFBQUlVLGVBQWVDLFFBQVFDLEdBQVIsRUFBbkI7O0FBRUEsUUFBSTtBQUNBRix1QkFBZSxjQUFRRyxnQkFBUixFQUFmO0FBQ0gsS0FGRCxDQUdBLE9BQU9DLEVBQVAsRUFBVyxDQUNWOztBQUVELFFBQU1YLFVBQVUsY0FBUVksUUFBUixDQUFpQkwsWUFBakIsRUFBK0JkLElBQS9CLENBQWhCO0FBQ0EsUUFBTW9CLFVBQVUsY0FBS0MsS0FBTCxDQUFXZCxPQUFYLEVBQW9CZSxPQUFPQyxJQUFQLENBQVluQixjQUFaLENBQXBCLENBQWhCOztBQUVBLFdBQU9nQixPQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7OztBQVNPLFNBQVN0RCxjQUFULENBQXdCOEMsSUFBeEIsRUFBOEJZLFFBQTlCLEVBQXdDQyxjQUF4QyxFQUF3RDtBQUMzRCxRQUFJQyxVQUFVRixTQUFTdkIsS0FBVCxDQUFlLElBQWYsRUFBcUJXLE9BQU8sQ0FBNUIsQ0FBZDtBQUNBLFFBQUlhLGNBQUosRUFBb0I7QUFDaEJDLGtCQUFVQSxRQUFRdkQsT0FBUixDQUFnQixLQUFoQixFQUF1QixFQUF2QixDQUFWO0FBQ0g7QUFDRCxXQUFPdUQsT0FBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7O0FBVU8sU0FBUzNELGtCQUFULENBQTRCRSxNQUE1QixFQUFvQzBELFVBQXBDLEVBQWdEQyxRQUFoRCxFQUEwRDtBQUM3RCxRQUFJQyxNQUFNLEVBQVY7QUFDQSxRQUFJNUQsTUFBSixFQUFZO0FBQ1IsWUFBTTZELGNBQWNGLFNBQVN0QyxNQUE3QjtBQUNBLFlBQU15QyxXQUFXSixhQUFhRyxXQUE5QjtBQUNBRCxjQUFNLEtBQ0E1RCxPQUFPK0QsS0FBUCxDQUFhLENBQWIsRUFBZ0JMLFVBQWhCLENBREEsQ0FDNEI7QUFENUIsVUFFQSxnQkFBTU0sT0FBTixDQUFjaEUsT0FBTytELEtBQVAsQ0FBYUwsVUFBYixFQUF5QkksUUFBekIsQ0FBZCxDQUZBLENBRWtEO0FBRmxELFVBR0E5RCxPQUFPK0QsS0FBUCxDQUFhRCxRQUFiLEVBQXVCOUQsT0FBT3FCLE1BQTlCLENBSE4sQ0FIUSxDQU1xQztBQUNoRDtBQUNELFdBQU91QyxHQUFQO0FBQ0giLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUg6YCa55So5pa55rOVXG4gKiBAYXV0aG9yIGllbGduYXcod3VqaTAyMjNAZ21haWwuY29tKVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3N0YXRTeW5jLCBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7Z2xvYiwgbG9nLCB1dGlsIGFzIGVkcFV0aWwsIHBhdGggYXMgZWRwUGF0aH0gZnJvbSAnZWRwLWNvcmUnO1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IFdISVRFU1BBQ0UgPSAvXltcXHNcXHhhMFxcdTMwMDBdK3xbXFx1MzAwMFxceGEwXFxzXSskL2c7XG5cbi8qKlxuICog5Yig6Zmk55uu5qCH5a2X56ym5Liy5Lik56uv55qE56m655m95a2X56ymXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZSDnm67moIflrZfnrKbkuLJcbiAqIEByZXR1cm4ge3N0cmluZ30g5Yig6Zmk5Lik56uv56m655m95a2X56ym5ZCO55qE5a2X56ym5LiyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmltKHNvdXJjZSkge1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nKHNvdXJjZSkucmVwbGFjZShXSElURVNQQUNFLCAnJyk7XG59XG5cbi8qKlxuICog6LCD55So57uZ5a6a55qE6L+t5Luj5Ye95pWwIG4g5qyhLOavj+S4gOasoeS8oOmAkiBpbmRleCDlj4LmlbDvvIzosIPnlKjov63ku6Plh73mlbDjgIJcbiAqIGZyb20gdW5kZXJzY29yZVxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIOi/reS7o+asoeaVsFxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3Ig5aSE55CG5Ye95pWwXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCDkuIrkuIvmlodcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0g57uT5p6cXG4gKi9cbmZ1bmN0aW9uIHRpbWVzKG4sIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgY29uc3QgYWNjdW0gPSBuZXcgQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGFjY3VtW2ldID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY3VtO1xufVxuXG5cbi8qKlxuICog5qC85byP5YyW5L+h5oGvXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1zZyDovpPlh7rnmoTkv6Hmga9cbiAqIEBwYXJhbSB7bnVtYmVyfSBzcGFjZUNvdW50IOS/oeaBr+WJjemdouepuuagvOeahOS4quaVsOWNs+e8qei/m+eahOmVv+W6plxuICpcbiAqIEByZXR1cm4ge3N0cmluZ30g5qC85byP5YyW5ZCO55qE5L+h5oGvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNc2cobXNnLCBzcGFjZUNvdW50ID0gMCkge1xuICAgIGxldCBzcGFjZSA9ICcnO1xuICAgIHRpbWVzKHNwYWNlQ291bnQsICgpID0+IHtcbiAgICAgICAgc3BhY2UgKz0gJyAnO1xuICAgIH0pO1xuICAgIHJldHVybiBzcGFjZSArIG1zZztcbn1cblxuLyoqXG4gKiDmoLnmja7lj4LmlbDku6Xlj4rmqKHlvI/ljLnphY3nm7jlupTnmoTmlofku7ZcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIOaWh+S7tlxuICogQHBhcmFtIHtBcnJheX0gcGF0dGVybnMgbWluaW1hdGNoIOaooeW8j1xuICpcbiAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSDljLnphY3nmoTmlofku7bpm4blkIhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhbmRpZGF0ZXMoYXJncywgcGF0dGVybnMpIHtcbiAgICBsZXQgY2FuZGlkYXRlcyA9IFtdO1xuXG4gICAgYXJncyA9IGFyZ3MuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gJy4nKTtcblxuICAgIGlmICghYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FuZGlkYXRlcyA9IGdsb2Iuc3luYyhwYXR0ZXJucyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICBsZXQgbGVuID0gYXJncy5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBhcmdzW2ldO1xuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBsb2cud2FybignTm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeSAlcycsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzdGF0ID0gc3RhdFN5bmModGFyZ2V0KTtcbiAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucmVwbGFjZSgvW1xcL3xcXFxcXSskLywgJycpO1xuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaC5hcHBseShcbiAgICAgICAgICAgICAgICAgICAgY2FuZGlkYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYi5zeW5jKHRhcmdldCArICcvJyArIHBhdHRlcm5zWzBdKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaCh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXM7XG59XG5cbi8qKlxuICog6I635Y+W5b+955Wl55qEIHBhdHRlcm5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZSDmlofku7bot6/lvoRcbiAqXG4gKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn0g57uT5p6cXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJZ25vcmVQYXR0ZXJucyhmaWxlKSB7XG4gICAgaWYgKCFleGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBsZXQgcGF0dGVybnMgPSByZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04Jykuc3BsaXQoL1xccj9cXG4vZyk7XG4gICAgcmV0dXJuIHBhdHRlcm5zLmZpbHRlcihpdGVtID0+IGl0ZW0udHJpbSgpLmxlbmd0aCA+IDAgJiYgaXRlbVswXSAhPT0gJyMnKTtcbn1cblxuY29uc3QgX0lHTk9SRV9DQUNIRSA9IHt9O1xuXG4vKipcbiAqIOWIpOaWreS4gOS4i+aYr+WQpuW6lOivpeW/veeVpei/meS4quaWh+S7ti5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZSDpnIDopoHmo4Dmn6XnmoTmlofku7bot6/lvoQuXG4gKiBAcGFyYW0ge3N0cmluZz19IG5hbWUgaWdub3Jl5paH5Lu255qE5ZCN56ewLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSWdub3JlZChmaWxlLCBuYW1lID0gJy5jc3NoaW50aWdub3JlJykge1xuICAgIGxldCBpZ25vcmVQYXR0ZXJucyA9IG51bGw7XG5cbiAgICBmaWxlID0gZWRwUGF0aC5yZXNvbHZlKGZpbGUpO1xuXG4gICAgbGV0IGtleSA9IG5hbWUgKyAnQCcgICsgZWRwUGF0aC5kaXJuYW1lKGZpbGUpO1xuICAgIGlmIChfSUdOT1JFX0NBQ0hFW2tleV0pIHtcbiAgICAgICAgaWdub3JlUGF0dGVybnMgPSBfSUdOT1JFX0NBQ0hFW2tleV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBmYWN0b3J5KGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBsZXQgY29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgZ2V0SWdub3JlUGF0dGVybnMoaXRlbSkuZm9yRWFjaChsaW5lID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnW2xpbmVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZ25vcmVQYXR0ZXJucyA9IGVkcFV0aWwuZ2V0Q29uZmlnKFxuICAgICAgICAgICAgZWRwUGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICApO1xuXG4gICAgICAgIF9JR05PUkVfQ0FDSEVba2V5XSA9IGlnbm9yZVBhdHRlcm5zO1xuICAgIH1cblxuICAgIGxldCBiaXpPclBrZ1Jvb3QgPSBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYml6T3JQa2dSb290ID0gZWRwUGF0aC5nZXRSb290RGlyZWN0b3J5KCk7XG4gICAgfVxuICAgIGNhdGNoIChleCkge1xuICAgIH1cblxuICAgIGNvbnN0IGRpcm5hbWUgPSBlZHBQYXRoLnJlbGF0aXZlKGJpek9yUGtnUm9vdCwgZmlsZSk7XG4gICAgY29uc3QgaXNNYXRjaCA9IGdsb2IubWF0Y2goZGlybmFtZSwgT2JqZWN0LmtleXMoaWdub3JlUGF0dGVybnMpKTtcblxuICAgIHJldHVybiBpc01hdGNoO1xufVxuXG4vKipcbiAqIOagueaNruihjOWPt+iOt+WPluW9k+WJjeihjOeahOWGheWuuVxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lIOihjOWPt1xuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVEYXRhIOaWh+S7tuWGheWuuVxuICogQHBhcmFtIHtib29sZWFufSBpc1JlcGxhY2VTcGFjZSDmmK/lkKbljrvmjonnqbrmoLxcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9IOW9k+WJjeihjOWGheWuuVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGluZUNvbnRlbnQobGluZSwgZmlsZURhdGEsIGlzUmVwbGFjZVNwYWNlKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBmaWxlRGF0YS5zcGxpdCgnXFxuJylbbGluZSAtIDFdO1xuICAgIGlmIChpc1JlcGxhY2VTcGFjZSkge1xuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXHMqLywgJycpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiDmoLnmja7ntKLlvJXmiorkuIDooYzlhoXlrrnkuK3nmoTmn5DkuKrlrZDkuLLlj5joibJcbiAqIOebtOaOpeeUqOato+WImeWMuemFjeeahOivne+8jOWPr+iDveS8muaKiui/meS4gOihjOaJgOacieeahCBjb2xvclN0ciDnu5nlj5joibLvvIzmiYDku6XopoHpgJrov4fntKLlvJXmnaXliKTmlq1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc291cmNlIOa6kOWtl+espuS4slxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0SW5kZXgg5byA5aeL55qE57Si5byV77yM6YCa5bi45pivIGNvbFxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yU3RyIOimgeWPmOiJsueahOWtl+espuS4slxuICpcbiAqIEByZXR1cm4ge3N0cmluZ30g5pS55Y+Y6aKc6Imy5ZCO55qE5a2X56ym5LiyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VDb2xvckJ5SW5kZXgoc291cmNlLCBzdGFydEluZGV4LCBjb2xvclN0cikge1xuICAgIGxldCByZXQgPSAnJztcbiAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGNvbnN0IGNvbG9yU3RyTGVuID0gY29sb3JTdHIubGVuZ3RoO1xuICAgICAgICBjb25zdCBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBjb2xvclN0ckxlbjtcbiAgICAgICAgcmV0ID0gJydcbiAgICAgICAgICAgICsgc291cmNlLnNsaWNlKDAsIHN0YXJ0SW5kZXgpIC8vIGNvbG9yU3RyIOWJjemdoueahOmDqOWIhlxuICAgICAgICAgICAgKyBjaGFsay5tYWdlbnRhKHNvdXJjZS5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkpIC8vIGNvbG9yU3RyIOeahOmDqOWIhlxuICAgICAgICAgICAgKyBzb3VyY2Uuc2xpY2UoZW5kSW5kZXgsIHNvdXJjZS5sZW5ndGgpOyAvLyBjb2xvclN0ciDlkI7pnaLnmoTpg6jliIZcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn1cbiJdfQ==