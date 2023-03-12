---
layout: post
title: '设计模式 02 — 观察者模式'
date: 2020-07-02 16:56:00 +0800
categories: 设计模式
tags: JS
---


## 1. 定义

《JavaScript设计模式与开发实践》中对观察者模式的定义如下：
>发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。在JavaScript 开发中，我们一般用事件模型来替代传统的发布—订阅模式。




## 2. 案例

`Vue2` 中有四个事件相关的 `API`:
1. `vm.$on`：监听当前实例上的自定义事件。
2. `vm.$once`：监听一个自定义事件，但是只触发一次。
3. `vm.$off`：移除自定义事件监听器。
4. `vm.$emit`：触发当前实例上的事件。

这四个 `API` 不能跨组件通信，下一节我们将其作为参考实现全局的**发布-订阅模式**。

## 3. 简单实现

>发布—订阅模式可以用一个全局的 Event 对象来实现，订阅者不需要了解消息来自哪个发布者，发布者也不知道消息会推送给哪些订阅者，Event 作为一个类似“中介者”的角色，把订阅者和发布者联系起来。见如下代码：

JS
```js
const Events = (function() {
  const events = {};
  return {
    on: on,
    once: once,
    off: off,
    emit: emit
  }

  /**
  *  监听
  *  @params {string | Array<string>} event 事件名或包含多个事件名的数组
  *  @params {Function} fn 回调函数
  */
  function on(event, fn) {
    if (!event) return;
    if (Array.isArray(event)) {
      for (let i = 0, len = event.length; i < len; i++) {
        this.on(event[i], fn);
      }
    } else {
      (events[event] || (events[event] = [])).push(fn);
    }
  }

  /**
  *  监听一次。一旦触发之后，监听器就会被移除。
  *  @params {string | Array<string>} event 事件名或包含多个事件名的数组
  *  @params {Function} fn 回调函数
  */
  function once(event, fn) {
    if (Array.isArray(event)) {
      for (let i = 0, len = event.length; i < len; i++) {
        this.once(event[i], fn);
      }
    } else {
      const fnWrapper = function() {
        // 注意这里取消监听的是 fnWrapper ，而不是 fn
        this.off(event, fnWrapper);
        fn.apply(this, arguments);
      }
      this.on(event, fnWrapper);
    }
  }

  /**
  *  取消监听
  *  @params {string | Array<string>} event 事件名或包含多个事件名的数组
  *  @params {Function} fn 取消监听的回调函数
  */
  function off(event, fn) {
    if (!event) return;
    if (Array.isArray(event)) {
      for (let i = 0, len = event.length; i < len; i++) {
        this.off(event[i], fn);
      }
    } else {
      if (!fn) return events[event] = [];
      const eventsList = events[event];
      for (let i = 0, len = eventsList.length; i < len; i++) {
        if (eventsList[i] === fn) {
          eventsList.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
  *  触发事件
  *  @params {string } event 触发的事件名
  *  @params {Array} [args] 剩余参数
  */
  function emit(event) {
    const eventsList = events[event] || [];
    const args = Array.prototype.slice.call(arguments, 1); // 移除第一个参数
    eventsList.forEach(ev => {
      ev.apply(this, args);
    });
  }
})();
```
