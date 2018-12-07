---
layout: post
title: "JS 一维数组和树形数组"
date: 2018-12-07 17:08:12 +0800
categories: learning-notes
tags: WEB前端 JS
---
* content
{:toc}

使用两种方法将有联系的**一维数组**转成**树形数组**。一维数组格式如下：
```js
// 一维数组
var arr = [
  { id: 0, name: "总公司" },
  { id: 1, name: "分公司1" },
  { id: 2, name: "分公司2" },
  { id: 11, name: "分公司1-1" },
  { id: 12, name: "分公司1-2" },
  { id: 21, name: "分公司2-1" },
  { id: 111, name: "分公司1-1-1" },
  { id: 112, name: "分公司1-1-2" },
  { id: 121, name: "分公司1-2-1" },
  { id: 122, name: "分公司1-2-2" }
];
```
最终的树形格式如下：




```js
// 树形数组
var res = [
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
            children: [
              { id: 121, name: "分公司1-2-1" },
              { id: 122, name: "分公司1-2-2" }
            ]
          }
        ]
      },
      { id: 2, name: "分公司2", children: [{ id: 21, name: "分公司2-1" }] }
    ]
  }
];
```

## 1. 一维数组转树形数组

### 1.1 非递归

非递归的思路如下：

1. 新建一个空数组 `res` 用来存放结果；
2. 循环整个一维数组，处理数组中的每个对象；
3. 根据每个对象的id，使用循环找到它的直接母公司对象，如：
  `id = 121` 的对象的直接母公司对象为 `res[0].children[0].children[1]`；
4. 把这个对象 `push` 到直接母公司对象的 `children` 属性中。

代码如下：

```js
function arrayToTree(arr) {
  var res = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    var comp = arr[i];
    var id = comp.id;
    if (id === 0) {
      // 总公司
      comp.children = [];
      res.push(comp);
      continue;
    }
    var currComp = res[0];
    var idArr = id.toString().split("");// [1, 1, 1]
    // 根据 id 中的值(不看最后一个)，找到此公司的直接母公司
    for (var j = 0, idLen = idArr.length - 1; j < idLen; j++) {
      currComp = currComp.children[idArr[j] - 1];
    }
    // 判断此公司的直接母公司对象是否有 children 属性
    if (!("children" in currComp)) {
      currComp.children = [];
    }
    currComp.children.push(comp);
  }
  return res;
}
```

### 1.2 递归

递归思路：

1. 使用命名函数表达式创建一个递归函数 `arrayToTree`；
2. 传入参数为一维数组，递归结束条件为：数组长度等于1；
3. 使用 `splice` 移除数组中的第二项，赋值给 `comp`；
4. 根据 `comp.id` 找到其直接母公司对象；
5. 把 `comp` 对象 `push` 到其直接母公司对象的 `children` 属性中；
6. `return f(linearArr);`

```js
var arrayToTree = (function f(linearArr) {
  var len = linearArr.length;
  // 递归结束条件：长度为1
  if (len === 1) {
    return linearArr;
  }
  var comp = linearArr.splice(1, 1)[0]; // 移除原数组中的第二项，并赋值给comp
  var id = comp.id;
  var idArr = id.toString().split(""); // [1, 1, 1]
  var parentComp = linearArr[0];
  // 根据 id 中的值(不看最后一个)，找到此公司的直接母公司
  for (var i = 0, len = idArr.length; i < len - 1; i++) {
    parentComp = parentComp.children[idArr[i] - 1];
  }
  // 判断此公司的直接母公司对象是否有 children 属性
  if (!("children" in parentComp)) {
    parentComp.children = [];
  }
  parentComp.children.push(comp);
  return f(linearArr);
});
```