---
layout: post
title:  "webpack学习笔记"
date:   2018-08-18 10:16:12 +0800
categories: learning-notes
tags: webpack WEB前端
---
* content
{:toc}
虽然在[商家单页面案例](https://nxjniexiao.github.io/2018/08/16/Sell-APP-Learning-Notes/)中使用了webpack，但其实不是很理解webpack的工作原理。因此还是很有必要去学习一下webpack。
## 1. 安装webpack
在网上搜了一些教程，大都是全局安装并使用webpack。由于实际项目中大都是局部安装的。因此特意去搜了一下如何局部安装webpack：
+ 1) 新建一个文件夹exercise webpack，用来存放学习代码；
+ 2) 在此文件夹中打开CMD，运行：
```bash
npm init
```
生成一个package.json文件;
+ 3) 安装webpack：
```bash
npm install webpack --save-dev
```
+ 4) 安装webpack-cli：
```bash
npm install webpack-cli --save-dev
```
**官网tips：**如果你使用 webpack 4+ 版本，你还需要安装 CLI。<br>
完成后，打开package.json文件，我们会发现文件中多了devDependencies字段：
```json
// devDependencies：开发和测试环境中依赖的包。项目上线之后不需要。
  "devDependencies": {
    "webpack": "^4.16.5",
    "webpack-cli": "^3.1.0"
  }
```

## 2. 使用webpack打包
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
+ 2) 在package.json文件中定义脚本命令`"test01"`：
```json
  "scripts": {
    "test01": "webpack --mode=development 01/app.js"
  },
```
`--mode=development`表示webpack的运行模式为开发模式。
+ 3) 在exercise webpack文件夹下打开CMD，运行：
```bash
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
```bash
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
**<font color="red">注意：</font>**loader是从右向左执行的，即css-loader先执行，然后把结果传给style-loader处理，把样式打包到js文件中。因此要注意它们之间的顺序。
+ 4) 在package.json文件中定义脚本命令`"test02"`：
```json
  "scripts": {
    "test01": "webpack --mode=development 01/app.js",
    "test02": "webpack --mode=development 02/app.js"
  }
```
+ 5) 在exercise webpack文件夹下打开CMD，运行：
```bash
npm run test02
```
运行完成后，dist/main.js会被新生成的main.js覆盖掉。<br>

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
```bash
npm install
```
完成之后，webpack运行正常。
## 3. webpack配置
[webpack.docschina.org](https://webpack.docschina.org/concepts/configuration/)中对webpack配置的作用的描述：
>因为 webpack 配置是标准的 Node.js CommonJS 模块，你可以做到以下事情：
>+ 通过 require(...) 导入其他文件
>+ 通过 require(...) 使用 npm 的工具函数
>+ 使用 JavaScript 控制流表达式，例如 ?: 操作符
>+ 对常用值使用常量或变量
>+ 编写并执行函数来生成部分配置

### 3.1 基本配置文件webpack.config.js
[webpack.docschina.org](https://webpack.docschina.org/configuration)中对webpack.config.js文件的描述：
>webpack 开箱即用，可以无需使用任何配置文件。然而，webpack 会假定项目的入口起点为 src/index，然后会在 dist/main.js 输出结果，并且在生产环境开启压缩和优化。<br>
>通常，你的项目还需要继续扩展此能力，为此你可以在项目根目录下创建一个 webpack.config.js 文件，**webpack 会自动使用它**。

+ 1) 在配置webpack.config.js之前，我们先把文件夹'02'中的文件拷贝出来，重新整理一下：
   + index.html放在根目录下，即文件夹'exercise webpack'中；
   + 在根目录下新建文件夹'src'，并在src中新建文件夹'js'和'css'；
   + 把app.js、01.js和02.js放至src/js文件夹中；
   + 把style.css、01.css和02.css放至src/css文件夹中。
+ 2) 由于各文件之间的相对位置发生了变化，需要修改文件中的引用路径。<br>
index.html:
```html
<script src="dist/main.js"></script>
```
app.js:
```js
// 修改前：require('!style-loader!css-loader!./style.css');
require('../css/style.css');
// 不需要在路径中添加'!style-loader!css-loader!'，我们将在下一步的配置文件中为.css文件指定loader
```
+ 3) 在根目录下(即文件夹'exercise webpack')，新建webpack.config.js文件：
```js
const path = require('path');
module.exports = {
    // 入口文件
    entry: './src/js/app.js',
    // 指定输出文件
    // 删除output.path: __dirname + '/dist',
    // 见代码后面的注释
    output: {
        filename: 'main.js'
    },
    // 模式
    mode: 'development',
    // 模块
    module: {
        // module.rules允许你在webpack配置中指定多个loader。
        rules:[
            {
                // 正则表达式，以.css为扩展名的文件
                test: /\.css$/,
                // 指定使用的loader
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'}
                ]
            }
        ]
    }
};
```
**<font color="red">注：</font>**关于`output`选项，官网[webpack.js.org](https://webpack.js.org/concepts/output/)中这样解释：
`output`中至少要有一个值：`filename`，用于指定输出的文件名。<br>
**webpack.config.js**
 ```js
 module.exports = {
   output: {
     filename: 'bundle.js',
   }
 };
 ```
**不需要在配置中指定，webpack会自动在`dist`目录下生成文件`bundle.js`。**<br>
<br>
完成后的exercise webpack目录结构如下：
```
exercise webpack
├── node_modules
├── src
|   ├── css
|   |   ├── 01.css
|   |   ├── 02.css
|   |   └── style.css
|   └── js
|       ├── 01.js
|       ├── 02.js
|       └── app.js
├── index.html
├── package.json
└── webpack.config.js
```
+ 4) 在package.json文件中定义脚本命令`"dev"`：
```js
  "scripts": {
    "test01": "webpack --mode=development 01/app.js",
    "test02": "webpack --mode=development 02/app.js",
    "dev": "webpack"
  },
```
+ 5) 在exercise webpack文件夹下打开CMD，运行：
```bash
npm run dev
```
运行完成后，dist/main.js会被新生成的main.js覆盖掉。<br>

打开根目录下的index.html，查看效果：(为了与前面的效果区分开，修改了src中相应的代码)
<div style="background: skyblue;color:grey;font-size:40px">HELLO WEBPACK!——使用配置文件</div>

## 4. webpack安装第三方库
如何在webpack工具里安装第三方库：(以jQuery为例)
+ 1) 在根目录处打开CMD，安装jQuery:
```bash
npm install jquery --save-dev
```
+ 2) 在app.js中引入jQuery，并使用：
```js
  const $ = require('jquery');// 引入第三方库jQuery

  let div = $("div");
  div.html( div.html() + "——使用第三方库jQuery").css({'font-size': '20px'});
```
+ 3) 在exercise webpack文件夹下打开CMD，运行：
```bash
npm run dev
```

打开根目录下的index.html，查看效果：
<div style="background: skyblue;color:grey;font-size:20px">HELLO WEBPACK!——使用配置文件——使用第三方库jQuery</div>

## 5. webpack-dev-server模块

修改代码后，手动运行`npm run dev`会很繁琐。我们可以使用webpack-dev-server，让代码发生变化后自动编译。<br>
关于webpack-dev-server模块的功能，以下引用了github页面的原文描述：
>Use webpack with a development server that provides live reloading. This should be used for development only.<br>

让webpack提供具有实时重载功能的开发服务器。 这应该仅用于开发模式(mode: 'development')。

### 5.1 安装和使用
+ 1) 安装此模块
```bash
npm install webpack-dev-server --save-dev
```
+ 2) 在package.json文件中定义脚本命令`"start"`：
```json
  "scripts": {
    "test01": "webpack --mode=development 01/app.js",
    "test02": "webpack --mode=development 02/app.js",
    "dev": "webpack",
    "start": "webpack-dev-server --output-filename ./dist/main.js"
  }
```
+ 3) 在exercise webpack文件夹下打开CMD，运行：
  ```bash
  npm run start
  ```
我们会看到提示：`Project is running at http://localhost:8080/`。<br>

在浏览器中打开此地址，我们会看到和3中同样的内容：<br>
<div style="background: skyblue;color:grey;font-size:20px">HELLO WEBPACK!——使用配置文件——使用第三方库jQuery</div>
现在，我们修改js或者css文件后，webpack-dev-server模块会自动打包文件，因此我们在浏览器就能查看最新的页面。<br>
**<font color="red">注意：</font>**<br>
   1. `"start"`命令中，`webpack-dev-server`后面添加参数`--output-filename ./dist/main.js`的原因：<br>
   `webpack`会自动使用`webpack.config.js`中的`output.filename: "main.js"`，然后在本地文件夹`dist`下生成打包文件`main.js`。<br>
   但是`webpack-dev-server`不会，它生成的文件在内存中，并且我们可以通过`http://localhost:8080/`访问。<br>
   所以添加参数`--output-filename ./dist/main.js`之后，打包文件的路径将是：`http://localhost:8080/dist/main.js`。
   否则将会是：`http://localhost:8080/main.js`。<br>
   <br>
   2. `index.html`中，导入`main.js`的`script`标签如下：
   ```html
   <script src="dist/main.js"></script>
   ```
   我们访问index.html时，会向下面的URL发送GET请求，获取上述打包文件`main.js`：
   ```
   Request URL: http://localhost:8080/dist/main.js
   Request Method: GET
   ```

### 5.2 devServer

devServer选项影响webpack-dev-server的行为。<br>
在前面的例子中，我们在package.json文件中定义了脚本命令`"start"`，并把参数写在了命令`webpack-dev-server`后面：
```json
"scripts": {
  "start": "webpack-dev-server --output-filename ./dist/main.js"
}
```
但是在实际项目中`webpack-dev-server`会需要更多的配置参数，因此我们修改此命令，使用配置文件：
```json
"scripts": {
  "start": "webpack-dev-server --config webpack.config.js"
}
```
**<font color="red">然后最重要的一点是</font>**，我们要在`webpack.config.js`文件中新增`devServer.publicPath`属性：
```js
devServer: {
  // 打包的文件能通过http://localhost:8080/dist/{output.filename}访问
  publicPath: '/dist/'
}
```

下面是devServer中常用的几个属性：
+ **1) devServer.publicPath**<br>
指定能够访问打包文件的路径名，在下例中的配置可以让我们通过`http://localhost:8080/dist/main.js`访问打包后的js文件：
```js
devServer: {
    // 打包的文件能通过http://localhost:8080/dist/{output.filename}访问
    publicPath: '/dist/'
}
```

+ 2) devServer.port<br>
指定要监听请求的端口号。
  ```js
  devServer: {
    port: 8080
  }
  ```
+ 3) devServer.before<br>
用于指定在其他中间件前执行的自定义中间件，引用官网的描述：
>Provides the ability to execute custom middleware prior to all other middleware internally within the server. This could be used to define custom handlers, for example:
>```js
>devServer: {
>  before(app){
>    app.get('/some/path', function(req, res) {
>      res.json({ custom: 'response' });
>    });
>  }
>}
>```

## 6. 插件(plugins)

以下内容来自于[webpack.docschina.org](https://webpack.docschina.org/concepts/plugins/)。<br>
插件是 webpack 的支柱功能。它的目的在于解决 loader 无法实现的其他事。<br>
webpack 插件是一个具有 apply 方法的 JavaScript 对象。apply 属性会被 webpack compiler 调用，并且 compiler 对象可在整个编译生命周期访问。

### 6.1 插件的使用和配置

以下内容来自于[webpack.docschina.org](https://webpack.docschina.org/concepts/plugins/)。<br>
由于插件可以携带参数/选项，你必须在 webpack 配置中，向 plugins 属性传入 new 实例。<br>
根据你的 webpack 用法，这里有多种方式使用插件。
+ 1) 配置<br>
**webpack.config.js**
  ```js
  const HtmlWebpackPlugin = require('html-webpack-plugin'); //通过 npm 安装
  const webpack = require('webpack'); //访问内置的插件
  const path = require('path');

  module.exports = {
    entry: './path/to/my/entry/file.js',
    output: {
      filename: 'my-first-webpack.bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({template: './src/index.html'})
    ]
  };
  ```
+ 2) Node API<br>
**some-node-script.js**
  ```js
  const webpack = require('webpack'); //访问 webpack 运行时(runtime)
  const configuration = require('./webpack.config.js');

  let compiler = webpack(configuration);
  compiler.apply(new webpack.ProgressPlugin());

  compiler.run(function(err, stats) {
    // ...
  });
```

### 6.2 插件html-webpack-plugin

在前面的例子中，我们使用了`webpack-dev-server`模块，并在`index.html`中通过`script`标签手动引入打包后的js文件。<br>
```html
<script src="dist/main.js"></script>
```
我们可以使用`html-webpack-plugin`插件，自动完成上述工作，并以指定的html文件为模板生成一个html文件。
在这之前，我们先注销根目录下`index.html`中引入`main.js`文件的`script`标签。

+ 1) 安装`webpack-dev-server`：
```bash
npm install --save-dev html-webpack-plugin
```
+ 2) 修改`webpack.config.js`：<br>
新增插件：
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 插件
plugins: [
  // 以根目录下的index.html为模板
  new HtmlWebpackPlugin({template: 'index.html', filename: 'index.html'})
]
```
删除devServer.publicPath的配置：
```js
devServer: {
    // 打包的文件能通过http://localhost:8080/dist/{output.filename}访问
    // publicPath: '/dist/'
}
```
**注意：**如果不删除此配置，`html-webpack-plugin`生成的`index.html`的路径将会为：`http://localhost:8080/dist/index.html`。<br>
而我们的目的是想在根目录下生成`index.html`，这样我们访问`http://localhost:8080/`时，会自动打开此`index.html`。<br>

最后我们运行`npm run start`，并在浏览器中打开`http://localhost:8080/`，就能看到内容了。<br>
用浏览器查看此网页的代码如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>index</title>
    <!--<script src="dist/main.js"></script>-->
</head>
<body>
<script type="text/javascript" src="main.js"></script></body>
</html>
```
我们可以看到`body`标签中多了一个引入`main.js`文件的`script`标签。


## 7. webpack中使用babel
官网[www.babeljs.cn](https://www.babeljs.cn/)中是这样描述babel的：<br>
>Babel是一个JavaScript编译器。它通过语法转换器支持最新版本的JavaScript。这些插件允许你立刻使用新语法，无需等待浏览器支持。<br>

### 7.1 为何要使用babel
在本篇的例子中，除了let和const的使用，没有使用**ES6**的其他语法。因此，我们用IE11浏览器能正常访问`http://localhost:8080/`。<br>
**注：**IE11支持一小部分ES6，如let和const的；IE10几乎不支持ES6。<br>
如果我们在js文件中使用更多的ES6语法，我们将无法用IE11浏览器访问`http://localhost:8080/`。<br>
app.js文件：
```js
import show from './01';// 引入01.js(ES6)
import '../css/style.css';// 引入style.css样式文件(ES6)
import $ from 'jquery';// 引入第三方库jQuery(ES6)

let str = show("Hello webpack!——使用配置文件");
document.write('<div>' + str + '</div>');
let div = $("div");
div.html( div.html() + "——使用第三方库jQuery").css({'font-size': '20px'});
```
01.js文件：
```js
import upper from './02';// 引入02.js(ES6)

export default function (str) {
    return upper(str);
}
```
02.js文件：
```js
// 箭头函数(ES6)
let show = (str) => {
    return str.toUpperCase();
};
export default show;
```
但是使用已经支持ES6的浏览器，如最新版本的chrome、firefox等等，是能够正常访问的。为了兼容未支持ES6的浏览器，我们可以使用babel把ES6语法转换成ES5。<br>

### 7.2 安装和使用babel
关于如何在webpack中使用babel，参考了官网[www.babeljs.cn](https://www.babeljs.cn/docs/setup/#installation)中的步骤。
+ 1) 安装
```bash
npm install babel-loader babel-core --save-dev
```
+ 2) 修改webpack.config.js文件
  ```js
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,// 排除特定条件
        use: ['babel-loader']// [{loader: 'label-loader'}]的简写
      }       
    ]
  }
  ```
+ 3) 安装babel-preset-env，根据目标浏览器或运行时环境，自动决定适合的Babel插件和polyfills，从而将ES2015+编译为ES5。
```bash
npm install babel-preset-env --save-dev
```
+ 4) 创建.babelrc文件：
```json
{
  "presets": ["env"]
}
```

完成babel的安装和配置后，运行`npm run start`，之后就可以用IE11浏览器正常访问`http://localhost:8080`了。但IE8无法正常访问，因为IE8不支持ES5。


## 8. webpack模块
>在模块化编程中，开发者将程序分解成离散功能块(discrete chunks of functionality)，并称之为模块。

### 8.1 什么是 webpack 模块
此节引用自[webpack.docschina.org](https://webpack.docschina.org/concepts/modules/)。
>对比 Node.js 模块，webpack 模块能够以各种方式表达它们的依赖关系，几个例子如下：
>+ ES2015 import 语句
>+ CommonJS require() 语句
>+ AMD define 和 require 语句
>+ css/sass/less 文件中的 @import 语句。
>+ 样式(url(...))或 HTML 文件(&lt;img src=...&gt;)中的图片链接(image url)
>
>**tips：**webpack 1 需要特定的 loader 来转换 ES 2015 import，然而通过 webpack 2 可以开箱即用。

### 8.2 模块解析
此节引用自[webpack.docschina.org](https://webpack.docschina.org/concepts/module-resolution/)。
>resolver 是一个库(library)，用于帮助找到模块的绝对路径。一个模块可以作为另一个模块的依赖模块，然后被后者引用，如下：
>```js
>import foo from 'path/to/module'
>// 或者
>require('path/to/module')
>```
>所依赖的模块可以是来自应用程序代码或第三方的库(library)。resolver 帮助 webpack 找到 bundle 中需要引入的模块代码，这些代码在包含在每个 require/import 语句中。 当打包模块时，webpack 使用 enhanced-resolve 来解析文件路径。<br>
>使用 enhanced-resolve，webpack 能够解析三种文件路径：
>+ 绝对路径
>```js
>import "/home/me/file";// '/'表示根目录
>import "C:\\Users\\me\\file";
>```
>+ 相对路径
>```js
>import "../src/file1";// '../'表示当前文件夹的上一级文件夹
>import "./file2";// './'表示当前文件夹
>```
>+ 模块路径
>```js
>import "module";
>import "module/lib/file";
>```
>模块将在 resolve.modules 中指定的所有目录内搜索。 你可以替换初始模块路径，此替换路径通过使用 resolve.alias 配置选项来创建一个别名。