---
layout: post
title:  "Redux搭配React完成迷你型任务管理应用"
date:   2018-09-04 15:36:12 +0800
categories: learning-notes
tags: WEB前端 redux react
---
* content
{:toc}

Redux官网[cn.redux.js.org](https://cn.redux.js.org/docs/basics/ExampleTodoList.html)中有一个小例子：Todo List。官方源码地址：[redux-todos](https://github.com/reduxjs/redux/tree/master/examples/todos)。<br>
此文记录了自己完成此例子的过程。

## 1. 使用create-react-app快速构建单页面应用

[create-react-app](https://github.com/facebook/create-react-app#creating-an-app)能够让我们省去安装和配置webpack、babel等工作，从而能够让我们把精力放在代码上。<br>
安装过程如下：
```bash
npx create-react-app 01-todos
```
安装完成后：
```bash
cd 01-todos
yarn start
```
然后我们可以在浏览器地中输入`http://localhost:3000/`来访问我们的页面了。<br>
初始的文件结构如下:
```
01-todos/
  README.md
  node_modules/...
  package.json
  public/
    index.html
    favicon.ico
  src/
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
```
**<font color="red">注意：</font>**
+ 1) 其中有两个文件不能删除：
   + `public/index.html`：模板文件；
   + `src/index.js`：JS入口文件。
+ 2) Webpack只能处理`src`中的文件，所以JS和CSS文件要放在src中，或其子目录中；
+ 3) `public/index.html`只能引入`public`中的文件。

## 2. 准备工作

### 2.1 删除、修改文件
删除不需要的文件后，文件结构如下：
```
01-todos/
  node_modules/...
  package.json
  yarn.lock
  .gitignore
  public/
    index.html
  src/
    index.js
```
修改`public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <title>Todo List</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
</html>
```
修改`src/index.js`：
```jsx
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<div>test</div>, document.getElementById('root'));
```
重新运行`yarn start`，用浏览器访问`http://localhost:3000/`，页面中出现`test`。

### 2.2 新增文件夹

在`src`文件夹中新建如下文件夹：
+ `actions`：存放actions创建函数的文件；
+ `components`：存放展示组件(描述如何展现)；
+ `containers`：存放容器组件(描述如何运行)；
+ `reducers`：存放处理actions的纯函数reducers。

修改后文件结构如下：
```
01-todos/
  node_modules/...
  package.json
  yarn.lock
  .gitignore
  public/
    index.html
  src/
    actions/
    components/
    containers/
    reducers/
    index.js
```

### 2.3 安装库

+ 1) 安装redux：
```bash
yarn add redux
```
若使用npm工具安装：
```bash
npm install --save redux
```
+ 2) 安装react-redux：
```bash
yarn add react-redux
```
+ 3) 安装prop-types：
```bash
yarn add prop-types
```

## 3. 组件编码

Todo List需要保存两种不同的数据：
+ 当前选中的任务过滤条件；
+ 完整的任务列表。

因此state的结构如下：
```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

### 3.1 展示组件

这些组件只定义外观并不关心数据来源和如何改变。传入什么就渲染什么。如果你把代码从 Redux 迁移到别的架构，这些组件可以不做任何改动直接使用。它们并不依赖于 Redux。<br>

#### 3.1.1 Todo.js<br>
components/Todo.js用于显示 todos 列表：<br>
  + todos: Array 以 { text, completed } 形式显示的 todo 项数组。<br>
  + onTodoClick(index: number) 当 todo 项被点击时调用的回调函数。<br>

代码如下：
```jsx
import react, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
```
#### 3.1.2 