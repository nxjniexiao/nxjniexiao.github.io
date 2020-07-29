---
layout: post
title: '设计模式 03 — 策略模式'
date: 2020-07-29 09:13:00 +0800
categories: 设计模式
tags: js
---

* content
{:toc}

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
3. `submit` 函数中逻辑的复用性差，当其他表单也需要验证某个**必填项**参数时，也需要实现一遍 `meeting.name` 的判断逻辑：
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

### 3.1 Context

我们先是实现作为 `Context` 的 `Validator` 类，它负责接收用户的请求并委托给**策略对象**。

JS
```js
// Validator 类
var Validator = function (rulesObj) {
  this.rulesMap = Object.create(null); // 验证规则
  var keys = Object.keys(rulesObj || {});
  keys.forEach((key) => {
    this.add(key, rulesObj[key]);
  });
};

// 添加验证规则
Validator.prototype.add = function (key, rules) {
  this.rulesMap[key] = rules;
  rules.forEach((rule) => {
    rule.strategy = getStrategy(rule);
  });
};

// 验证参数
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

JavaScript 语言中函数是一等对象，可以作为参数四处传递，因此我们可以直接用函数封装策略。

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

由于必填项、数值范围和字符串长度验证很常见，因此把这些验证设计成以配置项方式传入，如：

JS
```js
var rule = {
  name: [
    {
      required: true,
      msg: '会议名称不能为空',
    },
    {
      maxLen: 10,
      msg: '会议名称长度不能超过10',
    }
  ],
};
```

### 3.3 重构 submit

重构后的 `submit` 函数：

JS
```js
var submit = function (meeting) {
  var msg = validateMeeting(meeting);
  if (msg) return console.log(msg);
  // 验证通过，发起请求...
};
```

负责验证参数的 `validateMeeting` 函数如下：

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
2. 复用性高。`Validator` 类和计算策略对象的 `getStrategy` 可以在程序的其他地方复用，也可以很方便地移植到其他项目中。
