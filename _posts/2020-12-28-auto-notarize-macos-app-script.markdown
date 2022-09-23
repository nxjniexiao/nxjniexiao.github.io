---
layout: post
title: '自动公证 macOS app 脚本'
date: 2020-12-28 20:22:00 +0800
categories: Electron
tags: Electron
---

* content
{:toc}

参考链接：[https://github.com/CaicaiNo/Apple-Mac-Notarized-script](https://github.com/CaicaiNo/Apple-Mac-Notarized-script)

以下脚本用于自动公证 macOS app：
```bash
#! /bin/bash

# 从 config.json 中获取配置的函数
function getConfig() {
  CONFIG=`cat ./config.json |
    python3 -c "import sys, json; print(json.load(sys.stdin)$1)"`
  if [[ "$CONFIG" == "" ]]; then
    echo "Error: config.json must contains key: $1"
    exit 1
  fi
}
# 获取 app 名称
getConfig "['productName']"
APP_NAME=$CONFIG
# 获取 app 版本号
getConfig "['version']['mac']"
VERSION=$CONFIG
# 获取当前项目的 config 所在文件夹的名称，如 "Umeet"
getConfig "['configFolderName']"
CONFIG_FOLDER_NAME=$CONFIG
# release 文件夹路径
RELEASE_PATH="./release"
# pkg 包路径
APP_FILE_PATH="${RELEASE_PATH}/${APP_NAME}.pkg"
# pkg 新包路径
APP_FILE_PATH_NEW="${RELEASE_PATH}/${APP_NAME}-v${VERSION}-setup.pkg"
# 临时文件 temp 的路径（用来存放上传app的结果）
tmp="${RELEASE_PATH}/tmp"
# app id
APP_ID=""
# apple 账号
USERNAME=""
# 不是 apple 账号的密码，而是生成的 app 密匙
PASSWORD=""

# 打包 pkg 函数
function appPackge()  {
  echo "####### Start building PKG... #######"
  PROJ_FILE="./config/$CONFIG_FOLDER_NAME/pkgproj/pkg.pkgproj"
  if [ ! -f "$PROJ_FILE" ]; then
    echo  "Error: $PROJ_FILE is not exist"
    exit 1
  fi
  /usr/local/bin/packagesbuild --package-version "$VERSION" "$PROJ_FILE"
}

# app 公证函数
function appNotarization(){
  echo "####### Notarization script start #######"
  # 公证 app 并盖章
  uploadFileAndNotarized
  if [ $? -ne 0 ];then
  echo "####### Notarization script failed #######"
  return 1
  fi
  # 查询结果（这里可以看到，苹果系统会下载一个xxx.ticket的文件到临时文件，然后。。。）
  xcrun stapler staple -v "$APP_FILE_PATH_NEW"
  #验证是否公证成功，成功会提示success
  spctl -a -v --type install "$APP_FILE_PATH_NEW"
  echo "####### Notarization script end #######"
  return 0
}

# 公证 app 并盖章
function uploadFileAndNotarized()
{
  # 安装包签名：（此时可以重命名）
  productsign --timestamp=none --sign  "Developer ID Installer: SYSTEC TECHNOLOGY CO., LIMITED (XXXXXXXXXX)" "$APP_FILE_PATH" "$APP_FILE_PATH_NEW"

  echo "####### Start notarizing $APP_FILE_PATH_NEW ... #######"
  xcrun altool --notarize-app --primary-bundle-id "$APP_ID" --username "$USERNAME" --password "$PASSWORD" --asc-provider XXXXXXXXXX -t osx --file "$APP_FILE_PATH_NEW" &> $tmp
  # 从日志文件中读取UUID,并隔一段时间检查一次公证结果
  # 只有成功的格式是 RequestUUID =
  uuid=`cat $tmp | grep -Eo 'RequestUUID = [[:alnum:]]{8}-([[:alnum:]]{4}-){3}[[:alnum:]]{12}' | grep -Eo '[[:alnum:]]{8}-([[:alnum:]]{4}-){3}[[:alnum:]]{12}' | sed -n "1p"`
  # 如果上传过了，则会返回 The upload ID is
  if [[ "$uuid" == "" ]];then
    uuid=`cat $tmp | grep -Eo 'The upload ID is [[:alnum:]]{8}-([[:alnum:]]{4}-){3}[[:alnum:]]{12}' | grep -Eo '[[:alnum:]]{8}-([[:alnum:]]{4}-){3}[[:alnum:]]{12}' | sed -n "1p"`
    echo "####### The software asset has already been uploaded. The upload ID is $uuid #######"
  fi
  echo "####### Notarization UUID is $uuid #######"
  # 即没有上传成功，也没有上传过，则退出
  if [[ "$uuid" == "" ]]; then
    echo "####### No success no uploaded, unknown error #######"
    cat $tmp  | awk 'END {print}'
    return 1
  fi

  # 根据 UUID 轮询上传结果
  while true; do
      echo "####### Checking for notarization... #######"

      xcrun altool --notarization-info "$uuid" --username "$USERNAME" --password "$PASSWORD" &> $tmp
      r=`cat $tmp`
      t=`echo "$r" | grep "success"`
      f=`echo "$r" | grep "invalid"`
      if [[ "$t" != "" ]]; then
          echo "####### Notarization done! #######"
          xcrun stapler staple "$APP_FILE_PATH_NEW"
          echo "####### Stapler done! #######"
          break
      fi
      if [[ "$f" != "" ]]; then
          echo "####### Failed : $r #######"
          return 1
      fi
      echo "####### Not finish yet, sleep 1 min then check again... #######"
      sleep 60
  done
  return 0
}

appPackge
appNotarization

```
