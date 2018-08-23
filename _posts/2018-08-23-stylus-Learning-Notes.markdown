---
layout: post
title:  "Stylus学习笔记"
date:   2018-08-23 15:41:12 +0800
categories: learning-notes
tags: CSS WEB前端
---
* content
{:toc}
Stylus是一款CSS预处理语言，它提供了高效、动态和富有表现力的方式来生成CSS。Stylus支持缩进的语法和常规的CSS样式。

## 1. 安装Stylus

新建文件夹"exercise Stylus"，下面的操作均在此文件夹中完成。
+ 1) 安装Stylus前，运行：
```bash
npm init
```
生成package.json文件。
+ 2) 本地安装stylus：
```bash
npm install stylus --save-dev
```
+ 3) 使用stylus：
```bash
stylus -w style.styl -o style.css
```
其中style.styl为需要编译的stylus文件，style.css为编译后的css文件。<br>
由于我们没有全局安装Stylus，所以不能直接使用stylus命令。我们需要修改package.json文件中的scripts：
```json
  "scripts": {
    "test01": "stylus -w style.styl -o style.css"
  }
```
然后在package.json所在目录(即文件夹"exercise Stylus")下运行：
```bash
npm run test01
```

## 2. 使用Stylus

### 2.1 编译单个stylus文件
+ 1) 在package.json所在的文件夹"exercise Stylus"(以下统一简称**根目录**)中新建文件夹"01"，然后在01中新建index.html和style.styl文件。<br>
目录结构如下：
```
exercise Stylus
├── 01
|   ├── index.html
|   └── style.styl
└── package.json
```
**index.html：**
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>01</title>
  </head>
  <body>
  <div class="box1"></div>
  <div class="box2"></div>
  </body>
  </html>
  ```
**style.styl：**
  ```css
  .box1
    width: 100px
    height: 100px
    background: tomato
  .box2
    width: 100px
    height: 100px
    background: skyblue
  ```
+ 2) 修改package.json文件中的scripts：
```json
  "scripts": {
    "test01": "stylus -w 01/style.styl -o 01/style.css"
  }
```
+ 3) 在根目录下运行：
```bash
npm run test01
```
文件夹"01"中会生成一个style.css文件：
  ```css
  .box1 {
    width: 100px;
    height: 100px;
    background: #ff6347;
  }
  .box2 {
    width: 100px;
    height: 100px;
    background: #87ceeb;
  }
  ```
+ 4) 在index.html中引入此css文件：
  ```html
  <link rel="stylesheet" href="style.css">
  ```
用浏览器打开index.html，我们会看到两个颜色不一样的div。

### 2.2 编译多个stylus文件

+ 1) 复制文件夹01，命名为02，删除style.css文件，新建01.styl和02.styl文件。
目录结构如下：
```
exercise Stylus
├── 02
|   ├── 01.styl
|   ├── 02.styl
|   ├── index.html
|   └── style.styl
└── package.json
```
**style.styl：**
```css
@import '01.styl';
@import '02.styl';
```
**01.styl：**
  ```css
  .box1
    width: 100px
    height: 100px
    background: tomato
  ```
**02.styl：**
  ```css
  .box2
    width: 100px
    height: 100px
    background: skyblue
  ```
+ 2) 修改package.json文件中的scripts：
```json
  "scripts": {
    "test02": "stylus -w 02/style.styl -o 02/style.css"
  }
```
+ 3) 在根目录下运行：
```bash
npm run test02
```
文件夹"02"中会生成一个style.css文件：
  ```css
  .box1 {
    width: 100px;
    height: 100px;
    background: #ff6347;
  }
  .box2 {
    width: 100px;
    height: 100px;
    background: #87ceeb;
  }
  ```
用浏览器打开文件夹"02"中的index.html。

### 2.3 在webpack中使用stylus

关于如何安装和使用webpack，可以参考[webpack学习笔记](https://nxjniexiao.github.io/2018/08/18/webpack-Learning-Notes/)。
除了之前安装过的stylus，我们还需要安装以下模块：
+ 安装webpack和webpack-cli；
+ 安装web-dev-server，提供实时重载的服务器；
+ 安装style-loader和css-loader，把样式嵌入打包后的js文件中；
+ 安装stylus-loader(A stylus loader for webpack)；

安装好上述这些模块后，在根目录下新建webpack.config.js文件：
```js
module.exports = {
  // 模式
  mode: 'development',
  // 模块
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          // 三个loader的顺序不能改变
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      }
    ]
  }
};
```
然后修改package.json文件中的scripts:
```json
  "scripts": {
    "start": "webpack-dev-server --entry ./src/js/app.js --output-filename ./dist/main.js"
  }
```
除开文件夹01和02，目录结构如下图：
```
exercise Stylus
├── node_modules
├── src
|   ├── css
|   |   ├── 01.styl
|   |   ├── 02.styl
|   |   └── style.styl
|   └── js
|       ├── 01.js
|       ├── 02.js
|       └── app.js
├── index.html
├── package.json
└── webpack.config.js
```
**index.html：**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>index</title>
  <script src="./dist/main.js"></script>
</head>
<body>
<div class="box1"></div>
<div class="box2"></div>
</body>
</html>
```
**js文件：**
```js
/* app.js */
import '../styl/style.styl'; //ES2015
import show from './01';// 引入01.js(ES2015)

let str = show("Hello webpack!——使用配置文件");
document.write('<div>' + str + '</div>');

/* 01.js */
import upper from './02';// 引入0.2.js(ES2015)

export default function (str) {
    return upper(str);
}

/* 02.js */
let show = (str) => {
    return str.toUpperCase();
};
export default show;
```
**Stylus文件：**
```css
/* style.styl */
@import '01.styl';
@import '02.styl';

/* 01.styl */
.box1
  width: 100px
  height: 100px
  background: tomato

/* 02.styl */
.box2
  width: 100px
  height: 100px
  background: skyblue
```
在根目录下运行：
```bash
npm run start
```
提示编译成功后，在浏览器中打开`http://localhost:8080`。