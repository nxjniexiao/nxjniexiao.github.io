---
layout: post
title: '设计模式 01 —— 职责链模式'
date: 2019-07-08 11:20:00 +0800
categories: 设计模式
tags: js
---

* content
{:toc}

## 1. 定义

职责链模式的定义是：使多个对象都有机会处理请求，从而避免请求的**发送者**和**接受者**之间的耦合关系：<br>

`Request` --> `A` --> `B` --> `C` --> `D`。




## 2. 面向对象的职责链

### 2.1 构造函数 Chain

首先定义一个构造函数 `Chain`:

```js
// 构造函数 Chain
// fn 为需要被包装的函数
// nextNode 为链中的下一个节点
var Chain = function(fn) {
  this.fn = fn;
  this.nextNode = null;
};
```

### 2.2 Chain.prototype

给 Chain 的原型添加方法:

```js
// 指定链中的下一个节点
Chain.prototype.setNextNode = function(nextNode) {
  return (this.nextNode = nextNode); //返回下一个节点
};
// 处理并传递请求
Chain.prototype.handleRequest = function() {
  var ret = this.fn.apply(this, arguments);
  if (ret === 'NEXT_NODE') {
    return (
      this.nextNode &&
      this.nextNode.handleRequest.apply(this.nextNode, arguments)
    );
  }
  return ret;
};
```

### 2.3 异步职责链

给 Chain 的原型添加方法:

```js
// 异步职责链，手动把请求传递给职责链中的下一个节点
Chain.prototype.next = function() {
  return (
    this.nextNode && this.nextNode.handleRequest.apply(this.nextNode, arguments)
  );
};
```

## 3. 使用闭包实现职责链

### 3.1 _after 方法

首先给出 Function.prototype._after 方法：

- 接受一个函数 fn 作为参数，返回一个函数；
- 此函数先执行函数自身
  - 能处理，返回运行结果；
  - 不能处理(返回 ‘NEXT_NODE’)，则返回 fn 的运行结果。

```js
Function.prototype._after = function(fn) {
  var _self = this;
  return function() {
    var ret = _self.apply(this, arguments);
    if (ret === 'NEXT_NODE') {
      return fn.apply(this, arguments);
    }
    return ret;
  };
};
```

### 3.2 使用案例

有一个预约会议的表单页面，点击预约按钮后，会根据当前表单的状态，预约本地会议、Umeeting 会议、视频会议和混合会议四种会议。<br>

#### 3.2.1 初始函数

这个创建会议的函数可能是这样的：

```js
var createMeeting = function(meeting) {
  if (meeting.type === 1) {
    // 创建本地会议...
  } else if (meeting.type === 3) {
    // 创建Umeeting会议...
  } else if (meeting.type === 0 && !meeting.isMixed) {
    // 创建视频会议...
  } else if (meeting.type === 0 && meeting.isMixed) {
    // 创建混合会议...
  }
};
```

#### 3.2.2 使用职责链重构

分解 createMeeting 函数，每个会议的创建过程单独封装成一个函数，使其粒度更加细小。再根据职责链的定义，分析出此案例的模型：<br>

点击预约按钮(发起请求) `-->` createLocalMeeting `-->` createUmeeting `-->` createVideoMeeting `-->` createMixedMeeting 。<br>

当某个节点无法处理请求时，会传递给此链条中的下一个节点。<br>

使用职责链重构后:

```js
// 创建会议(职责链模式)
var createMeeting = createLocalMeeting
  ._after(createUmeeting)
  ._after(createVideoMeeting)
  ._after(createMixedMeeting);
```

1. 创建本地会议:<br>
```js
var createLocalMeeting = function(meeting) {
  if (meeting.type !== 1) {
    return 'NEXT_NODE';
  }
  // 创建本地会议的逻辑...
};
```
2. 创建Umeeting会议:<br>
```js
var createUmeeting = function(meeting) {
  if (meeting.type !== 3) {
    return 'NEXT_NODE';
  }
  // 创建Umeeting会议的逻辑...
};
```
3. 创建视频会议:<br>
```js
var createVideoMeeting = function(meeting) {
  if (meeting.type !== 0 || meeting.isMixed) {
    return 'NEXT_NODE';
  }
  // 创建视频会议的逻辑...
};
```
4. 创建混合会议:<br>
```js
var createMixedMeeting = function(meeting) {
  if (meeting.type !== 0 || meeting.isMixed) {
    return 'NEXT_NODE';
  }
  // 创建混合会议的逻辑...
};
```

重构之后的好处：
1. 粒度更小的函数更易于阅读、维护和复写。
2. 良好的函数命名本身就起到了注释的作用。
3. 职责链中的每个节点之间已解耦，不会相互影响。可扩展性更强：
   + 当不需要某个类型的会议时，直接在链条中取消创建此类型会议的函数即可。
   + 当需要增加某个类型会议时，直接在链条的任意位置插入新函数即可，不需要去修改其他类型会议的创建函数。
4. 每个函数(对象)更加符合单一职责原则。
