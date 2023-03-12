---
layout: post
title:  "高性能 JavaScript 要点总结"
date:   2018-11-22 09:13:12 +0800
categories: learning-notes
tags: WEB前端 JS
---


此笔记为《高性能 JavaScript 编程》一书的要点总结。

## 1. 加载和运行

大多数浏览器使用单进程处理 UI 更新和 JavaScript 运行等多个任务。当浏览器遇到一个 &lt;script&gt; 标签时，浏览器会停下来运行此 JavaScript 代码，然后再继续解析、翻译页面。

### 1.1 将脚本放在底部

将所有 &lt;script&gt; 标签放在尽可能接近 &lt;body&gt; 标签底部的位置，尽量减少对整个页面下载的影响。

### 1.2 将多个 JavaScript 文件整合成一个文件。

由于每个 &lt;script&gt; 标签下载时阻塞页面解析过程，所以限制页面的 &lt;script&gt; 总数也可以改善性能。

### 1.3 使用非阻塞脚本

非阻塞脚本的秘密在于，等页面完成加载之后，再加载 JavaScript 源码。<br>

+ 1) 动态脚本元素(跨浏览器)<br>
使用 JavaScript 动态创建 &lt;script&gt; 元素，例如：`<script type="text/javascript" src="file1.js"></script>`。
+ 2) 延期脚本 —— defer(部分浏览器支持)<br>
一个带有defer 属性的 &lt;script&gt; 标签可以放置在文档的任何位置。对应的 JavaScript 文件将在 &lt;script&gt; 被解析时启动下载，但代码不会被执行，直到DOM 加载完成（在onload 事件句柄被调用之前）。
+ 3) XHR 脚本注入(不能跨域)<br>
首先创建一个XHR 对象，然后下载 JavaScript 文件，接着用一个动态 &lt;script&gt; 元素将 JavaScript 代码注入页面。




推荐的向页面加载大量 JavaScript 的方法分为两个步骤：
+ 第一步，包含动态加载 JavaScript 所需的代码，代码量尽量小，可能只包含`loadScript()`函数；
+ 第二步，加载页面初始化所需的额外的 JavaScript 代码。

其中`loadScript()`函数如下：
```js
function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (script.readyState) { //IE
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}
```

非阻塞 JavaScript 加载库：
+ YUI 3
+ LazyLoad 库
+ LABjs 库

## 2. 数据访问

大多数情况下，对一个**字面量**和一个**局部变量**数据访问的性能差异是微不足道的。访问数组项和对象成员的代价要高一些，具体高多少，很大程度上依赖于浏览器。<br><br>
注：字面量(Literals)是常量，它分为:
+ 数组字面量: `[1,2,3]`
+ 布尔字面量: `false`
+ 浮点数字面量: `3.14`
+ 整数字面量: `9`
+ 对象字面量: `{name: 'nxj'}`
+ 正则表达式字面量: `/ab+c/`
+ 字符串字面量: `'foo'`

### 2.1 缓存储域外变量的值

一个标识符在作用域链中所处的位置越深，读写它的速度就越慢。<br>
**如果非局部变量在函数中的使用多于一次，可用局部变量存储它。**例如：
```js
var doc = document;// 全局变量 document 存储在局部变量 doc 中。
// 需要使用 document 时，用 doc 替代。
var bd = doc.body;
var links = doc.getElementsByTagName("a");
```
### 2.2 缓存对象成员的值

**对象成员**比**字面量**或**局部变量**访问速度慢，在某些浏览器上比访问数组项还要慢。要理解此中的原因，首先要理解 JavaScript 中对象的性质。

+ 原型: JavaScript 中的对象是基于原形的。一个对象通过一个内部属性 `[[prototype]]` 绑定到它的原形。
+ 原型链: 它是实现继承的主要方法。其基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法。

当代码读取某个对象的属性时，会沿着原型链向上查找，即：先搜索对象实例，如果没找到，则继续搜索指针指向的原型对象，直到原型链的末端。**深入原形链越深，搜索的速度就会越慢**。

此外，由于对象成员可能包含其它成员，例如不太常见的写法 `window.location.href` 这种模式。**成员嵌套越深，访问速度越慢**。

你可以**将常用对象成员的值存入一个局部变量**，消除多余的搜索过程。在处理嵌套对象成员时这点特别重要，它们会对运行速度产生难以置信的影响。

### 2.3 谨慎使用闭包

一般来讲，当函数执行完毕后，局部活动对象就会被销毁，内存中仅保存全局执行环境的变量对象。但是，闭包的情况又有所不同。<br><br>
当涉及闭包时，活动对象就无法销毁了，因为引用仍然存在于闭包的[[Scope]]属性中。这意味着脚本中的闭包与非闭包函数相比，需要更多内存开销。<br><br>
在脚本中最好是小心地使用闭包，内存和运行速度都值得被关注。但是，你可以通过以下方法减轻对运行速度的影响：<br>
**将常用的域外变量存入局部变量中，然后直接访问局部变量**。

### 2.4 避免使用 with 和 try-catch

+ with 表达式
  ```js
  with (document){ //avoid!
    var bd = body,
    links = getElementsByTagName("a")
  }
  ```
使用 with 表达式后，包含 document 的新对象被推入作用域链的前端，但是运行函数自身的活动对象将处于作用域链的第二个位置。访问代价会更高。
+ try-catch 表达式
  ```js
  try {
    methodThatMightCauseAnError();
  } catch (ex){
    alert(ex.message); //scope chain is augmented here
  }
  ```
和 with 表达式同理，在 catch 块中，包含异常对象的新对象将被推入作用域链的前端，函数的所有局部变量现在被放在作用域链的第二个对象中。<br><br>
你可以通过精缩代码的办法最小化 catch 子句对性能的影响。一个很好的模式是将错误交给一个专用函数来处理。例如：
  ```js
  try {
    methodThatMightCauseAnError();
  } catch (ex){
    handleError(ex); //delegate to handler method
  }
  ```
handleError() 函数是 catch 子句中运行的唯一代码。此函数以适当方法自由地处理错误，并接收由错误产生的异常对象。由于只有一条语句，没有局部变量访问，作用域链临时改变就不会影响代码的性能。

<!-- ### 2.7 总结

+ 字面量和局部变量访问速度非常快，数组项和对象成员需要更长时间。
+ 变量在作用域链中的位置越深，访问所需的时间就越长。访问局部变量速度最快，访问全局变量速度最慢。
+ 避免使用 with 和 try-catch 表达式，，因为它们改变了运行期上下文的作用域链。
+ 嵌套对象成员会造成重大性能影响，尽量少用。
+ 一个属性或方法在原形链中的位置越深，访问它的速度就越慢。
+ **将经常使用的对象成员，数组项，和域外变量存入局部变量中**。 -->

## 3. DOM 编程

文档对象模型(DOM, Document Object Model)是针对 XML 但经过扩展用于 HTML 的应用程序编程接口(API, Application Programming Interface)。DOM 把整个页面映射为一个多层节点结构。

### 3.1 减少访问和修改 DOM 元素的次数

+ 1) 减少访问和修改 DOM 元素的次数
  ```js
  function innerHTMLLoop() {
    for (var count = 0; count < 15000; count++) {
      document.getElementById('here').innerHTML += 'a';
    }
  }
  ```
一个更有效率的版本将使用局部变量存储更新后的内容，在循环结束时一次性写入：
  ```js
  function innerHTMLLoop2() {
    var content = '';
    for (var count = 0; count < 15000; count++) {
      content += 'a';
    }
    document.getElementById('here').innerHTML += content;
  }
  ```
+ 2) 访问集合元素时使用局部变量
```js
var nodeName = document.getElementsByTagName('div')[0].nodeName;
var nodeType = document.getElementsByTagName('div')[0].nodeType;
var tagName = document.getElementsByTagName('div')[0].tagName;
```
上述代码访问了三次全局的 `document`。我们可以用一个局部变量把 `document` 的值缓存起来：
```js
var divs = document.getElementsByTagName('div');
var nodeName = divs[0].nodeName;
var nodeType = divs[0].nodeType;
var tagName = divs[0].tagName;
```

### 3.2 减少重绘和重新排版次数

当浏览器下载完所有页面HTML 标记，JavaScript，CSS，图片之后，它解析文件并创建两个内部数据结构：
+ DOM 树：表示页面结构；
+ 渲染树：表示DOM 节点如何显示。

重排和重绘的区别：
+ 重排：当 DOM 改变影响到元素的几何属性(宽和高)，浏览器需要重新计算元素的几何属性，而且其他元素的几何属性和位置也会因此改变受到影响。浏览器使渲染树上受到影响的部分失效，然后重构渲染树。这个过程被称作重排版。
+ 重绘：不是所有的 DOM 改变都会影响几何属性。例如，改变一个元素的背景颜色不会影响它的宽度或高度。在这种情况下，只需要重绘(不需要重排)，因为元素的布局没有改变。

在下述情况中会发生重排版：
+ 添加或删除可见的DOM 元素；
+ 元素位置改变；
+ 元素尺寸改变（因为边距，填充，边框宽度，宽度，高度等属性改变）；
+ 内容改变，例如，文本改变或图片被另一个不同尺寸的所替代；
+ 最初的页面渲染；
+ 浏览器窗口改变尺寸。

因为计算量与每次重排版有关，大多数浏览器通过队列化修改和批量显示优化重排版过程。**获取布局信息的操作将导致刷新队列动作**：
+ offsetTop, offsetLeft, offsetWidth, offsetHeight
+ clientTop, clientLeft, clientWidth, clientHeight
+ scrollTop, scrollLeft, scrollWidth, scrollHeight
+ 非IE: getComputedStyle(elm, null), IE: elm.currentStyle

**最小化重绘和重排版**：

+ 1) 延迟访问布局信息，避免强制重排版:
  ```js
  var computed,
  tmp = '',
  bodystyle = document.body.style;
  if (document.body.currentStyle) { // IE, Opera
    computed = document.body.currentStyle;
  } else { // W3C
    computed = document.defaultView.getComputedStyle(document.body, '');
  }
  bodystyle.color = 'red';
  tmp = computed.backgroundColor;
  bodystyle.color = 'white';
  tmp = computed.backgroundImage;
  bodystyle.color = 'green';
  tmp = computed.backgroundAttachment;
```
如果将查询 computed 风格的代码搬到末尾后：
```js
bodystyle.color = 'red';
bodystyle.color = 'white';
bodystyle.color = 'green';
tmp = computed.backgroundColor;
tmp = computed.backgroundImage;
tmp = computed.backgroundAttachment;
```
+ 2) 尽可能将样式改变合并在一起执行，减少修改 DOM 的次数：
```js
var el = document.getElementById('mydiv');
el.style.borderLeft = '1px';
el.style.borderRight = '2px';
el.style.padding = '5px';
```
修改后：
```js
var el = document.getElementById('mydiv');
el.style.cssText = 'border-left: 1px; border-right: 2px; padding: 5px;';
```
+ 3) 批量修改 DOM
   1. 从文档流中摘除该元素；
   2. 对其应用多重改变；
   3. 将元素带回文档中。<br><br>

   有三种基本方法可以将 DOM 从文档中摘除：
   1. 隐藏元素，进行修改，然后再显示它；
   ```js
    var ul = document.getElementById('mylist');
    ul.style.display = 'none';// 隐藏元素
    appendDataToElement(ul, data);// ul 元素下追加 li 元素
    ul.style.display = 'block';// 显示元素
   ```
   2. 使用一个文档片断在已存 DOM 之外创建一个子树，然后将它拷贝到文档中；
   ```js
    var fragment = document.createDocumentFragment();// 创建一个新的空白的文档片段
    appendDataToElement(fragment, data);// 将新元素添加至文档片段
    document.getElementById('mylist').appendChild(fragment);// 把文档片段下的子元素插入 ul 元素中
   ```
   3. 将原始元素拷贝到一个脱离文档的节点中，修改副本，然后覆盖原始元素。
   ```js
    var old = document.getElementById('mylist');
    var clone = old.cloneNode(true);// 创建副本
    appendDataToElement(clone, data);// 修改副本
    old.parentNode.replaceChild(clone, old);// 用副本覆盖老节点
   ```

### 3.3 缓冲布局信息

例如，将一个元素从 100px 向右平移至 500px 处，每次移动 1px：
  ```js
  // 动画循环
  myElement.style.left = 1 + myElement.offsetLeft + 'px';
  if (myElement.offsetLeft >= 500) {
    stopAnimation();
  }
  ```
上面例子中，每次元素移动时，都要查询偏移量 `myElement.offsetLeft`，我们可以把此信息缓存起来，从而获得更好的性能：
  ```js
  var current = myElement.offsetLeft;// 缓冲布局信息
  // 动画循环
  current ++;
  myElement.style.left = current + 'px';
  if (current >= 500) {
    stopAnimation();
  }
  ```

### 3.4 将元素提出动画流

显示和隐藏部分页面构成展开/折叠动画是一种常见的交互模式。它通常包括区域扩大的几何动画，将页面其他部分推向下方。<br>
当动画进行时，将引发巨大的重排版动作，使用户感到动画卡顿。使用以下步骤可以避免对大部分页面进行重排版：
1. 页面顶部可以"折叠/展开"的元素称作"动画元素"，用**绝对坐标**对它进行定位，当它的尺寸改变时，就不会推移页面中其他元素的位置，而只是覆盖其他元素。
2. **展开动作只在"动画元素"上进行**。这时其他元素的坐标并没有改变，换句话说，其他元素并没有因为"动画元素"的扩大而随之下移，而是任由动画元素覆盖。
3. "动画元素"的动画结束时，**将其他元素的位置下移到动画元素下方**，界面"跳"了一下。

### 3.5 事件委托

事件委托利用了事件冒泡，只指定一个事件处理程序，就可以管理某一类型的所有事件。例如，我们把 &lt;ul&gt; 元素下所有 &lt;li&gt; 元素的点击事件委托给 &lt;ul&gt; 元素。

## 4. 算法和流程控制

### 4.1 改善循环性能

for，while，do-while 循环的性能特性相似，除非你要迭代遍历一个属性未知的对象，否则不要使用 for-in 循环。<br>

改善循环性能的最好办法是：
+ 减少每次迭代中的运算量，如用局部变量缓存局外变量等；
+ 减少循环迭代次数，如达夫设备(每次循环中最多可 8 次调用`process()`函数)。

### 4.2 递归算法改迭代算法

浏览器的调用栈尺寸限制了递归算法在 JavaScript 中的应用；栈溢出错误导致其他代码也不能正常执行。<br>

**归并排序**（英语：Merge sort，或mergesort），是创建在**归并操作**上的一种有效的排序算法，它既可以用递归实现，也可以用迭代实现。其中归并操作`merge`如下：
```js
// 合并两个排好序的数组
function merge(left, right) {
  var res = [];
  while (left.length && right.length) {
    if (left[0] < right[0]) {
      res.push(right.shift());// 移除数组中的第一项并返回该项
    } else {
      res.push(left.shift());// 移除数组中的第一项并返回该项
    }
  }
  // 合并两个数组中剩下的项(left 或者 right)，然后返回数组
  return res.concat(left).concat(right);
}
```
使用递归实现 `mergeSort`：
```js
// 递归
function mergeSort(items) {
  len = items.length;
  if (len === 1) {
    // 递归终止条件
    return items;
  }
  var middle = Math.floor(len / 2);
  var left = items.slice(0, middle);
  var right = items.slice(middle);
  return merge(mergeSort(left), mergeSort(right));
}
var res = mergeSort([5, 2, 3, 1, 6, 4]);
console.log(res);// [ 6, 5, 4, 3, 2, 1 ]
```
这个合并排序代码相当简单直接，但是 `mergeSort()` 函数被调用非常频繁。一个具有 n 个项的数组总共调用 `mergeSort()` 达 `2 * n - 1` 次。<br>

程序陷入**栈溢出错误**并不一定要修改整个算法；它只是意味着递归不是最好的实现方法。合并排序算法还可以用迭代实现，如下：
```js
// 迭代
function mergeSort(items) {
  var len = items.length;
  if (len === 1) {
    return items;
  }
  // 创建一个临时数组，把 items 中的每一项放在数组中，方便调用merge
  var temp = [];
  for (var i = 0; i < len; i++) {
    temp.push([items[i]]);// [1,2] => [[1],[2]]
  }
  // 迭代：第一项和第二项merge，第三项和第四项merge，以此类推
  temp.push([]);// 防止数组长度为奇数时，最后剩一个单独项无法merge
  for (var i = len; i > 1; i = i / 2) {
    // 数组成对merge, i: 5/6 => 2.5/3 => 1.25/1.5 => 0.625/0.75(结束循环)
    for (var j = 0, k = 0; k < i; j++ , k += 2) {
      temp[j] = merge(temp[k], temp[k + 1]);
    }
    temp[j] = [];// 防止数组中有用项(靠前部分)的总数为奇数时，错误地使用了紧随有用项后的无用项
  }
  return temp[0];
}
```
### 4.3 递归中使用制表技术

使用制表技术来重写 `factorial()` 函数，利用缓存保存并重用计算结果:
```js
function memFactorial(n) {
  // 建立一个缓存对象
  if (!memFactorial.cache) {
    memFactorial.cache = {
      '0': 1,
      '1': 1
    }
  }
  var cache = memFactorial.cache;
  // 检查缓存中是否已经存在相应的计算结果
  if (!cache.hasOwnProperty(n)) {
    // 不存在：计算结果，然后存入缓存
    cache[n] = n * memFactorial(n - 1);
  }
  return cache[n];
}
```
制表过程因每种递归函数而略有不同，但总体上具有相同的模式。为了使一个函数的制表过程更加容易，你可以定义一个 `memoize()` 函数封装基本功能。例如：
```js
function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}
function memoize(fundamental, cache) {
  cache = cache || {};
  var shell = function (arg) {
    if (!cache.hasOwnProperty(arg)) {
      cache[arg] = fundamental(arg);
    }
    return cache[arg];
  };
  return shell;
}
var memfactorial = memoize(factorial, { "0": 1, "1": 1 });
var fact6 = memfactorial(6);
var fact5 = memfactorial(5);
var fact4 = memfactorial(4);
```

### 4.4 优化条件表达式

1. 条件数量较大时，倾向于使用 switch 而不是 if-else。

2. 优化 if-else 的目标总是最小化找到正确分支之前所判断条件体的数量。最简单的优化方法是**将最常见的条件体放在首位**。<br>

3. 当有大量**离散值**需要测试时，if-else 和 switch 都比使用**查表法**要慢得多。<br>
注意：当使用查表法时，必须完全消除所有条件判断。操作转换成一个数组项查询或者一个对象成员查询。使用查表法的一个主要优点是：由于没有条件判断，当候选值数量增加时，很少，甚至没有增加额外的性能开销。<br>

4. **查表法**最常用于一个键和一个值形成逻辑映射的领域。**switch 表达式**更适合于每个键需要一个独特的动作，或者一系列动作的场合。

## 5. 响应接口

JavaScript 和用户界面更新在同一个进程内运行，同一时刻只有其中一个可以运行。这意味着当 JavaScript代码正在运行时，用户界面不能响应输入，反之亦然。有效地管理 UI 线程就是要确保 JavaScript 不能运行太长时间，以免影响用户体验。<br>

JavaScript 运行时间不应该超过 100 毫秒。过长的运行时间导致 UI 更新出现可察觉的延迟，从而对整体用户体验产生负面影响。

### 5.1 用定时器让出时间片

定时器可用于安排代码推迟执行，它使得你可以将长运行脚本分解成一系列较小的任务。

+ 1) 将典型的循环模式分解成一系列任务
  ```js
  for (var i=0, len=items.length; i < len; i++){
    process(items[i]);
  }
  ```
分解后如下：
  ```js
  function processArray(items, process, callback) {
    var todo = items.concat(); // 创建一个 items 副本
    setTimeout(function () {
      process(todo.shift());
      if (todo.length > 0) {
        setTimeout(arguments.callee, 25);
      } else {
        callback(items);
      }
    }, 25);
  }
  ```
其中 `arguments.callee` 为拥有这个 `arguments` 对象的函数，在本例中即为匿名函数。<br>

+ 2) 我们可以将一个长运行任务分解成一系列子任务
  ```js
  function multistep(steps, args, callback) {
    var tasks = steps.concat(); //创建一个 steps 数组的副本
    setTimeout(function () {
      // 执行下一个任务
      var task = tasks.shift();
      task.apply(null, args || []);
      // 判断是否还有更多的任务
      if (tasks.length > 0) {
        setTimeout(arguments.callee, 25);
      } else {
        callback();
      }
    }, 25);
  }
  ```

### 5.2 网页工人线程

网页工人线程 API 使代码运行而不占用浏览器 UI 线程的时间。要创建网页工人线程，你必须传入这个 JavaScript 文件的 URL:
```js
var worker = new Worker("code.js");
```
网页代码可使用 `onmessage` 事件句柄接收信息，并通过 `postMessage()` 方法向工人线程传递数据:
```js
worker.onmessage = function(event){
  alert(event.data);
};
worker.postMessage("Nicholas");
```
工人线程可使用 `onmessage` 事件句柄接收信息，并通过 `postMessage()` 方法将信息返回给页面:
```js
// code.js
self.onmessage = function (event) {
  self.postMessage("Hello, " + event.data + "!");
};
```

注：网页工人线程适合于那些纯数据的，或者与浏览器 UI 没关系的长运行脚本：
+ 编/解码一个大字符串；
+ 复杂数学运算（包括图像或视频处理）
+ 给一个大数组排序

## 6. Ajax 、异步 JavaScript 和 XML

本章考察从服务器收发数据最快的技术，以及最有效的数据编码格式。

### 6.1 请求和发送数据

在现代高性能 JavaScript 中使用的三种请求技术是 XHR、动态脚本标签插入和多部分的 XHR:

+ 1) XMLHttpRequest (XHR)
  ```js
  var url = '/data.php';
  var params = [
    'id=934875',
    'limit=20'
  ];
  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      var responseHeaders = req.getAllResponseHeaders(); // 获得请求头
      var data = req.responseText; // 获取数据
      // 处理数据
    }
  }
  req.open('GET', url + '?' + params.join('&'), true);
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // 设置请求头
  req.send(null); // 发送请求
  ```
+ 2) 动态脚本标签插入(可以跨域)<br>
该技术克服了 XHR 的最大限制：它可以从不同域的服务器上获取数据。<br>
  ```js
  var scriptElement = document.createElement('script');
  scriptElement.src = 'http://any-domain.com/javascript/lib.js';
  document.getElementsByTagName('head')[0].appendChild(scriptElement);
  ```
  相比于 XHR ，其缺点如下：
   + 不能通过请求发送信息头；
   + 参数只能通过 GET 方法传递，不能用 POST；
   + 不能设置请求的超时或重试；
   + 必须等待所有数据返回之后才可以访问它们；
   + 不能访问响应信息头或者像访问字符串那样访问整个响应报文；
   + **数据必须在一个回调函数之中被组装起来**。<br>
  注：最后一点非常重要。因为响应报文被用作脚本标签的源码，它必须是可执行的 JavaScript。你不能使用裸 XML，或者裸 JSON，任何数据，无论什么格式，必须在一个回调函数之组装起来。<br>
  ```js
  function jsonCallback(jsonString) {
    var data = ('(' + jsonString + ')');
    // 处理数据
  }
  ```
+ 3) 多部分的 XHR<br>
多部分XHR（MXHR）允许你只用一个 HTTP 请求就可以从服务器端获取多个资源。它通过将资源（可以是 CSS 文件，HTML 片段，JavaScript 代码，或 base64 编码的图片）打包成一
个由特定分隔符界定的大字符串，从服务器端发送到客户端。JavaScript 代码处理此长字符串，根据它的媒体类型和其他“信息头”解析出每个资源。

当数据只需发送给服务器时，有两种广泛应用的技术：XHR 和灯标。

+ 1) XHR<br>
虽然 XHR 主要用于从服务器获取数据，它也可以用来将数据发回。数据可以用 GET 或 POST 方式发回，以及任意数量的 HTTP 信息头。这给你很大灵活性。当你向服务器发回的数据量超过浏览器的最大 URL 长度时 XHR 特别有用。这种情况下，你可以用 POST 方式发回数据：
  ```js
  var url = '/data.php';
  var params = [
    'id=934875',
    'limit=20'
  ];
  var req = new XMLHttpRequest();
  req.onerror = function () {
    // 出错
  };
  req.onreadystatechange = function () {
    if (req.readyState == 4) {
      // 成功
    }
  };
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.setRequestHeader('Content-Length', params.length);
  req.send(params.join('&'));
  ```

+ 2) 灯标<br>
此技术与动态脚本标签插入非常类似。JavaScript 用于创建一个新的 Image 对象，将 src 设置为服务器上一个脚本文件的 URL。此 URL 包含我们打算通过 GET 格式传回的键值对数据。注意并没有创建 img 元素或者将它们插入到 DOM 中。
  ```js
  var url = '/status_tracker.php';
  var params = [
    'step=2',
    'time=1248027314'
  ];
  (new Image()).src = url + '?' + params.join('&');
  ```


### 6.2 数据格式

+ JSON 是轻量级的，解析迅速（作为本地代码而不是字符串），交互性与 XML 相当。
+ 字符分隔的自定义格式非常轻量，在大量数据集解析时速度最快，但需要编写额外的程序在服务器端构造格式，并在客户端解析。
+ 与其他格式相比，XML 极其冗长。每个离散的数据片断需要大量结构，所以有效数据的比例非常低。

## 7. 编程实践

+ 通过避免使用 `eval()` 和 `Function()` 构造器避免二次评估。此外，给 `setTimeout()` 和 `setInterval()` 传递函数参数而不是字符串参数。

+ 创建新对象和数组时使用对象直接量和数组直接量。它们比非直接量形式创建和初始化更快。
```js
var obj = {name: 'nie'};
var arr = [1, 2, 3];
```
+ 避免重复进行相同工作。当需要检测浏览器时，使用延迟加载或条件预加载。
```js
// 延迟加载
function addHandler(target, eventType, handler) {
  // 覆盖函数 addHandler
  if (target.addEventListener) { //DOM2 Events
    addHandler = function (target, eventType, handler) {
      target.addEventListener(eventType, handler, false);
    };
  } else { //IE
    addHandler = function (target, eventType, handler) {
      target.attachEvent("on" + eventType, handler);
    };
  }
  // 调用新函数
  addHandler(target, eventType, handler);
}
```
```js
// 条件预加载
var addHandler = document.body.addEventListener ?
  function (target, eventType, handler) {
    target.addEventListener(eventType, handler, false);
  } :
  function (target, eventType, handler) {
    target.attachEvent("on" + eventType, handler);
  };
```

+ 当执行数学运算时，考虑使用位操作，它直接在数字底层进行操作。

+ 原生方法总是比 JavaScript 写的东西要快。尽量使用原生方法。<br>
如多使用 `Math` 对象的方法，多使用原生的 `querySelector()` 和 `querySelectorAll()` 方法。