---
layout: post
title:  "React 中的高阶组件和 Redux 中的高阶 Reducer"
date:   2018-11-08 17:56:12 +0800
categories: learning-notes
tags: WEB前端 JS React Redux
---
* content
{:toc}

最近在使用 ant-design 完成网页的过程中，碰到了需要复用组件和 Reducer 的问题。详情可点击其[ github 仓库](https://github.com/nxjniexiao/douban-with-antd);

## 1. 组件复用

页面左侧有三个一级菜单 `电影`、`音乐`和`图书`，使用 `react-router 4` 实现点击菜单跳转至相应的组件。
电影页面：
<div><img src="/images/2018-11-08-React-Redux-Reuse/movie.png" /></div>
音乐页面：
<div><img src="/images/2018-11-08-React-Redux-Reuse/music.png" /></div>
图书页面：
<div><img src="/images/2018-11-08-React-Redux-Reuse/book.png" /></div>

### 1.1 路由、组件和 state 结构

路由部分代码如下：
```html
<Switch>
  <Route path="/movie" component={Movie} />
  <Route path="/music" component={Music} />
  <Route path="/book" component={Book} />
  <Route path="/search" component={Search} />
</Switch>
```

`Movie`、`Music`和`Book`组件中，又会根据二级菜单筛选对应的数据。<br>
这三个组件的逻辑业务一致，唯一的区别是它们的数据来源不同：
+ `Movie` 组件：`state.movie`;
+ `Music` 组件：`state.music`;
+ `Book` 组件：`state.book`;

其中 `state` 的结构设计如下:
```js
var state = {
  menusData: { /* 一级和二级菜单相关数据 */ },
  movie: {
    /* 搜索结果 */
    searchResult: {
      keyword: '',// 关键字
      currNum: 0,// 目前载入的列表数目
      totalNum: 0,// 服务器返回的列表总数
      resultList: []// 列表数组
    },
    /* 二级标题分类结果 */
    classResult: {
      china: {currNum: 0, totalNum: 0, resultList: []},
      europeUS: {currNum: 0, totalNum: 0, resultList: []}
      // ...更多
    }
  },
  music: { /* 与 movie 相同 */ },
  book: { /* 与 book 相同 */ }
}
```

### 1.2 高阶组件

如果不使用高阶组件，写完 `Movie` 组件的逻辑业务后，要把逻辑代码拷贝至其余组件中，然后做一些小的改动。<br>
为了复用组件，减少重复代码，可以使用高阶组件。
```js
const Movie = connect(state => state)(FilterResList(GridsWrapper, 'movie'));
const Music = connect(state => state)(FilterResList(GridsWrapper, 'music'));
const Book = connect(state => state)(FilterResList(GridsWrapper, 'book'));
const Search = connect(state => state)(FilterResList(GridsWrapper, 'search'));
```
其中：
+ `GridsWrapper` 组件只接收筛选后的数据，然后进行展示；
+ `FilterResList` 高阶组件主要用来完成业务逻辑，从 store 传入的 state 中筛选指定的数据。

`FilterResList` 高阶组件如下：
```js
import React, { Component } from 'react';
/* * 高阶组件 * */
export default function FilterResList(Comp, name) {
  // comp 为通用组件; name为新组件名 'movie' 'music' 'book' 'search'
  return class compWithFilterResList extends Component {
    constructor(props) {
      super(props);
      this.filterData = this.filterData.bind(this);
    }
    render() {
      return <Comp type={this.props.menusData.currMenuKeyName} result={this.filterData()} />
    }
    filterData() {
      if( name !== 'search') {
        // 'movie'/'music'/'book' 对应 Movie/Music/Book 组件
        const currSubmenuObj = this.props.menusData.currSubmenuObj;// 所有二级标题(对象:{movie:{},music:{},book:{}} )
        const currSubmenuKeyName = currSubmenuObj[name].keyName;// 当前二级标题
        return this.props[name].classResult[currSubmenuKeyName];
      } else {
        // 'search' 对应 Search 组件
        const currMenuKeyName = this.props.menusData.currMenuKeyName;// 当前一级标题
        return this.props[currMenuKeyName].searchResult;
      }
    }
  }
}
```
此高阶组件为一个函数：
+ 1) 接收两个参数：原组件 `Comp` 和 `name`，其中 `name` 表示组件将使用那一部分 `state` ；
+ 2) 函数中返回了一个新的组件 `compWithFilterResList`;
+ 3) 新组件传入了 `Store` 中的 `state` ，根据当前标题和传入的 `name` 筛选出要显示的结果 `result`;
+ 4) 新组件的 `render()` 中使用了传入的原组件 `Comp`，并把筛选后的结果 `result` 传给了 `Comp`:
  ```html
  <Comp result={this.filterData()} />
  ```

## 2. Reducer 逻辑复用

### 2.1 错误的方法：使用同一个逻辑代码

根据 1.2 中所示的 `state` 结构，我应该分别给 `state` 中的 `movie`、`music` 和 `book` 编写 Reducer 逻辑：`movie.js`、`music.js` 和 `book.js`。
然后通过 import 引入后使用 combineReducers 方法合并这几个 reducers:
```js
const rootReducer = combineReducers(
  {
    menusData,
    movie,
    music,
    book
  }
);
```
当完成 `state.movie` 的逻辑业务后，我发现它与 `state.music` 和 `state.book` 的逻辑一致，那我是不是可以直接使用呢？<br>
为了增加程序的可读性，我甚至把 `movie.js` 更名为 `handleResult.js`，然后再修改 `combineReducers` :
```js
const rootReducer = combineReducers(
  {
    menusData,
    movie: handleResult,
    music: handleResult,
    book: handleResult
  }
);
```
结果当然是不行。<br>
当我在 `/movie` 页面中 `dispatch` 一个加载**电影**分类数据的 `action` 时，它会同时命中 `state.movie`、`state.music` 和 `state.book` 的 `reducer`。<br>
也就是说从服务器请求回来的数据会同时存放至 `state.movie` `state.music` 和 `state.book` 中。

### 2.2 高阶 Reducer

google 后，发现[ Redux 中文官网 ](https://cn.redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html)就讲了如何复用 Reducer 逻辑。<br>

>创建特定的 reducer 有两种最常见的方式，一个是使用给定的前缀或者后缀生成新的 action 常量，另一个是在 action 对象上附加额外的信息。

我选择了后者，给 action 增加了一个 name 属性。取值为 `movie`、`music` 或 `book`，分别对应`state.movie` `state.music` 和 `state.book`。
然后创建高阶 Reducer `createNamedWrapperReducer`:
```js
function createNamedWrapperReducer(reducer, reducerName) {
  return (state, action) => {
    const { name } = action;// 'movie' 'music' 'book'
    const isInitializationCall = (state === undefined);// 判断是否为初始化(否则会报错)
    if ((reducerName !== name) && !isInitializationCall) {
      return state;
    }
    // 初始化或者name一致
    return reducer(state, action);// 注意使用 return
  }
}
export default createNamedWrapperReducer;
```
+ 1) 高阶函数接收两个参数：原始 reducer 和 reducerName；
+ 2) 函数内部返回一个新的 reducer 函数，格式符合 `(state, action) -> newState`；
+ 3) 新的 reducer 函数中，判断 action.name 是否和 reducerName 相等：
   + 不相等：返回 state；
   + 相等：返回 reducer(state, action) 的结果；

注意：高阶 Reducer 中的 `isInitializationCall` 是用来判断是否为初始化。<br>
如果不加这个判断条件，初始化时，`action.name` 为 `undefined`，新的 reducer 会执行如下代码：
```js
return state;
```
但是 `state` 也为 `undefined` ，这样会报错，因为 Redux 不允许返回值为 `undefined` 的 `state`。<br>
加了此判断条件后，新的 reducer 会执行如下代码：
```js
return reducer(state, action);
```
这样就能返回原始 reducer 中的 init state 了。

最后再修改 `combineReducers` 完成 Reducer 逻辑复用:
```js
const rootReducer = combineReducers(
  {
    menusData,
    movie: createNamedWrapperReducer(handleResult, 'movie'),
    music: createNamedWrapperReducer(handleResult, 'music'),
    book: createNamedWrapperReducer(handleResult, 'book')
  }
);
```

