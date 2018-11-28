---
layout: post
title:  "Redux搭配React完成包含异步action的应用 Async Subreddit"
date:   2018-09-04 15:36:12 +0800
categories: learning-notes
tags: WEB前端 redux react
---
* content
{:toc}

Redux官网[cn.redux.js.org](https://cn.redux.js.org/docs/advanced/ExampleRedditAPI.html)中有一个小例子：Reddit API。官方源码地址：[redux-async](https://github.com/reduxjs/redux/tree/master/examples/async)。<br>
此文记录了自己完成此例子的过程。

## 1. 概述

此例子的界面如下图：<br>
![图片](/images/2018-09-08-Redux-React-Subreddit-Async/APP.png)<br>
state的结构设计如下：<br>
![图片](/images/2018-09-08-Redux-React-Subreddit-Async/state.png)<br>
注意：官网提示此结构并不是最优的设计，它并不适用于有互相引用的嵌套内容的场景，或者用户可以编辑列表的场景。<br>

关于如何使用`create-react-app`快速构建单页面应用，以及如何设计`src`文件夹结构等，在博客[ Redux 搭配 React 完成迷你型任务管理应用 Todo List ](https://nxjniexiao.github.io/2018/09/04/Redux-React-Todo-List/)中有详细的描述，因此本文不再赘述。




## 2. 异步action

在[ Redux 搭配 React 完成迷你型任务管理应用 Todo List ](https://nxjniexiao.github.io/2018/09/04/Redux-React-Todo-List/)例子中，我们的actions创建函数返回的是一个**action对象**，每当 dispatch action 时，state 会被立即更新。我们称之为**同步action**。<br>
<br>
在使用了从`redux-thunk`库中引入的中间件`thunkMiddleware`后，我们可以在actions创建函数中返回一个**函数**，在返回的函数中我们可以做一些异步操作，然后根据操作的状态dispatch不同的**action对象**或另个一**异步action**。我们称之为**异步action**。<br>
<font color="red">重点：</font>
+ 1) 异步actions创建函数返回的是一个函数，不是action对象；
+ 2) 一个Thunk就是一个返回函数的函数，所以异步actions创建函数就是Thunk；
+ 3) 返回的函数能接收`dispatch`和`getState`参数，并稍后使用它们；
+ 4) Thunk中间件能让我们像 `dipatch` actions一样 `dispatch` 异步actions;
+ 5) dispatch()会返回内部函数中返回的值(即一个Promise对象)，如：<br>
    `fetchPosts(subreddit)`是一个Thunk，它返回一个函数，此函数中返回一个Promise对象：
    ```js
    function fetchPosts(subreddit) {
    return (dispatch) => {
        dispatch(requestSubreddit(subreddit));
        // fetch()会返回一个Promise对象
        return fetch(`https://www.reddit.com/r/${subreddit}.json`)
            .then(response => response.json())
            // response.json()返回一个被解析为JSON格式的promise对象。
            .then(json => dispatch(receiveSubreddit(subreddit, json)));
        }
    }
    ```
    所以另一个Thunk`fetchPostsIfNeeded(subreddit)`中的`dispatch()`也会返回此Promise对象。
    ```js
    return dispatch(fetchPosts(subreddit));
    ```
+ 6) 我们可以用Promise创建自己的控制流：
    ```js
    store.dispatch(fetchPosts('reactjs'))
        .then(() => store.dispatch(fetchPosts('frontend')))
        .then(() => console.log('完成'));
    ```
    在成功获取到`reactjs.json`和`frontend.json`后，会输出`完成`。

<br>
此例子的actions结构如下图所示：<br>
![图片](/images/2018-09-08-Redux-React-Subreddit-Async/actions.png)<br>
其中，`fetchPostsIfNeeded(subreddit)`的流程图如下：<br>
![图片](/images/2018-09-08-Redux-React-Subreddit-Async/fetchPostsIfNeeded.png)<br>
actions/index.js
```js
import fetch from 'cross-fetch';
// 导出action.type可能出现的四个值
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT';
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT';
export const REQUEST_SUBREDDIT = 'REQUEST_SUBREDDIT';
export const RECEIVE_SUBREDDIT = 'RECEIVE_SUBREDDIT';

// 同步actions
// 1. UI操作
// 1.1 用户选择要显示的subreddit
export function selectSubreddit(subreddit) {
    return {
        type: SELECT_SUBREDDIT,
        subreddit// subreddit: subreddit的简写
    }
}
// 1.2 用户点击刷新按钮
export function invalidateSubreddit(subreddit) {
    return {
        type: INVALIDATE_SUBREDDIT,
        subreddit
    }
}
// 2. 数据请求操作
// 2.1 获取指定的subreddit帖子
export function requestSubreddit(subreddit) {
    return {
        type: REQUEST_SUBREDDIT,
        subreddit
    }
}
// 2.2 收到响应请求
export function receiveSubreddit(subreddit, json) {
    return {
        type: RECEIVE_SUBREDDIT,
        subreddit,
        // json是对象
        // posts: json.data.children.map((child) => {return child.data}),
        posts: json.data.children.map(child => child.data),// 简写
        receiveAt: Date.now()
    }
}

// 3. 异步action
// 封装一个判断缓存值是否过期的函数
function shouldFetchPosts(state, subreddit) {
    // 获取'reactjs'或'frontend'分类下的对象:posts
    let posts = state.postsBySubreddit[subreddit];
    if (!posts) {
        // posts不存在
        return true;// 需要获取数据
    }else if (posts.isFetching) {
        // 正处在Loading...界面
        return false;// 不需要获取数据
    }else{
        // didInvalidate: true/false 表示数据是否过期。
        return posts.didInvalidate;
    }
}
// 3.1 请求数据
function fetchPosts(subreddit) {
    // 返回函数，交给thunk中间件处理
    return (dispatch) => {
        // dispatch一个action：数据请求开始
        dispatch(requestSubreddit(subreddit));
        // 使用 Fetch API 向指定的 url 请求数据
        //     https://www.reddit.com/r/reactjs.json
        //     https://www.reddit.com/r/frontend.json
        return fetch(`https://www.reddit.com/r/${subreddit}.json`)
            .then(response => response.json())
            // response.json()返回一个被解析为JSON格式的promise对象。
            .then(json => dispatch(receiveSubreddit(subreddit, json)));
    }
}
// 3.2 判断数据是否过期来决定是请求数据，还是返回一个resolved的Promise对象
export function fetchPostsIfNeeded(subreddit) {
    // 传入两个参数：dispatch 和 getState
    return (dispatch, getState) => {
        if(shouldFetchPosts(getState(), subreddit)){
            // 一个 thunk 中返回另一个 thunk
            return dispatch(fetchPosts(subreddit));
        }else{
            // Promise.resolve()返回一个解析过的Promise对象。
            // 告诉调用代码无需等待
            return Promise.resolve();
        }
    }
}
```
官网tips:
>fetch 使用须知:<br>
>本示例使用了 fetch API。它是替代 XMLHttpRequest 用来发送网络请求的非常新的 API。由于目前大多数浏览器原生还不支持它，建议你使用 cross-fetch 库：<br>
>1. 安装：`yarn add cross-fetch`
>2. 导入：
>```js
>// 每次使用 `fetch` 前都这样调用一下
>import fetch from 'cross-fetch'
>```
>
>在底层，它在浏览器端使用 whatwg-fetch polyfill，在服务器端使用 node-fetch，所以如果当你把应用改成同构时，并不需要改变 API 请求。

## 3. reducers
reducers划分为两个子reducer：
+ 1) selectedsubreddit: 负责处理state.selectedsubreddit；
+ 2) postsBySubreddit：负责处理state.postsBySubreddit。

最后使用`combineReducers()`把它们合并成一个reducer。

reducers/index.js
```js
import {combineReducers} from 'redux';

import {
    SELECT_SUBREDDIT,
    INVALIDATE_SUBREDDIT,
    REQUEST_SUBREDDIT,
    RECEIVE_SUBREDDIT
} from '../actions';

// 1. 负责处理state.selectedsubreddit  [Sting类型]
function selectedsubreddit(state = 'reactjs', action) {
    switch (action.type) {
        // 用户选择了要显示的subreddit
        case SELECT_SUBREDDIT:
            return action.subreddit;
        default:
            return state;
    }
}

// 封装一个posts函数，处理state.postsBySubreddit.frontend
// 或state.postsBySubreddit.reactjs
function posts(state = {
    isFetching: false,// 不显示Loading...进度条
    didInvalidate: false,// 数据未过期
    items: []
}, action) {
    switch (action.type) {
        // 用户点击刷新按钮
        case INVALIDATE_SUBREDDIT:
            return {
                ...state,
                didInvalidate: true// 数据已过期
            };
        // 请求数据
        case REQUEST_SUBREDDIT:
            return {
                ...state,
                isFetching: true,// 显示Loading...进度条
                didInvalidate: false// 数据未过期
            };
        // 接收到数据
        case RECEIVE_SUBREDDIT:
            return {
                ...state,
                isFetching: false,// 不显示Loading...进度条
                didInvalidate: false,// 数据未过期
                items: action.posts,
                lastUpdate: action.receiveAt
            };
        default:
            return state;
    }
}

// 2. 负责处理state.postsBySubreddit  [Object对象]
function postsBySubreddit(state = {}, action) {
    switch (action.type) {
        case INVALIDATE_SUBREDDIT:
        case REQUEST_SUBREDDIT:
        case RECEIVE_SUBREDDIT:
            return {
                ...state,
                [action.subreddit]: posts(state[action.subreddit], action)
            };
        default:
            return state;
    }
}

// 合并子reducers
const rootReducers = combineReducers({
    selectedsubreddit,
    postsBySubreddit
});
export default rootReducers;
```
注：上面的代码中，如`{...state, didInvalidate: true}`使用了ES7的对象展开运算符。它让你可以通过展开运算符 (...) , 以更加简洁的形式将一个对象的可枚举属性拷贝至另一个对象。它等价于：
```js
Object.assign({}, state, {didInvalidate: true})
```
尽管这样可行, 但 Object.assign() 冗长的写法会迅速降低 reducer 的可读性。

## 4. 中间件

Redux Thunk中间件允许action创建函数返回函数，而不是action对象。Thunk可用于延迟dispacth一个action，或仅在满足某个条件时dispatch。返回的函数接收store的方法`dispatch`和`getState`作为参数。<br>
<br>
Redux Logger中间件是一个生成Redux日志的记录工具，它可让我们像发生在自己浏览器中一样重放问题。Redux Logger不猜测错误发生的原因，也不要求用户提供屏幕截图和日志转储，而是让我们重放Redux的actions + state，网络请求，控制台日志和查看用户看到的视频。<br>
**注意**：Redux Logger必须位于中间件链的末尾，否则它将记录thunk和promise，而不是实际操作。

1. 安装中间件：
```bash
yarn add redux-thunk redux-logger
```
2. 导入中间件：
```js
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
```
3. 使用中间件：
    ```js
    import { createStore, applyMiddleware } from 'redux';
    import rootReducers from './reducers';
    
    const loggerMiddleware = createLogger();
    const store = createStore(
      rootReducer,
      applyMiddleware(
        thunkMiddleware, // 允许我们 dispatch() 函数
        loggerMiddleware // 一个很便捷的 middleware，用来打印 action 日志
      )
    );
    ```

## 5. 组件

此例子的组件划分很简单，容器组件`App`包含两个展示组件：`Picker`和`Posts`：<br>
![图片](/images/2018-09-08-Redux-React-Subreddit-Async/APP-components.png)<br>

### 5.1 入口文件

在编写组件代码前，我们先根据第4章——中间件中的内容，修改入口文件：
src/index.js
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';

import rootReducers from './reducers';
import App from './containers/App';

const loggerMiddleware = createLogger();
const store = createStore(
    rootReducers,
    applyMiddleware(
        thunkMiddleware,// 允许我们 dispatch() 函数
        loggerMiddleware// 一个很便捷的 middleware，用来打印 action 日志
    )
);
ReactDOM.render(<Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
```

### 5.2 容器组件 App

containers/App.js
```jsx
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Picker from '../components/Picker';
import Posts from '../components/Posts';
import {
    selectSubreddit,
    invalidateSubreddit,
    fetchPostsIfNeeded
} from '../actions'
import PropTypes from "prop-types";

class App extends Component {
    constructor(props) {
        super(props);
        // select()函数将被传递给Picker子组件，
        // 所以要使用bind()方法返回一个函数，此函数中的this指向此App组件。
        this.select = this.select.bind(this);
    }
    // 在第一次渲染后调用
    componentDidMount() {
        this.props.dispatch(fetchPostsIfNeeded(this.props.subreddit));
    }
    render() {
        return <div>
            <Picker
                subreddit={this.props.subreddit}
                select={this.select}
                opts={['reactjs','frontend']}
            />
            Last updated at {this.props.lastUpdate ? new Date(this.props.lastUpdate).toLocaleTimeString() : ''}.
            <button
                onClick={this.refresh.bind(this)}>
                刷新
            </button>
            {this.props.isFetching && this.props.posts.length === 0 &&
            <h1>Loading...</h1>
            }
            {!this.props.isFetching && this.props.posts.length === 0 &&
            <h1>Empty</h1>
            }
            {this.props.posts.length > 0 &&
            <div
                style={ {opacity: this.props.isFetching ? 0.5 : 1} }>
                <Posts posts={this.props.posts}/>
            </div>
            }
        </div>
    }
    // 定义点击刷新按钮执行的函数
    refresh() {
        let subreddit = this.props.subreddit;
        this.props.dispatch(invalidateSubreddit(subreddit));
        this.props.dispatch(fetchPostsIfNeeded(subreddit));
    }
    // 定义用户选择要显示的subreddit后执行的函数
    select(ev) {
        const newSubreddit = ev.target.value;
        this.props.dispatch(selectSubreddit(newSubreddit));
        this.props.dispatch(fetchPostsIfNeeded(newSubreddit));
    }
}
App.propTypes = {
    subreddit: PropTypes.string.isRequired,
    posts: PropTypes.array.isRequired,
    lastUpdate: PropTypes.number,
    didInvalidate: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired
};
const mapStateToProps = state => {
    const subreddit = state.selectedsubreddit;
    const selectedPosts = state.postsBySubreddit[state.selectedsubreddit];
    // 解构赋值
    const {
        items: posts,// 注意顺序：定义的变量posts在后面。
        lastUpdate,
        didInvalidate,
        isFetching
    } = selectedPosts ||
    // 防止selectedPosts为空
    {
        items: [],
        lastUpdate: null,
        didInvalidate: false,
        isFetching: false
    };
    return {
        subreddit,
        posts,
        lastUpdate,
        didInvalidate,
        isFetching
    }
};

// 省略第二个参数：mapDispatchToProps时，React Redux 默认将 dispatch 作为 prop 传入。
export default connect(mapStateToProps)(App);
```
<font color="red">上述代码中有几个注意点：</font>
+ 1) 解构赋值：
```js
// 解构赋值
const {
    items: posts,// 注意顺序：定义的变量posts在后面。
    lastUpdate,
    didInvalidate,
    isFetching
} = selectedPosts ||
// 防止selectedPosts为空
{
    items: [],
    lastUpdate: null,
    didInvalidate: false,
    isFetching: false
};
return {
    subreddit,
    posts,
    lastUpdate,
    didInvalidate,
    isFetching
}
```
等价于：
```js
return {
    subreddit: state.selectedsubreddit,
    posts: selectedPosts ? selectedPosts.items : [],
    lastUpdate: (selectedPosts && selectedPosts.lastUpdate) ? selectedPosts.lastUpdate : null,
    didInvalidate: selectedPosts ? selectedPosts.didInvalidate : false,
    isFetching: selectedPosts ? selectedPosts.isFetching : false
}
```
+ 2) `connect()`省略第二个参数：mapDispatchToProps时，React Redux 默认将 dispatch 作为 prop 传入。
```js
export default connect(mapStateToProps)(App);
```
`App`组件中可以使用`this.props.dispatch`。
+ 3) `bind(obj)`方法，创建一个函数的实例，其this的值会被绑定到传给`bind()`函数的值，即obj。
```js
class App extends Component {
    constructor(props) {
        super(props);
        // select()函数将被传递给Picker子组件，
        // 所以要使用bind()方法返回一个函数，此函数中的this指向此App组件。
        this.select = this.select.bind(this);
    }
}
```
this.select()被调用时，this指向App组件

### 5.3 展示组件 Picker

components/Picker.js
```jsx
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Picker extends Component{
    render() {
        return <div>
            <h1>{this.props.subreddit}</h1>
            <select name="sureddits" onChange={ev => this.props.select(ev)}>
                {this.props.opts.map((opt, index) =>
                    <option key={index} value={opt}>{opt}</option>)
                }
            </select>
        </div>
    }
}
Picker.propTypes = {
    subreddit: PropTypes.string.isRequired,
    select: PropTypes.func.isRequired,
    opts: PropTypes.array.isRequired
};
export default Picker;
```

### 5.4 展示组件 Posts

components/Posts.js:
```jsx
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Posts extends Component {
    render() {
        return <ul>
            {this.getPostsItems()}
        </ul>
    }
    getPostsItems() {
        return this.props.posts.map((post, index) => <li key={index}>{post.title}</li>)
    }
}
Posts.propTypes = {
  posts: PropTypes.array.isRequired
};
export default Posts;
```