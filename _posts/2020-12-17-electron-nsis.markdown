---
layout: post
title: 'Electron Builder 中如何自定义 NSIS 脚本'
date: 2020-12-17 15:51:00 +0800
categories: Electron
tags: Electron
---


## 1. 自定义 NSIS 脚本

有两个选项可以在 Electron Builder 中自定义 NSIS 脚本 — `include` 和 `script`。 

`script` 允许你提供完全不同的 NSIS 脚本。在大多数情况下，它不是必需的，因为你只需要自定义某些方面，但仍然使用经过良好测试和维护的默认 NSIS 脚本。

因此，建议使用 `include`。

详情见 [https://www.electron.build/configuration/nsis#custom-nsis-script](https://www.electron.build/configuration/nsis#custom-nsis-script)

1.  `package.json`中增加 `include` 字段引入 `installer.nsh` 文件。

2.  新建 `installer.nsh` 文件，并自定义如下宏：

    - customHeader

    - preInit

    - customInit

    - customUnInit

    - customInstall

    - customUnInstall

    - customRemoveFiles

    - customInstallMode

```
!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro preInit
  ; This macro is inserted at the beginning of the NSIS .OnInit callback
  !system "echo '' > ${BUILD_RESOURCES_DIR}/preInit"
!macroend

!macro customInit
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customInit"
!macroend

!macro customInstall
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customInstall"
!macroend

!macro customInstallMode
  # set $isForceMachineInstall or $isForceCurrentInstall
  # to enforce one or the other modes.
!macroend
```

## 2. NSIS 语法

### 2.1 变量

1.  自定义变量

    `Var [/GLOBAL] var_name`

    声明一个用户变量。 变量名称允许使用的字符：`[a-z][A-Z][0-9]` 和 `_`。 所有定义的变量都是**全局变量**，即使在节或函数中定义也是如此。 为了清楚起见，在 section 或函数中定义的变量必须使用 `/GLOBAL` 标志。 在 section 和函数之外，不需要 `/GLOBAL` 标志。

    ```
    Var example

    Function testVar
      Var /GLOBAL example2

      StrCpy $example "example value"
      StrCpy $example2 "another example value"
    FunctionEnd
    ```

2.  其他可写变量

    - `$0, $1, $ 2, $3, $ 4, $5, $ 6, $7, $ 8, $9, $ R0, $R1, $ R2, $R3, $ R4, $R5, $ R6, $R7, $ R8, $R9`

      寄存器。 这些变量可以像用户变量一样使用，但是通常在共享函数或宏中使用。 您不必声明这些变量，因此在共享代码中使用它们时不会出现任何名称冲突。 在共享代码中使用这些变量时，建议您使用堆栈来保存和恢复其原始值。 这些变量也可以用于与插件通信，因为它们可以由插件 DLL 读取和写入。

    - `$INSTDIR`: C:\Users\Nie Xiaojun\AppData\Roaming\UmeetPro

3.  常量

    - `$APPDATA`: C:\Users\Nie Xiaojun\AppData\Roaming

    - `$TEMP`: C:\Users\Nie Xiaojun\AppData\Local\Temp

### 2.2 StrCpy

`user_var(destination) str [maxlen] [start_offset]`

用 `str` 设置用户变量 `$x`。 `str` 可以包含变量（包括正在设置的用户变量（可以通过这种方式连接字符串等））。如果指定了 `maxlen`，则字符串最多为 `maxlen` 个字符（如果 `maxlen` 为负，则字符串将从末尾截断 `abs(maxlen)`个字符）。如果指定了 `start_offset`，则源将与其偏移（如果 `start_offset` 为负，它将从字符串的末尾开始 `abs(start_offset)`）。

```
StrCpy $0 "a string" # = "a string"
StrCpy $0 "a string" 3 # = "a s"
StrCpy $0 "a string" -1 # = "a strin"
StrCpy $0 "a string" "" 2 # = "string"
StrCpy $0 "a string" "" -3 # = "ing"
StrCpy $0 "a string" 3 -4 # = "rin"
StrCpy $0 "$0$0" # = "rinrin"
```

### 2.3 !macro

`macro_name [parameter][...]`

创建一个名为 `macro_name` 的宏。 `!macro` 和 `!macroend` 之间的所有行将被保存。 要稍后插入宏，请使用 `!insertmacro`。 `!macro` 定义可以定义一个或多个参数。 可以使用 `!define`（例如  `${PARMNAME}`）从宏内部进行访问的方式相同。

```
!macro SomeMacro parm1 parm2 parm3
  DetailPrint "${parm1}"
  MessageBox MB_OK "${parm2}"
  File "${parm3}"
!macroend
```

### 2.4 MessageBox

`mb_option_list messagebox_text [/SD return] [return_check jumpto [return_check_2 jumpto_2]]`

显示包含文本 `messagebox_text` 的 `MessageBox`。

```
MessageBox MB_OK "simple message box"
MessageBox MB_YESNO "is it true?" IDYES true IDNO false
true:
  DetailPrint "it's true!"
  Goto next
false:
  DetailPrint "it's false"
next:
MessageBox MB_YESNO "is it true? (defaults to yes on silent installations)" /SD IDYES IDNO false2
  DetailPrint "it's true (or silent)!"
  Goto next2
false2:
  DetailPrint "it's false"
next2:
```

### 2.5 SetRegView

`32|64|default|lastused`

设置受注册表命令影响的注册表视图（后缀为 32/64 的根密钥不受影响）。 在 Windows 的 64 位版本上，有两个视图：一种用于 32 位应用程序，另一种用于 64 位应用程序。 默认情况下，在 64 位系统（WOW64）上运行的 32 位应用程序只能访问 32 位视图。 使用 `SetRegView 64` 允许安装程序在注册表的 64 位视图中访问密钥。 如果 Windows 不支持所选视图，则注册表操作将失败。

```
SetRegView 32
ReadRegStr $0 HKLM Software\Microsoft\Windows\CurrentVersion ProgramFilesDir
DetailPrint $0 # prints C:\Program Files (x86)
!include x64.nsh
${If} ${RunningX64}
  SetRegView 64
  ReadRegStr $0 HKLM Software\Microsoft\Windows\CurrentVersion ProgramFilesDir
  DetailPrint $0 # prints C:\Program Files
${EndIf}
SetRegView Default
```

### 2.6 ReadRegStr

`user_var(output) root_key sub_key name`

从注册表中读取用户变量 `$x`。 `root_key` 的有效值在 `WriteRegStr` 下列出。 如果字符串不存在，将设置错误标志，并将 `$x` 设置为空字符串（`""`）。 如果存在该值，但是其类型为 `REG_DWORD`，则将其读取并转换为字符串，并设置错误标志。

```
ReadRegStr $0 HKLM Software\NSIS ""
DetailPrint "NSIS is installed at: $0"
```

### 2.7 DeleteRegKey

`[/ifempty | /ifnosubkeys | /ifnovalues] root_key subkey`

删除注册表项。 如果指定了 `/ifempty`，则只有在没有子项且没有值的情况下，才删除注册表项（否则，将删除整个注册表树）。 `root_key` 的有效值在 `WriteRegStr` 下列出。 如果无法将注册表项从注册表中删除（或者如果开始时不存在），则会设置错误标志。

```
DeleteRegKey HKLM "Software\My Company\My Software"
DeleteRegKey /ifempty HKLM "Software\A key that might have subkeys"
```

### 2.8 ExecWait

`command [user_var(exit code)]`

执行指定的程序，然后等待执行的进程退出。 有关更多信息，请参见 `Exec`。 如果未指定输出变量，则执行的程序返回非零错误代码或存在错误时，`ExecWait` 将设置错误标志。 如果指定了输出变量，则 `ExecWait` 用退出代码设置变量（并且仅在发生错误时设置错误标志；如果发生错误，则用户变量的内容未定义）。

注意，如果命令中可能有空格，则应将其放在引号中以将其与参数分隔。 例如：

```
ExecWait '"$INSTDIR\command.exe" parameters'
ExecWait '"$INSTDIR\someprogram.exe"' $0
DetailPrint "some program returned $0"
```

如果不将其用引号引起来，则无论带有或不带有参数，Windows 9x 均不起作用。

## 3. Tips

### 3.1 如何卸载旧版本

参考[https://nsis.sourceforge.io/Docs/Chapter3.html#3.2.3](https://nsis.sourceforge.io/Docs/Chapter3.html#3.2.3) 。

```
# uninstall old version
ExecWait '"$INSTDIR\uninstaller.exe" /S _?=$INSTDIR'
```

- `/S` 静默运行安装程序或卸载程序。

- `_?=` 设置 `\$INSTDIR`。它还会阻止卸载程序将自身复制到临时目录并从那里运行。它可以与 `ExecWait` 一起使用，以等待卸载程序完成。它必须是命令行中使用的最后一个参数，并且即使路径包含空格，也不能包含任何引号。

在 customInit 中卸载旧版本：

```
IfFileExists "$INSTDIR\Uninstall Umeet Pro.exe" 0 +5
  MessageBox MB_OK "Umeet Pro is installed"
  # uninstall old version
  ExecWait '"$INSTDIR\Uninstall Umeet Pro.exe" /S _?=$INSTDIR'
  MessageBox MB_OK "Umeet Pro is uninstalled"
```

### 3.2 在安装新版本之前自动卸载旧版本

参考[https://nsis.sourceforge.io/Auto-uninstall_old_before_installing_new](https://nsis.sourceforge.io/Auto-uninstall_old_before_installing_new) 。

### 3.3 注册表写入和读取

- 写入 `InstallLocation` :

  ```
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$APPDATA\UmeetPro"
  ```

  &#x20;其中 `${INSTALL_REGISTRY_KEY}` 为:

  ```
  Software\{9B19E29A-3257-4618-4FEF-38BD2A2F163B}_is1
  ```

- 读取 `InstallLocation` :

  ```
  ReadRegStr $1 HKLM "SOFTWARE\WOW6432Node\{9B19E29A-3257-4618-4FEF-38BD2A2F163B}_is1" "InstallLocation" ; UmeetPro
  ```

  &#x20;其中 `WOW6432Node` 为 64 位版本注册表编辑中 32 位注册表项的存放路径。
