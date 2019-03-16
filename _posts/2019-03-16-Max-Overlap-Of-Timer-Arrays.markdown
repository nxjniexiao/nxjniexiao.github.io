---
layout: post
title: "计算多个时间段数组的最大重叠数"
date: 2019-03-16 09:51:12 +0800
categories: learning-notes 算法 JS
tags: GIT
---
* content
{:toc}

## 1. 算法要求

有这样一系列时间段数组，如：

+ `[9, 18]`
+ `[9, 12]`
+ `[12, 18]`
+ `[11, 13]`

其中第一个数组表示 9 点至 18 点之间的时间段。求这些时间段的最大重叠数。<br>

**注：** 一个时间段的结束时间和另一个时间段的起始时间相同时，不算为重叠，如第二个和第三个数组。<br>

在[ CSDN ](https://blog.csdn.net/s634772208/article/details/46492651)找到了此算法的实现，现用 JS 实现此算法。

## 2. 算法分析

把时间段数组中的起点和终点都拆分为一个 Point 对象，如把 `[9, 18]` 中的起点和终点拆分为如下两个对象：

+ `{value: 9, type: 0}`：起点；
+ `{value: 18, type: 1}`：终点

其中 `value` 为时间，`type` 为类型，`type = 0` 为起点，`type = 1` 为终点。<br>
其他时间段数组做相同处理，然后把所有 Point 对象放入一个数组，然后进行排序，排序规则如下：

+ 根据时间值升序排列；
+ 时间相等时，根据类型排序，终点排前面，起点排后面。

**注：** 如果一个时间段的结束时间和另一个时间段的起始时间相同算为重叠，则起点排前面，终点排后面。<br>

定义一个初始值为 `0` 的变量 `count`，遍历排序后的数组，如果 Point 对象为起点，则 `count ++`，为终点则 `count --`。<br>
返回遍历过程中 `count` 曾经出现的最大值，即为这一系列时间段数组的最大重叠数。





## 3. 算法实现

### 3.1 Point 对象

`Point.js`:

```js
// Point 类
var Point = function(value, type) {
  // 时间
  this.value = value;
  // 0 为起点，1 为终点
  this.type = type;
};
module.exports = Point;
```

### 3.2 Point 数组排序函数

`sortFn.js`:

```js
// Point 对象数组的排序算法
var sortFn = function(p1, p2) {
  value1 = p1.value;
  value2 = p2.value;
  if (value1 !== value2) {
    // 根据时间值升序排列
    return value1 - value2;
  }
  type1 = p1.type;
  type2 = p2.type;
  // 一个时间段的结束时间和另一个时间段的起始时间相同时，不算为重叠
  // 时间值相等时，终点排前面
  return type2 - type1;
  // 一个时间段的结束时间和另一个时间段的起始时间相同时，算为重叠
  // return type1 - type2;
};
module.exports = sortFn;
```

### 3.3 时间段工厂函数

`pointFactory.js`:

```js
var Point = require("./Point");
var sortFn = require("./sortFn");
// 把时间段数组分解成 Point 对象数组
var pointFactory = function() {
  var timersArr = [];
  var push = function(timer) {
    timersArr.push(timer);
  };
  return {
    push: function(timer) {
      timersArr.push(timer);
    },
    createPointArr: function() {
      var arr = [];
      for (var i = 0, len = timersArr.length; i < len; i++) {
        var timer = timersArr[i];
        var start = timer[0];
        var end = timer[1];
        arr.push(new Point(start, 0));
        arr.push(new Point(end, 1));
      }
      return arr.sort(sortFn); // 排序
    }
  };
};
module.exports = pointFactory;
```

### 3.4 计算时间段最大重叠数函数

`calcMaxOverlap.js`:

```js
// 计算最大重叠数
var calcMaxOverlap = function(pointsArr) {
  var count = 0;
  var maxOverlap = 0;
  for (var i = 0, len = pointsArr.length; i < len; i++) {
    var point = pointsArr[i];
    if (point.type === 0) {
      // 起点
      count++;
      maxOverlap = Math.max(count, maxOverlap);
    } else {
      count--;
    }
  }
  return maxOverlap;
};
module.exports = calcMaxOverlap;
```

### 3.5 测试结果

`index.js`:

```js
var pointFactory = require("./pointFactory.js");
var calcMaxOverlap = require("./calcMaxOverlap");
var factory = pointFactory();
factory.push([9, 18]);
factory.push([9, 12]);
factory.push([12, 18]);
factory.push([11, 13]);
var pointsArr = factory.createPointArr();
console.log(pointsArr);
var maxOverlap = calcMaxOverlap(pointsArr);
console.log(maxOverlap);
```
`pointsArr` 结果如下：
```js
var pointsArr = [
  { value: 9, type: 0 },
  { value: 9, type: 0 },
  { value: 11, type: 0 },
  { value: 12, type: 1 },
  { value: 12, type: 0 },
  { value: 13, type: 1 },
  { value: 18, type: 1 },
  { value: 18, type: 1 }
];
```
最大重叠数为：`3`。