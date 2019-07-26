---
layout: post
title: "《CSS揭秘》学习笔记"
date: 2019-06-01 22:45:12 +0800
categories: learning-notes CSS
tags: css
custom_css: ["2019-06-01-css-secrets.css"]
custom_js: ["2019-06-01-css-secrets.js"]
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




{% raw %}

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

我们可以通过 `box-shadow` 来实现多重边框，而不需要使用额外的元素。<br>

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
**注：**
1. `0 / 4em 4em` 等价于 `0 center / 4em 4em` ，因为对于 `background-position` 属性，如果只指定了一个值，另外一个值将为 `center` 。
2. `repeating-linear-gradient` 中的颜色宽度为：
   + 0 - 12.5%: 红色；
   + 12.5% - 25%: 透明；
   + 25% - 37.5%: 蓝色；
   + 37.5% - 50% : 透明；
3. 然后剩下的 50% 区域会自动重复，这样他才能与其他 `4em X 4em` 方形背景以**相同的颜色**拼接起来。

我们还可以使用这个技巧实现蚂蚁行军边框，此效果在图像编辑软件中很常见：
<div class="marching-ants margin-btm-14">蚂蚁行军边框</div>

CSS 如下：
```css
@keyframes ants {
  to { background-position: 100%; }
}
.marching-ants {
  width: 200px;
  height: 132px;
  padding: 1em;
  border: 1px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              repeating-linear-gradient(-45deg, 
              #fff 0, #fff 12.5%, 
              transparent 0, transparent 25%,
              #000 0, #000 37.5%,
              transparent 0, transparent 50%
              ) 0 / .6em .6em;
  animation: ants 12s linear infinite;
}
```

要点如下：
1. 边框宽度减少至 `1px` ，**此时斜向条纹转变成了虚线边框**；
2. 把 `background-size` 改为一个合适的值，如 `.6em .6em`；
3. 定义动画 `ants` ，改变其 `background-position` 的值；
4. 通过 `animation` 使用动画，此时黑白虚线框就会动起来了。

## 3. 形状

### 3.1 自适应椭圆

**完整椭圆**

我们知道，给一个正方形盒子设置 `border-radius: 50%;` 时，我们会得到一个圆形：
<div class="box-1_3-1 adaptive-ellipse"></div>
HTML:
```html
<div class="box adaptive-ellipse"></div>
```
CSS:
```css
.box {
  width: 100px;
  height: 100px;
  background-color: #ff7875;
}
.adaptive-ellipse {
  border-radius: 50%;
}
```
当我们改变盒子的宽高，使其变为矩形时，我们会得到一个椭圆：
<div class="box-2_3-1 adaptive-ellipse"></div>
CSS:
```css
.box {
  width: 150px;
  height: 100px;
  background-color: #ff7875;
}
```

实际上，`border-radius: 50%;` 是 `border-radius: 50% / 50%;` 的简写，前后两个值分别指定了水平和垂直半径。

**半椭圆**

`border-radius` 是下面四个属性的简写：
+ `border-top-left-radius`: 左上角半径
+ `border-top-right-radius`: 右上角半径
+ `border-bottom-right-radius`: 右下角半径
+ `border-bottom-left-radius`: 左下角半径

当我们想得到一个垂直的半椭圆时，我们可以设置:
+ 左上角/右上角半径为 `50% 100%`
+ 左下角/右下角半径为 `0 0`

CSS 如下：
```css
.adaptive-half-ellipse-ver {
  border-top-left-radius: 50% 100%;
  border-top-right-radius: 50% 100%;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
```
效果如下：
<div class="box-2_3-1 adaptive-half-ellipse-ver margin-btm-14"></div>

真正简洁的方法还是使用 `border-radius` 简写属性，然后使用 `/` 分隔水平和垂直半径：
```css
.adaptive-half-ellipse-ver {
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
}
```
当我们给左下角/右下角的垂直半径设置为 `0` 时，其水平半径由 `0` 改为为 `50%` 时，并不会影响左下角/右下角的直角，因此我们可以进一步简化属性：

```css
.adaptive-half-ellipse-ver {
  border-radius: 50% / 100% 100% 0 0;
}
```
同理，如下代码会得到水平的半椭圆：<br>
CSS:
```css
.adaptive-half-ellipse-hor {
  border-radius: 0 100% 100% 0 / 50%;
}
```
效果如下：
<div class="box-2_3-1 adaptive-half-ellipse-hor margin-btm-14"></div>

**四分之一椭圆**

根据前面的思路，当把左上角的半径设 `100%` ，其余三个角的半径设为 `0` 时，我们就会得到四分之一椭圆：

<div class="box-2_3-1 adaptive-quarter-ellipse margin-btm-14"></div>

CSS：
```css
.adaptive-quarter-ellipse {
  border-radius: 100% 0 0 0;
}
```

### 3.2 平行四边形

我们可以通过 `skew()` 变形属性来生成一个平行四边形：

<div class="box-3-2 parallelogram-1 margin-btm-14">parallelogram</div>

CSS:
```css
.parallelogram {
  transform: skewX(-30deg);
}
```

我们生成了一个平行四边形，但是内容也跟着一起变形了。怎样让内容保持不变呢？

**两个元素方案**

<div class="box-3-2 parallelogram-1 margin-btm-14">
  <div class="parallelogram-2">parallelogram</div>
</div>

内层的内容元素使用一次反向的 `skew()` ，从而抵消外层容器的变形效果。<br>

HTML:
```html
<div class="parallelogram-1">
  <div class="parallelogram-2">parallelogram</div>
</div>
```

CSS:
```css
.parallelogram-1 {
  transform: skewX(-30deg);
}
.parallelogram-2 {
  transform: skewX(30deg);
}
```

**伪元素方案**

此方案的重点是把所有的样式应用到为元素上，然后在对为元素进行变形

<div class="box-3-2 parallelogram margin-btm-14">parallelogram</div>

HTML:
```html
<div class="parallelogram">parallelogram</div>
```

CSS:
```css
.parallelogram {
  position: relative;
  z-index: 0; /* 修复和页面样式冲突的bug */
}
.parallelogram::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: #ff7875;
  transform: skew(-30deg);
  z-index: -1;
}
```
注：
+ 为了使伪元素自动继承宿主元素的尺寸，
   + 我们设置了宿主元素的 `position: relative;` ，
   + 然后给伪元素设置 `position: absolute;` ，并设置 `top/right/bottom/left` 为 `0`;
+ 由于伪元素会覆盖在宿主元素之上，所以我们设置伪元素 `z-index: -1;`

### 3.3 菱形

在视觉设计中，把图片裁切为菱形是一种常见的设计手法。

**两个元素方案**

<div class="box-3-3-1 rhombus">
  <img src="/images/2019-06-01-css-secrets/cat.jpg" />
</div>

HTML:
```html
<div class="rhombus">
  <img src="/images/2019-06-01-css-secrets/cat.jpg" />
</div>
```

CSS:
```css
.rhombus {
  transform: rotate(45deg);
  overflow: hidden;
}

.rhombus img {
  width: 100%;
  transform: rotate(-45deg);
}
```

可以看到，图片被裁剪成了八角形。因此我们应该放大图片，使其充满其父元素。

<div class="box-3-3-1 rhombus">
  <img class="scale" src="/images/2019-06-01-css-secrets/cat.jpg" />
</div>

CSS:
```css
.rhombus img {
  width: 100%;
  transform: rotate(-45deg) scale(1.42);
}
```
注：
1. 我们保留了图片宽度为 `100%` 这个值，当浏览器不支持 `transform` 时，仍然可以得到一个合理的布局，因此没有使用 `width: 142%;`。
2. `scale()` 缩放的参考点默认为图片中心点，除非我们人为指定 `transform-origin` 的值；通过 `width` 属性放大图片时，参考点为左上角。

**裁剪路径方案**(不完全支持)

`clip-path`: 可以创建一个只有元素的部分区域可以显示的剪切区域。区域内的部分显示，区域外的隐藏。<br>

剪切区域是被引用内嵌的 `URL` 定义的路径或者外部 `svg` 的路径，或者是一个形状例如 `circle()`。<br>

`clip-path` 属性代替了现在已经弃用的 `clip` 属性。

<img class="box-3-3-2" src="/images/2019-06-01-css-secrets/cat-1.jpg" />

HTML
```html
<img class="box-3-3-2" src="/images/2019-06-01-css-secrets/cat-1.jpg" />
```

CSS:
```css
.box-3-3-2 {
  width: 300px;
  height: 200px;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  transition: clip-path 1s;
}
.box-3-3-2:hover {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
```
注：
1. `polygon()` 用于生成一个多边形，其接受至少三对坐标值，使用逗号分隔。
2. `clip-path` 可以参与动画，上述代码实现了鼠标悬停时图片平滑地显示其完整形状。
3. **safari 浏览器不支持该属性**。
4. `clip-path` 可以适应非正方形的图片。

### 3.4 切角效果

切角效果在网页设计中非常流行。<br>

**一个切角**

我们首先用无所不能的 CSS 渐变实现一个切角。

<div class="box-100 single-clip-corner"></div>

HTML:
```html
<div class="single-clip-corner"></div>
```

CSS:
```css
.single-clip-corner {
  background: #ff7875;
  background: linear-gradient(-45deg, transparent 15px, #ff7875 0);
}
```
注：`background: #ff7875;` 作为回退属性，在不支持 CSS 渐变的浏览器中，我们仍能看到简单的实色背景。<br>

**两个切角**

根据前面的思路，当我们想用两层渐变去实现底部的两个切角时，CSS 如下：

```css
.btm-clip-corner {
  background: #ff7875;
  background: linear-gradient(-45deg, transparent 15px, #ff7875 0),
              linear-gradient(45deg, transparent 15px, #69c0ff 0);
}
```

实际效果如下：

<div class="box-100 btm-clip-corner margin-btm-14"></div>

这样是行不通的，两层渐变背景默认会填满整个元素，且会相互覆盖。<br>

我们可以通过如下几步，把两层背景分别放在左侧和右侧：

1. `background-repeat` 设为 `no-repeat`；
2. `background-size` 设为 `50% 100%`；
3. `backgound-position` 分别设为 `right` 和 `left`。

CSS:
```css
.btm-clip-corner {
  background: #ff7875;
  background: linear-gradient(-45deg, transparent 15px, #ff7875 0) right,
              linear-gradient(45deg, transparent 15px, #69c0ff 0) left;
  background-size: 50% 100%;
  background-repeat: no-repeat;
}
```

效果如下：
<div class="box-100 btm-clip-corner-2 margin-btm-14"></div>

**四个切角**

同理，实现四个切角的 CSS 如下：

```css
.four-clip-corner {
  background: #ff7875;
  background: linear-gradient(135deg, transparent 15px, #ff7875 0) left top,
              linear-gradient(-135deg, transparent 15px, #69c0ff 0) right top,
              linear-gradient(-45deg, transparent 15px, #ff7875 0) right bottom,
              linear-gradient(45deg, transparent 15px, #69c0ff 0) left bottom;
  background-size: 50% 50%;
  background-repeat: no-repeat;
}
```

效果如下：
<div class="box-100 four-clip-corner margin-btm-14"></div>
此效果也可以使用 `clip-path` 属性实现。

**弧形切角**

<div class="box-100 scoop-corners margin-btm-14"></div>

CSS:
```css
.scoop-corners {
  background: #ff7875;
  background: radial-gradient(circle at top left, transparent 15px, #ff7875 0) left top,
              radial-gradient(circle at top right, transparent 15px, #69c0ff 0) right top,
              radial-gradient(circle at bottom right, transparent 15px, #ff7875 0) right bottom,
              radial-gradient(circle at bottom left, transparent 15px, #69c0ff 0) left bottom;
  background-size: 50% 50%;
  background-repeat: no-repeat;
}
```




### 3.5 梯形标签页

我们可以 3D 旋转伪元素生成梯形:

<div class="trapezoid margin-btm-14">trapezoid</div>

HTML:
```html
<div class="trapezoid">trapezoid</div>
```
CSS:
```css
.trapezoid {
  position: relative;
  width: fit-content;
  padding: 0 .8em;
  z-index: 0;
}
.trapezoid::after {
  position: absolute;
  content: '';
  top: 0; right: 0; bottom: 0; left: 0;
  transform: scaleY(1.3) perspective(.5em) rotateX(5deg);
  transform-origin: bottom;
  background: #ff7875;
  z-index: -1;
}
```
要点：
1. 元素本身相对定位，其伪元素绝对定位；
2. 伪元素通过 `transform` 属性缩放和旋转：
   + `scaleY(1.3)` Y 方向拉伸 1.3 倍，抵消 X 方向旋转 5 度后视觉上高度降低的效果；
   + `rotateX(5deg)` X 方向旋转 5 度，用于生成视觉上的梯形效果；
   + `perspective(.5em)` 指定了观察者与 z=0 平面的距离；
3. `transform-origin: bottom;` 指定元素变形的原点。

根据上述特点，我们可以设计出复杂的梯形标签页: 

<ul class="nav-3-5">
  <li>Home</li>
  <li class="selected">Projects</li>
  <li>About</li>
</ul>
<div class="content-3-5">Projects</div>

HTML:
```html
<ul class="nav-3-5">
  <li>Home</li>
  <li class="selected">Projects</li>
  <li>About</li>
</ul>
<div class="content-3-5">Projects</div>
```
CSS:
```css
ul.nav-3-5 {
  padding-left: .8em;
  margin-bottom: 0;
}
ul.nav-3-5 > li {
  position: relative;
  display: inline-block;
  margin: 0 -.4em !important;
  padding: .3em 1em 0;
  cursor: pointer;
  z-index: 0;
}
ul.nav-3-5 > li::before,
.content-3-5 {
  border: 1px solid rgba(0, 0, 0, .4);
}
ul.nav-3-5 > li::before {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: #ccc;
  background-image: linear-gradient(
    hsla(0, 0%, 100%, .6), 
    hsla(0, 0%, 100%, 0));
  border: 1px solid rgba(0, 0, 0, .4);
  border-bottom: none;
  border-radius: .5em .5em 0 0;
  box-shadow: 0 .15em white inset;
  transform: scale(1, 1.3) perspective(.5em) rotateX(5deg);
  transform-origin: bottom;
  z-index: -1;
}
.content-3-5 {
  margin-bottom: 1em;
  background: #eee;
  padding: 1em;
  border-radius: .15em;
}
ul.nav-3-5 li.selected {
  z-index: 2;
}
ul.nav-3-5 li.selected::before {
  background-color: #eee;
  margin-bottom: -1px;
}
```
JS:
```js
(function() {
  var navDom = document.querySelector('.nav-3-5');
  var liDomArr = navDom.querySelectorAll('li');
  var contentDom = document.querySelector('.content-3-5');
  navDom.addEventListener('click', clickTab);
  // 点击 tab 页的回调函数
  function clickTab(event) {
    removeClass();
    event.target.classList.add('selected');
    contentDom.innerHTML = event.target.innerHTML;
  }
  // 移除所有 li 元素的 'selected' 类
  function removeClass() {
    liDomArr.forEach(function(dom) {
      dom.classList.remove('selected');
    });
  }
})();
```

### 3.6 简单的饼图

#### 3.6.1 固定比例的饼图

我们来一步一步完成一个 20% + 80% 的饼图。

**首先**完成一个左右颜色不一样的圆形: 

<div class="circle-3-6"></div>

HTML
```html
<div class="circle-3-6"></div>
```
CSS:
```css
.circle-3-6 {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #ff7875;
  background-image: linear-gradient(to right, transparent 50%, #69c0ff 0);
}
```

**第二步**，设置伪元素的样式，让它起到遮罩层的作用(见虚线方框)。

<div class="circle-3-6 stage-2"></div>

```css
.circle-3-6.stage-2::after {
  content: '';
  display: block;
  margin-left: 50%;
  height: 100%;
  border: 1px dashed #ccc;
}
```

**第三步**，给伪元素设置背景色，并以左中为中心旋转 `(20% * 360)` 度，即 `0.2turn`。

<div class="circle-3-6 stage-2 stage-3 margin-btm-14"></div>

HTML
```html
<div class="circle-3-6 stage-2 stage-3 margin-btm-14"></div>
```
CSS
```css
.circle-3-6.stage-3::after {
  background-color: inherit;
  transform: rotate(0.2turn);
  transform-origin: left;
}
```

**第四步**，把伪元素变为半圆形，并去掉虚线方框。

<div class="circle-3-6 stage-2 stage-3 stage-4"></div>

HTML
```html
<div class="circle-3-6 stage-2 stage-3 stage-4"></div>
```
CSS
```css
.circle-3-6.stage-4::after {
  border-radius: 0 100% 100% 0 / 50%;
  border: none;
}
```
注：除了把伪元素变为半圆形外，给`.circle-3-6` 设置 `overflow: hidden;` 也可以达到同样的效果。<br>

最终的 CSS 如下：

```css
.circle-3-6::after {
  content: '';
  display: block;
  margin-left: 50%;
  height: 100%;
  border-radius: 0 100% 100% 0 / 50%;
  background-color: inherit;
  transform: rotate(0.2turn);
  transform-origin: left;
}
```

现在我们可以调整 `transform: rotate(0.2turn);` 中的角度来调整蓝色部分的比例。<br>

但是，当角度调整至 `0.5turn` 以上时，如 `0.7turn` 会得到不符合我们预期的情况：

<div class="circle-3-6 turn-70"></div>

CSS
```css
.circle-3-6.turn-70::after {
  transform: rotate(0.7turn);
}
```
我们预期的是，蓝色占 `70%` ，而当前蓝色占 `30%` 。

从另一个角度考虑，我们把伪元素的颜色改为蓝色，然后把旋转角度减去 `0.5turn` ，就会得到预期的情况：

<div class="circle-3-6 turn-70 turn-70-right"></div>

CSS
```css
.circle-3-6.turn-70-right::after {
  background-color: #69c0ff;
  transform: rotate(0.2turn);
}
```

#### 3.6.2 饼图进度指示器

我们还可以结合动画，生成一个从 `0%` 变为 `100%` 的饼图。

<div class="circle-3-6 pointer auto-run"></div>

CSS
```css
@keyframes bg-color {
  50% {
    background-color: #69c0ff;
  }
}
@keyframes spin {
  to {
    transform: rotate(0.5turn);
  }
}
.pointer::after {
  content: '';
  display: block;
  margin-left: 50%;
  height: 100%;
  border-radius: 0 100% 100% 0 / 50%;
  background-color: inherit;
  transform-origin: left;
}
.circle-3-6.auto-run::after {
  animation: bg-color 6s step-end infinite,
             spin 3s linear infinite;
}
```

#### 3.6.3 静态饼图封装

用同一套代码实现不同比例的饼图这个需求更加常见，比如我们希望通过如下方式来生成两个不同比例的饼图：

```html
<div class="pie">20%</div> 
<div class="pie">60%</div> 
```

由于无法给伪元素设置内联样式，因此我们通过让上一节中的动画暂定的方式来封装代码。

<div class="pie">20%</div> 
<div class="pie">60%</div> 

CSS
```css
.pie {
  position: relative;
  display: inline-block;
  width: 100px;
  height: 100px;
  line-height: 100px; /* 文字垂直居中 */
  border-radius: 50%;
  background-color: #ff7875;
  background-image: linear-gradient(to right, transparent 50%, #69c0ff 0);
  text-align: center; /* 文字水平居中 */
  color: transparent; /* 隐藏文字 */
}
.pie::after {
  content: '';
  position: absolute; /* 绝对定位 */
  display: block;
  top: 0; right: 0;
  width: 50%;
  height: 100%;
  border-radius: 0 100% 100% 0 / 50%;
  background-color: inherit;
  transform-origin: left;
  animation: bg-color 100s step-end infinite,
             spin 50s linear infinite;
  animation-delay: inherit; /* 继承自 .pie 元素 */
  animation-play-state: paused; /* 动画暂定 */
}
```
JS
```js
(function() {
  var pieDomArr = document.querySelectorAll(".pie");
  pieDomArr.forEach(function(pieDom) {
    var ratial = parseFloat(pieDom.innerHTML); // `20%` 转 20 
    pieDom.style.animationDelay = -ratial + "s";
  });
})();
```
重点：
1. 给伪元素设置 `animation-delay: inherit;`，使其值继承自 `.pie` 元素。
2. 通过 js ，给每个 `.pie` 元素设置内联样式 `pieDom.style.animationDelay = -ratial + "s";`。
3. 负的延时是合法的，就好像动画在过去已经播了指定延时的时间一样。因此动画第一帧为延时值的**绝对值**处的状态。
4. `animation-play-state: paused;` 让动画永久暂停。

#### 3.6.4 SVG 方案

首先生成一个圆形，并加上描边。

<svg width="100" height="100">
<circle class="stage-1" r="30" cx="50" cy="50" />
</svg>

HTML
```html
<svg width="100" height="100">
<circle class="stage-1" r="30" cx="50" cy="50" />
</svg>
```
CSS
```css
circle.stage-1 {
  fill: #ff7875;
  stroke: #69c0ff;
  stroke-width: 30;
}
```
注：
1. `stroke` 属性定义了给定图形元素的外轮廓的颜色。
2. `stroke-width` 属性指定了当前对象的轮廓的宽度，分布在**轮廓线**的两侧。

第二步，我们给它添加 `stroke-dasharray: 20 11.5;` 属性，第一个值指定了线段的长度，第二个指定了缺口的长度。
<svg width="100" height="100">
<circle class="stage-1 stage-2" r="30" cx="50" cy="50" />
</svg>
此圆形的周长为: `2πr = 2 x 3.14 x 30 ≈ 189` ，当我们把缺口长度设为其周长时:<br>
即 `stroke-dasharray: 20 189;` ，会出现如下情况。
<svg width="100" height="100">
<circle class="stage-1 stage-2 stage-3" r="30" cx="50" cy="50" />
</svg>
图中的线段长度就是我们指定的 `20px`。

第三步，调整圆形半径和线段的宽度，就可以得到我们想要的扇形了。
<svg width="100" height="100">
<circle class="stage-4" r="25" cx="50" cy="50" />
</svg>
HTML
```html
<svg width="100" height="100">
<circle class="stage-4" r="25" cx="50" cy="50" />
</svg>
```
CSS
```css
circle.stage-4 {
  fill: #ff7875;
  stroke: #69c0ff;
  stroke-width: 50;
  stroke-dasharray: 20 158;
}
```

最后，我们给 `svg` 元素添加背景颜色，并把它逆时针旋转 `90deg` 。
<svg class="final" width="100" height="100">
<circle class="stage-4" r="25" cx="50" cy="50" />
</svg>
HTML
```html
<svg class="final" width="100" height="100">
<circle class="stage-4" r="25" cx="50" cy="50" />
</svg>
```
CSS
```css
svg.final {
  transform: rotate(-90deg);
  border-radius: 50%;
  background-color: #ff7875;
}
```

#### 3.6.5 饼图进度指示器(SVG)

我们创建一个动画，把 `stroke-dasharray` 的值从 `0 158` 变为 `158 158` 。

<svg class="final" width="100" height="100">
<circle class="animation" r="25" cx="50" cy="50" />
</svg>
HTML
```html
<svg class="final" width="100" height="100">
<circle class="animation" r="25" cx="50" cy="50" />
</svg>
```
CSS
```css
@keyframes fillup {
  to {
    stroke-dasharray: 158 158;
  }
}
circle.animation {
  fill: #ff7875;
  stroke: #69c0ff;
  stroke-width: 50;
  stroke-dasharray: 0 158;
  animation: fillup 6s linear infinite;
}
```

#### 3.6.6 静态饼图封装(SVG)

我们按照 3.6.3 的方式去封装饼图，使用方式如下：<br>
HTML
```html
<div class="pie-svg">20%</div> 
<div class="pie-svg">60%</div>
<div class="pie-svg animated">0%</div>
```
效果如下：
<div class="pie-svg">20%</div> 
<div class="pie-svg">60%</div>
<div class="pie-svg animated">0%</div>

CSS
```css
.pie-svg {
  display: inline-block;
  width: 100px;
  height: 100px;
}
@keyframes grow {
  to {
    stroke-dasharray: 100 100;
  }
}
.pie-svg.animated circle {
  animation: grow 6s linear infinite;
}
```

JS
```js
(function() {
  var pieDomArr = document.querySelectorAll('.pie-svg');
  pieDomArr.forEach(function(pieDom) {
    var ratial = parseFloat(pieDom.innerHTML); // `20%` 转 20
    var ns = 'http://www.w3.org/2000/svg';
    var svgDom = document.createElementNS(ns, 'svg');
    var titleDom = document.createElementNS(ns, 'title');
    var circleDom = document.createElementNS(ns, 'circle');
    /* svg 元素 */
    svgDom.setAttribute('viewBox', '0 0 32 32'); //四个参数为: min-x min-y width height
    svgDom.style.transform = 'rotate(-90deg)';
    svgDom.style.borderRadius = '50%';
    /* title 元素 */
    titleDom.innerHTML = pieDom.innerHTML;
    /* circle 元素 */
    circleDom.setAttribute('r', 16);
    circleDom.setAttribute('cx', 16);
    circleDom.setAttribute('cy', 16);
    circleDom.setAttribute('fill', '#ff7875');
    circleDom.setAttribute('stroke', '#69c0ff');
    circleDom.setAttribute('stroke-width', 32);
    circleDom.setAttribute('stroke-dasharray', ratial + ' 100');
    /* 插入至 DOM 中 */
    svgDom.appendChild(titleDom);
    svgDom.appendChild(circleDom);
    pieDom.innerHTML = '';
    pieDom.appendChild(svgDom);
  });
})();
```
通过 js 生成的 HTML 代码如下：<br>
HTML
```html
<div class="pie-svg">
  <svg viewBox="0 0 32 32" style="transform: rotate(-90deg); border-radius: 50%;">
    <title>20%</title>
    <circle r="16" cx="16" cy="16" fill="#ff7875" stroke="#69c0ff" stroke-width="32" 
            stroke-dasharray="20 100"></circle>
  </svg>
</div>
<div class="pie-svg">
  <svg viewBox="0 0 32 32" style="transform: rotate(-90deg); border-radius: 50%;">
    <title>60%</title>
    <circle r="16" cx="16" cy="16" fill="#ff7875" stroke="#69c0ff" stroke-width="32" 
            stroke-dasharray="60 100"></circle>
  </svg>
</div>
<div class="pie-svg animated">
  <svg viewBox="0 0 32 32" style="transform: rotate(-90deg); border-radius: 50%;">
    <title>0%</title>
    <circle r="16" cx="16" cy="16" fill="#ff7875" stroke="#69c0ff" stroke-width="32" 
            stroke-dasharray="0 100"></circle>
  </svg>
</div>
```
注：
1. 给 `svg` 元素设置 `viewBox="0 0 32 32"` ，四个值分别为 `min-x min-y width height` ，此元素将自动适应容器的大小。
2. 我们调整 `circle` 元素的半径，使其周长接近 `100` ，最终其 `r` 为 `100 / 2π ≈ 16` ，
这样设置饼图的比例时更加方便，如 `stroke-dasharray: 38 100` 会得到比例为 `38%` 的饼图。
3. `createElementNS(namespaceURI, qualifiedName)`: 创建一个具有指定的命名空间URI和限定名称的元素。
4. 为确保可访问性，在 `<svg>` 内增加一个 `<title>` 元素，这样屏幕阅读器的读者也可以知道这个图像显示的是什么比率了。

## 4. 视觉效果

### 4.1 单侧投影

尝试实现单侧投影的代码如下：
HTML
```html
<div class="box-100 bg-red-4 bottom-shadow-4-1"></div>
```
CSS
```css
.bottom-shadow-4-1 {
  box-shadow: 0 5px 4px black;
}
```
效果如下：
<div class="box-100 bg-red-4 bottom-shadow-4-1 margin-btm-14"></div>

第三个值阴影模糊半径 `4px` 会导致模糊后的阴影显示在两侧，多出来的长度大约为 `4px`。<bt>

我们可以使用第四个长度参数 —— **阴影扩散半径**来消除两侧的阴影。当我们设置负的扩散半径时，阴影会根据指定的值缩小。<br>
CSS
```css
.bottom-shadow-4-1 {
  box-shadow: 0 5px 4px -4px black;
}
```
注：前后几个值分别为 `x偏移量 | y偏移量 | 阴影模糊半径 | 阴影扩散半径 | 阴影颜色`。<br>
最终效果如下：
<div class="box-100 bg-red-4 bottom-shadow-4-1-correct margin-btm-14"></div>

**邻边投影**

<div class="box-100 bg-red-4 sides-shadow-4-2 margin-btm-14"></div>

HTML
```html
<div class="box-100 bg-red-4 sides-shadow-4-2 margin-btm-14"></div>
```

CSS
```css
.sides-shadow-4-2 {
  box-shadow: 4px 4px 6px -3px black;
}
```
注: 
1. 扩张半径（-3px）为模糊半径（6px）的相反值的一半。
2. 偏移值要大于等于模糊半径（6px）的一半，这样投影才能被藏进另外两条边之内。

**双侧投影**

`box-shadow` 支持使用逗号分隔多个阴影效果。因此我们可以使用两个投影来实现双侧投影。

<div class="box-100 bg-red-4 opposite-sides-shadow-4-3 margin-btm-14"></div>

HTML
```html
<div class="box-100 bg-red-4 opposite-sides-shadow-4-3 margin-btm-14"></div>
```
CSS
```css
.opposite-sides-shadow-4-3 {
  box-shadow: 5px 0 5px -5px black,
             -5px 0 5px -5px black;
}
```

### 4.2 不规则投影

在某些情况下， `box-shadow` 会忽略掉元素的一部分。如下面三种情况：

<div class="box-4-2 speech-bubble">对话气泡</div>
<div class="box-4-2 dotted-border">虚线边框</div>
<div class="box-4-2 cutout-corners">切角效果</div>

给这几个元素添加 `box-shadow` 后效果如下：

<div class="box-4-2 shadow-4-2 speech-bubble">对话气泡</div>
<div class="box-4-2 shadow-4-2 dotted-border">虚线边框</div>
<div class="box-4-2 shadow-4-2 cutout-corners">切角效果</div>

HTML
```html
<div class="box-4-2 shadow-4-2 speech-bubble">对话气泡</div>
<div class="box-4-2 shadow-4-2 dotted-border">虚线边框</div>
<div class="box-4-2 shadow-4-2 cutout-corners">切角效果</div>
```
CSS
```css
.shadow-4-2 {
  box-shadow: 2px 2px 6px rgba(0, 0, 0, .5);
}
```

我们可以使用 `filter` 属性，并使用 `drop-shadow()` 方法，它接受和 `box-shadow` 属性一样的参数，但不包括扩张半径和 `inset` 关键字。<br>

**注:** IE 浏览器不支持该属性。

<div class="box-4-2 filter-4-2 speech-bubble">对话气泡</div>
<div class="box-4-2 filter-4-2 dotted-border">虚线边框</div>
<div class="box-4-2 filter-4-2 cutout-corners">切角效果</div>

CSS
```css
.filter-4-2 {
  filter: drop-shadow(2px 2px 6px rgba(0, 0, 0, .5));
}
```
**注:** 任何非透明的部分都会被打上投影，例如虚线边框效果中的文字。

### 4.3 毛玻璃效果

`filter` 属性有一个 `blur()` 方法可以设置高斯模糊。

<iframe width="100%" height="500px" src="/html/2019-06-01-css-secrets.demo-01.html"></iframe>

HTML
```html
<div class="frosted-glass">
  <div>
    <p>
      由于我们不能直接对元素本身进行模糊处理，但可以对伪元素进行模糊处理，
      然后将其定位到元素的下面，它的背景将会无缝匹配宿主元素的父元素的背景。
    </p>
    <p>
      在使用负的 z-index 来把一个子元素移动到他的父元素下层时，请务必小心；
      如果父元素的上级元素也有背景，则该子元素将出现在它们之后。
    </p>
  </div>
</div>
```

CSS
```css
* {
  margin: 0;
  padding: 0;
}
.frosted-glass {
  width: 100%;
  height: 500px;
  overflow: hidden; /* 防止子元素的 margin-top 影响此元素的定位 */
}
.frosted-glass div {
  position: relative;
  margin: 150px auto;
  width: 60%;
  padding: 20px;
  border-radius: 5px;
  overflow: hidden; /* 防止高斯模糊效果弱化元素边界 */
  background: hsla(0, 0%, 100%, .3);
  color: white;
  text-shadow: black 0.1em 0.1em 0.2em;
  z-index: 1;
}
.frosted-glass,
.frosted-glass div::after {
  background: url('/images/2019-06-01-css-secrets/book.jpg') 0 / cover fixed;
}
.frosted-glass div::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  filter: blur(4px); /* 高斯模糊效果 */
  z-index: -1; /* 让伪元素位于内容之后 */
}
```

**注:** <br>

由于为了使 `div.frosted-glass` 和 `div.frosted-glass div::after` 两个元素的背景**无缝匹配**，
我们把 `background-attachment` 设为了 `fixed`:

```css
.frosted-glass,
.frosted-glass div::after {
  background: url('/images/2019-06-01-css-secrets/book.jpg') 0 / cover fixed;
}
```

这会让背景不会随着元素的内容滚动。其中 `/` 前面的 `0` 为 `background-position` ，当只设置了一个值时，`Y` 方向的值为 `center` 。<br>

为了不让图片在滚动的时候，出现背景和文字相对移动的情况，上图使用 `<iframe>` 标签内嵌了一个 `HTML` 页面，否则就会出现如下情况。

<div class="frosted-glass-4-2">
  <div>
    <p>
      由于我们不能直接对元素本身进行模糊处理，但可以对伪元素进行模糊处理，
      然后将其定位到元素的下面，它的背景将会无缝匹配宿主元素的父元素的背景。
    </p>
    <p>
      在使用负的 z-index 来把一个子元素移动到他的父元素下层时，请务必小心；
      如果父元素的上级元素也有背景，则该子元素将出现在它们之后。
    </p>
  </div>
</div>

### 4.4 折角效果

**45°折角效果**

我们可以利用 **3.4 切角效果** 一节中的渐变方法去实现此效果。<br>

先实现缺角效果: 

<div class="folded-corner-4-4 margin-btm-14 step-1">缺角效果</div>

CSS
```css
.folded-corner-4-4.step-1 {
  background: linear-gradient(-135deg, transparent 1.42em, #ff7873 0);
}
```

再实现折角效果: 

<div class="folded-corner-4-4 margin-btm-14 step-2">折角效果</div>

CSS
```css
.folded-corner-4-4.step-2 {
  background: linear-gradient(45deg, rgba(0, 0, 0, .4) 1.42em, transparent 0) top right / 2em 2em no-repeat;
}
```

最后重叠: 

<div class="folded-corner-4-4 margin-btm-14 step-3">最终效果</div>

CSS
```css
.folded-corner-4-4.step-3 {
  background: linear-gradient(45deg, rgba(0, 0, 0, .4) 1.42em, transparent 0) top right / 2em 2em no-repeat,
              linear-gradient(-135deg, transparent 1.42em, #ff7873 0);
}
```
注: 折角效果要放在切角效果后面。

**其他角度折角效果**

我们可以改变角度和折角背景的宽和高，就能形成如下 30° 折角效果: 

<div class="folded-corner-4-4 margin-btm-14 step-4">30°折角</div>

CSS
```css
.folded-corner-4-4.step-4 {
  background: linear-gradient(30deg, rgba(0, 0, 0, .4) 1.42em, transparent 0) 
                  top right / 2.84em 1.64em no-repeat,
              linear-gradient(-150deg, transparent 1.42em, #ff7873 0);
}
```

我们发现折角效果并不真实，折角和缺角应该是沿着斜边对称的。<br>

由于背景无法旋转，我们可以**旋转伪元素**。

<div class="folded-corner-4-4 margin-btm-14 step-5">30°折角(伪元素)</div>
<div class="folded-corner-4-4 margin-btm-14 step-5 step-6">30°折角(旋转伪元素)</div>
<div class="folded-corner-4-4 margin-btm-14 step-5 step-6 step-7">30°折角(最终效果)</div>

HTML
```html
<div class="folded-corner-4-4 margin-btm-14 step-5">30°折角(伪元素)</div>
<div class="folded-corner-4-4 margin-btm-14 step-5 step-6">30°折角(旋转伪元素)</div>
<div class="folded-corner-4-4 margin-btm-14 step-5 step-6 step-7">30°折角(最终效果)</div>
```

CSS
```css
.folded-corner-4-4.step-5 {
  display: inline-block;
  position: relative;
  margin-right: 14px;
  background: linear-gradient(-150deg, transparent 1.42em, #ff7873 0);
  border: none;
}
.folded-corner-4-4.step-5::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 2.84em;
  height: 1.64em;
  background: linear-gradient(-30deg, rgba(0, 0, 0, .4) 50%, transparent 0);
}
.folded-corner-4-4.step-6::before {
  transform: rotate(60deg);
}
.folded-corner-4-4.step-7 {
  border-radius: .4em;
}
.folded-corner-4-4.step-7::before {
  background: linear-gradient(-30deg, 
              rgba(0, 0, 0, .4) 0, 
              rgba(0, 0, 0, .2) 50%, 
              transparent 0);
  border-bottom-right-radius: inherit;
  box-shadow: .2em .2em .3em -.1em rgba(0, 0, 0, .15);
}
```
重点：
1. 切角效果放在 `div` 元素上，折角效果放在 `div::before` 伪元素上；
2. 伪元素的宽高为之前折角效果背景的宽高；
3. 伪元素的背景的线性角度由 `30deg` 变为 `-30deg`（左图）；
4. 最后把伪元素旋转 `60deg` （右图）。





{% endraw %}
