---
layout: post
title:  "在webpack中使用react和babel"
date:   2018-08-30 14:10:12 +0800
categories: learning-notes
tags: WEB前端 webpack react
---
* content
{:toc}

在学习react过程中，若不使用工具，总是要引入babel、react和react-dom：
```html
<script src="js/browser.js"></script>
<script src="js/react.js"></script>
<script src="js/react-dom.js"></script>
```
上述这三个js文件可以在[cdnjs.com](https://cdnjs.com/)下载，或使用Bower下载：[https://bower.io](https://bower.io/)。<br>
因此，在网上搜集了一些资料，并记录下如何在webpack中使用react进行模块化开发。

## 1. 安装所需要的模块

关于如何安装和使用webpack，可以参考[webpack学习笔记](https://nxjniexiao.github.io/2018/08/18/webpack-Learning-Notes/)。<br>
在安装react相关模块前，我们先安装以下模块：
+ webpack和webpack-cli；
+ webpack-dev-server，提供实时重载的服务器；
+ html-webpack-plugin，自动生成index.html，并把打包后的js文件引入其中；
+ style-loader和css-loader，把样式嵌入打包后的js文件中；
+ babel-core和babel-loader，把ES6语法转换成ES5；
+ babel-preset-env，根据目标浏览器或运行时环境，自动决定适合的Babel插件和polyfills，从而将ES2015+编译为ES5。

然后安装以下模块：
+ react和react-dom；
+ babel-preset-react，所有React插件的Babel预设。

安装完成后，package.json中的`"dependencies"`和`devDependencies`如下：
```json
"devDependencies": {
  "babel-core": "^6.26.3",
  "babel-loader": "^7.1.5",
  "babel-preset-env": "^1.7.0",
  "babel-preset-react": "^6.24.1",
  "css-loader": "^1.0.0",
  "html-webpack-plugin": "^3.2.0",
  "style-loader": "^0.23.0",
  "webpack": "^4.17.1",
  "webpack-cli": "^3.1.0",
  "webpack-dev-server": "^3.1.7"
},
"dependencies": {
  "react": "^16.4.2",
  "react-dom": "^16.4.2"
}
```
在使用过程中遇到了一个坑，`babel-loader`模块的版本为`8.0.0`，报错：`Error: Cannot find module '@babel/core'`。<br>
解决办法：使用低版本`babel-loader`。
```bash
npm install babel-loader@7 --save-dev
```

## 2. 新增配置文件

安装好这些模块后，在项目根目录下新建配置文件webpack.config.js:
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports={
    // 入口文件
    entry: './src/js/app.js',
    // 指定输出文件
    output: {
        filename: 'dist/main.js',
    },
    // 模式
    mode: 'development',
    // 启用source-map
    devtool: 'source-map',
    // 插件
    plugins: [
        new HtmlWebpackPlugin({template: 'index.html', filename: 'index.html'})
    ],
    // 模块
    module: {
        // module.rules 允许你在 webpack 配置中指定多个 loader。
        rules: [
            {
                test: /\.css$/,
                use:[
                    {loader: 'style-loader'},
                    {loader: 'css-loader'}
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {loader: 'babel-loader'}
                ]
            }
        ]
    }
};
```
然后在根目录下创建.babelrc：
```json
{
  "presets": ["env", "react"]
}
```
最后修改package.json中`scripts`：
```json
"scripts": {
  "start": "webpack-dev-server --config webpack.config.js"
}
```

## 3. 使用react

在项目根目录下新建文件夹：
+ 主页入口文件：index.html 
+ 项目入口文件：src/js/app.js 
+ Parent组件：src/components/Parent/Parent.js 和 Parent.css
+ Child组件：src/components/Child/Child.js 和 Child.css

文件结构目录如下：
```
exercise react
├── node_modules
├── src
|   ├── components
|   |   ├── Child
|   |   |   ├── Child.css
|   |   |   └── Child.js
|   |   └── Parent
|   |       ├── Parent.css
|   |       └── Parent.js
|   └── js
|       └── app.js
├── .babelrc
├── index.html
├── package.json
└── webpack.config.js
```

index.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>webpack+react+babel</title>
    <!-- 引入webpack打包后的文件 -->
    <script src="dist/main.js"></script>
</head>
<body>
<div id="app"></div>
</body>
</html>
```
src/js/app.js：
```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// 导入组件Parent
import Parent from '../components/Parent/Parent';

window.onload = function () {
    ReactDOM.render(<Parent/>, document.getElementById('app'));
};
```
**父组件Parent：**<br>
src/components/Parent/Parent.css：
```css
.parent{
    width: 500px;
    height: 500px;
    background: tomato;
    position: relative;
}
```
src/components/Parent/Parent.js：
```jsx
// 导入样式
import './Parent.css';
// 导入react
import React from 'react';
// 导入组件Child
import Child from '../Child/Child';

class Parent extends React.Component {
    constructor(...args){
        super(...args);
    }
    render() {
        return <div className='parent'>
            父组件<br />
            <Child />
        </div>
    }
}
// 导出组件Parent
export default Parent;
```
**子组件Child：**<br>
src/components/Child/Child.css：
```css
.child{
    width: 200px;
    height: 200px;
    background: grey;
    position: absolute;
    right: 0;
    top: 0;
}
```
src/components/Child/Child.js：
```jsx
// 导入样式
import './Child.css';
// 导入react
import React from 'react';

class Child extends React.Component {
    constructor(...args){
        super(...args);
    }
    render() {
        return <div className='child'>子组件</div>
    }
}
//导出组件Child
export default Child;
```

在根目录下运行：
```bash
npm run start
```
用浏览器访问`http://localhost:8080/`。