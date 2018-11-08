---
layout: post
title:  "使用递归实现 ES5 中的数组方法 reduce"
date:   2018-11-08 15:24:12 +0800
categories: learning-notes
tags: WEB前端 JS
---
* content
{:toc}

## 1. 递归

**JavaScript高级程序设计(第三版)** 第7章中的7.1节讲了 **递归**。<br>

### 1.1 递归函数

> 递归函数是在一个函数通过名字调用自身的情况下构成的。

书中给了一个经典的递归阶乘函数：
```js
function factorial(num) {
  if(num <= 1) {
    return 1;
  } else {
    return num * factorial(num - 1);
  }
}
```
可以看到此函数通过函数名`factorial`调用了自身。JavaScript中关于函数，可以这样理解:<br>
函数名是指针，函数是对象。<br>
这样，如果我们把其它值赋值给了`factorial`后，就会导致出错：
```js
var anotherFactorial = factorial;
factorail = null;
anotherFactorial(4);// 出错
```
`factorial`的值为`null`，所以`anotherFactorial`函数中调用`factorial`函数时，就会报错。

### 1.2 arguments.callee

> arguments.callee 是一个指向正在执行的函数的指针，因此可以用它来实现对函数的递归调用。

```js
function factorial(num) {
  if(num <= 1) {
    return 1;
  } else {
    return num * arguments.callee(num - 1);// 重点
  }
}
```
但在严格模式下，不能通过脚本访问`arguments.callee`。

### 1.3 命名函数表达式

```js
var factorial = (function f(num) {
  if(num <= 1) {
    return 1;
  } else {
    return num * f(num - 1);// 重点
  }
});
```
>以上代码创建了一个名为`f()`的命名函数表达式，然后将它赋值给变量`factorial`。这种方式在严格模式和非严格模式下都行得通。

## 2. 实现数组方法reduce

### 2.1 reduce
`reduce()` 为 ES5 中数组的一个方法，它会从数组的第一项开始，迭代数组的所有项，然后构建一个最终返回值。<br>
此方法接收两个参数：
+ 1) 在每一项上调用的函数，格式为：
```js
function (prev, curr, index, array) { 
  // 进行一些操作，然后返回一个结果
  return result;
  }
```
其中：
   + `prev`: 前一个值；
   + `curr`: 当前值；
   + `index`: 项的索引；
   + `array`: 数组对象。
+ 2) 作为归并基础的初始值(可选)。
   + 有初始值时，第一次执行函数时，`prev` 为初始值，`curr` 为数组第一项；
   + 无初始值时，第一次执行函数时，`prev` 为数组第一项，`curr` 为数组第二项；

书中的例子：
```js
var arr = [1,2,3,4,5];
var sum = arr.reduce(function(prev, curr, index, array){
  return prev + curr;
})
console.log(sum); // 15
```

### 2.2 如何实现reduce

给数组 `Array` 的原型添加一个自定义方法 `_myReduce`:
```js
Array.prototype._myReduce = function (func, init) {
  let i = 0;
  let _this = this;
  // 命名函数表达式
  var merge = (function f(prevRes) {
    const res = func(prevRes, _this[i], i, _this);
    if (i >= _this.length - 1) {
      return res;
    } else {
      i++;
      return f(res);
    }
  });
  if (init == undefined) {
    // 无初始值
    if(this.length === 1) {
      // 数组长度为1
      return this[0];
    }
    return merge(_this[i++]);// i++ : 先使用，然后加1
  } else {
    // 有初始值
    return merge(init);
  }
}
```
使用：
```js
let arr = [1,2,3,4,5];
const res1 = arr._myReduce((prev, curr) => {
  return prev + curr;
});
const res2 = arr._myReduce((prev, curr) => {
  return prev + curr;
}, 100);
console.log('res1 = ', res1);// 15
console.log('res2 = ', res2);// 115
```