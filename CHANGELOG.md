CHANGELOG
===

#### 2015.07.14

1. 覆盖了 CSSLint 的[规则](https://github.com/CSSLint/csslint/wiki/Rules)

#### 2015.07.03

1. 在 2015.06.25 的那次修复中，`vendor-prefixes-sort` 的粒度还是不够，之前没有考虑到 `@keyframes` 的情况，导致如下代码会误报：

        @-webkit-keyframes link_float {
            from {
                opacity: 0;
                -webkit-transform: scale(0);
                        transform: scale(0);
            }
        }
        @-moz-keyframes link_float {
            from {
                -moz-transform: scale(0);
                     transform: scale(0);
                opacity: 0;
            }
        }


    新版本修复了这个问题。

#### 2015.06.25

1. 修复了一个 `vendor-prefixes-sort` 规则的 bug，在 `vendor-prefixes-sort` 的判断中，是以类的粒度来判断属性的，但是如果是如下情况，那么之前的版本会误报：

        .modal-content {
            -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, .5);
                    box-shadow: 0 3px 9px rgba(0, 0, 0, .5);
        }

        @media (min-width: 768px) {
            .modal-content {
                -webkit-box-shadow: 0 5px 15px rgba(100, 0, 0, .5);
                        box-shadow: 0 5px 15px rgba(100, 0, 0, .5);
            }
            @media (min-width: 168px) {
                .modal-content {
                    -webkit-box-shadow: 0 8px 19px rgba(0, 200, 0, .5);
                            box-shadow: 0 8px 19px rgba(0, 200, 0, .5);
                }
            }
        }

	新版本修复了这个问题。

#### 2015.06.16

1. 修改了 `block-indent` 的实现逻辑，增加了 `block-indent` 对选择器以及嵌套的 @ 选择器（如 `@media`, `@keyframes`）的检测。

#### 2015.06.15 

1. `block-indent` 规则的配置修改为 `["    ", 4]` 或者 `["\t", 4]`，其中数组的第零项指的是缩进的字符串，第一项指的的缩进的开始位置，这个开始位置和前面的缩进的字符串的长度是没有关系的，可以理解成目标位置和当前行的第零列的位置的差值。例如：`["    ", 0]` 这样的配置表示缩进为 4 个空格，缩进的起始位置第 0 列即开头位置。而 `["\t", 6]` 这样的配置则表示随进为一个 `\t`，缩进的起始位置为第 6 列。
2. 行内注释更加丰富，现在支持行内注释动态设置规则的配置。例如：
    
        /* csshint block-indent: ["    ", 4], max-length: 3 */
    
    这一行注释把默认的配置 `block-indent: ["    ", 0]`，`max-length: 120` 给覆盖掉（仅对当前文件有效），那么在当前文件中，所执行的规则就是按照这个行内注释里的配置来进行检测。

#### 2015.05.16 

新的版本，介绍如上。另外，行内注释增加了忽略全部规则，如果在`/* csshint-disable */`中不配置任何规则，那么就会忽略全部规则，例如

    /* csshint-disable */

#### 2015.05.04 

行内注释的规则匹配，支持任意的`[^a-z-]`作为分隔符，例如

    /* csshint-disable always-semicolon, require-newline require-after-space | block-indent */

这段代码可以让当前文件不检测`always-semicolon`, `require-newline`, `require-after-space`以及`block-indent`这四个规则。这四个规则之间的分隔符分别是`,`, ` `, `|`

#### 2015.05.03 

提供简单的行内注释。

例如在某文件里设置如下代码

    /* csshint-disable always-semicolon, require-newline,require-after-space */

这段代码可以让当前文件不检测`always-semicolon`, `require-newline`, `require-after-space`这三个规则。

