---
layout: post
title: '设计模式 03 — 策略模式'
date: 2020-07-29 09:13:00 +0800
categories: 设计模式
tags: JS
---


## 1. 定义

《JavaScript 设计模式与开发实践》中对策略模式的定义如下：

> 策略模式的定义是：定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换。




## 2. 案例

在 Web 项目中，我们在发请求前都会先验证参数，满足要求后才会发请求，如下面预约会议的函数 `submit` ：

JS
```js
var submit = function (meeting) {
  // 1. 会议名称
  if (!meeting.name) {
    return console.log('会议名称不能为空');
  }
  if (meeting.name.length > 50) {
    return console.log('会议名称长度不能超过50');
  }
  // 2. 会议开始时间
  if (meeting.startTime < new Date()) {
    return console.log('会议开始时间不能小于当前时间');
  }
  // 3. 会议时长
  if (meeting.duration <= 0) {
    return console.log('会议时长必须大于零');
  }
  // 4. 会议室数量
  // 4.1 本地、视频会议需要选择会议室
  if (
    (meeting.type === 'LOCAL' || meeting.type === 'VIDEO') &&
    meeting.roomList.length === 0
  ) {
    return console.log('请选择一个会议室');
  }
  // 4.2 本地会议只能选择一个会议室
  if (meeting.type === 'LOCAL' && meeting.roomList.length > 1) {
    return console.log('本地会议只能选择一个会议室');
  }
  // 验证通过，发起请求...
};

// 提交表单
submit({
  name: 'name',
  startTime: +new Date() + 3600,
  duration: 60,
  type: 'LOCAL',
  roomList: ['room1'],
});
```

这种常见的编写方式有如下缺点：

1. `submit` 函数比较庞大，包含了很多 `if/else` 语句。
2. `submit` 函数缺乏弹性，如果需要新增规则，或者最大会议名称长度变为了 `40` ，都需要深入此函数的内部实现。
3. `submit` 函数中逻辑的复用性差，比如当其他表单也需要验证某个**必填项**参数时，也需要实现一遍 `meeting.name` 的判断逻辑：
   ```js
   var submit = function (user) {
     // 1. 用户名称
     if (!user.name) {
       return console.log('用户名称不能为空');
     }
     // 其他验证...
     // 验证通过，发起请求...
   };
   ```

## 3. JS 版策略模式

>将不变的部分和变化的部分隔开是每个设计模式的主题，策略模式也不例外，策略模式的目的就是将**算法的使用**与**算法的实现**分离开来。

>一个基于策略模式的程序至少由两部分组成。第一个部分是一组**策略类**，策略类封装了具体的算法，并负责具体的计算过程。
> 第二个部分是**环境类**Context，Context 接受客户的请求，随后把请求委托给某一个策略类。要做到这点，说明Context 中要维持对某个策略对象的引用。

### 3.1 环境类 Context

我们先实现作为 `Context` 的 `Validator` 类，它负责接收用户的请求并委托给**策略对象**：

1. `Validator` 有一个属性 `rulesMap` 用于存放针对每个 `key` 的规则数组，数组中每个对象都有个 `strategy` 指定的验证函数，即**策略对象**。
   JS
   ```js
   this.rulesMap =
   {
     name: [
       { strategy: validateFn1 },
       { strategy: validateFn2 }
     ]
   }
   ```
2. `Validator` 原型上有两个方法：用于添加验证规则的 `add()` 和 进行验证的 `validate()`。

最终实现如下：

JS
```js
/**
 *  Validator 类
 *  @params {Object} rulesObj 规则对象，key 为需要验证的键名，value 为验证规则数组。
 *          内部会遍历该对象并调用 this.add() 去添加验证规则。
 */
var Validator = function (rulesObj) {
  this.rulesMap = Object.create(null); // 验证规则
  var keys = Object.keys(rulesObj || {});
  keys.forEach((key) => {
    this.add(key, rulesObj[key]);
  });
};

/**
 *  添加验证规则
 *  @params {String} key 指定参数对象中需要验证的键名
 *  @params {Array} rules 验证规则数组
 */
Validator.prototype.add = function (key, rules) {
  this.rulesMap[key] = rules;
  rules.forEach((rule) => {
    rule.strategy = getStrategy(rule);
  });
};

/**
 *  验证参数
 *  @params {Object} params 需要验证的参数对象。
 */
Validator.prototype.validate = function (params) {
  var keys = Object.keys(this.rulesMap);
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    var rules = this.rulesMap[key];
    for (var j = 0, l = rules.length; j < l; j++) {
      var rule = rules[j];
      if (
        (!(key in params) && !rule.required) ||
        typeof rule.strategy !== 'function'
      )
        continue;
      var value = params[key];
      var msg = rule.strategy(value, params);
      if (msg) {
        console.log(msg);
        return msg;
      }
    }
  }
};
```

### 3.2 策略对象

JavaScript 语言中函数是一等对象，可以作为参数四处传递，因此我们可以直接用**函数**封装**策略**。

例如添加会议开始时间验证规则的代码如下：

JS
```js
validator.add('startTime', [
  {
    strategy: function (value) {
      if (value < new Date()) {
        return '会议开始时间不能小于当前时间';
      }
    }
  }
]);
```

此外，由于**必填项**、**数值范围**和**字符串长度**的验证很常见，因此这些验证被设计成以配置项方式传入，如：

JS
```js
validator.add('name', [
  {
    required: true,
    msg: '会议名称不能为空'
  },
  {
    maxLen: 10,
    msg: '会议名称长度不能超过10'
  }
]);
```

因此需要一个工厂函数 `getStrategy()` 来生成策略对象:

JS
```js
// 根据 rule（规则）计算 strategy（验证函数）
function getStrategy(rule) {
  if (rule.strategy) return rule.strategy;
  if (rule.hasOwnProperty('required')) {
    // required（必填项）
    return required;
  } else if (rule.hasOwnProperty('min') || rule.hasOwnProperty('max')) {
    // min（最小值） & max（最大值）
    return range;
  } else if (rule.hasOwnProperty('minLen') || rule.hasOwnProperty('maxLen')) {
    // minLen（最小长度） & maxLen（最大长度）
    return len;
  }
}

// 判断必填项
function required(value) {
  if (!value) return this.msg;
}

// 判断数值大小
function range(value) {
  var min = this.min;
  var max = this.max;
  if ((min != null && value < min) || (max != null && value > max)) {
    return this.msg;
  }
}

// 判断字符串长度
function len(value) {
  var minLen = this.minLen;
  var maxLen = this.maxLen;
  if (
    (minLen != null && value.length < minLen) ||
    (maxLen != null && value.length > maxLen)
  ) {
    return this.msg;
  }
}
```

### 3.3 重构 submit

重构后的 `submit()` 函数：

JS
```js
var submit = function (meeting) {
  var msg = validateMeeting(meeting);
  if (msg) return console.log(msg);
  // 验证通过，发起请求...
};
```

验证参数的逻辑被放在 `validateMeeting()` 函数中：

JS
```js
function validateMeeting(meeting) {
  var validator = new Validator({
    // 会议名称的校验规则
    name: [
      {
        required: true,
        msg: '会议名称不能为空',
      },
      {
        maxLen: 50,
        msg: '会议名称长度不能超过50',
      },
    ],
    // 开始时间的校验规则
    startTime: [
      {
        strategy: function (value) {
          if (value < new Date()) {
            return '会议开始时间不能小于当前时间';
          }
        },
      },
    ],
    // 会议时长的校验规则
    duration: [
      {
        min: 1,
        msg: '会议时长必须大于零',
      },
    ],
    // 会议室的校验规则
    roomList: [
      {
        strategy: function (value, params) {
          var meeting = params;
          // 1 本地、视频会议需要选择会议室
          if (
            (meeting.type === 'LOCAL' || meeting.type === 'VIDEO') &&
            meeting.roomList.length === 0
          ) {
            return '请选择一个会议室';
          }
          // 2 本地会议只能选择一个会议室
          if (meeting.type === 'LOCAL' && meeting.roomList.length > 1) {
            return '本地会议只能选择一个会议室';
          }
        },
      },
    ],
  });
  return validator.validate(meeting);
}
```

### 3.3 重构后的优点

1. 维护性高。我们仅仅通过“配置”的方式就可以完成一个表单的校验，当会议名称的规则变为"会议名称长度不能超过40"时，我们只需要修改配置即可：
   ```js
   var rule = // 此行为代码高亮需要
   {
     maxLen: 40,
     msg: '会议名称长度不能超过40',
   }
   ```
2. 复用性高。`Validator` 类和计算策略对象的 `getStrategy()` 可以在程序的其他地方复用，也可以很方便地移植到其他项目中。
