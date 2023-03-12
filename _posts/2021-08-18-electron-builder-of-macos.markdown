---
layout: post
title: 'MacOS 环境中的 Electron Builder 研究'
date: 2021-08-18 22:07:00 +0800
categories: Electron
tags: Electron
---


此文章使用 [electron-webpack-quick-start](https://github.com/electron-userland/electron-webpack-quick-start) 仓库测试 Electron Builder 打包相关问题。

## 1. 默认配置

不修改任何配置，直接运行`yarn dist` :

```
  • electron-builder  version=22.11.7 os=20.2.0
  • loaded parent configuration  file=/Users/systec/Documents/test/electron-webpack-quick-start/node_modules/electron-webpack/out/electron-builder.js
  • description is missed in the package.json  appPackageFile=/Users/systec/Documents/test/electron-webpack-quick-start/package.json
  • author is missed in the package.json  appPackageFile=/Users/systec/Documents/test/electron-webpack-quick-start/package.json
  • writing effective config  file=dist/builder-effective-config.yaml
  • packaging       platform=darwin arch=x64 electron=8.2.0 appOutDir=dist/mac
  • default Electron icon is used  reason=application icon is not set
  • file source doesn't exist  from=/Users/systec/Documents/test/electron-webpack-quick-start/static
  • signing         file=dist/mac/electron-webpack-quick-start.app identityName=Developer ID Application: SYSTEC TECHNOLOGY CO., LIMITED (XXXXXXXXXX) identityHash=6256F0D3C6B93E96753BC574115CC7BE85250FCF provisioningProfile=none
  • building        target=macOS zip arch=x64 file=dist/electron-webpack-quick-start-0.0.0-mac.zip
  • building        target=DMG arch=x64 file=dist/electron-webpack-quick-start-0.0.0.dmg
  • building block map  blockMapFile=dist/electron-webpack-quick-start-0.0.0.dmg.blockmap
  • building embedded block map  file=dist/electron-webpack-quick-start-0.0.0-mac.zip
✨  Done in 71.77s.
```

## 2. target=pkg

修改 target :

```json
"build": {
  "mac": {
    "target": "pkg"
  }
}
```

运行`yarn dist` 打包，期间会提示"productbuild 想要使用您的钥匙串中的密钥 privateKey 进行签名"，输入两次密码后：

```
  // 省略。。。
  • building        target=pkg arch=x64 file=dist/electron-webpack-quick-start-0.0.0.pkg
✨  Done in 177.31s.
```

只输出了 .pkg 文件，没有 .zip/.yml 等文件。

安装过程

![](/images/2021-08-18-electron-builder-of-macos/image_MNTvvZ9-cl.png)

![](/images/2021-08-18-electron-builder-of-macos/image_pJdEtw_9QR.png)

![](/images/2021-08-18-electron-builder-of-macos/image_5hZCsP5ePU.png)

![](/images/2021-08-18-electron-builder-of-macos/image_5-v17q7Z12.png)

安装成功后打开 app：

![](/images/2021-08-18-electron-builder-of-macos/image_8Q_DljHsOi.png)
