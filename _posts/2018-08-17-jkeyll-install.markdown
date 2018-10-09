---
layout: post
title:  "jkeyll的安装步骤"
date:   2018-08-17 17:54:12 +0800
categories: learning-notes
tags: Ruby jkeyll software-install
---
* content
{:toc}
此文描述了Jekyll的安装过程，及如何关联github上的远程仓库。
## 1. 安装Jekyll
windows版本的安装地址：[Jekyll on Windows](https://jekyllrb.com/docs/windows/)。
+ 1) 安装Ruby+Devkit<br>
选择官网推荐版本[Ruby+Devkit 2.4.4-2 (x64)](https://www.ruby-lang.org/en/downloads/) 下载。<br>
官网提示：Use default options for installation。(使用默认选项安装)
+ 2) 从菜单栏打开cmd，在命令栏输入：
```
gem install jekyll bundler
```
安装Jekyll和Bundler。
+ 3) 在命令栏输入：
```
jekyll -v
```
查看版本号，从而验证是否安装成功。
## 2. 新建博客
+ 1) CMD中cd到自己想要的目录，运行：
```
jekyll new my-blog
```
新建博客完成后，当前目录下会生成一个my-blog的文件夹。
+ 2) CMD中cd至my-blog文件夹，运行jekyll：<br>
`jekyll s`  或  `jekyll serve`<br>
命令行会提示服务地址为：`http://127.0.0.1:4000`
+ 3) 在浏览器地址中输入`http://127.0.0.1:4000`访问自己本地的博客。
## 3. 关联github远程仓库
关联自己github账户中名为USERNAME.github.io远程仓库和本地的博客仓库。<br>
若还未新建此远程仓库，可根据[pages.github.com](https://pages.github.com/)中的第一步创建。<br>
**注意：**USERNAME为你自己github的账户名。
+ 1) 在自己想要的位置新建一个放博客的文件夹，如`F:\git\github.io-blog`，在此处打开Git Bash，运行：
```
git clone git@github.com:USERNAME/USERNAME.github.io.git
```
把此远程仓库克隆到本地，当前文件夹下面会新建一个名为USERNAME.github.io的文件夹。
+ 2) 在此文件夹中，保留.git文件夹，删除其余文件和文件夹（README.md可以选择保留）。
+ 3) 把第2步中新建的my-blog文件夹下的所有内容，拷贝至USERNAME.github.io文件夹下。
+ 4) 提交至远程仓库：<br>
`git add .` ==> `git commit -m "说明"` ==> `git push -u origin master`
+ 5) 提交完成后，在浏览器中输入`https://USERNAME.github.io/`查看自己的远程博客。
## 4. 新建博客文件
在_posts文件夹下面新建博客文件，格式为YYYY-MM-DD-name-of-post.ext，例如：
```
2018-08-16-welcome-to-jekyll.markdown
```