---
layout: post
title: '设计模式 02 — 观察者模式'
date: 2020-07-02 16:56:00 +0800
categories: 设计模式
tags: js
---

* content
{:toc}

## 1. 定义

《JavaScript设计模式与开发实践》中对观察者模式的定义如下：
>发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。在JavaScript 开发中，我们一般用事件模型来替代传统的发布—订阅模式。




## 2. 简单实现

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

  // 监听
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

  // 监听一次
  function once(event, fn) {
    const fnWrapper = () => {
      // 注意这里取消监听的是 fnWrapper ，而不是 fn
      this.off(event, fnWrapper);
      fn.apply(this, arguments);
    }
    this.on(event, fnWrapper);
  }

  // 取消监听
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

  // 触发事件
  function emit(event) {
    const eventsList = events[event] || [];
    eventsList.forEach(ev => {
      ev.apply(this, arguments);
    });
  }
})();
```
