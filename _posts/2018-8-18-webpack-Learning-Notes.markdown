---
layout: post
title:  "webpack学习笔记"
date:   2018-08-18 10:16:12 +0800
categories: learning-notes
tags: webpack WEB前端
---
* content
{:toc}
虽然在商家单页面案例([学习笔记](https://nxjniexiao.github.io/2018/08/16/Sell-APP-Learning-Notes/))中使用了webpack，但其实不是很理解webpack的工作原理。因此还是很有必要去学习一下webpack。
## 1. 安装webpack
在网上搜了一些教程，大都是全局安装并使用webpack。由于实际项目中大都是局部安装的。因此特意去搜了一下如何局部安装webpack：
+ 1) 新建一个文件夹exercise webpack，用来存放学习代码；
+ 2) 在此文件夹中打开CMD，运行：
```
npm init
```
生成一个package.json文件;
+ 3) 安装webpack：
```
npm install webpack --save-dev
```
+ 4) 安装webpack-cli：
```
npm install webpack-cli --save-dev
```
完成后，打开package.json文件，我们会发现文件中多了devDependencies字段：
```json
// devDependencies：开发和测试环境中依赖的包。项目上线之后不需要。
  "devDependencies": {
    "webpack": "^4.16.5",
    "webpack-cli": "^3.1.0"
  }
```

## 2. 使用webpack
### 2.1 打包多个js文件
+ 1) 在exercise webpack文件夹下新建名为‘01’的文件夹，并在其中新建index.html、app.js、01.js、02.js：<br>
  index.html:
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>index</title>
      <!-- <script src="../dist/main.js"></script> -->
  </head>
  <body>
  
  </body>
  </html>
  ```
js:
```js
/* app.js文件 */
const show = require('./01');// 引入01.js
let str = show("Hello webpack!");
document.write('<div>' + str + '</div>');
/* 01.js文件 */
const upper = require('./02');// 引入02.js
module.exports = function show(str) {
    return upper(str);
};
/* 02.js文件 */
module.exports = function upper(str) {
    return str.toUpperCase();
};
```
我们可以看出，app.js引入了01.js，而01.js引入了02.js。
+ 2) 在package.json文件中定义脚本命令：
```json
  "scripts": {
    "test01": "webpack --mode=development 01/app.js"
  },
```
`--mode=development`表示webpack的运行模式为开发模式。
+ 3) 在exercise webpack文件夹下打开CMD，运行：
```
npm run test01
```
打包完成后，exercise webpack文件夹下会多一个dist文件夹，其中有个main.js文件；
+ 4) 在01/index.html文件中引入此main.js文件：
```html
<script src="../dist/main.js"></script>
```
用浏览器打开01/index.html文件，页面中出现：`HELLO WEBPACK!`。这说明webpack把app.js、01.js和02.js合并成了一个文件：main.js。

### 2.2 打包样式
在exercise webpack文件夹下拷贝一份01文件夹，命名为：02。
+ 1) 安装css-loader和style-loader。在exercise webpack文件夹下打开CMD，运行:
```
npm install css-loader style-loader --save-dev
```
《入门webpack》中关于这两个加载器的解释：
>css-loader使你能够使用类似@import和url（...）的方法实现require的功能，style-loader将所有的计算后的样式加入页面中，二者组合在一起使你能够把样式表嵌入webpack打包后的js文件中。
+ 2) 在文件夹'02'中新建style.css、01.css和02.css：<br>
style.css文件：
```css
/* 引入01.css和02.css文件 */
@import './01.css';
@import './02.css';
```
01.css和02.css文件：
```css
/* 01.css文件 */
div{
    background: tomato;
}
/* 02.css文件 */
div{
    color: white;
    font-size: 40px;
}
```
+ 3) 在02/app.js中引入style.css文件：
```js
require('!style-loader!css-loader!./style.css');// 注意顺序：style-loader在前面
```
+ 4) 在package.json文件中定义脚本命令：
```json
  "scripts": {
    "test01": "webpack --mode=development 01/app.js",
    "test02": "webpack --mode=development 02/app.js"
  }
```
+ 5) 在exercise webpack文件夹下打开CMD，运行：
```
npm run test02
```
运行完成后，2.1产生的dist/main.js会被新生成的main.js覆盖掉。<br>

打开02/index.html，查看效果：
<div style="background: tomato;color:white;font-size:40px">HELLO WEBPACK!</div>

**疑点：**
其中有一次运行`npm run test02`时报错：
```
Error: Cannot find module 'p-limit'
```
安装p-limit模块后，接着报错：
```
Error: Cannot find module 'webpack-sources'
```
安装webpack-sources模块后，又报错：
```
Error: Cannot find module 'loader-runner'
```
在意识到可能不是模块丢失的原因后，我删除了node_modules文件夹，修改pakage.json中的`"devDependencies"`：
```json
  "devDependencies": {
    "css-loader": "^1.0.0",
    "style-loader": "^0.22.1",
    "webpack": "^4.16.5",
    "webpack-cli": "^3.1.0"
  }
```
然后运行：
```
npm install
```
完成之后，webpack运行正常。