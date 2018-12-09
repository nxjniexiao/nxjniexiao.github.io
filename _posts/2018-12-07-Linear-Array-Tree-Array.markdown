---
layout: post
title: "JS 一维数组和树形数组"
date: 2018-12-07 17:08:12 +0800
categories: learning-notes
tags: WEB前端 JS
---
* content
{:toc}

最近在面试中碰到一道题：使用两种方法将有联系的**一维数组**转成**树形数组**。一维数组格式如下：
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
以下内容是如何使用**递归**和**非递归**实现两类数组之间的转换。

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

## 2. 树形数组转一维数组

### 2.1 非递归

非递归思路：

1. 指针 `index` 初始值为零 `0`；
2. 循环结束条件为 `index` 所在位置没有值；
3. 判断指针所在位置的对象是否有 `children` 属性：<br>
如果有，则把 `children` 中的对象插入到指针位置的后面，然后删除属性：`delete comp.children;`；<br>
4. `index ++`；

```js
function treeToArray(arr) {
  index = 0;
  while (index < arr.length) {
    var comp = arr[index];
    var children = comp.children;
    if (children) {
      // 把 splice() 方法的前两个参数提前插入 children 数组中
      children.unshift(index + 1, 0);
      // 第一个: index + 1: 要删除的第一项的位置
      // 第二个: 要删除的项
      // 剩余项: 需要插入的项
      Array.prototype.splice.apply(arr, children); // children 作为参数传递
      delete comp.children; // 删除 comp 对象中的 children 属性
    }
    index++;
  }
  return arr;
}
```

### 2.2 递归

递归思路：

1. 使用命名函数表达式创建一个递归函数 `treeToArray`；
2. 传入两个参数：树形数组和指针位置 `index` ；
3. 递归结束条件为：`index` 大于等于树形数组的长度 `len`，满足条件则直接返回该树形数组；
4. 判断指针所在位置的对象是否有 `children` 属性：<br>
如果有，则把 `children` 中的对象插入到指针位置的后面，然后删除属性：`delete comp.children;`；<br>
5. `return f(arr, ++index);`。

```js
var treeToArray = (function f(arr, index) {
  index = index || 0;
  var len = arr.length;
  if (index >= len) {
    return arr;
  }
  var comp = arr[index];
  var children = comp.children;
  if (children) {
    // 把 splice() 方法的前两个参数提前插入 children 数组中
    children.unshift(index + 1, 0);
    // 第一个: index + 1: 要删除的第一项的位置
    // 第二个: 要删除的项
    // 剩余项: 需要插入的项
    Array.prototype.splice.apply(arr, children);// children 作为参数传递
    delete comp.children;// 删除 comp 对象中的 children 属性
  }
  return f(arr, ++index);
});
```