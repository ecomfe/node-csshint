/**
 * @file 通用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import {statSync, existsSync, readFileSync} from 'fs';
import {glob, log, util as edpUtil, path as edpPath} from 'edp-core';

import colors from './colors';
console.log('colors: ', colors);

'use strict';

const WHITESPACE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;

/**
 * 删除目标字符串两端的空白字符
 *
 * @param {string} source 目标字符串
 * @return {string} 删除两端空白字符后的字符串
 */
export function trim(source) {
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
    const accum = new Array(Math.max(0, n));
    for (let i = 0; i < n; i++) {
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
export function formatMsg(msg, spaceCount = 0) {
    let space = '';
    times(spaceCount, () => {
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
export function getCandidates(args, patterns) {
    let candidates = [];

    args = args.filter(item => item !== '.');

    if (!args.length) {
        candidates = glob.sync(patterns);
    }
    else {
        let i = -1;
        let len = args.length;
        while (++i < len) {
            let target = args[i];
            if (!existsSync(target)) {
                log.warn('No such file or directory %s', target);
                continue;
            }

            let stat = statSync(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(
                    candidates,
                    glob.sync(target + '/' + patterns[0])
                );
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
export function getIgnorePatterns(file) {
    if (!existsSync(file)) {
        return [];
    }

    let patterns = readFileSync(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter(item => item.trim().length > 0 && item[0] !== '#');
}

const _IGNORE_CACHE = {};

/**
 * 判断一下是否应该忽略这个文件.
 *
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
export function isIgnored(file, name = '.csshintignore') {
    let ignorePatterns = null;

    file = edpPath.resolve(file);

    let key = name + '@'  + edpPath.dirname(file);
    if (_IGNORE_CACHE[key]) {
        ignorePatterns = _IGNORE_CACHE[key];
    }
    else {
        let options = {
            name: name,
            factory(item) {
                let config = {};
                getIgnorePatterns(item).forEach(line => {
                    config[line] = true;
                });
                return config;
            }
        };
        ignorePatterns = edpUtil.getConfig(
            edpPath.dirname(file),
            options
        );

        _IGNORE_CACHE[key] = ignorePatterns;
    }

    let bizOrPkgRoot = process.cwd();

    try {
        bizOrPkgRoot = edpPath.getRootDirectory();
    }
    catch (ex) {
    }

    const dirname = edpPath.relative(bizOrPkgRoot, file);
    const isMatch = glob.match(dirname, Object.keys(ignorePatterns));

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
export function getLineContent(line, fileData, isReplaceSpace) {
    let content = fileData.split('\n')[line - 1];
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
export function changeColorByIndex(source, startIndex, colorStr) {
    let ret = '';
    if (source) {
        const colorStrLen = colorStr.length;
        const endIndex = startIndex + colorStrLen;
        ret = ''
            + source.slice(0, startIndex) // colorStr 前面的部分
            + chalk.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
            + source.slice(endIndex, source.length); // colorStr 后面的部分
    }
    return ret;
}

/**
 * 获取 css 属性值的信息
 *
 * @param {string} text css 属性值
 *
 * @return {Array} 信息对象
 */
/* eslint-disable fecs-max-statements */
export function getPropertyValue(text) {
    /* jshint maxstatements: 71, maxcomplexity: 43 */

    const parts = [];
    const arr = postcss.list.space(String(text));

    for (let i = 0, len = arr.length; i < len; i++) {
        const part = {};
        part.text = arr[i];

        let temp;

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
            // eval('"Microsoft Yahei",') has error
            temp = arr[i].replace(/,$/g, '');
            part.type = 'string';
            /* jshint evil: true */
            /* eslint-disable fecs-no-eval, no-eval */
            part.value = eval(temp);
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
}
/* eslint-enable fecs-max-statements */
