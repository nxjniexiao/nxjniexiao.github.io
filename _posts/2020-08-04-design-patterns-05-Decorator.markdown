---
layout: post
title: '设计模式 05 — 装饰者模式'
date: 2020-08-04 16:03:00 +0800
categories: 设计模式
tags: JS
---

* content
{:toc}

## 1. 定义

《JavaScript 设计模式与开发实践》中对装饰者模式的描述如下：

>这种给对象动态地增加职责的方式称为装饰者（decorator）模式。装饰者模式能够在不改变对象自身的基础上，在程序运行期间给对象动态地添加职责。跟继承相比，装饰者是一种更轻便灵活的做法，这是一种“即用即付”的方式。

## 2. 案例

[设计模式 03 — 策略模式]({% post_url 2020-07-29-design-patterns-03-Strategy %})中使用了策略模式重构了 `submit` 函数：

JS
```js
var submit = function (meeting) {
  var msg = validateMeeting(meeting);
  if (msg) return console.log(msg);
  // 验证通过，发起请求...
};
```

虽然校验逻辑都被封装到了 `validateMeeting` 函数中，但 `submit` 函数内部还是要调用 `validateMeeting` 。

在使用**装饰者模式**重构 `submit` 前，先把 `validateMeeting` 从 `submit` 中抽离出来，让他们不再有任何**耦合关系**：

JS
```js
var submit = function (meeting) {
  // 发起请求...
};

var validateMeeting = function (meeting) {
  // 校验逻辑...
}
```

然后再考虑如何给 `submit` 函数动态添加 `validateMeeting` 函数的功能，但是：

>在 JavaScript 中可以很方便地给某个对象扩展属性和方法，但却很难在不改动某个函数源代码的情况下，给该函数添加一些额外的功能。

JavaScript 中通常使用 AOP 装饰函数。


## 3. 使用AOP装饰函数

>AOP（面向切面编程）的主要作用是把一些跟**核心业务逻辑模块**无关的功能抽离出来，这些跟业务逻辑无关的功能通常包括日志统计、安全控制、异常处理等。把这些功能抽离出来之后，再通过**“动态织入”**的方式掺入业务逻辑模块中。这样做的好处首先是可以保持业务逻辑模块的纯净和高内聚性，其次是可以很方便地复用日志统计等功能模块。

JavaScript 中通常使用高阶函数实现 AOP :

JS
```js
var before = function( fn, beforeFn ) {
  return function() {
    // 运行前一个函数
    var msg = beforeFn.apply(this, arguments);
    // 根据返回值判断是否调用后一个函数
    msg ? console.log(msg) : fn.apply(this, arguments);
  }
}
```

然后再使用 `before` 函数装饰 `submit` 函数：

JS
```js
var submit = function (meeting) {
  // 发起请求...
  console.log('提交表单');
};

var validateMeeting = function (meeting) {
  // 模拟校验逻辑
  var num = Math.random();
  return num > 0.5 ? '验证不通过' : null;
}

// 使用AOP装饰函数
submit = before(submit, validateMeeting);

// TEST
submit({});
```

## 4. AOP装饰函数的优点

>用 AOP 装饰函数的技巧在实际开发中非常有用。不论是业务代码的编写，还是在框架层面，我们都可以把行为依照职责分成粒度更细的函数，随后通过装饰把它们合并到一起，这有助于我们编写一个松耦合和高复用性的系统。
