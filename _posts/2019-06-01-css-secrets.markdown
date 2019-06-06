---
layout: post
title: "《CSS揭秘》学习笔记"
date: 2019-06-01 22:45:12 +0800
categories: learning-notes CSS
tags: css
customCss: ["/css/custom-css/2019-06-01-css-secrets.css"]
---

* content
{:toc}

## 1. 概述

此篇博客是学习《CSS 揭秘》一书的学习笔记。

## 2. 背景与边框

### 2.1 半透明边框

假设我们想给一个容器设置一道半透明白色边框，父元素的颜色会透过其边框。 HTML 如下：

```html
<div class="box-100">
  <div class="box-100 translucence-border"></div>
</div>
```

CSS 代码如下：

```css
.box-100 {
  width: 100px;
  height: 100px;
}
.translucence-border {
  border: 10px solid hsla(0, 0%, 100%, 0.5);
  background: #ff7875;
}
```




实际效果如下，子元素的红色背景(#ff7875)延伸到了边框下面，所以父元素的白色背景被遮住了。

<div class="margin-btm-14 box-100 hover-fade outline">
  <div class="box-100 translucence-border-before"></div>
</div>

CSS3 中的 `background-clip` 属性可以解决上述问题。此属性设置了元素的背景（背景图片或颜色）是否延伸到边框下面。

```css
.translucence-border {
  border: 10px solid hsla(0, 0%, 100%, 0.5);
  background: #ff7875;
  background-clip: padding-box;
}
```

`background-clip` 有如下几个值：

- `border-box`: 默认值，背景延伸至边框外沿（但是在边框下层）。
- `padding-box`: 背景延伸至内边距（padding）外沿。不会绘制到边框处。
- `content-box`: 背景被裁剪至内容区（content box）外沿。

修改后的效果如下，我们现在能够看到父元素的背景色了。

<div class="margin-btm-14 box-100 hover-fade outline">
  <div class="box-100 translucence-border-after"></div>
</div>

### 2.2 多重边框

**box-shadow 方案**

我们可以通过 `box-show` 来实现多重边框，而不需要使用额外的元素。<br>

它支持逗号语法，使我们可以创建任意数量的投影。

<div class="margin-btm-14 box-100 multi-border-1 hover-fade"></div>

HTML:

```html
<div class="box-100 multi-border"></div>
```

CSS:

```css
.multi-border {
  margin: 30px;
  background: #ff7875;
  /* x偏移量 | y偏移量 | 阴影模糊半径 | 阴影扩散半径 | 阴影颜色 */
  box-shadow: 0 0 0 10px #69c0ff, 0 0 0 20px #ffc069, 0 0 0 30px #95de64;
}
```

**outline 方案**

当我们只需要两层边框时，使用 outline (描边) 更方便。

<div class="margin-btm-14 box-100 multi-border-2 hover-fade"></div>

CSS:

```css
.multi-border {
  margin: 10px;
  background: #ff7875;
  border: 10px solid #69c0ff;
  /* 宽度 | 样式 | 颜色 */
  outline: 10px solid #ffc069;
}
```

### 2.3 灵活的背景定位

CSS 2.1 中，我们只能指定背景图片距离左上角的偏移量，或者干脆完全靠齐到其他三个角。<br>

CSS 3 中，我们可以灵活地定位背景图片了。

**background-position 扩展语法方案**

有如下 div 元素，内边距 10px ，现在我们想把此元素的背景图片定位到距右下角 10px 处。<br>
HTML:
```html
<div class="box-100 padding-10 bg-position">css 3</div>
```
CSS:
```css
.bg-position {
  background: url("/svg/css3.svg") no-repeat right bottom #ff7875;
  background-position: right 10px bottom 10px;
}
```
其中，前一个 `background` 中的 `right bottom` 为回退方案，对于不支持 CSS3 的浏览器，背景将定位至右下角处。<br>
效果如下：
<div class="margin-btm-14 box-100 padding-10 bg-position-1 hover-fade">css 3</div>

**background-origin 方案**

 `background-origin` 规定了 `background` 的原点。<br>

 其可用的属性如下：
 + `border-box`: 背景图片的摆放以 border 区域为参考;
 + `padding-box`: 背景图片的摆放以 padding 区域为参考;
 + `content-box`: 背景图片的摆放以 content 区域为参考;

CSS:
```css
.bg-position {
  background: url("/svg/css3.svg") no-repeat right bottom #ff7875;
  background-origin: content-box;
}
```

效果如下：
<div class="margin-btm-14 box-100 padding-10 bg-position-2 hover-fade">css 3</div>

**calc() 方案**

我们仍然以左上角偏移的思路来考虑，`calc(100% - 10px)` 的水平向左偏移等价于 `10px` 的水平向右偏移。

CSS:
```css
.bg-position {
  background: url("/svg/css3.svg") no-repeat right bottom #ff7875;
  background-position: calc(100% - 10px) calc(100% - 10px);
}
```

效果如下：
<div class="margin-btm-14 box-100 padding-10 bg-position-3 hover-fade">css 3</div>

### 2.4 边框内圆角

我们先用两个元素实现边框内圆角。<br>
HTML:
```html
<div class="outer">
  <div class="inner">边框内圆角</div>
</div>
```
CSS:
```css
.outer {
  padding: 5px;
}
.inner {
  padding: 5px;
  border-radius: 5px;
}
```
效果如下：
<div class="margin-btm-14 box-100 outer-2-4 bg-blue-4 hover-fade">
  <div class="auto-box inner-2-4 bg-red-4">边框内圆角</div>
</div>

我们再用一个元素实现边框内圆角。<br>
HTML:
```html
<div class="inner-rounding">边框内圆角</div>
```
CSS:
```css
.inner-rounding {
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 0 0 5px #69c0ff;
  outline: 5px solid #69c0ff;
}
```
重点： `outline` 不会跟着元素的圆角走，而 `box-shadow` 会。

效果如下：
<div class="margin-btm-14 box-100 inner-rounding bg-red-4 hover-fade">边框内圆角</div>

### 2.5 条纹背景

**水平条纹**

使用 `linear-gradient()` 线性渐变生成如下几个条纹：

HTML:
```html
<div class="box-500-100 flex-around">
  <div class="box-100 stripe-1">stripe-1</div>
  <div class="box-100 stripe-2">stripe-2</div>
  <div class="box-100 stripe-3">stripe-3</div>
  <div class="box-100 stripe-4">stripe-4</div>
  <div class="box-100 stripe-5">stripe-5</div>
</div> 
```
CSS:
```css
.stripe-1 {
  background: linear-gradient(#ff7875, #69c0ff);
}
.stripe-2 {
  background: linear-gradient(#ff7875 40%, #69c0ff 60%);
}
.stripe-3 {
  background: linear-gradient(#ff7875 50%, #69c0ff 50%);
}
.stripe-4 {
  background: linear-gradient(#ff7875 50%, #69c0ff 50%);
  background-size: 100% 20px;
}
.stripe-5 {
  background: linear-gradient(#ff7875 50%, #69c0ff 0);
  background-size: 100% 20px;
}
```
效果如下：
<div class="container flex-auto hover-fade">
  <div class="box-100 stripe-1">stripe-1</div>
  <div class="box-100 stripe-2">stripe-2</div>
  <div class="box-100 stripe-3">stripe-3</div>
  <div class="box-100 stripe-4">stripe-4</div>
  <div class="box-100 stripe-5">stripe-5</div>
</div> 

+ stripe-1: 从红色渐变至蓝色；
+ stripe-2: 在 40% - 60% 区域内从红色渐变至蓝色；
+ stripe-3: 无渐变效果，红蓝各占一半；
+ stripe-4: 配合 background-size 来调整尺寸；
+ stripe-5: 当第二个色标的位置为 0 时，会自动取前一个色标位置的值。

**垂直条纹**

HTML:
```html
<div class="box-100 vertical-stripe">垂直条纹</div>
```
我们只需要在开头加上一个额外的参数来指定渐变的方法，默认为 `to bottom` ，此处我们的方向为 `to right` ，或者使用 `90deg`。
CSS:
```css
.vertical-stripe {
  background: linear-gradient(to right, /* 或 90deg */
              #ff7875 50%, #69c0ff 0);
  background-size: 20px 100%;
}
```
效果如下：
<div class="margin-btm-14 box-100 vertical-stripe hover-fade">垂直条纹</div>

**斜条纹**

斜条纹我们使用了 `repeating-linear-gradient()` ，它与 `linear-gradient()` 类似，有一点不同：它是无限循环的，直到填满整个背景。

HTML:
```html
<div>
  <div class="diagonal-stripe-1">斜条纹1</div>
  <div class="diagonal-stripe-2">斜条纹2</div>
</div>
```
CSS:
```css
.diagonal-stripe-1 {
  background: repeating-linear-gradient(45deg, #ff7875, #69c0ff 20px);
}
.diagonal-stripe-2 {
  background: repeating-linear-gradient(
    45deg,
    #ff7875,
    #ff7875 10px,
    #69c0ff 0,
    #69c0ff 20px
  );
}
```

效果如下：
<div class="container flex-auto hover-fade">
  <div class="box-100 diagonal-stripe-1">斜条纹1</div>
  <div class="box-100 diagonal-stripe-2">斜条纹2</div>
</div>

### 2.6 复杂的背景图案

**网格**

HTML:
```html
<div class="box-110 grid"></div>
```
CSS:
```css
.grid {
  background: #fff;
  background-image: linear-gradient(rgba(200, 0, 0, 0.5) 50%, transparent 0),
    linear-gradient(90deg, rgba(200, 0, 0, 0.5) 50%, transparent 0);
  background-size: 20px 20px;
}
```
效果如下：
<div class="margin-btm-14 box-110 grid hover-fade"></div>

**波点**

HTML:
```html
<div class="box-100 polka"></div>
```
CSS:
```css
.polka {
  background: #fff;
  background-image: radial-gradient(#ff7875 30%, transparent 0),
                    radial-gradient(#ff7875 30%, transparent 0);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}
```
效果如下：
<div class="margin-btm-14 box-100 polka hover-fade"></div>

**棋盘**

HTML:
```html
<div class="box-100 checkerboard"></div>
```
CSS:
```css
.checkerboard {
  background: #eee;
  background-image: linear-gradient(45deg, 
                      rgba(0, 0, 0, .25) 25%, transparent 0, 
                      transparent 75%, rgba(0, 0, 0, .25) 0),
                    linear-gradient(45deg, 
                      rgba(0, 0, 0, .25) 25%, transparent 0, 
                      transparent 75%, rgba(0, 0, 0, .25) 0);
  background-position: 0 0, 10px 10px;
  background-size: 20px 20px
}
```
效果如下：
<div class="margin-btm-14 box-100 checkerboard hover-fade"></div>

### 2.7 伪随机背景

利用多层 background-image 生成随机背景：
+ 通过 background 设置一层底色；
+ 通过 background-image 设置三个条纹；
+ 通过 background-size 设置不同的尺寸使条纹错开。

HTML:
```html
<div class="container height-100 random-stripes"></div>
```
CSS:
```css
.random-stripes {
  background: #ff7875;
  background-image: linear-gradient(90deg, #69c0ff 10px, transparent 0),
                    linear-gradient(90deg, #ffc069 20px, transparent 0),
                    linear-gradient(90deg, #95de64 20px, transparent 0);
  background-size: 80px 100%, 60px 100%, 40px 100%;
}
```

效果如下：
<div class="container height-100 margin-btm-14 random-stripes"><div class="border-2-7"></div></div>

我们可以发现，图案每隔 240px 就会重复一次。见图中的虚线方框。<br>

240px 就是所有 background-size 的**最小公倍数**。<br>

为了最大化最小公倍数，我们把这些数字改成**质数**，并且这些质数之间**互质**。<br>

修改后的 CSS 如下：
```css
.cicada-stripes {
  background: #ff7875;
  background-image: linear-gradient(90deg, #69c0ff 11px, transparent 0),
                    linear-gradient(90deg, #ffc069 23px, transparent 0),
                    linear-gradient(90deg, #95de64 41px, transparent 0);
  background-size: 41px 100%, 61px 100%, 83px 100%;
}
```
现在这三个 background-size 的最小公倍数为 `41 X 61 X 83 = 207583px`。这个数值远大于常规屏幕的分辨率。<br>

这个技巧被称为"**蝉原则**"。

效果如下：
<div class="container height-100 margin-btm-14 cicada-stripes"></div>

### 2.8 连续的图像边框

有时我们想把图案或图片应用为边框，而不是背景。

**两个 HTML 元素**

最简单的办法是使用两个 HTML 元素，父元素的背景设为指定的图片(左图)，子元素用来放内容，效果如下(右图)：

<div class="container flex-auto">
  <div class="outer-2-8">
  </div>
  <div class="outer-2-8">
    <div class="inner-2-8">使用两个 HTML 元素实现连续的图像边框</div>
  </div>
</div>

HTML:
```html
<div class="outer">
  <div class="inner">使用两个 HTML 元素实现连续的图像边框</div>
</div>
```

CSS:
```css
.outer {
  width: 200px;
  height: 132px;
  padding: 10px;
  background: url('/images/2019-06-01-css-secrets/book.jpg');
  background-size: cover;
}
.inner {
  width: 100%;
  height: 100%;
  background: #fff;
}
```

**一个 HTML 元素**

使用一个 HTML 元素的思路如下：
+ 给元素设置一个透明的 `border` ；
+ 设置两层背景，一层是白色背景(白色背景写在前面)，下面一层是图片；
+ 白色背景的 `background-clip` 的值为 `padding-box` ，图片背景则为 `border-box` ；
+ 最后设置 `border-origin` 的值为 `border-box` (默认值为 `padding-box` )，否则就会出现左图背景图片有拼接的情况。

**注：**产生拼接的原因是图片显示的尺寸不仅取决于 padding box 的尺寸，而且被放置在了 padding box 的原点(左上角)。我们看到的实际上就是背景图片以平铺的方式蔓延到了border box 区域的效果。因此需要指定 `border-origin` 的值为 `border-box` 。

<div class="container flex-auto">
  <div class="continuous-image-borders">仅使用一个 HTML 元素实现连续的图像边框(背景图片有拼接情况)</div>
  <div class="continuous-image-borders correct">仅使用一个 HTML 元素实现连续的图像边框</div>
</div>

HTML:
```html
<div class="continuous-image-borders">仅使用一个 HTML 元素实现连续的图像边框</div>
```

CSS:
```css
.continuous-image-borders {
  width: 200px;
  height: 132px;
  padding: 10px;
  border: 10px solid transparent;
  background: linear-gradient(#fff, #fff),
              url('/images/2019-06-01-css-secrets/book.jpg');
  background-clip: padding-box, border-box;
  background-size: cover;
  background-origin: border-box;
}
```

为减少代码量，我们可以把背景属性整合到 background 这个简写属性中：
```css
.continuous-image-borders {
  width: 200px;
  height: 132px;
  padding: 10px;
  border: 10px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              url('/images/2019-06-01-css-secrets/book.jpg') border-box 0 0 / cover;
}
```
**注：**
1. `background` 属性被指定多个背景层时，使用逗号分隔每个背景层。
2. `background-size` 只能仅接着 `background-position` ，并以 `/` 分割，如 `0 0 / cover` 。
3. `<box>` 最多可以出现两次；出现两次时，前一个设置 `background-origin` ，后一个设置 `background-clip` ；出现一次时，同时设置这两个值。 
4. `background-color` 只能被包含在最后一层。

最终出现与前面一样的效果：
<div class="continuous-image-borders-opt margin-btm-14">仅使用一个 HTML 元素实现连续的图像边框（减少代码量）</div>

我们可以使用这个技巧实现老式信封样式的边框：
<div class="vintage-envelope margin-btm-14">老式信封样式边框</div>

CSS 如下:
```css
.vintage-envelope {
  width: 200px;
  height: 132px;
  padding: 1em;
  border: 1em solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              repeating-linear-gradient(-45deg, 
              red 0, red 12.5%, 
              transparent 0, transparent 25%,
              #58a 0, #58a 37.5%,
              transparent 0, transparent 50%
              ) 0 / 4em 4em;
}
```
**注：**`0 / 4em 4em` 等价于 `0 center / 4em 4em` ，因为对于 `background-position` 属性，如果只指定了一个值，另外一个值将为 `center`