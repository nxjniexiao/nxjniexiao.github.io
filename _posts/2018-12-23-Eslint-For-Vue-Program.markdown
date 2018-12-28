---
layout: post
title: "给 Vue 项目添加 Eslint"
date: 2018-12-23 10:12:12 +0800
categories: learning-notes
tags: WEB前端 Vue
---
* content
{:toc}

## 1. 关于 Eslint

>ESLint 是一个开源的 JavaScript 代码检查工具，由 Nicholas C. Zakas 于2013年6月创建。代码检查是一种静态的分析，常用于寻找有问题的模式或者代码，并且不依赖于具体的编码风格。对大多数编程语言来说都会有代码检查，一般来说编译程序会内置检查工具。

>JavaScript 是一个动态的弱类型语言，在开发中比较容易出错。因为没有编译程序，为了寻找 JavaScript 代码错误通常需要在执行过程中不断调试。像 ESLint 这样的可以让程序员在编码的过程中发现问题而不是在执行的过程中。

>ESLint 的初衷是为了让程序员可以创建自己的检测规则。ESLint 的所有规则都被设计成可插入的。ESLint 的默认规则与其他的插件并没有什么区别，规则本身和测试可以依赖于同样的模式。为了便于人们使用，ESLint 内置了一些规则，当然，你可以在使用过程中自定义规则。

## 2. 在 Vue 项目中新增 Eslint

我们在使用 `vue-cli` 初始化项目时，可以选择使用 `Eslint` 来检查代码。但是对于之前没有使用 `Eslint` 的 `Vue` 项目，当我们想增加此模块来检查代码时，可以先用 `vue-cli` 新建一个项目，然后把相关的配置复制到以前的项目中。<br>
注：我的 `vue-cli` 版本为 `2.9.6`。




+ 1) `vue init webpack project-name`: 新建项目，项目名称随便填一个;
+ 2) 把新项目中的 `.eslintrc.js` 拷贝到旧项目中；
  ```js
  // https://eslint.org/docs/user-guide/configuring

  module.exports = {
    root: true,
    parserOptions: {
      parser: 'babel-eslint'
    },
    env: {
      browser: true,
    },
    extends: [
      // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
      // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
      'plugin:vue/essential', 
      // https://github.com/standard/standard/blob/master/docs/RULES-en.md
      'standard'
    ],
    // required to lint *.vue files
    plugins: [
      'vue'
    ],
    // add your custom rules here
    rules: {
      // allow async-await
      'generator-star-spacing': 'off',
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  }
  ```
+ 3) 在 `build/webpack.base.conf.js` 中新增代码
  ```js
  // 省略。。。
  const createLintingRule = () => ({
    test: /\.(js|vue)$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [resolve('src'), resolve('test')],
    options: {
      formatter: require('eslint-friendly-formatter'),
      emitWarning: !config.dev.showEslintErrorsInOverlay
    }
  })
  module.exports = {
    // 省略。。。
    module: {
      rules: [
        ...(config.dev.useEslint ? [createLintingRule()] : []),
        // 省略。。。
      ]
    }
    // 省略。。。
  }
  ```
+ 4) 在 `config/index.js` 中新增代码
```js
module.exports = {
  dev: {
    // 省略。。。
    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,
    // 省略。。。
  },
  // 省略。。。
}
```
+ 5) 在 `package.json` 中增加依赖包
  ```json
  "devDependencies": {
    "babel-eslint": "^8.2.1",

    "eslint": "^4.15.0",
    "eslint-config-standard": "^10.2.1",
    "eslint-friendly-formatter": "^3.0.0",
    "eslint-loader": "^1.7.1",
    "eslint-plugin-import": "^2.7.0",
    "eslint-plugin-node": "^5.2.0",
    "eslint-plugin-promise": "^3.4.0",
    "eslint-plugin-standard": "^3.0.1",
    "eslint-plugin-vue": "^4.0.0",
  }
  ```

最后安装依赖后，重启项目。

## 3. Eslint 规则

### 3.1 分号

+ `semi: ["error", "always"]`: 语句末尾使用分号；
+ `semi: ["error", "never"]`: 语句末尾禁止使用分号。

### 3.2 单/双引号

+ `quotes: ["error", "double"]`: 双引号；
+ `quotes: ["error", "single"]`: 单引号。

### 3.3 函数左圆括号前是否加空格

+ `'space-before-function-paren': ['error', 'always']`: 加空格；
+ `'space-before-function-paren': ['error', 'never']`: 不加空格。