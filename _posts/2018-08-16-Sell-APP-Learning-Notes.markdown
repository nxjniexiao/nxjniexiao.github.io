---
layout: post
title:  "学习笔记：单页面案例——外卖商家页面"
date:   2018-08-16 19:40:12 +0800
categories: learning-notes
tags: Vue WEB前端 HTML CSS JS
---
* content
{:toc}
此项目是使用Vue.js开发的一款外卖app商家页面。项目的github地址：[sell](https://github.com/nxjniexiao/SellExercise)。主要内容如下：
+ 使用Vue-cli脚手架，搭建基本代码框架；
+ 使用官方路由管理器Vue Router，将三大组件goods、ratings和seller 映射到路由，实现点击导航栏显示相应的内容；
+ 使用vue-resource与后端做数据交互；
+ 使用第三方js 库better-scroll实现列表滚动；
+ 使用Webpack构建工具编译源码，生成浏览器能够识别的代码；
+ 使用eslint检查代码格式，规范代码风格；
+ 多处使用了flex弹性布局；
+ 点击头部区域弹出的商家详情页面中，使用了负margin的sticky footer布局；
+ 移动端1像素边框的设置；
+ 图标字体的使用；
+ 使用h5的localstorage接口存储在浏览器端，从而实现收藏商家的功能。

## 1. vue.cli的安装和使用
+ 1) 全局安装vue-cli
```bash
npm install -g vue-cli
```

+ 2) 以webpack为模板创建项目
cd至目标文件夹，运行：
```bash
vue init webpack sell
```

+ 3) 启动:
cd至文件夹sell，运行：
```bash
npm run dev
```
成功后提示：
```bash
Your application is running here: http://localhost:8080
```

## 2. 制作图标字体
  + 1) 打开网站：[icomoon.io](https://icomoon.io)
  + 2) 点击右上角IconMoon App按钮；
  + 3) 点击左上角的Import Icons按钮；
  + 4) 单击选中需要的图标后，点击页面右下方的Generate Font按钮；
  + 5) 点击页面右下角的Download按钮，下载后解压。（下载之前可以点击左上角的Preference按钮，可设置Font Name）

## 3. 创建文件夹
  + 1) src/components下创建header等文件夹，存放相应的文件，如header.vue等等；
  + 2) src下创建common文件夹，并再common下创建三个子文件夹：js、stylus和fonts；
  + 3) 把2中fonts文件夹下的文件拷贝至src/common/fonts下面；<br>
  + 4) 把2中的style.css拷贝至src/common/stylus下面，把名字改成一个有意义的名字，如：icon.styl，并把之前的css语法修改为styl语法（删除{、}和”）；
  + 5) 删掉assets目录(此项目不需要)。

## 4. 模拟后台数据
  + 1) sell目录下新增data.json文件，包含了："seller": [...]、"goods": [...] 和 "ratings": [...]三部分数据；
  + 2) 打开sell/build/dev-server.js，在里面添加响应前端请求本地数据的代码；<br>
  **说明1：**新版的 build 目录中没有 dev-server.js 和 dev-client.js 这两个文件，也没有默认依赖 http-proxy-middleware 插件。<br>
  **解决方法：**在webpack.dev.conf.js中配置。[配置参考](https://blog.csdn.net/qq_34645412/article/details/78833860)
  ```js
  //第一步
  const express = require('express');
  const app = express(); //请求server
  var appData = require('../data.json');
  var seller = appData.seller; //获取对应的本地数据
  var goods = appData.goods;
  var ratings = appData.ratings;
  var apiRoutes = express.Router();
  app.use('/api', apiRoutes);  //通过路由请求数据
  //第二步：在devServer里添加before(){}方法
  before(app){
    app.get('/api/seller',function(req, res){
      res.json({
        errno: 0,
        data: seller
      })
    });
    app.get('/api/goods',function(req, res){
      res.json({
        errno: 0,
        data: goods
      })
    });
    app.get('/api/ratings',function(req, res){
      res.json({
        errno: 0,
        data: ratings
      })
    });
  }
  ```
  **说明2：**报错，提示缺少express模块<br>
  **解决方法：**安装express模块。在sell文件夹下打开terminal，输入：
  ```bash
  npm install express --save-dev
  ```

## 5.组件拆分

### 5.1 css样式重置
在sell/static文件夹下新增css/reset.css，并把[cssreset.com](http://cssreset.com)中的内容拷贝至此文件，然后把此css文件引入到index.html中。
```html
<link rel="stylesheet" href="static/css/reset.css">
```

### 5.2 移动端scale设置
因为是移动端，新增meta标签：
```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">
```

### 5.3 配置.eslintrc.js文件
在rules:{}中新增：
```bash
'semi': ['error', 'always']  //分号的配置；
'indent': 0  //缩进的配置；
```

### 5.4 查看效果
编译成功后，在App.vue文件中的&lt;template&gt;标签中的&lt;div&gt;中新增内容，并在浏览器中查看效果。

### 5.5 stylus和stylus-loader
给style标签添加属性：
```html
<style lang="stylus" rel="stylesheet/stylus"></style>
```
会报错：<br>
```bash
This dependency was not found:
!!vue-style-loader!css-loader?{"sourceMap":true}!……
```
**说明：**devDependencies中缺少对stylus和stylus-loader两个模块的依赖<br>
**解决方法：**在sell文件夹下打开terminal，运行:
```bash
npm install stylus stylus-loader --save-dev
```

### 5.6 弹性布局
css中的弹性布局：
```css
display: flex; 
```
设置了此属性后，其子元素的float、clear、vertical-align属性将失效。<br>
拥有弹性布局元素的子元素可设置flex属性，它是 flex-grow、flex-shrink 和 flex-basis 属性的简写属性，默认是0 1 auto。<br>
```css
flex: 1; 
```
等价于:
```css
flex-grow: 1; flex-shrink: 1; flex-basis:0%;
```
+ `flex-grow: 1; ` 定义拉伸因子：如果存在剩余空间，按比例放大元素；
+ `flex-shrink: 1; ` 定义收缩规则：如果剩余空间不足，按比例缩小元素；
+ `flex-basis: 0%; ` 主轴方向的初始大小。

## 6.Vue-router

### 6.0 各文件的描述
+ index.html是首页入口文件。
+ App.vue是项目入口文件。
+ main.js是项目的核心文件，全局的配置都在这个文件里面。
+ commponents是存放组件的目录。

### 6.1 导入Vue-router
在main.js导中Vue-router：
```js
import VueRouter from 'vue-router';
```
如果在一个模块化工程中使用它，必须要通过 Vue.use() 明确地安装路由功能：
```js
Vue.use(VueRouter);
```
关于import中的当前路径，前面要添加./，比如：
```js
./components/header/header.vue
```
如果想省略掉./，可以在webpack.base.conf.js中的resolve:{alias:{新增内容}}中添加：
````js
‘components’: path.resolve(_dirname, '../src/components')
````

### 6.2 路由配置
将组件 (components) 映射到路由 (routes)，然后告诉 Vue Router 在哪里渲染它们。<br>
在main.js中通过import导入各个组件，然后按照官网步骤配置路由：
```js
// 2. 定义路由
const routes = [
  {path: '/goods', component: goods},
  {path: '/ratings', component: ratings},
  {path: '/seller', component: seller}
];
// 3. 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes
});
// 4. 创建和挂载根实例。
const app = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
}).$mount('#app');
```
**tips：**`/* eslint-disable no-new */`实例化Vue的时候，不需要赋值给变量。

### 6.3 编辑App.vue
在App.vue中：
```html
<template>
  <div id="app">
    <v-header></v-header>
    <div class="tab">
      <router-link to="/goods">商品</router-link>
      <router-link to="/ratings">评论</router-link>
      <router-link to="/seller">商家</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  import vHeader from './components/header/header.vue';
  export default {
    name: 'App',
    components: {vHeader}
  };
</script>
```

### 6.4 修改样式
在App.vue中的style标签中，修改导航栏的样式。<br>
**注意：**在stylus中，**&**表示在上层选择器后拼接。<br>
**说明：**当前路由会新增两个class：router-link-exact-active和router-link-active。<br>
**修改默认的class名称方法：**<br>
JS中：
```js
const router = new VueRouter({
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
});
```
CSS中：
```css
a.active
  color: rgb(240, 20, 20)
```
**移动端如何实现1px边框：**
+ 1) src/common/stylus/下新建mixin.styl文件：
```css
border-1px($color)
  position: relative
  &:after
    display: block
    position: absolute
    left: 0
    bottom: 0
    width: 100%
    border-top: 1px solid $color
    content: ''
```
+ 2) src/common/stylus/下新建base.styl文件：
```css
@media (-webkit-min-device-pixel-ratio: 1.5), (min-device-pixel-ratio: 1.5)
  .border-1px:after
    transform: scaleY(0.7)
    -webkit-transform: scaleY(0.7)
```
```css
@media (-webkit-min-device-pixel-ratio: 2.0), (min-device-pixel-ratio: 2.0)
  .border-1px:after
    transform: scaleY(0.5)
    -webkit-transform: scaleY(0.5)
```
+ 3) src/common/stylus/下新建index.styl文件：
```css
@import './base';
@import './icon';
@import './mixin';
```
+ 4) 在main.js中引入index.styl文件：
```js
import './common/stylus/index.styl';
```
+ 5) 在App.vue中导入mixin.style：
```css
@import './common/stylus/mixin.styl'
```
然后调用mixinstyl中定义好的函数border-1px()：
```
border-1px(rgba(7,17,27,0.1))
```
+ 6) 给导航div新增一个class：border-1px<br>
  ```html
  <div class="tab border-1px">
  ```
**Tips：**如何在手机上访问电脑的本地服务器：
Webpack dev server 默认只能localhost 本机访问，如果希望局域网内其它机器访问进行测试,需要添加 `–host 0.0.0.0` 参数：
```bash
webpack-dev-server   --host 0.0.0.0
```
即在package.json中修改:
```js
"scripts": {"dev"："webpack-dev-server --inline --progress --config build/webpack.dev.conf.js --host 0.0.0.0"}）
```
此外，还需要在电脑防火墙的高级设置中的入站规则中添加8080端口，允许局域网内其他机器访问本机的8080端口。


## 7.Header组件
Header组件拿到通过异步请求获得的数据后，进行渲染。<br>
我们在Header组件的父组件(即App.vue)中，发送ajax请求，获取商家的相关信息。然后通过props属性，传递给Header组件。

### 7.1 安装和使用vue-resource
安装：
```bash
npm install vue-resource --save
```
然后，在main.js中引入并使用vue-resource：
```js
import VueResource from 'vue-resource';
Vue.use(VueResource);
```

### 7.2 使用this.$http.get方法请求数据
在App.vue的export default{}中：
```js
data() {
  return {
    seller: {}
  };
},
created() {
  this.$http.get('/api/seller').then(response => {
    if (response.body.errno === 0) {
      this.seller = response.body.data;
    }
  });
},
```
**tips:** `space-before-function-paren:0` 不去检测函数圆括号"()"前后的空格。

### 7.3 传递seller数据
把seller对象传给Header组件：
```html
<v-header :seller="seller"></v-header>
```
在Header.vue中export default{ }中接收父组件传入的seller：
```js
props: {  seller: Object  }
```

### 7.4 编辑Header.vue
在Header.vue中添加内容，修改样式。<br>
**碰到的问题：**
+ 1) inline-block排列的两个div之间有间隙。<br>
**解决办法：**给这两个div的父元素设置`font-size：0;`，然后给这两个div分别设置相应字体大小。
或者删除HTML中的换行符：
```html
<span>内容1</span><span>内容2</span>。
```
+ 2) inline-block排列的两个div，一个是图片，另一个是文字，顶部没有对齐。<br>
**解决办法：**给图片元素设置：
```css
vertical-align: top
```
+ 3) 文本不换行，超出的文本用省略号显示：
```css
/*文本不换行*/
white-space: nowrap;	
overflow: hidden;
/*超出的文本用省略号显示*/
text-overflow: ellipsis;	
```

### 7.5 Sticky footers设计
实际效果：如果页面内容不够长，页脚块(.detai-close)位于视窗底部；如果内容过长，页脚块会被内容向下推送。<br>
+ 此案例中使用了负margin方法（兼容性好）:
  ```css
  .detail-main
    padding-bottom: 64px
  .detail-close
    position: relative
    width: 32px
    height: 32px
    margin: -64px auto 0 auto
    clear: both
    font-size: 32px
  ```
+ 此外还有弹性布局方法：<br>
  父元素：
  ```css
  .content-wrapper{
    display: flex;
    flex-direction: column;
  }
  ```
  子元素：
  ```css
  .content{flex: 1;}
  .footer{flex: 0;}
  ```
  思考：为何Sticky footers布局中的wrapper层需要清除浮动？代码如下：
  ```css
  .clearfix
    //不能少
    display: inline-block
    &:after
      content: ''
      display: block
      height: 0
      line-height: 0
      visibility: hidden
      clear: both
  ```
若不清除浮动，元素.detail-main的margin-top属性会导致其父元素.detail-wrapper的定位会向下移动，移动距离等于子元素margin-top的值。<br>
但是.clearfix样式中的：`display: inline-block;`属性能避免此现象。<br>
**不需要清除浮动的方法：**把子元素.detail-main的margin-top改为padding-top，也可以避免此现象。

### 7.6 新增评星组件：star.vue
```html
<div class="star">
  <span v-for="(singleStar, index) in allStars" :key="index" class="star-item" :class="[sizeType, singleStar]"></span>
</div>
```
渲染后：
```html
<div class="star">
  <span class="star-item size-48 on">
  <span class="star-item size-48 on">
  <span class="star-item size-48 on">
  <span class="star-item size-48 on">
  <span class="star-item size-48 off">
</div>
```
定义好star组件后，在header.vue中导入并注册star组件：`import star from '../star/star';`<br>
export dafault { } 中：`components: {  star  }`<br>
之后就可以在header.vue中使用star组件：

```html
<star :size="48" :score="4.2"></star>
```

### 7.7 Vue过渡动画
html中使用transition标签：
```html
<transition name="fade">
  <p v-if="show">hello</p>
</transition>
```
CSS中：
```css
.fade-enter-active, .fade-leave-active {  
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
```

### 7.8 弹窗后的内容模糊效果
给.detail添加css特性:
```css
backdrop-filter: blur(5px)
```

## 8. goods组件

### 8.1 左侧menu布局
多行文字垂直居中：(父元素.menu-item下面的子元素是.text)
```css
.menu-item
  display: table
.text
  display: table-cell
```

### 8.2 右侧内容布局
取消1px的横线：
```css
border-none()
  &:after
    display: none
```

### 8.3 滚动库better-scroll
+ 安装：`npm better-scroll --save`
+ 导入和使用：
```js
import BScroll from 'better-scroll'
const wrapper = document.querySelector('.wrapper')	//vue中如何拿到DOM见下方Tips
const scroll = new BScroll(wrapper)
```

**Tips:**
+ 1) 如何在vue中拿到某一个元素或者组件：**ref**<br>
  ref 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 $refs 对象上。如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例：<br>
  ```html
  <!-- "vm.$refs.p" will be the DOM node -->
  <p ref="p">hello</p>

  <!-- "vm.$refs.child" will be the child component instance -->
  <child-component ref="child"></child-component>
  ```
+ 2) Vue.nextTick( [callback, context] )
在修改数据之后立即使用这个方法，可获取更新后的DOM。
+ 3) 关联左侧菜单栏和右侧食物详情栏。<br>
   + 3.1) 右侧滚动，左侧菜单相应地高亮。
      + 3.1.1）data(){return {...}}里添加：
        ```js
        listHeight: [],
        scrollY: 0
        ```
      + 3.1.2）修改this.foodsScroll:
        ```js
        this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {probeType: 3});
        // 1 滚动的时候会派发scroll事件，会截流。
        // 2 滚动的时候实时派发scroll事件，不会截流。
        // 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
        // default：1
        ```
      + 3.1.3）监听scroll事件，拿到实时的pos.y值，并赋值给this.scrollY。
        ```js
        this.foodsScroll.on('scroll', (pos) => {
          this.scrollY = Math.abs(Math.round(pos.y));
        });
        ```
   + 3.2) 点击左侧菜单，右侧相应地滚动。
      + 3.2.1）修改this.menuScroll:（添加click: true参数）
        ```js
        this.menuScroll = new BScroll(this.$refs.menuWrapper, {click: true});
        // 点击列表是否派发click事件
        // default：true
        ```
      + 3.2.2）PC端模式下，会出现两次点击事件（实际未出现）。为了阻止默认的click事件：<br>
        HTML中：
        ```html
        @click="menuSelected(index, $event)"
        ```
        JS中：
        ```js
        menuSelected(index, event) {
          if(!event._constructed){
            return;
          }
        }
        ```
      + 3.2.3）在menuSelected() {...}中添加：
        ```js
        this.foodsScroll.scrollTo(0, -this.listHeight[index], 300);
        ```

## 9.cart购物车组件

### 9.1 seller数据的传递
  App.vue中的data() { }中有seller，可以传递给路由中的goods组件。方法如下：(路由的出口也可以传递参数)
  ```html
  <router-view :seller="seller"></router-view>
  ```

### 9.2 seller数据的使用
  这样goods组件中就能使用seller，并且可以向下传递给cart组件。方法如下：
  ```html
  <cart :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" :selectedList="selectedList" ref="cart"></cart>
  ```

### 9.3 数组selectedList
cart组件中（props: { }中），有由goods组件传入的selectedList：
```js
selectedList: {
  type: Array,
  default() {
    return [ {price: 10, count: 1}];
  }
}
```
**注意：**若props中有参数的类型为Array或者Object，default要写成上面这种函数形式。

### 9.4 countCtrl组件
+ 1) 父组件goods中：<br>
  **HTML：**
  ```html
  <countCtrl @countChanged="(newCount) => {changeCount(index,index1,newCount)}" :count="food.userCount"></countCtrl>
  ```
  **Scripts：**
  ```js
  // 监听子组件countCtrl中initCount值的改变
  changeCount(index, index1, newCount) {
    this.goods[index].foods[index1].userCount = newCount;
  }
  ```
+ 2) 子组件countCtrl中：<br>
  **HTML：**
  ```html
  <span @click="minusCount"> <i ...></i> </span>
  ```
  **Scripts：**
  ```js
  minusCount() {
    this.initCount--;
    this.$emit('countChanged', this.initCount);// 触发事件，传给其父组件goods
  }
  ```
+ 3) 初始状态下，点击(+)后，向左弹出(-)<br>
  **tips：**(+)和(-)为span元素，在没有设置display: inline-block的情况下，translate和rotateZ动画无法显示。<br>
  **HTML：**
  用transition元素包裹减号按钮标签:

  ```html
  <transition name="popup">  <span>..减号按钮..</span> </transition>
  ```
  **Style：**

  ```css
  .popup-enter-active, .popup-leave-active
    transition: all 0.5s

  .popup-enter, .popup-leave-to
    opacity: 0
    transform: translate3D(24px, 0, 0) rotateZ(180deg)
  ```

**tips：**给countCtrl中添加click事件，单击鼠标却没有响应。这是因为countCtrl的父组件goods里，使用betterScroll时，禁用了click事件。<br>
修改如下：（添加click: true）
```js
this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {probeType: 3, click: true});
```

### 9.5 小球飞入购物车动画
新建组件cartBall.vue：<br>
**HTML:**
```html
<div class="balls-container">
  <!--推荐对于仅使用 JavaScript 过渡的元素添加 v-bind:css="false"，-->
  <!--Vue 会跳过 CSS 的检测。这也可以避免过渡过程中 CSS 的影响。-->
  <transition-group
    name="drop"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    :css="false">
    <div class="ball" v-for="(ball, index) in balls" :key="index" v-show="ball.show">
      <div class="inner"></div>
    </div>
  </transition-group>
</div>
  ```
**Script:**<br>
在methods：{}中定义三个方法：beforeEnter(){ }、enter(){ }、afterEnter(){ }<br>
在鼠标点击+号按钮后，触发cartBallDrop() 触发方法，在执行了ball.show="true"后，会触发动画，依次执行：beforeEnter-->enter-->afterEnter。<br>
**疑点：**在过渡效果没完成时，就已经执行完了afterEnter。<br>
**~~目前不完美的解决办法：~~**在afterEnter方法中，用一个延时函数，时间等于CSS中transition的时间。目的是执行此函数时，运动已完成，然后再延时函数中，恢复小球至初始状态。(PC端正常，移动端在快速点击+号时，有BUG。)<br>
**注：BUG已完美解决，见下面代码后的内容。**
```js
setTimeout(() => {
  let ball = this.droppingBalls.shift();
  if (ball) {
    // 属性还原
    ball.show = false;
    ball.locObtained = false;
    ball.target = null;
  }
}, 400);
```
**CSS:**
```css
.balls-container
  .ball
    position: fixed
    left: 28px
    bottom: 18px
    z-index: 999
    transition: all .4s cubic-bezier(.49, -0.43, .83, .67)
    .inner
      transition: all .4s linear
      width: 24px
      height: 24px
      border-radius: 50%
      background: #00a0dc
```
**移动端小球动画BUG已完美解决：**<br>
+ 1）用transition替代transition-group
+ 2）修改enter函数：
  ```js
  enter(el, done) {
    // 。。。
    // 在el上监听transitionend事件，动画完成后调用afterEnter函数
    el.addEventListener('transitionend', done);
  }
  ```

**tips：**<br>
1. 父组件goods监听到子组件countCtrl中的事件后，如何调用其他子组件中的方法：
   + goods组件中：<br>
     HTML：
     ```html
     <countCtrl  @count-changed="(newCount, target) => {changeCountFromCountCtrl(index,index1,newCount,target)}"></countCtrl>
     <cart ref="cart"></cart>
     ```
     JS：（通过this.$refs.cart调用cart组件的cartDrop方法）
     ```js
     changeCountFromCountCtrl(index, index1, newCount, target) {
       this.$refs.cart.cartDrop(target);
     }
     ```
   + cart组件中：<br>
     HTML：
     ```html
     <cartBall ref="cartBall"></cartBall>
     ```
     JS：（通过this.$refs.cartBall调用cart组件的cartBallDrop方法）
     ```js
     cartDrop(target) {this.$refs.cartBall.cartBallDrop(target);}
     ```
   + carBall组件中：
     ```js
     methods: {
       cartBallDrop(target) {
         // 。。。
       }
     }
     ```
   **总结：**通过在HTML中定义ref属性和在组件的methods：{ }定义的方法中，通过this.$refs调用子组件的方法，最终一层层传递至真正需要执行函数的组件。
2. Element.getBoundingClientRect()方法返回元素的大小及其相对于视口的位置，其中有四个只读属性：left、top、right和bottom。
3. JavaScript钩子中的enter() { }
   ```js
   enter: function (el) {
     // 没有第二个参数
     // 由 CSS transitionend 事件决定过渡何时结束
   }
   enter: function (el, done) {
     // 有第二个参数
     // 过渡只有在调用 `done` 时结束
     done();
   }
   ```

### 9.6 购物车列表
+ 1) 点击购物车时，购物车列表从底部向上弹出，由于购物车列表高度不确定，无法给出translate3d的实际像素值。<br>
**解决方法：**
```css
transform: translate3d(0, 100%, 0)
```
+ 2) 购物车列表有个最大高度，当所选择的食物超过最大高度时，让列表能够滚动。注意使用this.$nextTick()。
```js
switchCartList() {
  this.cartListShow = !this.cartListShow && this.totalCount > 0;
  // 新建、刷新listScroll，让列表能够滚动
  if (this.cartListShow === true) {
    this.$nextTick(() => {
      if (!this.listScroll) {
        this.listScroll = new BScroll(this.$refs.cartListContent, {click: true});
      } else {
        this.listScroll.refresh();
      }
    });
  }
}
```
+ 3) 在购物车列表当中使用better-scroll，会出现列表无法滚动。<br>
**解决办法：**<br>
给ul的父元素list-wrapper设置最大高度和`overflow：hidden`属性。
```css
  .list-wrapper
    max-height: 265px
    background: white
    overflow: hidden
```
+ 4) 父元素有三个子元素：1、2、3，父元素的z-index=200。想实现的显示顺序为1>2>3。<br>
子元素1没有z-index；子元素2的z-index=100；子元素3的z-index=50。<br>
显示顺序由上至下为：2>3>1<br>
**原因：**子元素1没有继承父元素的z-index=200<br>
**解决办法：**单独给子元素1设置z-index=200。<br>
**结论：**父元素的z-index不影响其子元素1、2、3显示的先后顺序，只影响和父元素同级的元素之间的先后顺序。<br>

## 10.食物详情页面
**tips：**
1. 举个例子，如果触发一个 camelCase 名字的事件：
  ```js
  this.$emit('myEvent')
  ```
  则监听这个名字的 kebab-case 版本是不会有任何效果的：
  ```html
    <my-component v-on:my-event="doSomething"></my-component>
  ```
  **因此，我们推荐你始终使用 kebab-case 的事件名。**
2. goods组件包含了food组件，food组件又包含了countCtrl组件。然而，goods组件中：
  ```html
    <food @count-changed="changeCountInFood"></food>
  ```
  不能直接监听countCtrl组件中的自定义事件：count-changed。<br>
  **解决办法：**在food组件中监听其子组件countCtrl的count-changed事件，
  ```html
    <countCtrl @count-changed="changeCountInFood"></countCtrl>
  ```
  然后再emit一个count-changed事件，传递给父组件goods。
3. 在使用transition中遇到的问题，transition中的子标签，设置了height，但是没有设置width，在使用transform: translate移动效果时，实际无垂直滑动效果。<br>
**原因：只设置height不设置width的情况下，此标签的实际高度仍为0。**<br>
  此外还会影响内层使用better-scroll时，滚动层出现可以无限往上滚的情况。(原因未知)<br>
  **解决办法：**设置width：100%。
4. 移动端分辨率不一样，想让一张图片的宽度为屏幕的100%，高度等于宽度，则应该设置：
  ```css
    .food-header
      position: relative	/*相对定位*/
      width: 100%
      height: 0
      padding-top: 100%	/*等于其父元素宽度的100%*/
      border-1px(rgba(7, 17, 27, 0.1))
      .image
        position: absolute	/*绝对定位*/
        top: 0
        left: 0
        height: 100%
        width: 100%
  ```
5. 格式化日期和时间
   + 1) HTML：
   ```html
     <div class="rate-time">{ {rating.rateTime | formatDate} }</div>
   ```
   + 2) JS：
   ```js
   import {formatDate} from "../../common/js/date";
   ```
   **注意：**要使用花括号，因为date.js中通过export方式导出，在导入时要加{ }。
   ```js
   filters: {
     formatDate(time){
       let date = new Date(time);
       return formateDate(date, 'yyyy-MM-dd hh:mm');
     }
   },
   ```
   + 3) 在src/common/js中新建date.js：
   ```js
   export function formatDate(date, fmt) {
     // fmt: 'yyyy-MM-dd hh:mm'
     // 替换年份
     if (/(y+)/.test(fmt)) {
       // 一对圆括号代表一个捕获组
       let year = date.getFullYear().toString();
       fmt = fmt.replace(RegExp.$1, year.substr(4 - RegExp.$1.length));
     }
     let obj = {
       'M+': date.getMonth() + 1,
       'd+': date.getDate(),
       'h+': date.getHours(),
       'm+': date.getMinutes()
     };
     // 替换月、日、时、分
     for (let key in obj) {
       let pattern = new RegExp(`(${key})`);
       if (pattern.test(fmt)) {
         fmt = fmt.replace(RegExp.$1, prefixInt(obj[key], 2));
       }
     }
     // 前面自动补零(内部函数)
     function prefixInt(num, len) {
       // substr()会把第一个负参数加上字符串长度，即取尾部len位
       return ('0000000000' + num).substr(-len);
     }
     return fmt;
   }
   ```

## 11.评价(ratings)页面

### 11.1 seller数据的传递
由于APP.vue中的<router-view>中传入了seller：
```html
<router-view :seller="seller"></router-view>
```
因此，在ratings.vue组件props中定义好seller后，可以直接使用seller。

### 11.2 star组件出现的问题
传入参数相同的情况下，导入star组件，star组件中星星图标的高度为15px，最外层的div标签高度有的是15px，有的大于15px。<br>
**原因：**star组件的父元素有：`line-height：18px`属性，这会影响star组件的高度。<br>
**~~解决办法：~~**强行设置最外层div标签的高度为15px。<br>
**解决办法：**取消父元素的line-height：18px。<br>

### 11.3 适配小分辨率手机
使用flex左右布局时，在小分辨率手机，如iphone5s上，如果内容太多会出现换行的情况。<br>
**解决办法：**<br>
左侧：<br>
```css
flex: 0 0 137px;  width: 137px
@media only screen and (max-width: 320px)
  flex: 0 0 120px
  width: 120px
```
右侧：
```css
padding-left: 24px
@media only screen and (max-width: 320px)
  padding-left: 6px
```

### 11.4 class名冲突
组件food.vue使用了ratings.vue中的css特性：<br>
三个路由路径：good.vue、ratings.vue、seller.vue<br>
food.vue(good.vue的子组件)中有个`class=‘ratings-wrapper’`，ratings.vue中最外层的`class=‘ratings-wrapper’`。<br>
在ratings.vue中，切换到good.vue，点击食物，激活food.vue后，food.vue中的`class=‘ratings-wrapper’`的元素，同样使用了ratings.vue中`class=‘ratings-wrapper’`的特性，从而导致排版bug。<br>
**原因：**未知。<br>
**解决办法：**ratings.vue中最外层的`class=‘ratings-wrapper’`改名。

### 11.5 class名冲突
同11.4，ratings组件引入了rating-select组件，两个组件中均有一个同名的class。引入的rating-select也会套用ratings组件中的样式。<br>
**原因：**未知。<br>
**解决办法：**使用不同名字的class。

## 12.商家(seller)页面

### 12.1 异步问题
seller.vue组件会接收父组件APP.vue组件的值：seller，且在父组件APP.vue中，seller是通过异步获取的。<br>
因此，在seller.vue组件的mounted阶段，this.seller仍未空值。<br>
**解决办法：**在mounted() { }中 和watch: {}中都调用垂直、水平滚动函数<br>
+ 1) 在商家页面为当前页面，刷新页面时：mounted先执行，watch后执行；
+ 2) 从其他页面切到商家页面时：mouted执行，watch不执行。(seller未发生变化)<br>

**注：**因为refreshVerScroll函数中没有用到this.seller，所以在watch中可以取消对它的调用。
```js
mounted() {
  this.refreshVerScroll();
  this.refreshHorScroll();
},
watch: {
  // 如果'seller'发生改变，这个函数会执行
  'seller'() {
    this.refreshVerScroll();//此函数没有使用this.seller，可以取消。
    this.refreshHorScroll();
  }
},
```
在methods: { }中定义这两个滚动函数
```js
// 刷新垂直滚动
refreshVerScroll() {
  this.$nextTick(() => {
    if (!this.verScroll) {
      this.verScroll = new BScroll(this.$refs.sellerWrapper, {click: true});
    } else {
      this.verScroll.refresh();
    }
  });
},
// 刷新水平滚动
refreshHorScroll() {
  this.$nextTick(() => {
    if (this.seller.pics) {	//在mounted阶段调用此函数时，this.seller为空，不加判断会报错。
      let picWidth = 90;
      let marginRight = 6;
      let totalPicsWidth = this.seller.pics.length * (picWidth + marginRight) - marginRight;
      this.$refs.picture.style.width = totalPicsWidth + 'px';
      if (!this.horScroll) {
        this.horScroll = new BScroll(this.$refs.pictureWrapper,
{scrollX: true, eventPassthrough: 'vertical'}	//外层垂直滚动，内层水平滚动
);
      } else {
        this.horScroll.refresh();
      }
    }
  });
}
```

### 12.2 收藏/已收藏的逻辑
+ 1）修改APP.vue中的seller：{ }<br>
修改前：
```js
data() {
  return {
    seller: {}
  };
},
```
修改后：
```js
data() {
  return {
    seller: {
      id: (() => {
        let queryParam = urlParse();
        return queryParam.id;
      })()
    }
  };
},
```
+ 2）在common/js目录下新建util.js：
```js
export function urlParse () {
  let url = window.location.search;
  let obj = {};
  let pattern = /[?&][^?&]+=[^?&]+/g;
  let matches = url.match(pattern);
  // [ '?id=666', '&a=b' ]
  matches.forEach((item) => {
    let res = item.substr(1).split('=');
    // url已被encodeURIComponent编码，所以拿到值后需要decodeUTIComponent解码。
    let key = decodeURIComponent(res[0]);
    let value = decodeURIComponent(res[1]);
    obj[key] = value;
  });
  return obj;
}
```
**tips：**在浏览器中输入：window.location.search，回车后出现：
```bash
"?id=666&a=b"
```
+ 3）在APP.vue中引入urlParse方法：
```js
import {urlParse} from './common/js/util';
```
修改created（）{ }：<br>
修改前：
```js
this.$http.get('/api/seller' ).then(response => {
```
修改后：
```js
this.$http.get('/api/seller?id=' + this.seller.id).then(response => {
```
刷新页面，点击浏览器中Network中的"seller？id=666"，再点击右侧顶部的Headers，General中的Request URL变为:
```bash
http://localhost:8080/api/seller?id=666
```
后端会根据这个请求返回id=666的商家的信息。
为防止this.seller中的id被抛弃，采用vue.js官网中的建议，使用Object.assign方法：
```js
created() {
  this.$http.get('/api/seller?id=' + this.seller.id).then(response => {
    if (response.body.errno === 0) {
      // this.seller = response.body.data;
      this.seller = Object.assign({}, this.seller, response.body.data);
    }
  });
},
```
+ 4）数据的缓存部分<br>
在common/store/js中新建store.js文件：
```js
  // 储存
  export function saveToLocal(id, key, value) {
    // 只读的localStorage 允许你访问一个Document 的远端（origin）对象 Storage；数据存储为跨浏览器会话。
    // localStorage里存储的是字符串:
    // '{"1"(商家id): {"已收藏": "true", "老用户": "true",...},
    //   "2"(商家id): {"已收藏": "false", "老用户": "false",...},...'
    let seller = null;
    if (!window.localStorage.__seller__) {
      // window.localStorage.__seller__不存在
      seller = {};
      seller[id] = {};
    } else {
      // window.localStorage.__seller__存在
      let json = window.localStorage.__seller__;// JSON字符串
      seller = JSON.parse(json);// 把JSON字符串解析为原生JS值
      if (!seller[id]) {
        // 如果没有与id对应的商家(id = 3)，新建一个空对象赋值给seller[id]
        seller[id] = {};
      }
    }
    seller[id][key] = value;// 赋值
    window.localStorage.__seller__ = JSON.stringify(seller);// 把JS对象序列化为JSON字符串
  }

  // 读取(def为默认值，读取不到key所对应的值时使用)
  export function loadFromLocal(id, key, def) {
    if (window.localStorage.__seller__) {
      // window.localStorage.__seller存在
      let json = window.localStorage.__seller__;
      let seller = JSON.parse(json);
      if (seller[id]) {
        // 如果有与id对应的商家
        return seller[id][key] || def;
      } else {
        return def;
      }
    } else {
      return def;
    }
  }
```
+ 5）在seller.vue中导入store.js：
```js
import {saveToLocal, loadFromLocal} from '../../common/js/store';
```
修改methods中的方法switchCollect：
```js
switchCollect() {
  this.hasCollected = !this.hasCollected;
  saveToLocal(this.seller.id, 'fav', this.hasCollected);
},
```
在浏览器点击收藏前后，分别在Console输入localStorage，按回车出现：
```bash
前：Storage {loglevel:webpack-dev-server: "WARN", length: 1}
后：Storage {__seller__: "{"666":{"fav":true}}", loglevel:webpack-dev-server: "WARN", length: 2}
```
修改data中的hasCollected:<br>
修改前：
```js
data() {
  return {
    hasCollected: false
  };
},
```
修改后：
```js
data() {
  return {
    hasCollected: (() => {
      return loadFromLocal(this.seller.id, 'fav', false);
    })()
  };
},
```

## 13. 体验优化

### 13.1 keep-alive标签
keep-alive标签能让失活的组件缓存下来：
```html
<keep-alive>
  <router-view :seller="seller"></router-view>
</keep-alive>
```
重新创建动态组件的行为通常是非常有用的，但是在这个案例中，我们更希望那些标签的组件实例能够被在它们第一次被创建的时候缓存下来。<br>
为了解决这个问题，我们可以用一个 keep-alive 元素将其动态组件包裹起来。

## 14. 打包

### 14.1  npm run build
build完成之后，sell目录下会多一个dist文件夹。

### 14.2 用express启动小型server
+ 1）在根目录下创建JS文件：prod.server.js，内容见3）后的附录
+ 2）在config/index.js中的build：{ }中定义port：
```js
port: 9000,
```
+ 3）在config/index.js中的build：{ }中修改productionSourceMap: true为false，取消调试。
```js
productionSourceMap: true,
```
更改为：
```js
productionSourceMap: false,
```
**附录：**<br>
prod.server.js中的内容：
```js
  let express = require('express');
  let config = require('./config/index');
  
  let port = process.env.PORT || config.build.port;
  let app = express();
  let router = express.Router();
  
  router.get('/', (req, res, next) => {
    req.url = '/index.html';
    next();
  });
  
  app.use(router);
  
  //第一步
  let appData = require('./data.json');
  let seller = appData.seller; //获取对应的本地数据
  let goods = appData.goods;
  let ratings = appData.ratings;
  let apiRoutes = express.Router();
  
  //第二步：
  apiRoutes.get('/seller', function (req, res) {
    res.json({
      errno: 0,
      data: seller
    })
  });
  apiRoutes.get('/goods', function (req, res) {
    res.json({
      errno: 0,
      data: goods
    })
  });
  apiRoutes.get('/ratings', function (req, res) {
    res.json({
      errno: 0,
      data: ratings
    })
  });
  
  app.use('/api', apiRoutes);  //通过路由请求数据
  
  app.use(express.static('./dist'));
  
  module.exports = app.listen(port, function (err) {
    if (err) {
      console.log(err);
      return
    }
    console.log('Listening at http://localhost:' + port + '\n')
  });
```