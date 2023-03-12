---
layout: post
title: "JS 数据双向绑定"
date: 2018-12-06 16:51:12 +0800
categories: learning-notes
tags: WEB前端 JS
---


最近在面试中被问到了数据的双向绑定是如何实现的。当时只记得学习 Vue.js 时，有一个 `v-model` 指令能够实现数据双向绑定，实现的原理涉及到了事件监听。所以没有给出一个好的答案。

## 1. Vue.js 中的数据双向绑定

### 1.1 v-model 指令

Vue 官网中是这样描述 `v-model` 的：

> 你可以用 `v-model` 指令在表单 `<input>`、`<textarea>` 及 `<select>` 元素上创建双向数据绑定。它会根据控件类型自动选取正确的方法来更新元素。尽管有些神奇，但 `v-model` 本质上不过是语法糖。它负责**监听用户的输入事件**以更新数据，并对一些极端场景进行一些特殊处理。

下例是使用 `v-model` 在 `<input>` 元素上创建双向绑定：

```html
<input v-model="message" placeholder="edit me" />
<p>Message is: { { message } }</p>
```

### 1.2 getter/setter

Vue 官网中介绍响应式原理时，有这样一句话：

> 当你把一个普通的 JavaScript 对象传给 Vue 实例的 data 选项，Vue 将遍历此对象所有的属性，并使用 `Object.defineProperty` 把这些属性全部转为 `getter/setter`。`Object.defineProperty` 是 ES5 中一个无法 shim 的特性，这也就是为什么 Vue 不支持 IE8 以及更低版本浏览器。

这涉及到了 ES5 中定义的两种属性：数据属性和访问器属性。




#### 1.2.1 数据属性

数据属性包含一个数据值的位置。它有 4 个描述其行为的特性：

- `Configurable`: 表示能够通过 `delete` 删除，以及能否被修改为**访问器属性**。默认为 `true`。
- `Enumerable`: 表示能够通过 `for-in` 循环返回。默认为 `true`。
- `Writable`: 表示能否修改属性的值。默认为 `true`。
- `Value`: 包含这个属性的数据值。默认为 `undefined`。读取属性值时，从这个位置读；写入属性的时候，把新值保存在这个位置。

要修改属性的默认特性，需要使用 `Object.defineProperty()`:

```js
var obj = {};
Object.defineProperty(obj, "name", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: "nie"
});
console.log(obj.name); // nie
```
**注意**：通过 `Object.defineProperty` 创建新属性时，如果不指定，前三个特性默认都是 `false`。

#### 1.2.2 访问器属性

访问器属性不包含数据值；它们包含一对 `getter` 和 `setter` 函数。
- 在读取访问器属性时，调用 `getter` ;
- 在写入访问器属性时，调用 `setter` ;

访问器属性也有 4 个特性：

- `Configurable`: 表示能够通过 `delete` 删除，以及能否被修改为**访问器属性**。默认为 `true`。
- `Enumerable`: 表示能够通过 `for-in` 循环返回。默认为 `true`。
- `Get`: 读取属性时调用的函数。默认为 `undefined`。
- `Set`: 写入属性时调用的函数。默认为 `undefined`。

访问器属性不能直接定义，需要使用 `Object.defineProperty()`:
```js
var obj = {
  _name: "nie"
};
Object.defineProperty(obj, "name", {
  get: function() {
    return this._name;
  },
  set: function(newName) {
    this._name = newName;
  }
});
console.log(obj.name);// nie
obj.name = "nxj";
console.log(obj.name);// nxj
```

### 1.3 简单实现双向绑定

下面的例子中，我们使用 `Object.defineProperty()` 定义访问器属性简单地实现了在 `<input>` 元素上进行数据双向绑定。<br>

1. 我们给 `<input>` 元素添加一个监听键盘按键松开的事件处理函数：当监听到键盘按键松开时，把 `<input>` 元素中的值赋值给 `data.inputValue`。<br>

2. 这将导致 `inputValue` 的 `Set` 函数被调用，在此函数中，我们把传入的新值赋值给 `<input>` 元素的`value`属性和 `<span>` 元素的`innerHTML`属性。

```html
<body>
  <input id="input1" /> 
  <div>输入框内容为：<span id="span1"></span></div>
  <script>
    var input = document.getElementById("input1");
    var span = document.getElementById("span1");
    var data = { _inputValue: "" };
    Object.defineProperty(data, "inputValue", {
      get: function() {
        return this._inputValue;
      },
      set: function(newValue) {
        this._inputValue = newValue;
        input.value = newValue;// 修改 input 输入框的值
        span.innerHTML = newValue;// 修改 span 中的值
      }
    });
    input.onkeyup = function(event) {
      // 监听 keyup 事件，给 data.inputValue 赋值，调用其 set 方法
      data.inputValue = event.target.value;
    };
  </script>
</body>
```
最终双向绑定的效果是：
1. 我们在 `<input>` 元素中输入内容时，`data.inputValue` 的值也会随之变化，我们可以在控制台输入 `data.inputValue` 按回车查看其值；
2. 我们在控制台输入 `data.inputValue = 'new Value'` ，改变 `inputValue` 的值后， `<input>` 元素和 `<span>` 元素的值也会发生变化。