CSSHint
===
[![csshint](https://travis-ci.org/ielgnaw/node-csshint.svg?branch=master)](https://travis-ci.org/ielgnaw/node-csshint)
[![npm version](https://badge.fury.io/js/csshint.svg)](http://badge.fury.io/js/csshint)
[![Dependency Status](https://david-dm.org/ielgnaw/node-csshint.png)](https://david-dm.org/ielgnaw/node-csshint)
[![devDependency Status](https://david-dm.org/ielgnaw/node-csshint/dev-status.png)](https://david-dm.org/ielgnaw/node-csshint#info=devDependencies)

挂在全局 global 的属性
global.CSSHINT_HEXCOLOR_CASE_FLAG: 记录项目级别的颜色值的大小写信息，为0是小写，为1是大写

global.CSSHINT_INVALID_ALL_COUNT: 为 max-error 服务的，记录整个的错误个数
global.CSSHINT_FONTFAMILY_CASE_FLAG: 记录项目级别的 font-family 大小写信息，key 为小写格式，value 为真实的值， {'arial': 'Arial'}


CSSHint 是一个基于 NodeJS 的代码规范审查工具，目前的规则是基于 ecomfe 的[CSS 编码规范](https://github.com/ecomfe/spec/blob/master/css-style-guide.md)。

由于部分规则无法实现以及时间关系，以下规则尚未实现：

- require-after-linebreak
- group-properties
- font-family-space-in-quotes
- font-family-sort
- unifying-font-family-case-sensitive

剩下的其他规则都已经实现。

[配置参考](https://github.com/ielgnaw/node-csshint/blob/master/lib/config.js)


安装与更新
-------

CSSHint 已发布到 npm 上，可通过如下命令安装。

    $ [sudo] npm install csshint [-g]

升级 CSSHint 请用如下命令。

    $ [sudo] npm update csshint -g
    

使用
------

CSSHint 目前就一条命令，后面带 `-v` 参数，会显示版本信息；后面带目录或者文件名就会对目录或文件执行 CSSHint。

    $ csshint -v   // 显示版本信息
    $ csshint [filePath|dirPath]   // 对 file 或 dir 执行 csshint

也可以把 CSSHint 作为一个普通模块来使用，CSSHint 现在提供两个接口:
        
    /**
     * 检测 css 文件内容
     *
     * @param {string} fileContent 文件内容
     * @param {Object=} config 检测规则的配置，可选
     *
     * @return {Array.<Object>} 错误信息的集合 {ruleName, line, col, errorChar, message, colorMessage}
     */
    checkString(fileContent, config);
    
    
    /**
     * 校验文件
     *
     * @param {Object} file 包含 path, content 键的对象
     * @param {Array} errors 本分类的错误信息数组
     * @param {Function} done 校验完成的通知回调
     */
    check(file, errors, done);
 

    

TODO
------

1. 完全覆盖 [csslint](https://github.com/CSSLint/csslint) 里的规则。
2. 类似`jsHint`的文件内注释方式。


CHANGELOG
------

2015.05.04 行内注释的规则匹配，支持任意的`[^a-z-]`作为分隔符，例如

    /* csshint-disable always-semicolon, require-newline require-after-space | block-indent */

这段代码可以让当前文件不检测`always-semicolon`, `require-newline`, `require-after-space`以及`block-indent`这四个规则。这四个规则之间的分隔符分别是`,`, ` `, `|`

2015.05.03 提供简单的行内注释。

例如在某文件里设置如下代码

    /* csshint-disable always-semicolon, require-newline,require-after-space */

这段代码可以让当前文件不检测`always-semicolon`, `require-newline`, `require-after-space`这三个规则。

后续版本会支持`/* csshint-enable ruleName */`, `/* csshint ruleName1:false, ruleName2:true */`等更灵活的配置。
