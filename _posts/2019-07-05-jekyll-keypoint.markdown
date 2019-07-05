---
layout: post
title: "Jekyll 要点"
date: 2019-07-05 14:26:00 +0800
categories: learning-notes
tags: jkeyll
---

* content
{:toc}

## 1. 概述

此篇博客记录了[ Jekyll 官方文档](https://jekyllrb.com/docs/)中的一些要点。

## 2. 目录结构

一个基本的 `Jekyll` 项目通常看起来像这样：

```
.
├── _config.yml
├── _data
|   └── members.yml
├── _drafts
|   ├── begin-with-the-crazy-ideas.md
|   └── on-simplicity-in-technology.md
├── _includes
|   ├── footer.html
|   └── header.html
├── _layouts
|   ├── default.html
|   └── post.html
├── _posts
|   ├── 2007-10-29-why-every-programmer-should-play-nethack.md
|   └── 2009-04-26-barcamp-boston-4-roundup.md
├── _sass
|   ├── _base.scss
|   └── _layout.scss
├── _site
├── .jekyll-metadata
└── index.html # can also be an 'index.md' with valid front matter
```

详情如下：

1. `_config.yml`: 配置文件。
2. `_drafts`: 草稿，文件名可以没有日期。
3. `_includes`: 可被 `layouts` 和 `posts` 重用的片段，如 `{% include file.ext %}` 。
4. `_layouts`: 布局，其中的 Liquid 标签  `{ { content } }` 用于将内容注入网页。
5. `_posts`: 博文，文件名格式为 `YEAR-MONTH-DAY-title.MARKUP` 。
6. `_data`: 数据，支持 `.yml`/`.yaml`/`.json`/`.csv`/`.tsv` ，可通过 `site.date` 访问。
7. `_sass`: 存放可导入 `main.scss` 的 `scss` 文件( `main.scss` 最终会被转换为 `main.css`)。
8. `_site`: 存放生成的网页文件。
9. `index.html`/`index.md`: 主页。
10. `其他文件/文件夹`: 如 `css` 和 `images` 文件夹，`favicon.ico` 文件等。

## 3. Posts

`_post` 文件夹用于存放我们博客，支持 `Markdown` 和 `HTML` 。

### 3.1 文件名格式

文件名的格式为 `YEAR-MONTH-DAY-title.MARKUP`，此博文的文件名如下：

```
2019-07-05-jekyll-keypoint.markdown
```

### 3.2 YAML 前页

每篇博客文件中的开头为 `YAML`(一种语言) 前页，用于设置布局(layout)和元数据(meta data)。此博文的 `YAML` 前页如下：<br>

```YAML
---
layout: post
title: "Jekyll 要点"
date: 2019-07-05 14:26:00 +0800
categories: learning-notes
tags: jkeyll
---
```

### 3.3 图片和链接

我们可以在博文中插入图片、下载或其他资源的链接：

+ `![图片](/images/2018-09-04-Redux-React-Todo-List/Todo-List-UI.png)`: 插入图片
+ `[下载图片](/images/2018-09-04-Redux-React-Todo-List/Todo-List-UI.png)`: 下载地址
+ `[ Jekyll 官方文档](https://jekyllrb.com/docs/)`: 链接地址

建议在根目录下创建 `assets` 文件夹，用于存放图片和文件等。

### 3.4 创建博文索引

在其他页面创建博文索引很简单，如下：

```HTML
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{ { post.url } }">{ { post.title } }</a>
    </li>
  {% endfor %}
</ul>
```
注：
1. `post` 仅在 `for` 循环内可用；
2. 可以通过 `page` 变量访问当前页面/博文。

### 3.5 分类和标签(Categories and Tags)

分类和标签之间的区别是分类可以是帖子 URL 的一部分，而标签则不能。<br>

们可以通过 `site.categories` 访问所有的分类：

```HTML
{% for category in site.categories %}
  <h3>{ { category[0] } }</h3>
  <ul>
    {% for post in category[1] %}
      <li><a href="{{ post.url }}">{ { post.title } }</a></li>
    {% endfor %}
  </ul>
{% endfor %}
```
注: `category` 为数组，第一项为分类名称，第二项为该类别中的博文数组。

### 3.6 摘要(excerpts)

我们可以通过 `post.excerpt` 访问文章的摘要，默认为博文第一段。

```HTML
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{ { post.url } }">{ { post.title } }</a>
      { { post.excerpt } }
    </li>
  {% endfor %}
</ul>
```

在 `_config.yml` 文件中设置 `excerpt_separator: "\n\n\n\n"` 可以自定义摘要的内容。

### 3.7 草稿

`_drafts` 文件夹用于存放不想发布的博文草稿。在运行 `jekyll server` 时添加 `--drafts` 选项能预览草稿。

## 4. YAML 前页

YAML 前页必须放在文件的首部，并且位于一对三横线(`---`)中间。<br>

```YAML
---
layout: post
title: "《CSS揭秘》学习笔记"
date: 2019-06-01 22:45:12 +0800
categories: learning-notes CSS
tags: css
customCss: ["/css/custom-css/2019-06-01-css-secrets.css"]
---
```

前页中可以给**预先定义的**或**自定义的**变量赋值。然后在文件中，或在博文/页面所依赖的 `layouts` 或 `includes` 中就能通过 `Liquid` 标签使用这些变量。

### 4.1 预定义变量

1. `layouts`: 指定了要使用的布局文件(无后缀名)。布局文件必须放在 `_layouts` 目录中。
2. `permalink`: 自定义博客的 `URL` ，默认为 `/year/month/day/title.html`。
3. `published`: 如不想在生成的网站中显示此博文，则设为 `false`。
4. `date`: 日期，将覆盖根据文件名产生的日期。格式为 `YYYY-MM-DD HH:MM:SS +/-TTTT`。
5. `category`/`categories`: 分类，格式为 YAML 列表(`[learning-notes, CSS]`)或空格分隔的字符串(`learning-notes CSS`)。
6. `tags`: 标签，格式同上。

### 4.2 自定义变量

自定义的变量也能在 `Liquid` 中使用，例如定义 `customCss` 变量来保存博文需要的自定义 `css` 文件：

```YAML
customCss: ["/css/custom-css/2019-06-01-css-secrets.css"]
```

然后在 `head.html` 中通过 `page.customCSS` 来访问此数组。

```HTML
<head>
  {% if page.customCss %}
    {% for css in page.customCss %}
    <link rel="stylesheet" href="{ { css } }">
    {% endfor %}
  {% endif %}
</head>
```
