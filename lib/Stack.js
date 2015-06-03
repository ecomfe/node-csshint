/**
 * @file 简单的栈
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * Stack
 *
 * @constructor
 */
function Stack() {
    // 数据集合
    this.list = [];
    // 栈顶位置
    this.topIndex = 0;
}

/**
 * 进栈
 *
 * @param {*} elem 数据
 *
 * @return {Object} 当前栈实例
 */
Stack.prototype.push = function (elem) {
    this.list[this.topIndex++] = elem;
    return this;
};

/**
 * 出栈
 *
 * @return {Object} 当前出栈的元素
 */
Stack.prototype.pop = function () {
    if (this.topIndex) {
        var curElem = this.list[--this.topIndex];
        this.list.length = this.topIndex;
        return curElem;
    }
    return null;
};

/**
 * 返回栈顶元素
 *
 * @return {*} 站定元素
 */
Stack.prototype.getTopElem = function () {
    return this.list[this.topIndex - 1];
};

/**
 * 返回当前栈的长度
 *
 * @return {number} 当前栈的长度
 */
Stack.prototype.getLength = function () {
    return this.topIndex;
};

module.exports = Stack;
