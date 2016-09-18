'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = parse;

var _fs = require('fs');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _edpCore = require('edp-core');

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _util = require('./util');

var _checker = require('./checker');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 显示默认的信息
 */
/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

var showDefaultInfo = function showDefaultInfo() {
    console.log('');
    console.log(_package2.default.name + ' v' + _package2.default.version);
    console.log(_chalk2.default.bold.green((0, _util.formatMsg)(_package2.default.description)));
};

/**
 * 校验结果报告
 *
 * @inner
 * @param {Object} errors 按文件类型为 key，值为对应的校验错误信息列表的对象
 */
var report = function report(errors) {
    var t12 = true;

    if (errors.length) {
        errors.forEach(function (error) {
            _edpCore.log.info(error.path);
            error.messages.forEach(function (message) {
                var ruleName = message.ruleName || '';
                var msg = '→ ' + (ruleName ? _chalk2.default.bold(ruleName) + ': ' : '');
                // 全局性的错误可能没有位置信息
                if (typeof message.line === 'number') {
                    msg += 'line ' + message.line;
                    if (typeof message.col === 'number') {
                        msg += ', col ' + message.col;
                    }
                    msg += ': ';
                }

                msg += message.colorMessage || message.message;
                _edpCore.log.warn(msg);
            });
        });
        t12 = false;
    }

    if (t12) {
        _edpCore.log.info('Congratulations! Everything gone well, you are T12!');
    } else {
        process.exit(1);
    }
};

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
function parse(args) {
    args = args.slice(2);
    console.log(123);

    // 不带参数时，默认检测当前目录下所有的 css 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    var patterns = ['**/*.css', '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'];

    var candidates = (0, _util.getCandidates)(args, patterns);
    var count = candidates.length;

    if (!count) {
        return;
    }

    // 错误信息的集合
    var errors = [];

    /**
     * 每个文件的校验结果回调，主要用于统计校验完成情况
     *
     * @inner
     */
    var callback = function callback() {
        count--;
        if (!count) {
            report(errors);
        }
    };

    // 遍历每个需要检测的 css 文件
    candidates.forEach(function (candidate) {
        var readable = (0, _fs.createReadStream)(candidate, {
            encoding: 'utf8'
        });
        readable.on('data', function (chunk) {
            var file = {
                content: chunk,
                path: candidate
            };
            (0, _checker.check)(file, errors, callback);
        });
        readable.on('error', function (err) {
            throw err;
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGkuanMiXSwibmFtZXMiOlsicGFyc2UiLCJzaG93RGVmYXVsdEluZm8iLCJjb25zb2xlIiwibG9nIiwibmFtZSIsInZlcnNpb24iLCJib2xkIiwiZ3JlZW4iLCJkZXNjcmlwdGlvbiIsInJlcG9ydCIsInQxMiIsImVycm9ycyIsImxlbmd0aCIsImZvckVhY2giLCJpbmZvIiwiZXJyb3IiLCJwYXRoIiwibWVzc2FnZXMiLCJydWxlTmFtZSIsIm1lc3NhZ2UiLCJtc2ciLCJsaW5lIiwiY29sIiwiY29sb3JNZXNzYWdlIiwid2FybiIsInByb2Nlc3MiLCJleGl0IiwiYXJncyIsInNsaWNlIiwicHVzaCIsInBhdHRlcm5zIiwiY2FuZGlkYXRlcyIsImNvdW50IiwiY2FsbGJhY2siLCJyZWFkYWJsZSIsImNhbmRpZGF0ZSIsImVuY29kaW5nIiwib24iLCJmaWxlIiwiY29udGVudCIsImNodW5rIiwiZXJyIl0sIm1hcHBpbmdzIjoiOzs7OztRQXFFZ0JBLEssR0FBQUEsSzs7QUFoRWhCOztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBOzs7QUFaQTs7Ozs7QUFlQSxJQUFNQyxrQkFBa0IsU0FBbEJBLGVBQWtCLEdBQU07QUFDMUJDLFlBQVFDLEdBQVIsQ0FBWSxFQUFaO0FBQ0FELFlBQVFDLEdBQVIsQ0FBYSxrQkFBSUMsSUFBSixHQUFXLElBQVgsR0FBa0Isa0JBQUlDLE9BQW5DO0FBQ0FILFlBQVFDLEdBQVIsQ0FBWSxnQkFBTUcsSUFBTixDQUFXQyxLQUFYLENBQWlCLHFCQUFVLGtCQUFJQyxXQUFkLENBQWpCLENBQVo7QUFDSCxDQUpEOztBQU1BOzs7Ozs7QUFNQSxJQUFNQyxTQUFTLFNBQVRBLE1BQVMsU0FBVTtBQUNyQixRQUFJQyxNQUFNLElBQVY7O0FBRUEsUUFBSUMsT0FBT0MsTUFBWCxFQUFtQjtBQUNmRCxlQUFPRSxPQUFQLENBQ0ksaUJBQVM7QUFDTCx5QkFBSUMsSUFBSixDQUFTQyxNQUFNQyxJQUFmO0FBQ0FELGtCQUFNRSxRQUFOLENBQWVKLE9BQWYsQ0FDSSxtQkFBVztBQUNQLG9CQUFNSyxXQUFXQyxRQUFRRCxRQUFSLElBQW9CLEVBQXJDO0FBQ0Esb0JBQUlFLE1BQU0sUUFBUUYsV0FBVyxnQkFBTVosSUFBTixDQUFXWSxRQUFYLElBQXVCLElBQWxDLEdBQXlDLEVBQWpELENBQVY7QUFDQTtBQUNBLG9CQUFJLE9BQU9DLFFBQVFFLElBQWYsS0FBd0IsUUFBNUIsRUFBc0M7QUFDbENELDJCQUFRLFVBQVVELFFBQVFFLElBQTFCO0FBQ0Esd0JBQUksT0FBT0YsUUFBUUcsR0FBZixLQUF1QixRQUEzQixFQUFxQztBQUNqQ0YsK0JBQVEsV0FBV0QsUUFBUUcsR0FBM0I7QUFDSDtBQUNERiwyQkFBTyxJQUFQO0FBQ0g7O0FBRURBLHVCQUFPRCxRQUFRSSxZQUFSLElBQXdCSixRQUFRQSxPQUF2QztBQUNBLDZCQUFJSyxJQUFKLENBQVNKLEdBQVQ7QUFDSCxhQWZMO0FBaUJILFNBcEJMO0FBc0JBVixjQUFNLEtBQU47QUFDSDs7QUFFRCxRQUFJQSxHQUFKLEVBQVM7QUFDTCxxQkFBSUksSUFBSixDQUFTLHFEQUFUO0FBQ0gsS0FGRCxNQUdLO0FBQ0RXLGdCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIO0FBQ0osQ0FuQ0Q7O0FBcUNBOzs7OztBQUtPLFNBQVMxQixLQUFULENBQWUyQixJQUFmLEVBQXFCO0FBQ3hCQSxXQUFPQSxLQUFLQyxLQUFMLENBQVcsQ0FBWCxDQUFQO0FBQ0ExQixZQUFRQyxHQUFSLENBQVksR0FBWjs7QUFFQTtBQUNBLFFBQUl3QixLQUFLZixNQUFMLEtBQWdCLENBQXBCLEVBQXVCO0FBQ25CZSxhQUFLRSxJQUFMLENBQVUsR0FBVjtBQUNIOztBQUVELFFBQUlGLEtBQUssQ0FBTCxNQUFZLFdBQVosSUFBMkJBLEtBQUssQ0FBTCxNQUFZLElBQTNDLEVBQWlEO0FBQzdDMUI7QUFDQTtBQUNIOztBQUVELFFBQU02QixXQUFXLENBQ2IsVUFEYSxFQUViLHFFQUZhLENBQWpCOztBQUtBLFFBQU1DLGFBQWEseUJBQWNKLElBQWQsRUFBb0JHLFFBQXBCLENBQW5CO0FBQ0EsUUFBSUUsUUFBUUQsV0FBV25CLE1BQXZCOztBQUVBLFFBQUksQ0FBQ29CLEtBQUwsRUFBWTtBQUNSO0FBQ0g7O0FBRUQ7QUFDQSxRQUFNckIsU0FBUyxFQUFmOztBQUVBOzs7OztBQUtBLFFBQU1zQixXQUFXLFNBQVhBLFFBQVcsR0FBTTtBQUNuQkQ7QUFDQSxZQUFJLENBQUNBLEtBQUwsRUFBWTtBQUNSdkIsbUJBQU9FLE1BQVA7QUFDSDtBQUNKLEtBTEQ7O0FBT0E7QUFDQW9CLGVBQVdsQixPQUFYLENBQW1CLHFCQUFhO0FBQzVCLFlBQU1xQixXQUFXLDBCQUFpQkMsU0FBakIsRUFBNEI7QUFDekNDLHNCQUFVO0FBRCtCLFNBQTVCLENBQWpCO0FBR0FGLGlCQUFTRyxFQUFULENBQVksTUFBWixFQUFvQixpQkFBUztBQUN6QixnQkFBTUMsT0FBTztBQUNUQyx5QkFBU0MsS0FEQTtBQUVUeEIsc0JBQU1tQjtBQUZHLGFBQWI7QUFJQSxnQ0FBTUcsSUFBTixFQUFZM0IsTUFBWixFQUFvQnNCLFFBQXBCO0FBQ0gsU0FORDtBQU9BQyxpQkFBU0csRUFBVCxDQUFZLE9BQVosRUFBcUIsZUFBTztBQUN4QixrQkFBTUksR0FBTjtBQUNILFNBRkQ7QUFHSCxLQWREO0FBZUgiLCJmaWxlIjoiY2xpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSDlkb3ku6TooYzlip/og73mqKHlnZdcbiAqIEBhdXRob3IgaWVsZ25hdyh3dWppMDIyM0BnbWFpbC5jb20pXG4gKi9cblxuaW1wb3J0IHtjcmVhdGVSZWFkU3RyZWFtfSBmcm9tICdmcyc7XG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHtsb2d9IGZyb20gJ2VkcC1jb3JlJztcbmltcG9ydCBzeXMgZnJvbSAnLi4vcGFja2FnZSc7XG5pbXBvcnQge2Zvcm1hdE1zZywgZ2V0Q2FuZGlkYXRlc30gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4vY2hlY2tlcic7XG5cbi8qKlxuICog5pi+56S66buY6K6k55qE5L+h5oGvXG4gKi9cbmNvbnN0IHNob3dEZWZhdWx0SW5mbyA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgY29uc29sZS5sb2coKHN5cy5uYW1lICsgJyB2JyArIHN5cy52ZXJzaW9uKSk7XG4gICAgY29uc29sZS5sb2coY2hhbGsuYm9sZC5ncmVlbihmb3JtYXRNc2coc3lzLmRlc2NyaXB0aW9uKSkpO1xufTtcblxuLyoqXG4gKiDmoKHpqoznu5PmnpzmiqXlkYpcbiAqXG4gKiBAaW5uZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlcnJvcnMg5oyJ5paH5Lu257G75Z6L5Li6IGtlee+8jOWAvOS4uuWvueW6lOeahOagoemqjOmUmeivr+S/oeaBr+WIl+ihqOeahOWvueixoVxuICovXG5jb25zdCByZXBvcnQgPSBlcnJvcnMgPT4ge1xuICAgIGxldCB0MTIgPSB0cnVlO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgZXJyb3JzLmZvckVhY2goXG4gICAgICAgICAgICBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oZXJyb3IucGF0aCk7XG4gICAgICAgICAgICAgICAgZXJyb3IubWVzc2FnZXMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBydWxlTmFtZSA9IG1lc3NhZ2UucnVsZU5hbWUgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbXNnID0gJ+KGkiAnICsgKHJ1bGVOYW1lID8gY2hhbGsuYm9sZChydWxlTmFtZSkgKyAnOiAnIDogJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YWo5bGA5oCn55qE6ZSZ6K+v5Y+v6IO95rKh5pyJ5L2N572u5L+h5oGvXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UubGluZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gKCdsaW5lICcgKyBtZXNzYWdlLmxpbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZS5jb2wgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSAoJywgY29sICcgKyBtZXNzYWdlLmNvbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSAnOiAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gbWVzc2FnZS5jb2xvck1lc3NhZ2UgfHwgbWVzc2FnZS5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4obXNnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHQxMiA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0MTIpIHtcbiAgICAgICAgbG9nLmluZm8oJ0NvbmdyYXR1bGF0aW9ucyEgRXZlcnl0aGluZyBnb25lIHdlbGwsIHlvdSBhcmUgVDEyIScpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbn07XG5cbi8qKlxuICog6Kej5p6Q5Y+C5pWw44CC5L2c5Li65ZG95Luk6KGM5omn6KGM55qE5YWl5Y+jXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJncyDlj4LmlbDliJfooahcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGFyZ3MpIHtcbiAgICBhcmdzID0gYXJncy5zbGljZSgyKTtcbiAgICBjb25zb2xlLmxvZygxMjMpO1xuXG4gICAgLy8g5LiN5bim5Y+C5pWw5pe277yM6buY6K6k5qOA5rWL5b2T5YmN55uu5b2V5LiL5omA5pyJ55qEIGNzcyDmlofku7ZcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYXJncy5wdXNoKCcuJyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3NbMF0gPT09ICctLXZlcnNpb24nIHx8IGFyZ3NbMF0gPT09ICctdicpIHtcbiAgICAgICAgc2hvd0RlZmF1bHRJbmZvKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgJyoqLyouY3NzJyxcbiAgICAgICAgJyEqKi97b3V0cHV0LHRlc3Qsbm9kZV9tb2R1bGVzLGFzc2V0LGRpc3QscmVsZWFzZSxkb2MsZGVwLHJlcG9ydH0vKionXG4gICAgXTtcblxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzKGFyZ3MsIHBhdHRlcm5zKTtcbiAgICBsZXQgY291bnQgPSBjYW5kaWRhdGVzLmxlbmd0aDtcblxuICAgIGlmICghY291bnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOmUmeivr+S/oeaBr+eahOmbhuWQiFxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICog5q+P5Liq5paH5Lu255qE5qCh6aqM57uT5p6c5Zue6LCD77yM5Li76KaB55So5LqO57uf6K6h5qCh6aqM5a6M5oiQ5oOF5Ya1XG4gICAgICpcbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKCFjb3VudCkge1xuICAgICAgICAgICAgcmVwb3J0KGVycm9ycyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8g6YGN5Y6G5q+P5Liq6ZyA6KaB5qOA5rWL55qEIGNzcyDmlofku7ZcbiAgICBjYW5kaWRhdGVzLmZvckVhY2goY2FuZGlkYXRlID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGFibGUgPSBjcmVhdGVSZWFkU3RyZWFtKGNhbmRpZGF0ZSwge1xuICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICB9KTtcbiAgICAgICAgcmVhZGFibGUub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNodW5rLFxuICAgICAgICAgICAgICAgIHBhdGg6IGNhbmRpZGF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNoZWNrKGZpbGUsIGVycm9ycywgY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVhZGFibGUub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iXX0=