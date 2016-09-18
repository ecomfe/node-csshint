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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGkuanMiXSwibmFtZXMiOlsicGFyc2UiLCJzaG93RGVmYXVsdEluZm8iLCJjb25zb2xlIiwibG9nIiwibmFtZSIsInZlcnNpb24iLCJib2xkIiwiZ3JlZW4iLCJkZXNjcmlwdGlvbiIsInJlcG9ydCIsInQxMiIsImVycm9ycyIsImxlbmd0aCIsImZvckVhY2giLCJpbmZvIiwiZXJyb3IiLCJwYXRoIiwibWVzc2FnZXMiLCJydWxlTmFtZSIsIm1lc3NhZ2UiLCJtc2ciLCJsaW5lIiwiY29sIiwiY29sb3JNZXNzYWdlIiwid2FybiIsInByb2Nlc3MiLCJleGl0IiwiYXJncyIsInNsaWNlIiwicHVzaCIsInBhdHRlcm5zIiwiY2FuZGlkYXRlcyIsImNvdW50IiwiY2FsbGJhY2siLCJyZWFkYWJsZSIsImNhbmRpZGF0ZSIsImVuY29kaW5nIiwib24iLCJmaWxlIiwiY29udGVudCIsImNodW5rIiwiZXJyIl0sIm1hcHBpbmdzIjoiOzs7OztRQXFFZ0JBLEssR0FBQUEsSzs7QUFoRWhCOztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBOzs7QUFaQTs7Ozs7QUFlQSxJQUFNQyxrQkFBa0IsU0FBbEJBLGVBQWtCLEdBQU07QUFDMUJDLFlBQVFDLEdBQVIsQ0FBWSxFQUFaO0FBQ0FELFlBQVFDLEdBQVIsQ0FBYSxrQkFBSUMsSUFBSixHQUFXLElBQVgsR0FBa0Isa0JBQUlDLE9BQW5DO0FBQ0FILFlBQVFDLEdBQVIsQ0FBWSxnQkFBTUcsSUFBTixDQUFXQyxLQUFYLENBQWlCLHFCQUFVLGtCQUFJQyxXQUFkLENBQWpCLENBQVo7QUFDSCxDQUpEOztBQU1BOzs7Ozs7QUFNQSxJQUFNQyxTQUFTLFNBQVRBLE1BQVMsU0FBVTtBQUNyQixRQUFJQyxNQUFNLElBQVY7O0FBRUEsUUFBSUMsT0FBT0MsTUFBWCxFQUFtQjtBQUNmRCxlQUFPRSxPQUFQLENBQ0ksaUJBQVM7QUFDTCx5QkFBSUMsSUFBSixDQUFTQyxNQUFNQyxJQUFmO0FBQ0FELGtCQUFNRSxRQUFOLENBQWVKLE9BQWYsQ0FDSSxtQkFBVztBQUNQLG9CQUFNSyxXQUFXQyxRQUFRRCxRQUFSLElBQW9CLEVBQXJDO0FBQ0Esb0JBQUlFLE1BQU0sUUFBUUYsV0FBVyxnQkFBTVosSUFBTixDQUFXWSxRQUFYLElBQXVCLElBQWxDLEdBQXlDLEVBQWpELENBQVY7QUFDQTtBQUNBLG9CQUFJLE9BQU9DLFFBQVFFLElBQWYsS0FBd0IsUUFBNUIsRUFBc0M7QUFDbENELDJCQUFRLFVBQVVELFFBQVFFLElBQTFCO0FBQ0Esd0JBQUksT0FBT0YsUUFBUUcsR0FBZixLQUF1QixRQUEzQixFQUFxQztBQUNqQ0YsK0JBQVEsV0FBV0QsUUFBUUcsR0FBM0I7QUFDSDtBQUNERiwyQkFBTyxJQUFQO0FBQ0g7O0FBRURBLHVCQUFPRCxRQUFRSSxZQUFSLElBQXdCSixRQUFRQSxPQUF2QztBQUNBLDZCQUFJSyxJQUFKLENBQVNKLEdBQVQ7QUFDSCxhQWZMO0FBaUJILFNBcEJMO0FBc0JBVixjQUFNLEtBQU47QUFDSDs7QUFFRCxRQUFJQSxHQUFKLEVBQVM7QUFDTCxxQkFBSUksSUFBSixDQUFTLHFEQUFUO0FBQ0gsS0FGRCxNQUdLO0FBQ0RXLGdCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIO0FBQ0osQ0FuQ0Q7O0FBcUNBOzs7OztBQUtPLFNBQVMxQixLQUFULENBQWUyQixJQUFmLEVBQXFCO0FBQ3hCQSxXQUFPQSxLQUFLQyxLQUFMLENBQVcsQ0FBWCxDQUFQOztBQUVBO0FBQ0EsUUFBSUQsS0FBS2YsTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUNuQmUsYUFBS0UsSUFBTCxDQUFVLEdBQVY7QUFDSDs7QUFFRCxRQUFJRixLQUFLLENBQUwsTUFBWSxXQUFaLElBQTJCQSxLQUFLLENBQUwsTUFBWSxJQUEzQyxFQUFpRDtBQUM3QzFCO0FBQ0E7QUFDSDs7QUFFRCxRQUFNNkIsV0FBVyxDQUNiLFVBRGEsRUFFYixxRUFGYSxDQUFqQjs7QUFLQSxRQUFNQyxhQUFhLHlCQUFjSixJQUFkLEVBQW9CRyxRQUFwQixDQUFuQjtBQUNBLFFBQUlFLFFBQVFELFdBQVduQixNQUF2Qjs7QUFFQSxRQUFJLENBQUNvQixLQUFMLEVBQVk7QUFDUjtBQUNIOztBQUVEO0FBQ0EsUUFBTXJCLFNBQVMsRUFBZjs7QUFFQTs7Ozs7QUFLQSxRQUFNc0IsV0FBVyxTQUFYQSxRQUFXLEdBQU07QUFDbkJEO0FBQ0EsWUFBSSxDQUFDQSxLQUFMLEVBQVk7QUFDUnZCLG1CQUFPRSxNQUFQO0FBQ0g7QUFDSixLQUxEOztBQU9BO0FBQ0FvQixlQUFXbEIsT0FBWCxDQUFtQixxQkFBYTtBQUM1QixZQUFNcUIsV0FBVywwQkFBaUJDLFNBQWpCLEVBQTRCO0FBQ3pDQyxzQkFBVTtBQUQrQixTQUE1QixDQUFqQjtBQUdBRixpQkFBU0csRUFBVCxDQUFZLE1BQVosRUFBb0IsaUJBQVM7QUFDekIsZ0JBQU1DLE9BQU87QUFDVEMseUJBQVNDLEtBREE7QUFFVHhCLHNCQUFNbUI7QUFGRyxhQUFiO0FBSUEsZ0NBQU1HLElBQU4sRUFBWTNCLE1BQVosRUFBb0JzQixRQUFwQjtBQUNILFNBTkQ7QUFPQUMsaUJBQVNHLEVBQVQsQ0FBWSxPQUFaLEVBQXFCLGVBQU87QUFDeEIsa0JBQU1JLEdBQU47QUFDSCxTQUZEO0FBR0gsS0FkRDtBQWVIIiwiZmlsZSI6ImNsaS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUg5ZG95Luk6KGM5Yqf6IO95qih5Z2XXG4gKiBAYXV0aG9yIGllbGduYXcod3VqaTAyMjNAZ21haWwuY29tKVxuICovXG5cbmltcG9ydCB7Y3JlYXRlUmVhZFN0cmVhbX0gZnJvbSAnZnMnO1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCB7bG9nfSBmcm9tICdlZHAtY29yZSc7XG5pbXBvcnQgc3lzIGZyb20gJy4uL3BhY2thZ2UnO1xuaW1wb3J0IHtmb3JtYXRNc2csIGdldENhbmRpZGF0ZXN9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2NoZWNrfSBmcm9tICcuL2NoZWNrZXInO1xuXG4vKipcbiAqIOaYvuekuum7mOiupOeahOS/oeaBr1xuICovXG5jb25zdCBzaG93RGVmYXVsdEluZm8gPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJycpO1xuICAgIGNvbnNvbGUubG9nKChzeXMubmFtZSArICcgdicgKyBzeXMudmVyc2lvbikpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxrLmJvbGQuZ3JlZW4oZm9ybWF0TXNnKHN5cy5kZXNjcmlwdGlvbikpKTtcbn07XG5cbi8qKlxuICog5qCh6aqM57uT5p6c5oql5ZGKXG4gKlxuICogQGlubmVyXG4gKiBAcGFyYW0ge09iamVjdH0gZXJyb3JzIOaMieaWh+S7tuexu+Wei+S4uiBrZXnvvIzlgLzkuLrlr7nlupTnmoTmoKHpqozplJnor6/kv6Hmga/liJfooajnmoTlr7nosaFcbiAqL1xuY29uc3QgcmVwb3J0ID0gZXJyb3JzID0+IHtcbiAgICBsZXQgdDEyID0gdHJ1ZTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgIGVycm9ycy5mb3JFYWNoKFxuICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGVycm9yLnBhdGgpO1xuICAgICAgICAgICAgICAgIGVycm9yLm1lc3NhZ2VzLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcnVsZU5hbWUgPSBtZXNzYWdlLnJ1bGVOYW1lIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1zZyA9ICfihpIgJyArIChydWxlTmFtZSA/IGNoYWxrLmJvbGQocnVsZU5hbWUpICsgJzogJyA6ICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWFqOWxgOaAp+eahOmUmeivr+WPr+iDveayoeacieS9jee9ruS/oeaBr1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlLmxpbmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9ICgnbGluZSAnICsgbWVzc2FnZS5saW5lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UuY29sID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gKCcsIGNvbCAnICsgbWVzc2FnZS5jb2wpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJzogJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9IG1lc3NhZ2UuY29sb3JNZXNzYWdlIHx8IG1lc3NhZ2UubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB0MTIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodDEyKSB7XG4gICAgICAgIGxvZy5pbmZvKCdDb25ncmF0dWxhdGlvbnMhIEV2ZXJ5dGhpbmcgZ29uZSB3ZWxsLCB5b3UgYXJlIFQxMiEnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIOino+aekOWPguaVsOOAguS9nOS4uuWRveS7pOihjOaJp+ihjOeahOWFpeWPo1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3Mg5Y+C5pWw5YiX6KGoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShhcmdzKSB7XG4gICAgYXJncyA9IGFyZ3Muc2xpY2UoMik7XG5cbiAgICAvLyDkuI3luKblj4LmlbDml7bvvIzpu5jorqTmo4DmtYvlvZPliY3nm67lvZXkuIvmiYDmnInnmoQgY3NzIOaWh+S7tlxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBhcmdzLnB1c2goJy4nKTtcbiAgICB9XG5cbiAgICBpZiAoYXJnc1swXSA9PT0gJy0tdmVyc2lvbicgfHwgYXJnc1swXSA9PT0gJy12Jykge1xuICAgICAgICBzaG93RGVmYXVsdEluZm8oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICAnKiovKi5jc3MnLFxuICAgICAgICAnISoqL3tvdXRwdXQsdGVzdCxub2RlX21vZHVsZXMsYXNzZXQsZGlzdCxyZWxlYXNlLGRvYyxkZXAscmVwb3J0fS8qKidcbiAgICBdO1xuXG4gICAgY29uc3QgY2FuZGlkYXRlcyA9IGdldENhbmRpZGF0ZXMoYXJncywgcGF0dGVybnMpO1xuICAgIGxldCBjb3VudCA9IGNhbmRpZGF0ZXMubGVuZ3RoO1xuXG4gICAgaWYgKCFjb3VudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g6ZSZ6K+v5L+h5oGv55qE6ZuG5ZCIXG4gICAgY29uc3QgZXJyb3JzID0gW107XG5cbiAgICAvKipcbiAgICAgKiDmr4/kuKrmlofku7bnmoTmoKHpqoznu5Pmnpzlm57osIPvvIzkuLvopoHnlKjkuo7nu5/orqHmoKHpqozlrozmiJDmg4XlhrVcbiAgICAgKlxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICBjb3VudC0tO1xuICAgICAgICBpZiAoIWNvdW50KSB7XG4gICAgICAgICAgICByZXBvcnQoZXJyb3JzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyDpgY3ljobmr4/kuKrpnIDopoHmo4DmtYvnmoQgY3NzIOaWh+S7tlxuICAgIGNhbmRpZGF0ZXMuZm9yRWFjaChjYW5kaWRhdGUgPT4ge1xuICAgICAgICBjb25zdCByZWFkYWJsZSA9IGNyZWF0ZVJlYWRTdHJlYW0oY2FuZGlkYXRlLCB7XG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnXG4gICAgICAgIH0pO1xuICAgICAgICByZWFkYWJsZS5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB7XG4gICAgICAgICAgICAgICAgY29udGVudDogY2h1bmssXG4gICAgICAgICAgICAgICAgcGF0aDogY2FuZGlkYXRlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2hlY2soZmlsZSwgZXJyb3JzLCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICByZWFkYWJsZS5vbignZXJyb3InLCBlcnIgPT4ge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbiJdfQ==