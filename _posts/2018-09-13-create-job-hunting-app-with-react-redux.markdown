---
layout: post
title:  "学习笔记：使用Redux+React制作一款找工作的APP"
date:   2018-09-13 11:08:12 +0800
categories: learning-notes
tags: React Redux WEB前端 HTML CSS JS
---
* content
{:toc}

本文记录了使用 Redux 和 React 制作找工作APP过程中的一些要点。

## 1. 准备工作

### 1.1 快速构建应用

使用`create-react-app`快速构建单页面应用，具体过程可以参考我的笔记：[ Redux 搭配 React 完成迷你型任务管理应用 Todo List ](https://nxjniexiao.github.io/2018/09/04/Redux-React-Todo-List/)。<br>
`create-react-app`能够让我们省去安装和配置webpack、babel等工作，在此项目中我们需要自定义一些配置，所以需要运行：
```bash
npm run eject
```
运行完成后，项目根目录下会新增两个文件夹：`config`和`scripts`。

### 1.2 安装库

此应用使用 Redux 来管理 state 。所以要安装 redux 和 react-redux ：
```bash
yarn add redux react-redux
```

## 2. 登陆及注册页面

为了实现登陆和注册，我们把工作分为：
+ 1) 前端：redux + react + react-router，端口号：3000；
+ 2) 后端：nodejs + express，端口号：3030；
+ 3) 数据库：mongodb，端口号：27017；

### 2.1 前端

#### 2.1.1 依赖模块

前端使用的模块有：`react-router-dom`、`redux-thunk`、`redux-logger`、`babel-plugin-import`、`antd-mobile`、`axios`。
+ 1) React Router 是一组导航组件，它们与应用程序以声明方式组合。所以我们在写页面之前先安装 react-router-dom：
```bash
yarn add react-router-dom
```
导入：
```js
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
```
+ 2) 安装中间件：redux-thunk 和 redux-logger：
```bash
yarn add redux-thunk redux-logger
```
导入：
```js
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
```
+ 3) babel-plugin-import<br>
babel-plugin-import 是 babel 的模块化导入插件，兼容 antd，antd-mobile，lodash，material-ui 等。
```bash
yarn add babel-plugin-import --dev
```
+ 4) antd-mobile<br>
antd-mobile是一个基于 Preact / React / React Native 的 UI 组件库。
```bash
yarn add antd-mobile
```
在 package.json 中的`"babel"`字段下新增：
  ```json
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd-mobile",
        "style": "css"
      }
    ]
  ]
  ```
  使用：
  ```jsx
  import {Button} from 'antd-mobile';
  <Button type="primary">登陆</Button>
  ```
+ 5) axios<br>
axios 是基于 Promise 的 HTTP 客户端，适用于浏览器和 node.js。<br>
安装：
```bash
yarn add axios
```
引入：
```js
import axios from 'axios';
```
使用：
```js
axios.get('/user/info').then((res) => {
    if(res.status === 200) {
        console.log(res.data);
    }
});
```
注意：App 的服务端口号为`3000`，而后端服务的端口号为`3030`。为了能够在同域名下发送 API 请求，我们需要在`package.json`中新增`"proxy"`:
```json
{
  "proxy": "http://localhost:3030"
}
```
这样，前端请求：`axios.get('/user/info')`将会被代理到请求：`http://localhost:3030/user/info`。<br>
[官网解释](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development)<br>
**注：**不增加`"proxy"`字段时，请求地址将会是：`http://localhost:3000/user/info`。

#### 2.1.2 组件

登陆/注册界面有如下几个组件：
+ 1) Login：登陆；
+ 2) Register：注册；
+ 3) AuthRoute：权限管理；
+ 4) Logo: 网站logo。

**Tips:**<br>
+ 1) 组件`AuthRoute`主要用来检验用户是否有权限访问当前的url (`'localhost:3000/login'`和`'localhost:3000/register'`无需检验) 。<br>
此外此组件还通过`axios.get('/user/info').then((res) => {})`获取用户信息，判断用户是否已登录(后端根据通过req.cookies获取的登陆状态，返回不同的json)。
组件`AuthRoute`中为了能够访问 react-router 的 history/location 属性，从`react-router-dom`中引入了`withRouter`：
```jsx
import {withRouter} from 'react-router-dom';
class AuthRoute extends Component {
// AuthRoute组件中能使用this.props.history和this.props.location等。
}
export default withRouter(connect(null, mapDispatchToProps)(AuthRoute));
```
`src/index.js`中的`ReactDOM.render()`如下：
```jsx
ReactDOM.render(
    (<Provider store={store}>
        <Router>
            <div>
                <AuthRoute/>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
            </div>
        </Router>
    </Provider>),
    document.getElementById('root')
);
```
+ 2) `Login`和`Register`组件中从`react-router-dom`引入了`Redirect`，它能导航到新位置:
  ```jsx
  import {Redirect} from 'react-router-dom';
  // 使用Redirect
  render() {
    return (
      <div>
        {this.props.redirectPath?<Redirect to={this.props.redirectPath} />:null}
        /*其他操作...*/
      </div>
    );
  }
  ```

#### 2.1.3 Redux

目前的 state 结构如下：
```js
{
  user: {
    redirectPath: '',// 重定向路径
    isAuth: false,// 是否已登录
    username: '',// 用户名
    type: '',// 用户类型：boss/genius
    msg: ''// 错误信息
  }
}
```
`src/actions/actions.js`用来定义 actions 创建函数，`src/reducers/user.js`用来定义处理 state.user 的 reducer。<br>


### 2.2 后端

后端的代码中不要使用ES6的`import`、`export`和`export default`语法。

#### 2.2.1 依赖模块

后端使用的模块有：`express`、`body-parser`、`cookie-parser`、`mongoose`等。
+ 1) Express 是基于 Node.js 平台，快速、开放、极简的 Web 开发框架。<br>
安装：
```bash
yarn add express
```
使用：
```js
// server.js
const express = require('express');
const app = express();
app.use('/user', user);
// user.js
const express = require('express');
const router = express.Router();
router.post('/register', (req, res) => {/*...*/});
router.post('/login', (req, res) => {/*...*/});
router.get('/info', (req, res) => {/*...*/});
```
+ 2) body-parser 是解析主体的中间件，后端可以通过 **req.body** 访问解析后的请求主体。<br>
安装：
```bash
yarn add body-parser
```
使用：
```js
// server.js
const bodyParser = require('body-parser');
app.use(bodyParser.json());// 使用JSON body parser中间件
```
+ 3) cookie-parser 能解析 HTTP 请求 cookies。使用此中间件后，后端通过 **req.cookies** 能访问请求发送的 cookie。<br>
注：后端通过`res.cookie(name, value [, options])`设置 cookie，此方法为 Express 中 Response 对象的方法，与此中间件无关。<br>
安装：
```bash
yarn add cookie-parser
```
使用：
```js
// server.js
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // 使用cookie-parser中间件
```
+ 4) mongoose 用来连接 mongodb 数据库。<br>
安装：
```bash
yarn add mongoose
```
使用：
  ```js
  // model.js
  const mongoose = require('mongoose');
  // 连接mongodb
  const DB_URL = 'mongodb://127.0.0.1:27017/job-hunting';
  mongoose.connect(DB_URL, { useNewUrlParser: true });
  // 定义一个Model
  mongoose.model(
    'user', // 对应mongodb中的collection名称
    new mongoose.Schema({
      username: {type: String, required: true},
      pwd: {type: String, required: true},
      type: {type: String, required: true},
      //头像
      avatar:{'type':String},
    })
  );
  // 访问一个Model
  const User = mongoose.model('user');
  // 查询数据
  User.findOne({}, (err,doc) => {});
  // 插入数据
  // 我们把Model的实例称为一个document，它是与MongoDB中数据一一对应的映射。
  const instance = new User({username, pwd, type});
  instance.save((err, product) => {});
```
**注：**数据库中的 collection 名称会自动使用 user 的复数，即**users**。


### 2.3 mongodb

#### 2.3.1 安装和启动

+ 1) 安装 mongodb 数据库后，启动数据库：
```bash
mongod -dbpath F:/Database/mongodb/myproject
```
+ 2) **打开一个新的CMD**，连接服务：
```bash
mongo
```
如果成功，会提示：
```bash
connecting to: mongodb://127.0.0.1:27017
```

#### 2.3.2 常用操作

mongodb 中不需要手动创建集合，insert 数据时，若不存在此集合，会自动创建集合。

+ `show dbs`：查看所有数据库列表；
+ `use dbName`：使用/创建数据库；
+ `show collections`：查看所有集合；
+ `db.dropDatabase()`：删除当前数据库；
+ `db.COLLECTION_NAME.drop()`：删除指定集合；
+ `db.COLLECTION_NAME.insert({"name": "nxj"})`：插入数据；
+ `db.COLLECTION_NAME.find({"name": "nxj"})`：查找数据；
+ `db.COLLECTION_NAME.update({"name": "nxj"}, {$set:{"age": 20}})`：更新数据；
+ `db.COLLECTION_NAME.remove({"name": "nxj"})`：删除数据。

## 3. 完善信息页面

### 3.1 前端

新建组件如下：
+ 1) `BossInfo`：Boss 完善信息页面；
+ 2) `GeniusInfo`：牛人完善信息页面；
+ 3) `AvatarSelector`：选择头像的组件。

在`src/index.js`中使用了组件`BossInfo`和`GeniusInfo`：
```jsx
ReactDOM.render(
    (<Provider store={store}>
        <Router>
            <div>
                <AuthRoute/>
                <Route path="/boss-info" component={BossInfo}/>
                <Route path="/genius-info" component={GeniusInfo}/>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
            </div>
        </Router>
    </Provider>),
    document.getElementById('root')
);
```

在完善信息页面中填完信息后，点击保存按钮将 dispatch 一个异步 action ：update(info) 。<br>
如`BossInfo`组件中：
```jsx
// boss-info.js
class BossInfo extends Component {
    // 省略...
    render(){
        const currPath = this.props.location.pathname;// 当前路径
        const redirect = (this.props.redirectPath && (this.props.redirectPath !== currPath));// 是否需要跳转
        return (<div>
            {redirect ? <Redirect to={this.props.redirectPath}/> : null}
            {/*省略...*/}
            <Button type="primary" onClick={() => this.props.updateInfo(this.state)}>保存</Button>
        </div>)
    }
}
const mapStateToProps = state => {
    return {
        redirectPath: state.user.redirectPath
    }
};
const mapDispatchToProps = dispatch => {
    return {
        updateInfo: info => dispatch(update(info))
    }
};
export default connect(mapStateToProps,mapDispatchToProps)(BossInfo);
```
**注：**`{redirect ? <Redirect to={this.props.redirectPath}/> : null}`是为了实现点击保存按钮后由`/boss-info`至`/boss`的跳转。<br>
<br>
`actions.js`中定义的异步 action : `update()`中使用 POST 方法向后端传输信息：
```js
// Thunk(返回一个函数): 更新用户信息
export function update(info){
    return dispatch => {
        axios.post('/user/update', info)
            .then(res => {
                if(res.status === 200 && res.data.code === 0){
                    dispatch(authSuccess(res.data.info));//更新成功
                }else {
                    dispatch(errMsg(res.data.msg));//更新失败
                }
            }).catch(err => console.log(err));
    }
}
```

### 3.2 后端

后端接收到信息后，将其保存到 mongodb 数据库中。<br>
server/user.js:
```js
// 处理更新用户信息: axios.post('/user/update', {})
router.post('/update', (req, res) => {
    // 获取cookie中的_id，判断用户是否已登录
    if(req.cookies && req.cookies._id){
        // 已登录
        const _id = req.cookies._id;
        console.log('_id: '+_id);
        User.findOneAndUpdate({_id}, req.body, (err, doc) => {
            if(err){
                res.json({code: 1, msg: '后端错误！'});
            }else{
                console.log(doc);
                doc.pwd = null;
                // doc为插入数据前，在数据库中查找到的数据
                const info = Object.assign({}, {type: doc.type}, req.body);
                // 注意：不要直接复制doc，因为会复制doc中其他不需要的可枚举属性。
                // const info = Object.assign({}, doc, req.body);
                res.json({code: 0, info: info});
            }
        });
    } else {
        // 未登录，_id不存在
        res.json({code: 1, msg: '无登陆信息'});
    }
});
```
**注：**`Model.findOneAndUpdate(conditions, update, callback)`的回调函数 callback 中的参数 doc 为数据库中更新前的数据，所以返回 json 时，要和 req.body (要保存的信息) 一起返回：
```js
const info = Object.assign({}, {type: doc.type}, req.body);
```
其中我们没有直接复制 doc ：`const info = Object.assign({}, doc, req.body);`，原因是：<br>
如果直接复制 doc，我们会发现 doc.type 等，实际是保存在 doc._doc.type 中的。<br>
(不使用 Object.assign ，直接返回 doc ：`res.json({code: 0, info: doc});`则不会出现此情况。)<br>
<br>
我们只需要 doc.type 属性来更新 state.user.redirectPath 的值，实现点击保存后由`/boss-info`至`/boss`的跳转。