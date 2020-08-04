---
layout: post
title: '设计模式 04 — 中介者模式'
date: 2020-08-04 09:25:00 +0800
categories: 设计模式
tags: js
---

* content
{:toc}

## 1. 定义

《JavaScript 设计模式与开发实践》中对中介者模式的描述如下：

>中介者模式的作用就是解除对象与对象之间的紧耦合关系。

>增加一个中介者对象后，所有的相关对象都通过中介者对象来通信，而不是互相引用，所以当一个对象发生改变时，只需要通知中介者对象即可。

>中介者使各对象之间耦合松散，而且可以独立地改变它们之间的交互。

## 2. 案例

案例如下：

会议室选择页面初始化的时候会请求机构信息，页面的 html 也是异步加载的。两件事情都完成后才会根据**机构信息**请求会议室列表。

其中 html 加载完成后会触发其 onload 事件：

HTML
```html
<ng-include
  src="'templates/meeting-room-list.html'"
  onload="onHtmlLoad()"
></ng-include>
```

初始的实现可能是这样的：

JS
```js
// 标记是否加载完毕
var orgLoaded = false;
var htmlLoaded = false;

// 获取机构相关代码
var queryOrg = function () {
  // 模拟异步请求
  setTimeout(() => {
    orgLoaded = true;
    if (htmlLoaded) queryMeetingRoomList();
  }, 200);
};

// 监听 html 加载完成后的回调
var onHtmlLoad = function () {
  htmlLoaded = true;
  if (orgLoaded) queryMeetingRoomList();
};

// 获取会议室列表信息
var queryMeetingRoomList = function () {
  console.log('开始加载会议室...');
};

// TEST
queryOrg();
setTimeout(onHtmlLoad, 300); // 模拟 onload 回调
```

目前的实现不难理解，但当加载会议室列表的条件中增加一条：**获取用户信息完成**时，我们的代码可能是这样的：

JS
```js
// 标记是否加载完毕
var orgLoaded = false;
var htmlLoaded = false;
var userLoaded = false;

// 获取机构相关代码
var queryOrg = function () {
  setTimeout(() => {
    orgLoaded = true;
    // 修改 queryOrg 的内部实现
    if (htmlLoaded && userLoaded) queryMeetingRoomList();
  }, 200);
};

// 监听 html 加载完成后的回调
var onHtmlLoad = function () {
  htmlLoaded = true;
  // 修改 onHtmlLoad 的内部实现
  if (orgLoaded && userLoaded) queryMeetingRoomList();
};

// 获取用户信息（新增）
var queryUser = function () {
  setTimeout(() => {
    userLoaded = true;
    if (orgLoaded && htmlLoaded) queryMeetingRoomList();
  }, 150);
};

// 获取会议室列表信息
var queryMeetingRoomList = function () {
  console.log('开始加载会议室...');
};

// TEST
queryOrg();
queryUser();
setTimeout(onHtmlLoad, 300); // 模拟 onload 回调
```

可以看到，当需求变更后，我们得修改 `queryOrg` 和 `onHtmlLoad` 的内部实现，比如：

JS
```js
if (htmlLoaded) queryMeetingRoomList();
// 修改为：
if (htmlLoaded && userLoaded) queryMeetingRoomList();
```

这是因为这些函数相互之间强耦合在了一起：`queryOrg` 和 `onHtmlLoad` 的内部实现需要通过 `orgLoaded` 、 `htmlLoaded` 两个变量判断是否应该调用 `queryMeetingRoomList`。

且增加的 `queryUser` 也存在同样的问题。他们之间的关系如下图：

<div><img src="/images/2020-08-04-design-patterns-04-Mediator/mediator-original.png" /></div>

## 3. 使用中介者模式重构

创建一个**中介者对象**： `queryMeetingRoomListIfNeeded` ，其余三个对象：`queryOrg` 、`queryUser` 和 `onHtmlLoad` 不再判断是否需要调用 `queryMeetingRoomList` ，他们只需要调用**中介者对象** `queryMeetingRoomListIfNeeded` ，并传入当前加载完成的条件。

JS
```js
// 获取机构相关代码
var queryOrg = function () {
  setTimeout(() => {
    queryMeetingRoomListIfNeeded('orgLoaded');
  }, 200);
};

// 监听 html 加载完成后的回调
var onHtmlLoad = function () {
  queryMeetingRoomListIfNeeded('htmlLoaded');
};

// 获取用户信息
var queryUser = function () {
  setTimeout(() => {
    queryMeetingRoomListIfNeeded('userLoaded');
  }, 150);
};
```

**中介者**在被调用时，把相应条件赋为 `true` ，然后再判断所有条件都为 `true` 后，调用 `queryMeetingRoomList` 。具体实现如下：

JS
```js
// 中介者模式
var queryMeetingRoomListIfNeeded = (function () {
  var conditionsMap = {
    orgLoaded: false,
    userLoaded: false,
    htmlLoaded: false,
  };
  return function (condition) {
    conditionsMap[condition] = true;
    var allLoaded = Object.keys(conditionsMap).every(
      (key) => conditionsMap[key]
    );
    allLoaded && queryMeetingRoomList();
  };
})();
```

重构后各对象的关系如下图：

<div><img src="/images/2020-08-04-design-patterns-04-Mediator/mediator-new.png" /></div>

可以看到，`queryOrg` 、`queryUser` 和 `onHtmlLoad` 三个对象只需要和中介者 `queryMeetingRoomListIfNeeded` 通信，三个对象之间几乎不知道彼此的存在，他们之间的关系交给了**中介者对象**来实现和维护。

当案例中的**加载条件**增加或减少时，**三个对象**的内部实现是不需要改变的，我们只需要改变**中介者对象**的实现。

## 4. 中介者模式的缺点

>不过，中介者模式也存在一些缺点。其中，最大的缺点是系统中会新增一个中介者对象，因为对象之间交互的复杂性，转移成了中介者对象的复杂性，使得中介者对象经常是巨大的。中介者对象自身往往就是一个难以维护的对象。

>一般来说，如果对象之间的复杂耦合确实导致调用和维护出现了困难，而且这些耦合度随项目的变化呈指数增长曲线，那我们就可以考虑用中介者模式来重构代码。
