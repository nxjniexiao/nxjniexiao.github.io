---
layout: post
title:  "Promise学习笔记"
date:   2018-08-22 10:21:12 +0800
categories: learning-notes
tags: JS WEB前端 ES6
---
* content
{:toc}
此笔记的内容引用自官网[developer.mozilla.org—Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)和[developer.mozilla.org—使用Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)。

## 1. 什么是Promise
>Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象。<br>
>一个 Promise有以下几种状态:
>+ pending: 初始状态，既不是成功，也不是失败状态。
>+ fulfilled: 意味着操作成功完成。
>+ rejected: 意味着操作失败。
>
>pending 状态的 Promise 对象可能触发fulfilled 状态并传递一个值给相应的状态处理方法，也可能触发失败状态（rejected）并传递失败信息。<br>
>当其中任一种情况出现时，Promise 对象的 then 方法绑定的处理方法（handlers）就会被调用。<br>
>then方法包含两个参数：onfulfilled 和 onrejected，它们都是 Function 类型：
>+ 当Promise状态为fulfilled时，调用 then 的 onfulfilled 方法;
>+ 当Promise状态为rejected时，调用 then 的 onrejected 方法。
>
>所以在异步操作的完成和绑定处理方法之间不存在竞争。<br>
>因为 Promise.prototype.then 和  Promise.prototype.catch 方法返回promise 对象， 所以它们可以被链式调用。

```js
Promise.prototype.then(onFulfilled, onRejected)// 返回一个新的promise
/*例子：*/
p.then(function(value) {
   // 当p(一个Promise对象)的状态由pending变成fulfilled时调用
  }, function(reason) {
  // 当p(一个Promise对象)的状态由pending变成rejected时调用
});

Promise.prototype.catch(onRejected)// 返回一个新的promise
/*例子：*/
p.catch(function(reason) {
    // 当p(一个Promise对象)的状态由pending变成rejected时调用
});
```
## 2. Promise构造函数
```js
new Promise( function(resolve, reject) {...} /* executor */  );
```

根据官网描述总结以下6条要点：
+ 1) Promise构造函数中传入的参数为函数：executor;
+ **<font color="red">2) Promise构造函数执行时，立即调用executor函数;</font>**
+ 3) executor函数有两个函数作为参数：resolve和reject;
+ 4) executor函数内部通常会执行异步操作，并在完成后调用resolve或reject;
+ 5) resolve被调用时将promise的状态改为fulfilled;
+ 6) reject被调用时将promise的状态改为rejected;

注意上述第2条，在Promise构造函数返回新建对象前，executor函数就已经被调用了。

## 3. 使用Promise

### 3.1 创建Promise
我们可以用下面的小例子来理解Promise。
```js
let p1 = new Promise((resolve, reject) => {
    // setTimeout模拟异步操作
    setTimeout(() => {
        let n = -1 + Math.random() * 2;// 随机数-1~1
        if (n >= 0) {
            console.log('随机数 = ' + n);
            console.log('p1状态：fulfilled。');
            resolve(n);// 把p1状态设为fulfilled。
        } else {
            console.log('随机数 = ' + n);
            console.log('p1状态：rejected。');
            reject(new Error('随机数小于0'));// 把p1状态设为rejected。
        }
    }, 1000);
});

p1.then(res =>{
    // p1的状态若为fulfilled，执行第一个函数，打印n的值；
    console.log('n = ' + res);
}, err => {
    // p1的状态若为rejected，执行第二个函数，打印错误。
    console.log(err);
});
```

Promise构造函数执行时，立即调用作为参数的executor函数。<br>
在此函数中，我们使用setTimeout()函数来模拟异步操作：1秒钟后，生成一个范围为-1~1的随机数n：
+ 如果n&gt;=0，使用`resolve();`把p1(一个Promise对象)的状态设为fulfilled；
+ 如果n&lt;0，使用`reject()`把p1的状态设为rejected。

然后根据p1的状态执行p1.then()函数：
+ p1的状态若由pending变为fulfilled，执行第一个函数，打印n的值；
+ p1的状态若由pending变为rejected，执行第二个函数，打印错误。

结果会有两种情况：
```
随机数 = -0.5353394506291314
p1状态：rejected。
Error: 随机数小于0
```

```
随机数 = 0.02490386338275874
p1状态：fulfilled。
n = 0.02490386338275874
```

### 3.2 链式调用

方法`Promise.prototype.then(onFulfilled, onRejected)`会返回一个新的promise，所以我们可以通过创造一个promise chain来完成连续执行两个或者多个异步操作的需求。<br>
我们在3.1中的小例子基础上修改代码，利用Promise完成这样一个功能：<br>
一秒钟后生成第1个随机数，若它不小于0，则一秒钟后再生成第2个随机数，并把这两个随机数相加。若相加结果仍然不小于0，则打印结果。其余情况则打印错误。<br>
代码如下：
```js
let count = 0;
let p1 = new Promise((resolve, reject) => {
    // setTimeout模拟异步操作
    setTimeout(() => {
        count++;
        let n = -1 + Math.random() * 2;// 随机数-1~1
        if (n >= 0) {
            console.log('第1个随机数 = ' + n);
            console.log('p1状态：fulfilled。');
            resolve(n);// 把p1状态设为fulfilled。
        } else {
            console.log('第1个随机数 = ' + n);
            console.log('p1状态：rejected。');
            reject(new Error(`第${count}个随机数小于0`));// 把p1状态设为rejected。
        }
    }, 1000);
});

// promise状态为fulfilled时调用的函数
function Fulfilled(res) {
    count++;
    // new一个Promise对象
    let p = new Promise((resolve, reject) => {
        setTimeout(() => {
            let n = -1 + Math.random() * 2;// 随机数-1~1
            console.log(`第${count}个随机数 = ` + n);
            if (n + res >= 0) {
                console.log(`p${count}状态：fulfilled。`);
                resolve(n+res);// 把返回的promise状态设为fulfilled。
            } else {
                console.log(`p${count}状态：rejected。`);
                reject(new Error(`第${count}个随机数与前面的结果相加小于0`));// 把返回的promise状态设为rejected。
            }
        }, 1000);
    });
    return p;// 返回此promise
}

// promise状态为rejected时调用的函数
function Rejected(err) {
    count++;
    //  new一个Promise对象
    let p = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`p${count}状态：rejected。`);
            reject(err);// 把返回的promise状态设为rejected。
        }, 1000);
    });
    return p;// 返回此promise
}

let p2 = p1.then(Fulfilled, Rejected);

p2.then((res) => {
    console.log('最终结果为：' + res);
}, (err) => {
    console.log(err);
});
```
结果有三种可能：<br>
+ 第一种：<br>
    + executor函数(**作为Promise构造函数的参数**)中：第一秒后，生成一个随机数n=0.95。n不小于零，所以执行`resolve(n);`，p1状态被设为fulfilled。
    + 执行`p1.then(Fulfilled, Rejected);`中的Fulfilled函数，返回一个Promise对象p：<br>
    第二秒后生成第二个随机数n=0.26。两个随机数相加为1.21，不小于零，所以执行`resolve(n+res);`把返回的Promise对象p状态设为fulfilled。<br>
    **注：p2与这个返回的Promise对象p的状态和参数一致。[见下方引用的官方解释](#func-then)**
    + 执行`p2.then()`中的第一个函数，打印结果。
```
第1个随机数 = 0.9489641211016062
p1状态：fulfilled。
第2个随机数 = 0.26289801708479477
p2状态：fulfilled。
最终结果为：1.211862138186401
```
+ 第二种：<br>
    + executor函数中：第一秒后，生成一个随机数n=-0.92。n小于零，所以执行`reject(new Error(/*错误原因*/))`，p1状态被设为rejected。
    + 执行`p1.then(Fulfilled, Rejected);`中的Rejected函数，返回一个Promise对象p：<br>
    第二秒后执行`reject(err);`把返回的Promise对象p状态设为rejected。<br>
    + 执行`p2.then()`中的第二个函数，打印err。
```
第1个随机数 = -0.9151184862276849
p1状态：rejected。
p2状态：rejected。
Error: 第1个随机数小于0
```
+ 第三种：<br>
    + executor函数中：第一秒后，生成一个随机数n=0.41。n不小于零，所以执行`resolve(n);`，p1状态被设为fulfilled。
    + 执行`p1.then(Fulfilled, Rejected);`中的Fulfilled函数，返回一个Promise对象p：<br>
    第二秒后生成第二个随机数n=-0.69。两个随机数相加为-0.28，小于零，所以执行`reject(new Error(/*错误原因*/))`把返回的Promise对象p状态设为rejected。<br>
    + 执行`p2.then()`中的第二个函数，打印err。
```
第1个随机数 = 0.4141558202079687
p1状态：fulfilled。
第2个随机数 = -0.6860477930831919
p2状态：rejected。
Error: 第2个随机数与前面的结果相加小于0
```

在上面案例中，为了清晰地描述过程，使用了变量`let p2`。我们可以采用更简单的形式：
```js
p1.then(Fulfilled, Rejected).then((res) => {
    console.log('最终结果为：' + res);
}, (err) => {
    console.log(err);
});
```
如果我们想让三个随机数相加，只需要修改上面的代码：
```js
p1.then(Fulfilled, Rejected).then(Fulfilled, Rejected).then((res) => {
    console.log('最终结果为：' + res);
}, (err) => {
    console.log(err);
});
```
下面显示了运行代码后出现的其中一种情况：
```
第1个随机数 = 0.9745031598411451
p1状态：fulfilled。
第2个随机数 = 0.3137366861790132
p2状态：fulfilled。
第3个随机数 = 0.015714137953589447
p3状态：fulfilled。
最终结果为：1.3039539839737477
```
<span id="func-then">关于then()方法返回的Promise，引用官网的描述：</span>
>then方法返回一个Promise，而它的行为与then中的回调函数的返回值有关：
>+ **<font color="red">如果then中的回调函数返回一个值：</font>**<br>
那么then返回的Promise将会成为接受状态，并且将返回的值作为接受状态的回调函数的参数值。
>+ **<font color="red">如果then中的回调函数抛出一个错误：</font>**<br>
那么then返回的Promise将会成为拒绝状态，并且将抛出的错误作为拒绝状态的回调函数的参数值。
>+ **<font color="red">如果then中的回调函数返回一个已经是接受状态的Promise：</font>**<br>
那么then返回的Promise也会成为接受状态，并且将那个Promise的接受状态的回调函数的参数值作为该被返回的Promise的接受状态回调函数的参数值。
>+ **<font color="red">如果then中的回调函数返回一个已经是拒绝状态的Promise：</font>**<br>
那么then返回的Promise也会成为拒绝状态，并且将那个Promise的拒绝状态的回调函数的参数值作为该被返回的Promise的拒绝状态回调函数的参数值。
>+ **<font color="red">如果then中的回调函数返回一个未定状态(pending)的Promise：</font>**<br>
那么then返回Promise的状态也是未定的，并且它的终态与那个Promise的终态相同；同时，它变为终态时调用的回调函数参数与那个Promise变为终态时的回调函数的参数是相同的。