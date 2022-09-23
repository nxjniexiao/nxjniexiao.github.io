---
layout: post
title: '如何修改windows命令行的默认编码为utf-8'
date: 2021-02-24 11:33:00 +0800
categories: Tips
tags: windows cmd encoding
---

* content
{:toc}


详情见：[stackoverflow](https://stackoverflow.com/questions/57131654/using-utf-8-encoding-chcp-65001-in-command-prompt-windows-powershell-window)

## 1. 修改 powershell 默认编码为 utf-8

1.  在 Powershell 中运行如下命令生成 Powershell 的配置文件：

    ```
    New-Item $PROFILE -ItemType File -Force
    ```

    上述命令会生成一个名为 `Microsoft.PowerShell_profile.ps1` 的配置文件。

2.  在上述配置文件中添加如下代码：

    ```
    $OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding
    ```

## 2. 修改 cmd 默认编码为 utf-8

修改注册表：

`HKEY_CURRENT_USER\Software\Microsoft\Command Processor\AutoRun`（当前用户）

`HKEY_LOCAL_MACHINE\Software\Microsoft\Command Processor\AutoRun`（所有用户）

的值为 `chcp 65001 >NUL` 。

如果没有这一项，新建一个名为 `AutoRun` 的**字符串值**即可。
