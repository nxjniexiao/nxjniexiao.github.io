---
layout: post
title: 'MacOS 环境 Electron Builder 打包时报错'
date: 2021-07-16 11:56:00 +0800
categories: Electron
tags: Electron
---

* content
{:toc}

## 1. electron builder 因证书问题无法打包

**问题描述：**

1.  MacOS 环境中打包时报错：`SecTrustSettingsCopyCertificates error: -25300`

2.  运行`security find-identity` 时提示：

    ```
    Matching identities
    1) 证书1相关信息
    2) 证书2相关信息
      2 identities found

    Valid identities only
      0 valid identities found
    ```

**解决办法：**

1.  下载 Securly 证书 CRT 文件 ([securly_ca_2034.crt](https://download.securly.com/cert/securly_ca_2034.crt))。

2.  导航至访达 > 应用程序 > 实用工具 > 钥匙串访问。

3.  选择左侧栏中的 "系统"。

4.  打开 "文件>导入项目"，将证书文件导入 "系统 "钥匙串。（导入后需把此证书设置为"始终信任"）

详情见：[https://developer.apple.com/forums/thread/132458](https://developer.apple.com/forums/thread/132458)

## 2. security 相关命令

- `security lock-keychain`：锁定指定的钥匙串

- `security unlock-keychain`：解锁指定的钥匙串

- `security find-identity`：查找认证实体（证书+私钥）

例如：

```bash
security lock-keychain login.keychain
security unlock-keychain login.keychain
security find-identity
```
