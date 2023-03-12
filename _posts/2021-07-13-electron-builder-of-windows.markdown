---
layout: post
title: 'Win10 环境中的 Electron Builder 研究'
date: 2021-07-13 12:03:00 +0800
categories: Electron
tags: Electron
---


此文章使用 [electron-webpack-quick-start](https://github.com/electron-userland/electron-webpack-quick-start) 仓库测试 Electron 打包相关问题。

## 1. 不允许修改安装位置

electron-builder 默认不允许修改安装位置，即 `oneClick` 为 `true`。

### 1.1 默认配置打包

使用 electron-webpack-quick-start 的默认配置，没有配置任何其它参数和 installer.nsh。

1.  安装路径：`C:\Users\Nie Xiaojun\AppData\Local\Programs\electron-webpack-quick-start`

2.  缓存位置：`C:\Users\Nie Xiaojun\AppData\Roaming\electron-webpack-quick-start`

3.  注册表位置：`计算机\HKEY_CURRENT_USER\SOFTWARE\15c1c957-be56-51ad-bd98-1cddee0072d1`

注册表位置中最后一项为 `guid`。没有指定 `nsis.guid` 时，electron-builder 会根据 `appId` 和 `name` 自动生成一个 `guid`。

注册表信息：

```
InstallLocation: C:\Users\Nie Xiaojun\AppData\Local\Programs\electron-webpack-quick-start
KeepShortcuts: true
ShortcutName:  electron-webpack-quick-start
```

卸载及覆盖安装：

1.  **卸载后：**

    1.  注册表清空。

    2.  安装文件被移除。

    3.  缓存文件还在。

2.  **覆盖安装**：

    1.  注册表位置没变：`计算机\HKEY_CURRENT_USER\SOFTWARE\15c1c957-be56-51ad-bd98-1cddee0072d1`

    2.  安装文件夹中部分文件先被删除，之后再新增这些文件。

    3.  缓存文件还在。

### 1.2 perMachine=true

在默认配置基础上，仅修改 `perMachine` 为 `true`。

打完包后，安装包上有权限标记，双击安装时提示需要权限，点击【是】后开始自动安装。

1.  安装路径：`C:\Program Files\electron-webpack-quick-start`

2.  缓存位置（不变）：`C:\Users\Nie Xiaojun\AppData\Roaming\electron-webpack-quick-start`

3.  注册表位置：`计算机\HKEY_LOCAL_MACHINE\SOFTWARE\3a37b691-05ad-4a4c-a5a9-f022fced9581`

注册表信息：

```
InstallLocation: C:\Program Files\electron-webpack-quick-start
KeepShortcuts: true
ShortcutName:  electron-webpack-quick-start
```

## 2.允许修改安装位置

在默认配置基础上，仅修改 `oneClick=false`，`allowToChangeInstallationDirectory=true`。

### 2.1 为哪位用户安装该应用？

双击安装时，先出现【所有用户】和【当前用户】的选项页面：

![](/images/2021-07-13-electron-builder-of-windows/image_-SbCxbHr9E.png)

![](/images/2021-07-13-electron-builder-of-windows/image_xU496DgenY.png)

1.  默认是第二个选项，点击下一步后进入安装位置
  - 默认位置：`C:\Users\Nie Xiaojun\AppData\Local\Programs\electron-webpack-quick-start`
  - 注册表路径：`计算机\\**HKEY_CURRENT_USER**\SOFTWARE\3a37b691-05ad-4a4c-a5a9-f022fced9581`

2.  如果选择第一个选项，点击下一步后，**提示需要权限**，点击【是】后进入安装位置，
  - 默认位置：`C:\Program Files\electron-webpack-quick-start`
  - 注册表路径：`计算机\\**HKEY_LOCAL_MACHINE**\SOFTWARE\3a37b691-05ad-4a4c-a5a9-f022fced9581`

### 2.2 为【当前用户】安装在 C 盘

当选择【仅为我安装】，并把路径设置在 `C:\Program Files\electron-webpack-quick-start` 时，会因为没权限而报错：

![](/images/2021-07-13-electron-builder-of-windows/image_Ytthhk6rfg.png)

解决办法可以右键安装文件，选择【以管理员身份运行】，安装后注册表位置：

```
计算机\HKEY_CURRENT_USER\SOFTWARE\3a37b691-05ad-4a4c-a5a9-f022fced9581
```

**安装后无法正常卸载软件**，卸载软件后注册表相关信息被清空，但 `C:\Program Files\electron-webpack-quick-start` 中的文件未被删除。

**总结：** 当选择【当前用户】时不能安装在系统盘。

### 2.3 为【所有用户】安装在 C 盘

当选择【为使用这台电脑的任何人安装】时能正常安装和卸载，安装后注册表位置：

```
计算机\HKEY_LOCAL_MACHINE\SOFTWARE\3a37b691-05ad-4a4c-a5a9-f022fced9581
```

## 3.覆盖安装选择不同的安装路径

第一次安装位置：`C:\Users\Nie Xiaojun\AppData\Local\Programs\electron-webpack-quick-start`

第二次覆盖安装时会提示**已经存在一个安装**：

![](/images/2021-07-13-electron-builder-of-windows/image_bGAQWyo5qz.png)

点击下一步，然后把上一次的安装路径改为 `D:\Program Files`：

![](/images/2021-07-13-electron-builder-of-windows/image_iMSrzasVx6.png)

**注：目标文件夹输入框中的默认路径为上一次安装时的路径。**

旧程序的相关文件被删除，且注册表信息中的安装位置也有更新：

```
InstallLocation: D:\Program Files\electron-webpack-quick-start
KeepShortcuts: true
ShortcutName:  electron-webpack-quick-start
```

## 4.配置

### 4.1 requestedExecutionLevel

```json
"build": {
  "win": {
    "requestedExecutionLevel": "requireAdministrator"
  }
}
```

`requestedExecutionLevel` 默认为 `asInvoker`，改为 `requireAdministrator` 后，启用 app 时会提示需要管理员权限，且快捷方式右下角有盾牌标志。

![](/images/2021-07-13-electron-builder-of-windows/image_Un-jmCbME5.png)

### 4.2 perMachine

如果 `perMachine` 为 `true`，安装包.exe 文件上会有盾牌标记：

![](/images/2021-07-13-electron-builder-of-windows/image_mnwFOuEzjf.png)

双击时，**提示需要权限**，点击【是】后**直接进入安装位置**，默认位置：
`C:\Program Files\electron-webpack-quick-start`

**总结：** `perMachine` 为 `true` 只是默认选择了给【所有用户】安装，和 `perMachine` 为 `false` 并手动选择给【所有用户安装】没有区别。

## 5.macro 执行顺序

preInit => customInit => customInstallMode => 为哪位用户安装界面 => 安装位置界面 => 安装中界面 => customInstall
