CSSHint
===
[![csshint](https://travis-ci.org/ielgnaw/node-csshint.svg?branch=master)](https://travis-ci.org/ielgnaw/node-csshint)
[![npm version](https://badge.fury.io/js/csshint.svg)](http://badge.fury.io/js/csshint)
[![Dependency Status](https://david-dm.org/ielgnaw/node-csshint.png)](https://david-dm.org/ielgnaw/node-csshint)
[![devDependency Status](https://david-dm.org/ielgnaw/node-csshint/dev-status.png)](https://david-dm.org/ielgnaw/node-csshint#info=devDependencies)

CSSHint 是一个基于 NodeJS 的代码规范审查工具，目前的规则是基于 ecomfe 的 [CSS 编码规范](https://github.com/ecomfe/spec/blob/master/css-style-guide.md)。

经过了一段时间的重构，终于来到这个版本。在这个版本中，`css`解析器切换成 [postcss](https://github.com/postcss/postcss)。此外，这个版本里，改变了实现方式，性能较以前的版本有比较大的提升。同时，在全局`global`对象上挂载了如下三个属性：

- `global.CSSHINT_INVALID_ALL_COUNT`: 用于记录全局的`warn`个数，为`max-error`规则服务。
- `global.CSSHINT_HEXCOLOR_CASE_FLAG`: 记录项目级别的颜色值的大小写信息，0: 小写， 1: 大写，为`unifying-color-case-sensitive`规则服务。
- `global.CSSHINT_FONTFAMILY_CASE_FLAG`: 记录项目级别的`font-family`大小写信息，为`unifying-font-family-case-sensitive`规则服务。

[配置参考](https://github.com/ielgnaw/node-csshint/blob/master/lib/config.js)


Install & Update
-------

CSSHint 已发布到 npm 上，可通过如下命令安装。

    $ [sudo] npm install csshint [-g]

升级 CSSHint 请用如下命令。

    $ [sudo] npm update csshint [-g]
    

Usage
------

- in CLI
	
		$ csshint -v   // 显示版本信息
		$ csshint [filePath|dirPath]   // 对 file 或 dir 执行 csshint 		
- in Node.js
        
    	/**
	     * 检测 css 文件内容
	     *
	     * @param {string} fileContent 文件内容
	     * @param {Object=} config 检测规则的配置，可选
	     *
	     * @return {Promise} Promise 对象，
	     * Promise 对象的 reject 和 resolve 的回调函数的参数格式如下，
	     * {
	     * 		path: {string} 文件路径
	     * 		messages: {Array.<Object>} 错误信息集合，[{ruleName, line, col, errorChar, message, colorMessage}]
	     * }
	     */
	    exports.checkString(fileContent, config);
    
    
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
2. 支持`/* csshint-enable ruleName */`, `/* csshint ruleName1:false, ruleName2:true */`等更加灵活的行内注释配置。


CHANGELOG
------
2015.05.16 新的版本，介绍如上。另外，行内注释增加了忽略全部规则，如果在`/* csshint-disable */`中不配置任何规则，那么就会忽略全部规则，例如

	/* csshint-disable */

2015.05.04 行内注释的规则匹配，支持任意的`[^a-z-]`作为分隔符，例如

    /* csshint-disable always-semicolon, require-newline require-after-space | block-indent */

这段代码可以让当前文件不检测`always-semicolon`, `require-newline`, `require-after-space`以及`block-indent`这四个规则。这四个规则之间的分隔符分别是`,`, ` `, `|`

2015.05.03 提供简单的行内注释。

例如在某文件里设置如下代码

    /* csshint-disable always-semicolon, require-newline,require-after-space */

这段代码可以让当前文件不检测`always-semicolon`, `require-newline`, `require-after-space`这三个规则。

