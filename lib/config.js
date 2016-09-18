'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadConfig = loadConfig;

var _manis = require('manis');

var _manis2 = _interopRequireDefault(_manis);

var _path = require('path');

var _stripJsonComments = require('strip-json-comments');

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 对配置文件的读取合并等等
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

var STORAGE = null;

var JSON_YAML_REG = /.+\.(json|yml)$/i;

/**
 * 获取 merge 后的配置文件
 * 用户自定义的配置文件优先级 .csshintrc > config.yml > config.json
 *
 * @param {string} filePath 待检查的文件路径，根据这个路径去寻找用户自定义的配置文件，然后和默认的配置文件 merge
 * @param {boolean} refresh 是否强制刷新内存中已经存在的配置
 *
 * @return {Object} merge 后的配置对象
 */
function loadConfig(filePath, refresh) {
    if (refresh && STORAGE) {
        return STORAGE;
    }

    var manis = new _manis2.default({
        files: ['.csshintrc', 'config.yml', 'config.json'],
        loader: function loader(content, filePath) {
            if (!content) {
                return '';
            }

            if ((0, _path.basename)(filePath) === '.csshintrc') {
                return JSON.parse((0, _stripJsonComments2.default)(content));
            }

            var match = filePath.match(JSON_YAML_REG);
            if (match) {
                var suffix = match[1];
                if (suffix === 'json') {
                    return JSON.parse((0, _stripJsonComments2.default)(content));
                } else if (suffix === 'yml') {
                    return _jsYaml2.default.load(content);
                }
            }
        }
    });

    manis.setDefault((0, _path.join)(__dirname, './config.yml'));

    STORAGE = manis.from(filePath);

    return STORAGE;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsibG9hZENvbmZpZyIsIlNUT1JBR0UiLCJKU09OX1lBTUxfUkVHIiwiZmlsZVBhdGgiLCJyZWZyZXNoIiwibWFuaXMiLCJmaWxlcyIsImxvYWRlciIsImNvbnRlbnQiLCJKU09OIiwicGFyc2UiLCJtYXRjaCIsInN1ZmZpeCIsImxvYWQiLCJzZXREZWZhdWx0IiwiX19kaXJuYW1lIiwiZnJvbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7UUF5QmdCQSxVLEdBQUFBLFU7O0FBcEJoQjs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztBQVJBOzs7OztBQVVBOztBQUVBLElBQUlDLFVBQVUsSUFBZDs7QUFFQSxJQUFNQyxnQkFBZ0Isa0JBQXRCOztBQUVBOzs7Ozs7Ozs7QUFTTyxTQUFTRixVQUFULENBQW9CRyxRQUFwQixFQUE4QkMsT0FBOUIsRUFBdUM7QUFDMUMsUUFBSUEsV0FBV0gsT0FBZixFQUF3QjtBQUNwQixlQUFPQSxPQUFQO0FBQ0g7O0FBRUQsUUFBSUksUUFBUSxvQkFBVTtBQUNsQkMsZUFBTyxDQUNILFlBREcsRUFFSCxZQUZHLEVBR0gsYUFIRyxDQURXO0FBTWxCQyxjQU5rQixrQkFNWEMsT0FOVyxFQU1GTCxRQU5FLEVBTVE7QUFDdEIsZ0JBQUksQ0FBQ0ssT0FBTCxFQUFjO0FBQ1YsdUJBQU8sRUFBUDtBQUNIOztBQUVELGdCQUFJLG9CQUFTTCxRQUFULE1BQXVCLFlBQTNCLEVBQXlDO0FBQ3JDLHVCQUFPTSxLQUFLQyxLQUFMLENBQVcsaUNBQWtCRixPQUFsQixDQUFYLENBQVA7QUFDSDs7QUFFRCxnQkFBSUcsUUFBUVIsU0FBU1EsS0FBVCxDQUFlVCxhQUFmLENBQVo7QUFDQSxnQkFBSVMsS0FBSixFQUFXO0FBQ1Asb0JBQUlDLFNBQVNELE1BQU0sQ0FBTixDQUFiO0FBQ0Esb0JBQUlDLFdBQVcsTUFBZixFQUF1QjtBQUNuQiwyQkFBT0gsS0FBS0MsS0FBTCxDQUFXLGlDQUFrQkYsT0FBbEIsQ0FBWCxDQUFQO0FBQ0gsaUJBRkQsTUFHSyxJQUFJSSxXQUFXLEtBQWYsRUFBc0I7QUFDdkIsMkJBQU8saUJBQUtDLElBQUwsQ0FBVUwsT0FBVixDQUFQO0FBQ0g7QUFDSjtBQUNKO0FBekJpQixLQUFWLENBQVo7O0FBNEJBSCxVQUFNUyxVQUFOLENBQWlCLGdCQUFLQyxTQUFMLEVBQWdCLGNBQWhCLENBQWpCOztBQUVBZCxjQUFVSSxNQUFNVyxJQUFOLENBQVdiLFFBQVgsQ0FBVjs7QUFFQSxXQUFPRixPQUFQO0FBQ0giLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSDlr7nphY3nva7mlofku7bnmoTor7vlj5blkIjlubbnrYnnrYlcbiAqIEBhdXRob3IgaWVsZ25hdyh3dWppMDIyM0BnbWFpbC5jb20pXG4gKi9cblxuaW1wb3J0IE1hbmlzIGZyb20gJ21hbmlzJztcbmltcG9ydCB7am9pbiwgYmFzZW5hbWV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHN0cmlwSlNPTkNvbW1lbnRzIGZyb20gJ3N0cmlwLWpzb24tY29tbWVudHMnO1xuaW1wb3J0IHlhbWwgZnJvbSAnanMteWFtbCc7XG5cbid1c2Ugc3RyaWN0JztcblxubGV0IFNUT1JBR0UgPSBudWxsO1xuXG5jb25zdCBKU09OX1lBTUxfUkVHID0gLy4rXFwuKGpzb258eW1sKSQvaTtcblxuLyoqXG4gKiDojrflj5YgbWVyZ2Ug5ZCO55qE6YWN572u5paH5Lu2XG4gKiDnlKjmiLfoh6rlrprkuYnnmoTphY3nva7mlofku7bkvJjlhYjnuqcgLmNzc2hpbnRyYyA+IGNvbmZpZy55bWwgPiBjb25maWcuanNvblxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aCDlvoXmo4Dmn6XnmoTmlofku7bot6/lvoTvvIzmoLnmja7ov5nkuKrot6/lvoTljrvlr7vmib7nlKjmiLfoh6rlrprkuYnnmoTphY3nva7mlofku7bvvIznhLblkI7lkozpu5jorqTnmoTphY3nva7mlofku7YgbWVyZ2VcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVmcmVzaCDmmK/lkKblvLrliLbliLfmlrDlhoXlrZjkuK3lt7Lnu4/lrZjlnKjnmoTphY3nva5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IG1lcmdlIOWQjueahOmFjee9ruWvueixoVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvbmZpZyhmaWxlUGF0aCwgcmVmcmVzaCkge1xuICAgIGlmIChyZWZyZXNoICYmIFNUT1JBR0UpIHtcbiAgICAgICAgcmV0dXJuIFNUT1JBR0U7XG4gICAgfVxuXG4gICAgbGV0IG1hbmlzID0gbmV3IE1hbmlzKHtcbiAgICAgICAgZmlsZXM6IFtcbiAgICAgICAgICAgICcuY3NzaGludHJjJyxcbiAgICAgICAgICAgICdjb25maWcueW1sJyxcbiAgICAgICAgICAgICdjb25maWcuanNvbidcbiAgICAgICAgXSxcbiAgICAgICAgbG9hZGVyKGNvbnRlbnQsIGZpbGVQYXRoKSB7XG4gICAgICAgICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChiYXNlbmFtZShmaWxlUGF0aCkgPT09ICcuY3NzaGludHJjJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHN0cmlwSlNPTkNvbW1lbnRzKGNvbnRlbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG1hdGNoID0gZmlsZVBhdGgubWF0Y2goSlNPTl9ZQU1MX1JFRyk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3VmZml4ID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgaWYgKHN1ZmZpeCA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHN0cmlwSlNPTkNvbW1lbnRzKGNvbnRlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3VmZml4ID09PSAneW1sJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geWFtbC5sb2FkKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWFuaXMuc2V0RGVmYXVsdChqb2luKF9fZGlybmFtZSwgJy4vY29uZmlnLnltbCcpKTtcblxuICAgIFNUT1JBR0UgPSBtYW5pcy5mcm9tKGZpbGVQYXRoKTtcblxuICAgIHJldHVybiBTVE9SQUdFO1xufVxuIl19