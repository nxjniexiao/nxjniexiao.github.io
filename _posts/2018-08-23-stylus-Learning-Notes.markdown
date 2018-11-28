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
|   ├── styl
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

## 3. Stylus语法

此节代码和内容来自于官网[http://stylus-lang.com](http://stylus-lang.com/)。

## 3.1 选择器 selectors

### 3.1.1 缩进 Indentation

Stylus采用缩进式语法，可以省略`{`、`}`、`;`和`:`。
```
body
  color white
```
或者选择保留`:`：
```
body
  color: white
```
编译后：
```css
body {
  color: #fff;
}
```

### 3.1.2 规则集 Rule Sets

和css一样，可以使用`,`为多个选择器定义属性：
```
textarea, input
  border 1px solid #eee
```
也可以换行：
```
textarea
input
  border 1px solid #eee
```
编译后：
```css
textarea,
input {
  border: 1px solid #eee;
}
```

### 3.1.3 引用父选择器 Parent Reference

可以使用`&`引用父选择器：
```
textarea
input
  color #A7A7A7
  &:hover
    color #000
```
编译后：
```css
textarea,
input {
  color: #a7a7a7;
}
textarea:hover,
input:hover {
  color: #000;
}
```
在下面的例子中，在mixin中使用`&`给IE浏览器设置2px的border：
```
box-shadow()
  -webkit-box-shadow arguments
  -moz-box-shadow arguments
  box-shadow arguments
  html.ie8 &,
  html.ie7 &,
  html.ie6 &
    border 2px solid arguments[length(arguments) - 1]
body
  #login
    box-shadow 1px 1px 3px #eee
```
**注：**`&`指向 `body #login`，`html.ie8`等会拼接在`body`前面。<br>
编译后：
```css
body #login {
  -webkit-box-shadow: 1px 1px 3px #eee;
  -moz-box-shadow: 1px 1px 3px #eee;
  box-shadow: 1px 1px 3px #eee;
}
html.ie8 body #login,
html.ie7 body #login,
html.ie6 body #login {
  border: 2px solid #eee;
}
```

### 3.1.4 部分引用 Partial Reference

`^[N]`表示部分引用，其中N是数字(-1, 0, 1等等)。<br>
`^[0]`引用嵌套选择器中的第一层，`^[1]`则引用**<font color="red">第一层和第二层</font>**。
```
.foo
  &__bar
    width: 10px

    ^[0]:hover &
      width: 20px
```
注：第一层和第二层是一个完整的选择器`.foo__bar`，但`^[0]`部分引用第一层，即`.foo`。<br>
编译后：
```css
.foo__bar {
  width: 10px;
}
.foo:hover .foo__bar {
  width: 20px;
}
```
**<font color="red">若N为负数</font>**，则从尾部计算。如`^[-1]`表示去除最后一层后剩下部分的引用。
```
.foo
  &__bar
    &_baz
      width: 10px

      ^[-1]:hover &
        width: 20px
```
编译后：
```css
.foo__bar_baz {
  width: 10px;
}
.foo__bar:hover .foo__bar_baz {
  width: 20px;
}
```

### 3.1.5 带范围的部分引用 Ranges in partial references

`^[N..M]`：其中一个数字是起始索引，另一个是结束索引。由于选择器是从第一层渲染至最后一层，所以N和M的顺序不影响结果。
```
.foo
  & .bar
    & .baz
      width: 10px

      ^[0]:hover ^[2..1]
        width: 20px
```
编译后：
```css
.foo .bar .baz {
  width: 10px;
}
.foo:hover .bar .baz {
  width: 20px;
}
```

### 3.1.6 初始引用 Initial Reference

`~/`代表第一层，等价于`^[0]`，缺点是只能在选择器的首部使用。
```
.block
  &__element
    ~/:hover &
      color: red
```
编译后：
```css
.block:hover .block__element {
  color: #f00;
}
```

### 3.1.7 相对引用 Relative Reference

`../`表示相对引用，它只能在选择器首部使用。`../../`表示更深一层。
```
.foo
  .bar
    .baz
      width: 10px

      &,
      ../../ .foobar
        height: 10px
```
编译后：
```css
.foo .bar .baz {
  width: 10px;
}
.foo .bar .baz,
.foo .foobar {
  height: 10px;
}
```

### 3.1.8 根引用 Root Reference
`/`适用于给不在当前范围中的选择器设置样式，如下面例子中的`.is-hovered`。
```
textarea
input
  color #A7A7A7
  &:hover,
  /.is-hovered
    color #000
```
编译后：
```css
textarea,
input {
  color: #a7a7a7;
}
textarea:hover,
input:hover,
.is-hovered {
  color: #000;
}
```

### 3.1.9 歧义 Disambiguation
例如表达式`margin - n`可以被解析为减法运算，或具有一元减号的属性。为了消除歧义，可以在表达式外使用一对括号。
```
pad(n)
  margin (- n)

body
  pad(5px)
```
编译后：
```css
body {
  margin: -5px;
}
```

## 3.2 变量 variables

我们可以在在stylus中使用变量：
```
 font-size = 14px

 body
   font font-size Arial, sans-serif
```
编译后：
```css
 body {
   font: 14px Arial, sans-serif;
 }
```
变量也可以包含表达式列表：
```
font-size = 14px
font = font-size "Lucida Grande", Arial

body
  font font, sans-serif
```
编译后：
```css
body {
  font: 14px "Lucida Grande", Arial, sans-serif;
}
```
此外，标识符(变量、函数等)可以在前面加`$`：
```
$font-size = 14px
body {
  font: $font-size sans-serif;
}
```

### 3.2.1 属性查询 Property Lookup

我们可以选择不单独给变量赋值，而是直接在属性中赋值，如下例中的`width: w = 150px`和`height: h = 80px`：
```
#logo
  position: absolute
  top: 50%
  left: 50%
  width: w = 150px
  height: h = 80px
  margin-left: -(w / 2)
  margin-top: -(h / 2)
```
注意先后顺序，`w`和`h`要先赋值，才能在后面使用。<br>
或者干脆不使用变量名称`w`和`h`，改用`@width`和`@height`获取宽度和高度:
```
#logo
  position: absolute
  top: 50%
  left: 50%
  width: 150px
  height: 80px
  margin-left: -(@width / 2)
  margin-top: -(@height / 2)
```
此特性的另一个用途是可以在mixins中，根据其他存在的属性来定义属性。下例中，如果不存在z-index，则设置`z-index: 1`：
```
 position()
    position: arguments
    z-index: 1 unless @z-index

  #logo1
    z-index: 20
    position: absolute

  #logo2
    position: absolute
```
编译后：
```css
#logo1 {
  z-index: 20;
  position: absolute;
}
#logo2 {
  position: absolute;
  z-index: 1;
}
```
属性查找，如`@color`，会逐层向上冒泡，直到找到`color`为止。如果找不到，则返回null。

## 3.3 插值 interpolation

此插值特性类似于ES6的模板字符串，让我们可以使用`{}`包裹表达式，把它们嵌入到标识符和选择器中。

### 3.3.1 标识符插值 Identifier Interpolation

例如`-webkit-{'border' + '-radius'}`等价于`-webkit-border-radius`。下面的例子中使用了浏览器前缀(vendor prefixes)来扩展属性。
```
vendor(prop, args)
  -webkit-{prop} args
  -moz-{prop} args
  {prop} args
border-radius()
  vendor('border-radius', arguments)

box-shadow()
  vendor('box-shadow', arguments)
button
  border-radius 1px 2px / 3px 4px
```
编译后：
```css
button {
  -webkit-border-radius: 1px 2px / 3px 4px;
  -moz-border-radius: 1px 2px / 3px 4px;
  border-radius: 1px 2px / 3px 4px;
}
```

### 3.3.1 选择器插值 Selector Interpolation

插值同样适用于选择器。下面例子中，我们迭代给表格前5行设置不同的高度：
```
table
  for row in 1 2 3 4 5
    tr:nth-child({row})
      height: 10px * row
```
编译后：
```css
table tr:nth-child(1) {
  height: 10px;
}
table tr:nth-child(2) {
  height: 20px;
}
table tr:nth-child(3) {
  height: 30px;
}
table tr:nth-child(4) {
  height: 40px;
}
table tr:nth-child(5) {
  height: 50px;
}
```
我们还可以通过创建一个字符串变量，并把其放入`{}`中来实现把多个选择器放一起：
```
mySelectors = '#foo,#bar,.baz'

{mySelectors}
  background: #000
```
编译后：
```css
#foo,
#bar,
.baz {
  background: #000;
}
```

## 3.4 运算符 Operators

### 3.4.1 运算符优先级 Operator Precedence

运算符的优先级由高到低如下：
```
 .
 []
 ! ~ + -
 is defined
 ** * / %
 + -
 ... ..
 <= >= < >
 in
 == is != is not isnt
 is a
 && and || or
 ?:
 = := ?= += -= *= /= %=
 not
 if unless
```

### 3.4.2 一元运算符 Unary Operators

有效的一目运算符有：`!`, `not`, `-`, `+`, 和 `~`。
```
!0
// => true

!!0
// => false

!1
// => false

!!5px
// => true

-5px
// => -5px

--5px
// => 5px

not true
// => false

not not true
// => true
```
一元运算符中`not`的优先级最低。
```
a = 0
b = 1

!a and !b
// => false
// parsed as: (!a) and (!b)
```
```
not a or b
// => false
// parsed as: not (a or b)
```

### 3.4.3 下标 []
下标能够让我们通过索引拿到表达式中的值。下标为负数时，从尾至首取值。
  ```
   list = 1 2 3
   list[0]
   // => 1

   list[-1]
   // => 3
  ```
带括号的表达式可以充当元组(例如(15px 5px)，(1 2 3))。

### 3.4.4 范围 Range .. ...

`N..M`包括N和M，`N...M`包括N，但是不包括M。
```
1..5
 // => 1 2 3 4 5

 1...5
 // => 1 2 3 4

 5..1
 // => 5 4 3 2 1
```

### 3.4.5 加减法 Additive: + -
做加减法运算时，既可以在同类型单位之间转换，如`ms`和`s`，又可以在不同类型单位之间转换，如`5s - 2px`得到`3s`。
```
15px - 5px
// => 10px

5 - 2
// => 3

5in - 50mm
// => 3.031in

5s - 1000ms
// => 4s

20mm + 4in
// => 121.6mm

"foo " + "bar"
// => "foo bar"

"num " + 15
// => "num 15"
```

### 3.4.6 乘除法和求余 Multiplicative: / * %

在属性值中使用`/`时请使用括号，因为css中`/`后面的值为行高`line-height`。<br>
+ `font: 14px/1.5;`：字体大小14px，行高为字体的1.5倍；
+ `font: (14px/1.5);`：字体大小(14÷1.5)px。

```
2000ms + (1s * 2)
// => 4000ms

5s / 2
// => 2.5s

4 % 2
// => 0
```

### 3.4.7 指数 Exponent: **

```
2 ** 8
// => 256
```

### 3.4.8 相等和关系运算符 Equality & Relational: == != >= <= > <

相等运算符可以用来比较单位、颜色、字符串，甚至标识符。<br>
`0 == false` 和 `null == false` 返回 `false`.
```
5 == 5
// => true

10 > 5
// => true

#fff == #fff
// => true

true == false
// => false

wahoo == yay
// => false

wahoo == wahoo
// => true

"test" == "test"
// => true

true is true
// => true

'hey' is not 'bye'
// => true

'hey' isnt 'bye'
// => true

(foo bar) == (foo bar)
// => true

(1 2 3) == (1 2 3)
// => true

(1 2 3) == (1 1 3)
// => false
```
别名：
```
==    is
!=    is not
!=    isnt
```

### 3.4.9 真、假 Truthfulness
true: `0%`、 `0px`、 `1px`、 `-1`、 `-1px`、 `hey`、 `'hey'`、 `(0 0 0)`、 `('' '')`。<br>

false: `0`、 `null`、 `false`、 `''`。

### 3.4.10 逻辑运算符 Logical Operators: && || and or

`&&`、`||`分别是`and`、`or`的别名。
```
5 && 3
// => 3

0 || 5
// => 5

0 && 5
// => 0

#fff is a 'rgba' and 15 is a 'unit'
// => true
```

### 3.4.11 存在运算符 Existence Operator: in

判断`in`左边的对象是否存在于`in`右边的表达式中。
```
nums = 1 2 3
1 in nums
// => true

5 in nums
// => false
```
适用于未定义的标识符：
```
words = foo bar baz
bar in words
// => true
HEY in words
// => false
```
适用于元组(tuples)：
```
vals = (error 'one') (error 'two')
error in vals
// => false

(error 'one') in vals
// => true
(error 'two') in vals
// => true
(error 'something') in vals
// => false
```
混合(mixin)中使用`in`：
```
pad(types = padding, n = 5px)
  if padding in types
    padding n
  if margin in types
    margin n
body
  pad()
body
  pad(margin)
body
  pad(padding margin, 10px)
```
编译后：
```css
body {
  padding: 5px;
}
body {
  margin: 5px;
}
body {
  padding: 10px;
  margin: 10px;
}
```

### 3.4.12 条件赋值 Conditional Assignment: ?= :=

`?=`和`:=`：如果一个变量未被赋值，则赋值；如果变量已经有值了，则不赋值。
```
color := white
color ?= white
color = color is defined ? color : white
```
下例中，color不会被赋予值`black`，因为color已经被赋值`white`了。
```
color = white
color ?= black

color
// => white
```

### 3.4.13 实例判断 Instance Check: is a

Stylus中能够使用`is a`来进行类型判断。
```
15 is a 'unit'
// => true

#fff is a 'rgba'
// => true

15 is a 'rgba'
// => false
```
或者采用内置函数type()
```
type(#fff) == 'rgba'
// => true  
```

### 3.4.14 变量声明 Variable Definition: is defined

`is defined`用来判断一个变量是否已经被赋值。
```
foo is defined
// => false

foo = 15px
foo is defined
// => true

#fff is defined
// => 'invalid "is defined" check on non-variable #fff'
```
或者采用内置函数`lookup(name)`：
```
name = 'blue'
lookup('light-' + name)
// => null

light-blue = #80e2e9
lookup('light-' + name)
// => #80e2e9
```
`is defined`很重要。如下例中，由于未声明的标识符会返回true，即使`ohnoes`未声明，`body`仍会被添加属性：`padding: 5px;`。
```
body
  if ohnoes
    padding 5px
```
使用`is defined`更合理：
```
body
  if ohnoes is defined
    padding 5px
```

### 3.4.15 三元运算符 Ternary

```
num = 15
num ? unit(num, 'px') : 20px
// => 15px
```

### 3.4.16 转型 Casting

`(expr) unit`和内置函数`unit()`一样，可以用来添加后缀。
```
body
  n = 5
  foo: (n)em
  foo: (n)%
  foo: (n + 5)%
  foo: (n * 5)px
  foo: unit(n + 5, '%')
  foo: unit(5 + 180 / 2, deg)
```

### 3.4.17 格式化 Sprintf

使用字符串格式化操作符`%`可以生成字面值，它在内部使用内置函数`s()`来转换参数：
```
'X::Microsoft::Crap(%s)' % #fc0
// => X::Microsoft::Crap(#fc0)
```
多个值的情况要使用括号：
```
'-webkit-gradient(%s, %s, %s)' % (linear (0 0) (0 100%))
// => -webkit-gradient(linear, 0 0, 0 100%)
```

## 3.5 混合 Mixins
混合(mixins)和函数以相同的方式定义，但以不同的方式使用。<br>
例如下面所示的函数`border-radius(n)`，它也可以被当作混合(mixins)调用：
```
border-radius(n)
  -webkit-border-radius n
  -moz-border-radius n
  border-radius n
```
+ 当作函数使用：
  ```
  form input[type=button]
    border-radius(5px)
  ```
编译后：
  ```css
  form input[type=button] {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }
  ```
+ 当作混合(mixins)使用，我们能省略括号，提供出色的、透明的浏览器属性支持。
  ```
  form input[type=button]
    border-radius 5px
  ```
**注意：**作为混合(mixins)的border-radius被视为属性，而不是函数的调用。

我们可以利用局部变量`arguments`来传递更多的参数：
```
border-radius()
  -webkit-border-radius arguments
  -moz-border-radius arguments
  border-radius arguments
```
这样我们就可以这样使用此混合(mixins)了：`border-radius 1px 2px / 3px 4px`。<br>
此特性还可以给指定的浏览器提供透明的支持，如IE中的`opacity`属性：
```
support-for-ie ?= true
opacity(n)
  opacity n
  if support-for-ie
    filter unquote('progid:DXImageTransform.Microsoft.Alpha(Opacity=' + round(n * 100) + ')')
#logo
  &:hover
    opacity 0.5
```
编译后：
```css
#logo:hover {
  opacity: 0.5;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);
}
```

### 3.5.1 引用父选择器 Parent References

混合(mixins)可以使用父引用符`&`，作用于父级而不是进一步的嵌套。<br>
下面的例子创建了一个混合(mixins)`stripe(even, odd)`来给表格中的行设置`background-color`，其中`even`和`odd`有默认值。<br>
在`tr`的嵌套中，先给所有行设置背景颜色`odd`，然后使用`&`引用`tr`，给偶数行设置颜色`even`：
```
stripe(even = #fff, odd = #eee)
  tr
    background-color odd
    &.even
    &:nth-child(even)
      background-color even
```
然后我们可以使用此混合(mixins)：
```
table
  stripe()
  td
    padding 4px 10px
table#users
  stripe(#303030, #494848)
  td
    color white
```
或者，我们也可以在`stripe(even, odd)`中取消`&`的使用：
```
stripe(even = #fff, odd = #eee)
  tr
    background-color odd
  tr.even
  tr:nth-child(even)
    background-color even
```
我们可以把`stripe`当成属性一样来调用：`stripe #fff #000`。

### 3.5.2 块混合 Block mixins

我们使用`+`前缀可以给混合(mixins)传递块(blocks):
```
foo()
  .bar
    {block}

+foo()
  width: 10px
```
编译后：
```css
.bar {
   width: 10px;
 }
```
被传入的块(blocks)在混合(mixins)内将作为`block`变量使用。此功能以后会加强。

### 3.5.3 混合内使用混合 Mixing Mixins in Mixins

混合(mixins)可以调用其他混合(mixins)。<br>
下例创建了一个行内的list(由inline-list完成)，并使用逗号分隔(由comma-list完成)。
```
inline-list()
  li
    display inline
comma-list()
  inline-list()
  li
    &:after
      content ', '
    &:last-child:after
      content ''
ul
  comma-list()
```
编译后：
```css
ul li:after {
  content: ", ";
}
ul li:last-child:after {
  content: "";
}
ul li {
  display: inline;
}
```

## 3.6 函数 Functions

函数定义与mixins相同，但是函数可能返回一个值。

### 3.6.1 返回值 Return Values

创建一个求和的函数：
```
add(a, b)
  a + b
```
然后我们可以在属性值中使用：
```
body 
  padding add(10px, 5)
```
编译后：
```css
body {
  padding: 15px;
}
```

### 3.6.2 参数默认值 Argument Defaults

可选参数可以默认是一个表达式，在Stylus中它还可以默认是一个其他早期参数。
```
add(a, b = a)
  a + b
add(10, 5)
// => 15

add(10)
// => 20
```
**由于给参数设置默认值是赋值，我们也可以在设置默认值使用函数：**
```
add(a, b = unit(a, px))
  a + b
```

### 3.6.3 命名参数 Named Parameters

函数能使用命名参数，这能让你不需要记住参数的顺序，或者简单地提升代码的阅读性。
```
subtract(a, b)
  a - b

subtract(b: 10, a: 25)
```

### 3.6.4 函数体 Function Bodies

在前面的`add()`函数中，我们使用内置函数`unit()`把每个参数的单位强制改成`px`。这样可以忽略单位自动转换，如`ms`和`s`之间的自动转换。
```
add(a, b = a)
  a = unit(a, px)
  b = unit(b, px)
  a + b

add(15%, 10deg)
// => 25
```

### 3.6.5 多个返回值 Multiple Return Values

就像我们可以给变量赋多个值一样，我们可以在函数中返回多个值：
```
sizes = 15px 10px

sizes[0]
// => 15px 
```
函数中返回多个值：
```
sizes()
  15px 10px

sizes()[0]
// => 15px
```

一个小例外是返回值是标识符。例如，以下内容看起来像是对Stylus的属性赋值（因为没有运算符）：
```
swap(a, b)
  b a
```
为消除歧义，我们可以用括号，或者使用return关键字：
```
swap(a, b)
  (b a)

swap(a, b)
  return b a
```

### 3.6.6 条件语句 Conditionals

假设我们想创建一个名为`stringish()`的函数来确定参数是否可以转换为字符串。我们检查`val`是字符串，还是`ident`（类似于字符串）。因为未定义的标识符将自己作为值，我们可以将它们与自己进行比较，如下所示（其中yes和no代替true和false）：
```
stringish(val)
  if val is a 'string' or val is a 'ident'
    yes
  else
    no
```
使用：
```
stringish('yay') == yes
// => true
  
stringish(yay) == yes
// => true
  
stringish(0) == no
// => true
```
**注意：**'yes'和'no'不是布尔值。此例中，它们只是未定义的标识符。<br>
另一个例子：
```
compare(a, b)
  if a > b
    higher
  else if a < b
    lower
  else
    equal
```
使用：
```
compare(5, 2)
// => higher

compare(1, 5)
// => lower

compare(10, 10)
// => equal
```

### 3.6.7 别名 Aliasing

要为函数设置别名，只需将函数名称赋值给新标识符即可。例如，我们的`add()`函数可以设置别名为`plus()`，如下所示：
```
plus = add

plus(1, 2)
// => 3
```

### 3.6.8 函数作为变量 Variable Functions

函数的参数可是其他函数。下例中，我们的`invoke()`函数接受一个函数，所以我们可以传递`add()`或`sub()`。
```
add(a, b)
  a + b

sub(a, b)
  a - b

invoke(a, b, fn)
  fn(a, b)

body
  padding invoke(5, 10, add)
  padding invoke(5, 10, sub)
```
编译后：
```css
body {
  padding: 15;
  padding: -5;
}
```

### 3.6.9 匿名函数 Anonymous functions

我们可以使用`@(){}`语法在需要时使用匿名函数。以下是如何使用它来创建自定义`sort()`函数：
```
sort(list, fn = null)
  // default sort function
  if fn == null
    fn = @(a, b) {
      a > b
    }

  // bubble sort
  for $i in 1..length(list) - 1
    for $j in 0..$i - 1
      if fn(list[$j], list[$i])
        $temp = list[$i]
        list[$i] = list[$j]
        list[$j] = $temp
  return list

  sort('e' 'c' 'f' 'a' 'b' 'd')
  // => 'a' 'b' 'c' 'd' 'e' 'f'

  sort(5 3 6 1 2 4, @(a, b){
    a < b
  })
  // => 6 5 4 3 2 1
```

### 3.6.10 参数 arguments

`arguments`可用于所有函数体，它包含传递进来的所有参数。

```
sum()
  n = 0
  for num in arguments
    n = n + num

sum(1,2,3,4,5)
// => 15
```

### 3.6.11 哈希的例子 Hash Example

下面我们定义了`get(hash，key)`函数，它返回`key`(或`null`)。我们遍历hash中的每一对，当第一个节点(`key`)匹配时返回该对的第二个节点。
```
get(hash, key)
  return pair[1] if pair[0] == key for pair in hash
```
使用：
```
hash = (one 1) (two 2) (three 3)

get(hash, two)
// => 2
get(hash, three)
// => 3
get(hash, something)
// => null
```