---
layout: post
title: "搜索树形数组"
date: 2018-12-28 21:49:12 +0800
categories: learning-notes
tags: WEB前端 Vue
---
* content
{:toc}

## 1. 需求

有一颗树形数组，显示了一个公司的整体结构，如下：
<div><img src="/images/2018-12-28-Search-Tree-Array/tree.png" /></div>
现在的需求是，根据指定的 id 找出该公司，及其所有的父级公司。比如查询条件为 `id = 131` 的结果为：<br>
`[总公司, 分公司1, 分公司1-3, 分公司1-3-1]`




树形数组如下：
```js
var arr = [
  {
    id: 0,
    name: "总公司",
    children: [
      {
        id: 1,
        name: "分公司1",
        children: [
          {
            id: 11,
            name: "分公司1-1",
            children: [
              { id: 111, name: "分公司1-1-1" },
              { id: 112, name: "分公司1-1-2" }
            ]
          },
          {
            id: 12,
            name: "分公司1-2",
            children: [{ id: 121, name: "分公司1-2-1" }]
          },
          {
            id: 13,
            name: "分公司1-3",
            children: [
              { id: 131, name: "分公司1-3-1" },
              { id: 132, name: "分公司1-3-2" },
              { id: 133, name: "分公司1-3-3" }
            ]
          }
        ]
      },
      {
        id: 2,
        name: "分公司2",
        children: [{ id: 21, name: "分公司2-1" }, { id: 22, name: "分公司2-2" }]
      }
    ]
  }
];
```

## 2. 递归实现

+ 递归函数传入三个参数：树形数组 `targetArr`，查询条件 `id` 和结果数组 `res`；
+ 循环对比数组中的每一个对象：
   + 1) 把对象 `push` 进 `res` 数组；
   + 2) 判断此对象的 `id` 是否满足要求，若满足，则 `return true`，用于跳出当前循环，以及跳出外层循环(如果有的话)；
   + 3) 判断此对象有无 `children` 属性(有无子公司)，如果没有，把 1) 中 `push` 进来的对象 `pop` 出去；
       + 判断该次循环是否为最后一次循环，如果是，`return false` 告诉外层循环未找到符合条件的对象；
       + 如果不是最后一次循环，则直接进入下一此循环；
   + 4) 如果 2) 和 3) 都不满足，说明有 `children` 属性，则调用递归，查询子公司。<br>
        `hasBeenFound = f(tar.children, id, res); // 递归`
        + 根据递归结果，返回了 `true` ，说明找到了符合条件的对象，则 `return true`，用于跳出当前循环，以及跳出外层循环(如果有的话)；
        + 如果没有返回 `true`，把 1) 中 `push` 进来的对象 `pop` 出去；

**注:** 特别是 4) 中的 `return true`，不能使用 `break`，否则无法跳出外层循环。

```js
const search = function f(targetArr, id, res) {
  res = res || [];
  let hasBeenFound = false;
  for (let i = 0, len = targetArr.length; i < len; i++) {
    const tar = targetArr[i];
    res.push(tar);
    // 1. 当前对象为指定对象
    if (tar.id === id) {
      return true; // 跳出当前循环，并返回true(用来结束外层循环)
    }
    // 2. 当前对象无子公司
    if (!tar.hasOwnProperty("children")) {
      res.pop();
      if (i === len - 1) {
        // 最后一个对象
        return false; // 返回 false
      } else {
        // 非最后一个对象
        continue; // 进入下一次循环(对比下一个对象)
      }
    }
    // 3. 查询其子公司
    hasBeenFound = f(tar.children, id, res); // 递归
    if (hasBeenFound) {
      // 如果在子公司中找到指定对象
      // 此处有个坑：不要使用break，否则只能跳出本层循环，外层循环中 hasBeenFound 为 undefined
      return true; // 跳出当前循环，并返回true(用来结束外层循环)
    } else {
      // 如果在子公司中未找到指定对象
      res.pop();
    }
  }
};
```
测试结果如下：
```js
const res = [];
console.log(search(arr, 131, res));
console.log(res);
//  true
//  [ 
//    { id: 0, name: '总公司', children: [ [Object], [Object] ] },
//    { id: 1, name: '分公司1', children: [ [Object], [Object], [Object] ] },
//    { id: 13, name: '分公司1-3', children: [ [Object], [Object], [Object] ] },
//    { id: 131, name: '分公司1-3-1' } 
//  ]
```