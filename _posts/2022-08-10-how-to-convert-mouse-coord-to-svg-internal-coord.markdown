---
layout: post
title: 如何把鼠标坐标转换成svg内部坐标
date: 2022-08-10 19:46:00 +0800
categories: learning-notes
tags: Matrix
math: true
---

## 1. 概述

最近在工作中碰到了一个问题，当 svg 的父元素存在 transform 属性（旋转、缩放、平移或倾斜）时，如何把当前鼠标所在的坐标转换成 svg 内部坐标。这个问题在 [stackoverflow](https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg) 中得到了解答。

同时也发现了在 firefox 中存在 BUG ，因为 `svg.getScreenCTM()` 并没有计入 svg 父元素的 transform 。这个 BUG 于 2020 年在 [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=1610093) 中就被提出来了，目前仍未修复。

**不过可以把 transform 属性放在 svg 元素上来暂时规避上述 BUG 。**

## 2. 如何把鼠标坐标转换成svg内部坐标

1. 获取 SVG 元素：
   ```js
   var svg = document.querySelector('svg');
   ```

2. 创建 [SVGPoint](https://developer.mozilla.org/en-US/docs/Web/API/SVGPoint) ，稍后会用到其 `matrixTransform` 方法：
   ```js
   var pt = svg.createSVGPoint();
   ```

3. 计算鼠标位置在 SVG 元素内对应的坐标：
   ```js
   function cursorPoint(evt){
     pt.x = evt.clientX; pt.y = evt.clientY;
     return pt.matrixTransform(svg.getScreenCTM().inverse());
   }
   ```
   其中:
   - `svg.getScreenCTM()` 返回一个 `DOMMatrix`，代表将当前 svg 元素的坐标系转换为 SVG 文档片段的 SVG **视口坐标系**的矩阵。<br>
   - `DOMMatrix.inverse()` 返回一个该矩阵的逆矩阵。<br>
   - `pt.matrixTransform()` 将在 pt 对象上应用一个指定的矩阵变换。
4. 在 svg 元素上监听 `mousemove` 并调用 `cursorPoint` 方法：
   ```js
   svg.addEventListener('mousemove',function(evt) {
     var loc = cursorPoint(evt);
     // Use loc.x and loc.y here
   }, false);
   ```

## 3. Demo

### 3.1 SVG 父元素没有 transform 属性

下方 demo 中 svg **父元素**（div）没有 transform 属性。在 chrome 和 firefox 中均正常：SVG 中的黑点会跟随鼠标移动。

<iframe src="/html/2022-08-10-how-to-convert-mouse-coord-to-svg-internal-coord-demo-1.html" style="width: 100%; height: 210px; border: none;"></iframe>

### 3.2 SVG 父元素有 transform 属性

下方 demo 中 svg **父元素**（div）有 transform 属性 `transform: translate(100px, 100px);`。在 firefox 中不正常：SVG 中的黑点会跟随鼠标移动，**但是黑点在鼠标右下方 100px 处**。

<iframe src="/html/2022-08-10-how-to-convert-mouse-coord-to-svg-internal-coord-demo-2.html" style="width: 100%; height: 310px; border: none;"></iframe>

### 3.2 SVG 元素有 transform 属性

下方 demo 中 svg 元素有 transform 属性 `transform: translate(100px, 100px);`。在 chrome 和 firefox 中均正常。

<iframe src="/html/2022-08-10-how-to-convert-mouse-coord-to-svg-internal-coord-demo-3.html" style="width: 100%; height: 310px; border: none;"></iframe>