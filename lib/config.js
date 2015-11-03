/**
 * @file csshint 配置
 * http://gitlab.baidu.com/fe/spec/blob/master/css.md 规范中的规则
 * 如果设置为 true ，则需要检测
 * @author ielgnaw(wuji0223@gmail.com)
 */

module.exports = {
    /* eslint-disable fecs-camelcase */

    'max-error': 100,

    // 001: [建议] `CSS` 文件使用无 `BOM` 的 `UTF-8` 编码。
    'no-bom': true,

    // 002: [强制] 使用 `4` 个空格做为一个缩进层级，不允许使用 `2` 个空格 或 `tab` 字符。
    'block-indent': ['    ', 0],

    // `{` 对应 003: [强制] `选择器` 与 `{` 之间必须包含空格。
    'require-before-space': ['{'],

    // `:` 对应 004: [强制] `属性名` 与之后的 `:` 之间不允许包含空格， `:` 与 `属性值` 之间必须包含空格。
    // `,` 对应 005: [强制] `列表型属性值` 书写在单行时，`,` 后必须跟一个空格。
    'require-after-space': [':', ','],

    // 006: [强制] 每行不得超过 `120` 个字符，除非单行不可分割。
    'max-length': 120,

    // ` ` 和 `,` 对应 007: [建议] 对于超长的样式，在样式值的 `空格` 处或 `,` 后换行，建议按逻辑分组。
    // 这里超长的样式指长度超过 max-length 的
    // 暂无实现
    'require-after-linebreak': [' ', ','],

    // `selector` 对应 008: [强制] 当一个 rule 包含多个 selector 时，每个选择器声明必须独占一行。
    // `property` 对应 011: [强制] 属性定义必须另起一行。
    // `media-query-condition` 对应 044: [强制] `Media Query` 如果有多个逗号分隔的条件时，应将每个条件放在单独一行中。
    'require-newline': ['selector', 'property', 'media-query-condition'],

    // `>`, `+`, `~` 对应 009: [强制] `>`、`+`、`~` 选择器的两边各保留一个空格。
    'require-around-space': ['>', '+', '~'],

    // // `text-content` 对应 010 和 024
    // // 010: [强制] 属性选择器中的值必须用双引号包围。
    // // 024: [强制] 文本内容必须用双引号包围。
    // 'require-doublequotes': ['text-content'],

    // `attr-selector` 对应 010: [强制] 属性选择器中的值必须用双引号包围。
    // `text-content` 对应 024: [强制] 文本内容必须用双引号包围。
    'require-doublequotes': ['attr-selector', 'text-content'],

    // 012: [强制] 属性定义后必须以分号结尾。
    'always-semicolon': true,

    // 013: [强制] 如无必要，不得为 `id`、`class` 选择器添加类型选择器进行限定。
    'disallow-overqualified-elements': true,

    // 014: [建议] 选择器的嵌套层级应不大于 3 级，位置靠后的限定条件应尽可能精确。
    'max-selector-nesting-level': 3,

    // `property` 对应 015: [建议] 在可以使用缩写的情况下，尽量使用属性缩写。
    // `color` 对应 030: [强制] 颜色值可以缩写时，必须使用缩写形式。
    'shorthand': ['property', 'color'],

    // 017: [建议] 同一 rule set 下的属性在书写时，应按功能进行分组，
    // 并以 **Formatting Model（布局方式、位置） > Box Model（尺寸） > Typographic（文本相关） > Visual（视觉效果）**
    // 的顺序书写，以提高代码的可读性。
    // 暂无实现
    'group-properties': true,

    // 019: [建议] 尽量不使用 `!important` 声明。
    'disallow-important': true,

    // 025: [强制] 当数值为 0 - 1 之间的小数时，省略整数部分的 `0`。
    'leading-zero': true,

    // 026: [强制] `url()` 函数中的路径不加引号。
    'disallow-quotes-in-url': true,

    // 027: [建议] `url()` 函数中的绝对路径可省去协议名。
    'omit-protocol-in-url': true,

    // 028: [强制] 长度为 `0` 时须省略单位。 (也只有长度单位可省)
    'zero-unit': true,

    // 029: [强制] RGB颜色值必须使用十六进制记号形式 `#rrggbb`。不允许使用 `rgb()`。
    'hex-color': true,

    // 031: [强制] 颜色值不允许使用命名色值。
    'disallow-named-color': true,

    // 032: [建议] 颜色值中的英文字符采用小写。如不用小写也需要保证同一项目内保持大小写一致。
    'unifying-color-case-sensitive': true,

    // 033: [强制] 必须同时给出水平和垂直方向的位置。
    'horizontal-vertical-position': true,

    // 034: [强制] `font-family` 属性中的字体族名称应使用字体的英文 `Family Name`，其中如有空格，须放置在引号中。
    // 暂无实现
    'font-family-space-in-quotes': true,

    // 035: [强制] `font-family` 按「西文字体在前、中文字体在后」、「效果佳 (质量高/更能满足需求) 的字体在前、效果一般的字体在后」
    // 的顺序编写，最后必须指定一个通用字体族( `serif` / `sans-serif` )。
    // 暂无实现
    'font-family-sort': true,

    // 036: [强制] `font-family` 不区分大小写，但在同一个项目中，同样的 `Family Name` 大小写必须统一。
    'unifying-font-family-case-sensitive': true,

    // 037: [强制] 需要在 Windows 平台显示的中文内容，其字号应不小于 `12px`。
    'min-font-size': 12,

    // `font-weight` 对应 039: [强制] `font-weight` 属性必须使用数值方式描述。
    // `line-height` 对应 040: [建议] `line-height` 在定义文本段落时，应使用数值。
    'require-number': ['font-weight', 'line-height'],

    // 041: [强制] 使用 `transition` 时应指定 `transition-property`。
    'require-transition-property': true,

    // 046: [强制] 带私有前缀的属性由长到短排列，按冒号位置对齐。
    'vendor-prefixes-sort': true,

    // 050: [强制] 禁止使用 `Expression`。
    'disallow-expression': true,

    // 判断属性是否存在
    'property-not-existed': true,


    /* ********************* 以下配置来自 csslint ********************* */

    // Don't use width or height when using padding or border
    'box-model': true,

    // Certain properties shouldn't be used with certain display property values
    'display-property-grouping': true,

    // Duplicate properties must appear one after the other
    'duplicate-properties': true,

    // Rules without any properties specified should be removed
    'empty-rules': true,

    // 和 property-not-existed 需要重构
    // 'known-properties': true,

    // Don't use adjoining classes
    'adjoining-classes': true,

    // box-sizing doesn't work in IE6 and IE7
    'box-sizing': true,

    // 'compatible-vendor-prefixes': true,

    // When using a vendor-prefixed gradient, make sure to use them all
    'gradients': true,

    // Negative text-indent doesn't work well with RTL.
    // If you use text-indent for image replacement explicitly set direction for that item to ltr
    'text-indent': true,

    // 和 vendor-prefixes-sort 需要重构
    // 'vendor-prefix': true,

    // For older browsers that don't support RGBA, HSL, or HSLA, provide a fallback color
    'fallback-colors': true,

    // Checks for the star property hack (targets IE6/7)
    'star-property-hack': true,

    // Checks for the underscore property hack (targets IE6)
    'underscore-property-hack': true,

    // Use the bulletproof @font-face syntax to avoid 404's in old IE
    // (http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax)
    'bulletproof-font-face': true,

    // Too many different web fonts in the same stylesheet
    'font-face': 5,

    // Don't use @import, use <link> instead
    'import': true,

    // Selectors that look like regular expressions are slow and should be avoided
    'regex-selectors': true,

    // Don't use universal selector because it's slow
    'universal-selector': true,

    // Unqualified attribute selectors are known to be slow
    'unqualified-attributes': true,

    // Every background-image should be unique. Use a common class for e.g. sprites
    'duplicate-background-images': true,

    // Too many floats, you're probably using them for layout. Consider using a grid system instead
    'floats': 10,

    // Too many font-size declarations, abstraction needed
    'font-sizes': 10,

    // Selectors should not contain IDs
    'ids': true,

    // Use of outline: none or outline: 0 should be limited to :focus rules
    'outline-none': true,

    // Headings should not be qualified
    'qualified-headings': true,

    // Headings should be defined only once
    'unique-headings': true

    /* eslint-enable fecs-camelcase */
};
