---
layout: post
title:  "Node.js 处理 HTTP 范围请求"
date:   2018-12-01 11:57:12 +0800
categories: learning-notes
tags: WEB前端 JS Node.js
---
* content
{:toc}

最近写了一个不使用外部框架的情况下，使用 Node.js 开启一个托管文件的服务器，github 地址：[serving-static-files-without-frameworks](https://github.com/nxjniexiao/serving-static-files-without-frameworks)。<br>

但是，使用 Iphone 访问 mp4 文件时，发现视频无法播放。<br>

## 1. 范围请求

在用 Iphone 访问 mp4 文件时，请求头中有表示范围请求的 Range 字段，`bytes=` 后的区间告知服务器返回文件的起始/结束位置：
```
Range: bytes=0-1
```

## 2. 服务端处理范围请求

服务端要根据 Range 字段，设置相应的响应头部字段：
```
Accept-Ranges: bytes
Content-Range: bytes 0-1/44546796
```
+ `Accept-Ranges`：定义范围请求的单位：字节；
+ `Content-Range`：定义数据片段在整个文件中的位置(单位字节)：
   + `0`：起始位置(包含)；
   + `1`：结束位置(包含)；
   + `44546796`：文件大小。

注意：`0` 表示第一个字节，和数组的 index 类似，`0-99` 表示文件首部的 `100` 字节。

在访问 mp4 文件时所有**请求**头中的 `Range` 字段和**响应**头中的 `Content-Range` 字段如下：
```
Range: bytes=0-1
Content-Range: bytes 0-1/44546796
Range: bytes=0-65535
Content-Range: bytes 0-65535/44546796
Range: bytes=65536-131071
Content-Range: bytes 65536-131071/44546796
Range: bytes=131072-44546795
Content-Range: bytes 131072-44546795/44546796
Range: bytes=44236800-44546795
Content-Range: bytes 44236800-44546795/44546796
Range: bytes=131072-2752511
Content-Range: bytes 131072-2752511/44546796
```

## 3. 代码

封装一个处理 Range 请求的函数 `resRange()`，其中：
1. `range` 为请求头中的 `header` 字段，通过 `req.headers.range`获取，如`Range: bytes=0-1`；
2. `filePathNormalized` 为文件的绝对路径(符合平台特性)；
3. `resFailed()` 是一个封装好的返回 404 响应的函数；
4. `file.stat` 封装了 `require('fs').stat`，返回一个 Promise 对象；
5. `file.createReadStream` 为 `require('fs').createReadStream`，返回一个可读流；
6. `rs.pipe(res);` 绑定可写流 `res` 到可读流 `rs`，将可读流自动切换到流动模式，并将可读流的所有数据推送到绑定的可写流。

```js
const file = require("./file.js");
// 封装函数，处理 Range 请求
function resRange(range, filePathNormalized) {
  let position = range.replace("bytes=", "").split("-");
  let fileSize = 0;
  file
    .stat(filePathNormalized)
    .then(stats => {
      fileSize = stats.size; // 文件大小
      const start = parseInt(position[0]); // 起始位置(坑:字符串转为整数)
      const end = position[1] ? parseInt(position[1]) : fileSize - 1; // 结束位置(坑:字符串转为整数)
      const partialSize = end - start + 1;
      res.statusCode = 206; // 206: partial content
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      // res.setHeader("Content-Length", partialSize);
      // res.setHeader("Cache-Control", "no-cache");
      const rs = file.createReadStream(filePathNormalized, {
        start,
        end
      }); // 返回可读流
      rs.on("error", (err) => {
        console.log(err);
        resFailed("文件读取出错");
      });
      rs.pipe(res);// 绑定可写流 res 到可读流 rs
    })
    .catch(err => {
      console.log(err);
      resFailed("文件不存在");
    });
}
```
**注意**：`require('fs').createReadStream(path[, options])` 的第二个参数 `options` 可以是一个对象，如：
```js
const opt = {
  start: 0,
  end: 1
};
```
其中 `start` 和 `end` 为整数类型，所以上述代码中使用了 `parseInt(position[0])` 把字符串转换成整数。否则会报错：
```
net::ERR_CONTENT_LENGTH_MISMATCH
```