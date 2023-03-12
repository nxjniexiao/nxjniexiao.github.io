---
layout: post
title: '如何公证 macOS app'
date: 2020-12-28 14:16:00 +0800
categories: Electron
tags: Electron
---


## 1. 参考

参考 1：[为 app 签名以通过“门禁”验证](https://developer.apple.com/cn/developer-id/)。

参考 2：[Notarizing macOS Software Before Distribution](https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution) 和 [在分发前对 macOS 软件进行公证](https://developer.apple.com/cn/documentation/xcode/notarizing_macos_software_before_distribution/)。

参考 3：[Customizing the Notarization Workflow](https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow)。

参考 4：[macOS app 实现自动化 notarize 脚本](https://www.logcg.com/archives/3222.html)。

自动公证脚本：[notarize-app.sh]({% post_url 2020-12-28-auto-notarize-macos-app-script %})

## 2. 签名

使用 productsign 命令对现有安装程序进行签名

```bash
productsign --timestamp=none
            --sign "Developer ID Installer: SYSTEC TECHNOLOGY CO., LIMITED (XXXXXXXXXX)"
            Umeet.pkg
            Umeet-v3.12.0-setup.pkg
```

## 3. 获取 provider

```bash
xcrun altool --list-providers -u [USER] -p [PWD]
```

## 4. 公证 app

```bash
xcrun altool --notarize-app
             --primary-bundle-id [APP_ID]
             --username [USER]
             --password [PWD]
             --asc-provider XXXXXXXXXX -t osx
             --file Umeet-v3.12.0-setup.pkg
```

## 5. 查询公证结果

```bash
xcrun altool --notarization-info [RequestUUID]
             --username [USER]
             --password [PWD]
```

## 6. 添加票据

```bash
xcrun stapler staple Umeet-v3.12.0-setup.pkg
```

## 7. 查询结果

```bash
xcrun stapler staple -v Umeet-v3.12.0-setup.pkg
```

## 8. 查询认证结果

```bash
spctl -a -v --type install Umeet-v3.12.0-setup.pkg
```
