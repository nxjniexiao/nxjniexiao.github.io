---
layout: post
title:  "Redux搭配React完成迷你型任务管理应用 Todo List"
date:   2018-09-04 15:36:12 +0800
categories: learning-notes
tags: WEB前端 Redux React
---


Redux官网[cn.redux.js.org](https://cn.redux.js.org/docs/basics/ExampleTodoList.html)中有一个小例子：Todo List。官方源码地址：[redux-todos](https://github.com/reduxjs/redux/tree/master/examples/todos)。<br>
此文记录了自己完成此例子的过程。

## 1. 使用create-react-app快速构建单页面应用

[create-react-app](https://github.com/facebook/create-react-app#creating-an-app)能够让我们省去安装和配置webpack、babel等工作，从而能够让我们把精力放在代码上。<br>
安装过程如下：
```bash
npx create-react-app 01-todos
```
安装完成后：
```bash
cd 01-todos
yarn start
```
然后我们可以在浏览器地中输入`http://localhost:3000/`来访问我们的页面了。<br>
初始的文件结构如下:
```
01-todos/
  README.md
  node_modules/...
  package.json
  public/
    index.html
    favicon.ico
  src/
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
```
**<font color="red">注意：</font>**
+ 1) 其中有两个文件不能删除：
   + `public/index.html`：模板文件；
   + `src/index.js`：JS入口文件。
+ 2) Webpack只能处理`src`文件夹中的文件，所以JS和CSS文件要放在src中，或其子目录中；
+ 3) `public/index.html`只能引入`public`文件夹中的文件。




## 2. 准备工作

### 2.1 删除、修改文件
删除不需要的文件后，文件结构如下：
```
01-todos/
  node_modules/...
  package.json
  yarn.lock
  .gitignore
  public/
    index.html
  src/
    index.js
```
修改`public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <title>Todo List</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
</html>
```
修改`src/index.js`：
```jsx
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<div>test</div>, document.getElementById('root'));
```
重新运行`yarn start`，用浏览器访问`http://localhost:3000/`，页面中出现`test`。

### 2.2 新增文件夹

在`src`文件夹中新建如下文件夹：
+ `actions`：存放actions创建函数的文件；
+ `components`：存放描述如何展现的展示组件；
+ `containers`：存放描述如何运行的容器组件；
+ `reducers`：存放处理actions的reducer文件。

修改后文件结构如下：
```
01-todos/
  node_modules/...
  package.json
  yarn.lock
  .gitignore
  public/
    index.html
  src/
    actions/
    components/
    containers/
    reducers/
    index.js
```

### 2.3 安装库

+ 1) 安装redux：
```bash
yarn add redux
```
若使用npm工具安装：
```bash
npm install --save redux
```
+ 2) 安装react-redux：
```bash
yarn add react-redux
```
+ 3) 安装prop-types：
```bash
yarn add prop-types
```

## 3. 逻辑代码

Todo List的界面如下：<br>
![图片](/images/2018-09-04-Redux-React-Todo-List/Todo-List-UI.png)<br>
此页面有如下三个功能：
1. 在输入框中输入内容，点击`Add Todo`按钮后，新增一条待办事项；
2. 在某一条待办事项上单击鼠标，此事项会在两个状态之间切换：未完成/已完成，删除线表示已完成；
3. 页面下方有三个筛选按钮，可以用来显示所有、显示未完成或显示已完成；

Todo List需要保存两种不同的数据：
+ 当前选中的任务过滤条件；
+ 完整的任务列表。

因此state的结构如下：
```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

### 3.1 Reducer

接下来我们要创建reducers，实现上述三个功能。<br>
reducer 是一个纯函数，接收旧的 state 和 action，返回新的 state。<br>
所有的reducer放在reducers文件夹中，结构如下图：
![图片](/images/2018-09-04-Redux-React-Todo-List/reducers-folder.png)

#### 3.1.1 todo.js

<span id="3-1-1"></span>
`reducers/todo.js`负责处理state.todos数组：
```js
import {ADD_TODO, TOGGLE_TODO} from '../actions'

// 传入(拆分后的)state：state.todos
const todos = (state = [], action) => {
    switch (action.type){
        case ADD_TODO:
            return [
                ...state,
                {
                    text: action.text,
                    completed: false
                }
            ];
        case TOGGLE_TODO:
            return state.map((todo, index) => {
                if(index === action.index){
                    return {
                        ...todo,
                        completed: !todo.completed
                    }
                }
                return todo;
            });
        default:
            return state;
    }
};

export default todos;
```
#### 3.1.2 visibilityFilter.js

<span id="3-1-2"></span>
`reducers/visibilityFilter.js`负责处理state.visibilityFilter：
```js
import {SET_VISIBILITY_FILTER, VisibilityFilters} from '../actions'

// 传入(拆分后的)state：state.visibilityFilter
const visibilityFilter = (state = VisibilityFilters.SHOW_ALL, action) => {
    switch (action.type){
        case SET_VISIBILITY_FILTER:
            return action.filter;
        default:
            return state;
    }
};
export default visibilityFilter;
```

#### 3.1.3 index.js

`reducers/index.js`负责使用`combineReducers()`把todos.js和visibilityFilter.js合并成一个reducer：
```js
import {combineReducers} from 'redux';
import todos from './todos.js';
import visibilityFilter from './visibilityFilter.js';

const rootReducer = combineReducers({
    todos,
    visibilityFilter
});
export default rootReducer;
```

### 3.2 Actions

我们可以看到在3.1.1的[todos.js](#3-1-1)和3.1.2的[visibilityFilter.js](#3-1-2)中引入了`../actions`文件夹中的函数和变量：<br>
**注：**`actions`文件夹中有`index.js`，所以实际引入的是`../actions/index.js`。
```js
// todos.js中：
import {ADD_TODO, TOGGLE_TODO} from '../actions'
// visibilityFilter.js中
import {SET_VISIBILITY_FILTER, VisibilityFilters} from '../actions'
```
这是因为官网中推荐我们使用单独的文件/文件夹来存放actions，方便维护。<br>

#### 3.2.1 index.js
`actions/index.js`中存放着常量和创建action的函数。<br>
actions/index.js:
```js
// 导出常量：action.type中的三个值
export const ADD_TODO = 'ADD_TODO';// 新增待办事项
export const TOGGLE_TODO = 'TOGGLE_TODO';// 修改待办事项
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';// 设置筛选条件

// 导出其他常量: state.visibilityFilter中的三个值
export const VisibilityFilters = {
    SHOW_ALL: 'SHOW_ALL',// 显示全部
    SHOW_COMPLETED: 'SHOW_COMPLETED',// 显示已完成
    SHOW_UNCOMPLETED: 'SHOW_UNCOMPLETED'// 显示未完成
};

// 创建actions的函数:
// 1.创建新增待办事项的action
export function addTodo (text) {
    return {
        type: ADD_TODO,
        text// text: text的简写
    }
}
// 2.创建修改待办事项的action
export function toggleTodo (index) {
    return {
        type: TOGGLE_TODO,
        index
    }
}
// 3. 创建修改筛选条件的action
export function setVisibilityFilter (filter){
    return {
        type: SET_VISIBILITY_FILTER,
        filter
    }
}
```

### 3.3 测试逻辑代码

在`src/index.js`文件中新增测试代码，来检测逻辑是否合理。<br>
src/index.js:
```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';

/*************************新增测试用代码*************************/
import {createStore} from 'redux';
import rootReducer from './reducers';
// 引入创建action的函数
import {addTodo, toggleTodo, setVisibilityFilter} from './actions'
//创建store
let store = createStore(rootReducer);

// 设置监听：每次 state 更新时，打印日志
// 注意 subscribe() 返回一个函数用来注销监听器
const unsubscribe = store.subscribe(()=> {
    console.log(store.getState());
});
// 新增待办事项
store.dispatch(addTodo('新建待办事项1'));
store.dispatch(addTodo('新建待办事项2'));
store.dispatch(addTodo('新建待办事项3'));
// 把第一个待办事项标记为：已完成(completed: true)
store.dispatch(toggleTodo(0));
// 把筛选条件改为 visibilityFilter: "SHOW_COMPLETED"
store.dispatch(setVisibilityFilter('SHOW_COMPLETED'));

// 取消监听
unsubscribe();
/*************************测试代码 END*************************/

ReactDOM.render(<App />, document.getElementById('root'));
```
修改完成后，在浏览器中打开`http://localhost:3000/`的Console页面，查看输出信息：
![图片](/images/2018-09-04-Redux-React-Todo-List/test-reducers-actions.png)

## 4. 组件
Redux 的 React 绑定库是基于**容器组件**和**展示组件**相分离的开发思想。<br>
它们的区别如下：<br>

区别|展示组件 |	容器组件
---: | --- | ---
作用 |	描述如何展现（骨架、样式） |	描述如何运行（数据获取、状态更新）
直接使用 Redux |	否 |	是
数据来源 |	props |	监听 Redux state
数据修改 |	从 props 调用回调函数 |	向 Redux 派发 actions
调用方式 |	手动 |	通常由 React Redux 生成

Todo List的界面如下：<br>
![图片](/images/2018-09-04-Redux-React-Todo-List/Todo-List-components.png)

Todo List各组件之间的关系如下：<br>
![图片](/images/2018-09-04-Redux-React-Todo-List/components.png)

### 4.1 入口文件中传入Store

>所有容器组件都可以访问 Redux store，所以可以手动监听它。一种方式是把它以 props 的形式传入到所有容器组件中。但这太麻烦了，因为必须要用 store 把展示组件包裹一层，仅仅是因为恰好在组件树中渲染了一个容器组件。

>建议的方式是使用指定的 React Redux 组件 &lt;Provider&gt; 来 魔法般的 让所有容器组件都可以访问 store，而不必显式地传递它。只需要在渲染根组件时使用即可。

所以我们修改入口文件src/index.js(记得删除前面编写的测试用代码)：
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import { Provider } from 'react-redux'
import rootReducer from './reducers';
import App from './components/App.js';

//创建store
let store = createStore(rootReducer);
// 使用指定的 React Redux 组件 <Provider> 来让所有容器组件
// 都可以访问 store，而不必显式地传递它。只需要在渲染根组件时使用即可。
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
```
### 4.2 根组件 App

三大子组件`AddTodo`、`VisibleTodoList`和`Filter`最终都引入到了根组件`App`中：
```jsx
import './App.css';
import React, {Component} from 'react';
import AddTodo from '../containers/AddTodo.js'
import VisibleTodoList from '../containers/VisibleTodoList.js';
import Filter from './Filter.js'

class App extends Component{
    render() {
        return <div>
            <AddTodo />
            <VisibleTodoList />
            <Filter />
        </div>
    }
}
export default App;
```

### 4.3 实现容器组件

在编写组件之前，我们得先了解如何实现容器组件，把组件和Redux store关联起来：<br>
+ Store中的State数据发生变化时，相应的组件重新渲染；
+ 在组件中派发actions时，修改Store中相应的State数据。

官网建议使用 React Redux 库的 connect() 方法来生成容器组件，这个方法做了性能优化来避免很多不必要的重复渲染。

#### 4.3.1 函数connect()

`connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])(MyComp)`<br>
函数connect返回一个容器组件，能够让组件`MyComp`使用由store传入的数据和方法。

#### 4.3.2 函数mapStateToProps

>mapStateToProps(state, [ownProps]): stateProps<br>
>将 store 中的数据作为 props 绑定到组件上。<br>
>第二个可选参数 ownProps ，是组件自己的 props。

```js
const mapStateToProps = state => {
  return {
    name: value// value通常为state中的某一部分数据
  }
}
```
组件`MyComp`中可以使用`this.props.name`，其值为`value`。

#### 4.3.3 函数mapDispatchToProps

>mapDispatchToProps(dispatch, [ownProps]): dispatchProps<br>
>将 action 作为 props 绑定到组件上。<br>
>第二个可选参数 ownProps 同上。

```js
const mapDispatchToProps = dispatch => {
  return {
    name: func// func中可以使用dispach()来发出action
    }
  }
}
```
组件中`MyComp`可以使用`this.props.name`，来调用函数`func`。



### 4.4 新增事项组件

`AddTodo`是一个混合型的小组件，目前没必要把它拆分成两个组件。<br>
containers/AddTodo.js:
```jsx
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addTodo} from "../actions";
import PropTypes from 'prop-types';

class AddTodo extends Component{
    render() {
        return <div>
            <input
                ref="input"
                type="text"
                style={ {marginRight: '5px'} }
            />
            <input
                type="button"
                value="添加待办事项"
                onClick={this.add.bind(this)}
            />
        </div>
    }
    // 定义点击添加待办事项方法
    add() {
        let text = this.refs['input'].value.trim();
        this.props.addTodo(text);// 调用store传入的方法addTodo()
        this.refs['input'].value = '';
    }
}

// 定义mapDispathToProps，分发action，将addTodo函数作为props传给组件
const mapDispatchToProps = dispatch => {
    return {
        addTodo: text => {
            dispatch(addTodo(text));
        }
    }
};

// 使用 PropTypes 进行类型检查
AddTodo.propTypes = {
    addTodo: PropTypes.func.isRequired
};
// 注意mapDispatchToProps为第二个参数，第一个参数为空。
export default connect(null, mapDispatchToProps)(AddTodo);
```

### 4.5 显示事项组件

根据前面的组件结构图，三个组件关系为：<br>
`VisibleTodoList.js` --> `TodoList.js` --> `Todo.js`<br>

#### 4.5.1 VisibleTodoList

容器组件`VisibleTodoList`中引入了展示组件`TodoList`，然后使用`connect(...args)(TodoList)`传给`TodoList`组件两个属性：
+ 1) `filteredTodos`：根据`state.visibilityFilter`从`state.todos`数组中筛选出满足条件的数组；
+ 2) `toggle()`：发送修改todo.completed的action，待办事项被点击时调用此函数。

containers/VisibleTodoList.js:
```jsx
import {connect} from 'react-redux';
import TodoList from '../components/TodoList.js';
import {toggleTodo, VisibilityFilters} from "../actions";

// 定义函数getFilteredTodos：根据条件筛选todos数组
function getFilteredTodos (state) {
    // 筛选条件:'SHOW_ALL'、'SHOW_COMPLETED'、'SHOW_UNCOMPLETED'
    const filter = state.visibilityFilter;
    switch (filter) {
        case VisibilityFilters.SHOW_ALL:
            return state.todos;
        case VisibilityFilters.SHOW_COMPLETED:
            return state.todos.filter((todo) => {
                return todo.completed;
            });
        case VisibilityFilters.SHOW_UNCOMPLETED:
            return state.todos.filter((todo) => {
                return !todo.completed;
            });
        default:
            throw new Error('Unknown Filter: ' + filter);
    }
}

// 定义mapStateToProps，把store.state中筛选后的todos映射到组件
const mapStateToProps = state => {
    return {
        filteredTodos: getFilteredTodos(state)
    }
};

// 定义mapDispathToProps，分发action，将toggle函数作为props传给组件
const mapDispatchToProps = dispatch => {
    return {
        toggle: id => {
            dispatch(toggleTodo(id))
        }
    }
};

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);
export default VisibleTodoList;
```

#### 4.5.2 TodoList

`TodoList`拿到容器组件`VisibleTodoList`传递过来的`filteredTodos`和`toggle()`后，根据数组`filteredTodos`渲染引入进来的子组件`Todo`，并把`toggle()`传递给了`Todo.js`。<br>
components/TodoList.js:
```jsx
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Todo from './Todo.js';

class TodoList extends Component{
    render() {
        return <ul>
            {this.todosItem(this.props.filteredTodos)}
        </ul>
    }
    // todosItem(): 根据数组返回一个包含li元素的数组
    todosItem(filteredTodos) {
        let todosItem = filteredTodos.map((todo, index) => {
            return <Todo
                key={index}
                index={index}
                text={todo.text}
                completed={todo.completed}
                toggle={this.props.toggle}
            />
        });
        return todosItem;
    }
}
// 使用 PropTypes 进行类型检查
TodoList.propTypes={
    // PropTypes.arrayOf: 一个指定元素类型的数组
    // PropTypes.shape: 一个指定属性及其类型的对象
    filteredTodos: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string,
        completed: PropTypes.bool
    }).isRequired).isRequired,
    toggle: PropTypes.func.isRequired
};
export default TodoList;
```

#### 4.5.2 Todo

`Todo`拿到了`TodoList`传递过来的`toggle()`后，渲染&lt;li&gt;元素，并给其添加一个点击函数，调用`toggle()`。<br>
components/Todo.js:
```jsx
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Todo extends Component{
    render() {
        return <li
            onClick={this.toggle.bind(this)}
            style={ {textDecoration: this.props.completed ? 'line-through': 'none'} }>
            <a href="javascript:;">{this.props.text}</a>
        </li>
    }
    // 定义li元素被点击时执行的函数toggle()
    toggle() {
        this.props.toggle(this.props.index);
    }
}
// 使用 PropTypes 进行类型检查
Todo.propTypes = {
    index: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default Todo;
```

### 4.6 筛选事项组件

根据前面的组件结构图，三个组件关系为：<br>
`Filter.js` --> `FilterButton.js` --> `Button.js`<br>

#### 4.6.1 Filter
展示组件`Filter`中引入容器组件`FilterButton`，然后根据数组`buttons`渲染出包含三个`FilterButton`组件的&lt;div&gt;元素。
```jsx
import React, {Component} from 'react';
import FilterButton from '../containers/FilterButton.js';
import {VisibilityFilters} from '../actions';

class Filter extends Component{
    render() {
        return <div>
            显示：
            {this.getButtons()}
        </div>
    }
    // getButtons()：根据数组buttons生成一个包含FilterButton组件的数组。
    getButtons() {
        let buttons = [
            {name: '全部', filter: VisibilityFilters.SHOW_ALL},
            {name: '未完成', filter: VisibilityFilters.SHOW_UNCOMPLETED},
            {name: '已完成', filter: VisibilityFilters.SHOW_COMPLETED}
        ];
        return buttons.map((button, index) => {
            return <FilterButton
                key={index}
                name={button.name}
                filter={button.filter}
            />
        })
    }
}
export default Filter;
```

#### 4.6.2 FilterButton
容器组件`FilterButton`中引入了展示组件`Button`，然后使用`connect(...args)(Button)`传给`Button`组件两个属性：
+ `active`：true/false，Button组件通过`disabled={this.props.active}`控制button元素是否可以被点击；
+ `setFilter()`：发送修改state.visibilityFilter的action，Button组件中的button元素被点击时调用此函数。

```jsx
import {connect} from 'react-redux';
import {setVisibilityFilter} from '../actions';
import Button from '../components/Button.js';

// 定义mapStateToProps，把active属性映射到组件
const mapStateToProps = (state, ownProps) => {
    return {
        active: state.visibilityFilter === ownProps.filter
    }
};

// 定义mapDispathToProps，分发action，将filter()作为props传给组件
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setFilter: () => {
            dispatch(setVisibilityFilter(ownProps.filter))
        }
    }
};

const FilterButton = connect(mapStateToProps, mapDispatchToProps)(Button);
export default FilterButton;
```

#### 4.6.3 Button

展示组件`Button`根据传入的属性渲染button元素。
```jsx
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Button extends Component{
    render() {
        return <button
            className='button'
            disabled={this.props.active}
            onClick={this.setFilter.bind(this)}>
            {this.props.name}
        </button>
    }
    // 设置点击按钮调用的函数
    setFilter() {
        this.props.setFilter();
    }
}
// 使用 PropTypes 进行类型检查
Button.propTypes = {
    name: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    setFilter: PropTypes.func.isRequired
};
export default Button;
```