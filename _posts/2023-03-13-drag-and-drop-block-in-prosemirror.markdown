---
layout: post
title: 如何在 Prosemirror 中实现块级节点的拖拽
date: 2023-03-13 21:02:00 +0800
categories: Prosemirror
tags: Prosemirror
---


最近用于工作需要研究了 Prosemirror 和基于 React 的 Prosemirror 编辑器 [rich-markdown-editor](https://github.com/outline/rich-markdown-editor) ，并尝试在 rich-markdown-editor 的基础上实现能够拖拽块级节点的功能。

## 1. 总体思路

本文中涉及的概念参考了 [Prosemirror 官网](https://prosemirror.net/) 和 [xheldon](https://www.xheldon.com/) 翻译的中文版 [指南](https://prosemirror.xheldon.com/docs/guide/) 和 [API 文档](https://prosemirror.xheldon.com/docs/ref/) 。

在 Prosemirror 中实现拖拽块级节点的总体思路如下：

1. 鼠标进入块级节点时，找到块级节点的 [index](https://www.xheldon.com/tech/prosemirror-guide-chinese.html#indexing) ，用于渲染拖拽按钮。
2. 按钮不是编辑器 [文档](https://www.xheldon.com/tech/prosemirror-guide-chinese.html#documents) 的一部分，所以需要使用 [Widget Decoration](https://prosemirror.xheldon.com/docs/ref/#view.Decoration%5Ewidget) 把按钮渲染到 index 所在的位置。
3. 鼠标点击此按钮时，选中该块级节点 ([NodeSelection](https://prosemirror.xheldon.com/docs/ref/#state.NodeSelection))，该 NodeSelection 会在 Prosemirror-view 中的 dragstart 事件处理函数中被用到。当然该按钮需要设置 `draggable="true"` 才能触发拖拽事件。

## 2. 获取块级节点的 index

### 2.1 什么是 index

Prosemirror 中可以以一个整数表示文档中的任意位置，这个整数是 token 的顺序。更详细的解释可查看 [中文文档](https://www.xheldon.com/tech/prosemirror-guide-chinese.html#indexing) 。

下面是官方文档给出的一个例子，该例子中包含两个块级节点： `<p>` 和 `<blockquote>` 。

<pre><code>0   1 2 3 4    5
&nbsp;&lt;p&gt; O n e &lt;/p&gt;

5            6   7 8 9 10    11   12            13
 &lt;blockquote&gt; &lt;p&gt; T w o &lt;img&gt; &lt;/p&gt; &lt;/blockquote&gt;
</code></pre>

### 2.2 mouseover 中获取块级节点的 index

我们要实现的是，当鼠标移入块级元素内时，找到该块级节点开始的 index ：
- 移入 `<p>` 节点内时: index = 0
- 移入 `<blockquote>` 节点内时: index = 5

实现该逻辑有两个要点：

1. Prosemirror 中我们创建 [Plugin](https://www.xheldon.com/tech/prosemirror-guide-chinese.html#plugins) 实例时可以在 [props](https://prosemirror.xheldon.com/docs/ref/#view.EditorProps) 中通过 [handleDOMEvents](https://prosemirror.xheldon.com/docs/ref/#view.EditorProps.handleDOMEvents) 字段监听 mouseover 事件。
2. EditorView 有一个 [posAtCoords](https://prosemirror.xheldon.com/docs/ref/#view.EditorView.posAtCoords) 方法可以返回一对坐标在文档中的位置 index。<br>
   `posAtCoords(coords: {left: number, top: number}) → ?⁠{pos: number, inside: number}`

在获取到鼠标对应的位置信息（pos）后，需要 [resolve](https://prosemirror.xheldon.com/docs/ref/#model.Node.resolve) 一下，将其变成 [resolvedPos](https://prosemirror.xheldon.com/docs/ref/#model.ResolvedPos) 后才能获取到更多的信息：`view.state.doc.resolve(pos.pos)`。

然后通过 ResolvedPos 的 [start](https://prosemirror.xheldon.com/docs/ref/#model.ResolvedPos.start) 方法获取给定深度的祖先节点的开始位置（绝对位置）。在 2.1 文档示例中，当鼠标移入 `<p>` 节点内时，`start(1)` 返回 `1` ，移入 `<blockquote>` 节点内时，返回 `6` 。

当 `posAtCoords` 返回的 `pos.inside` 为 `-1` 时，说明鼠标落在了顶级节点，不在任何节点之内。此时直接使用 `pos.pos` 的值即可。

```ts
new Plugin({
  props: {
    handleDOMEvents: {
      mouseover: (view: EditorView, event) => {
        // 省略...
        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (!pos) return;
        let index: number;
        if (pos.inside === -1) {
          // 鼠标落在了顶级节点，不在任何节点之内
          index = pos.pos;
        } else {
          const resolvedPos = view.state.doc.resolve(pos.pos);
          index = resolvedPos.start(1) - 1;
        }
        // 省略...
        view.dispatch(
          view.state.tr.setMeta("sideMenu", {
            pos: index,
            nodeType: this.nodeType,
          })
        );
      }
    }
  }
})
```

### 2.3 派发 transaction

mouseover 中当监测到鼠标所在的块级节点发生变化时，会通过 [`view.dispatch`](https://prosemirror.xheldon.com/docs/ref/#view.EditorView.dispatch) 去派发一个 [transaction](https://prosemirror.xheldon.com/docs/ref/#state.Transaction) ，但是 `tr.setMeta` 仅在该 `transaction` 上储存了 `meta` 信息，并不会修改文档内容。该 `transaction` 会触发 Widget Decoration 重新运行来更新拖拽按钮的位置，详情见后面章节。

## 3. 使用 Widget Decoration 渲染拖拽按钮

[指南](https://www.xheldon.com/tech/prosemirror-guide-chinese.html#decorations) 中指出 Decorations 给了我们绘制 document view 方面的一些能力，其中 [Widget decorations](https://prosemirror.xheldon.com/docs/ref/#view.Decoration%5Ewidget) 可以在给定位置插入一个 DOM node ，其不是实际文档的一部分。

### 3.1 如何创建 Decoration

我们在创建 Plugin 实例时可以在 [props](https://prosemirror.xheldon.com/docs/ref/#view.EditorProps) 中通过 [decorations](https://prosemirror.xheldon.com/docs/ref/#view.EditorProps.decorations) 字段创建 Decoration 。decorations 函数需要返回 DecorationSource ，我们一般通过 [DecorationSet](https://prosemirror.xheldon.com/docs/ref/#view.DecorationSet) 来创建。下面的例子中通过 DecorationSet.empty 创建了一个 decorations 的空集合。

```js
new Plugin({
  props: {
    decorations(state) {
      return DecorationSet.empty;
    }
  }
})
```

### 3.2 创建拖拽按钮的 Decoration

根据 [指南](https://www.xheldon.com/tech/prosemirror-guide-chinese.html#decorations) 中的建议，把 decoration 放到 plugin 的 state 中去维护。插件通过定义 [state](https://prosemirror.xheldon.com/docs/ref/#state.PluginSpec.state) 字段持有自己的插件 state ，该字段一般包含如下两个字段：

1. [init](https://prosemirror.xheldon.com/docs/ref/#state.StateField.init): 用于初始化插件的 state 。
2. [apply](https://prosemirror.xheldon.com/docs/ref/#state.StateField.apply): 应用给定的 transaction 到插件的 state 字段，以产生一个新的 state 。

下方的代码中，当 `view.dispatch()` 被调用时，`apply` 就会运行，其中的 `tr.getMeta("sideMenu")` 就能获取到 2.3 中设置的 meta 信息，最后根据该信息生成新的 DecorationSet 。

之后是 props 中的 decorations 被调用，其直接返回该插件的 state ，即拖拽按钮的 DecorationSet 。

```ts
new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, value, oldState, newState) {
      const sideMenu = tr.getMeta("sideMenu");
      if (sideMenu !== undefined) {
        // 省略...
        return DecorationSet.create(newState.doc, [
          Decoration.widget(sideMenu.pos, () => {
            return button; // button 为拖拽按钮，类型为 dom.Node
          }),
        ]);
      } else {
        return value;
      }
    },
  },
  props: {
    handleDOMEvents: { /* 省略 */ },
    decorations(state) {
      // this 为该 Plugin 实例
      return this.getState(state);
    },
  }
})
```

代码中的 `button` 为拖拽按钮 DOM 节点，详情见后面章节。

## 4. 实现拖拽按钮

在拖拽按钮被点击(mousedown)时，我们需要选中拖拽按钮右侧的块级节点，因此需要在监听函数中 dispatch 一个 [setSelection](https://prosemirror.xheldon.com/docs/ref/#state.Transaction.setSelection) 的 transaction 。接下来的逻辑就自动交给了 [EditorView](https://prosemirror.xheldon.com/docs/ref/#view.EditorView) 中的 dragstart 函数。

此外，该按钮被拖拽时，浏览器会默认把该按钮显示为半透明拖拽图像，并在拖动过程中跟随鼠标指针。为了优化用户体验，我们可以通过 `DataTransfer.setDragImage()` 把右侧的块级节点设置为拖拽图像。

```ts
import { Plugin } from "prosemirror-state";

export default class SideMenuTrigger extends Extension {
  dragging: boolean; // 当前是否在拖拽中

  sideMenuPos: number; // 拖拽按钮渲染的 index

  nodeType: string; // 拖拽按钮右侧的节点类型

  get plugins() {
    const button = document.createElement("button");
    button.className = "";
    button.type = "button";
    button.draggable = true;
    button.innerHTML = '<svg>...</svg>'; // 省略 svg 内容

    button.addEventListener("mousedown", () => {
      const editorView = this.editor.view;
      editorView.dispatch(
        editorView.state.tr.setSelection(
          NodeSelection.create(editorView.state.doc, this.sideMenuPos)
        )
      );

      this.dragging = true;

      const handleDragStart = event => {
        const dom = event.target.nextSibling;
        event.dataTransfer.setDragImage(dom, 0, 0);
      };

      const resetDragging = () => {
        this.dragging = false;
        document.removeEventListener("dragstart", handleDragStart);
        document.removeEventListener("drop", resetDragging);
        document.removeEventListener("mouseup", resetDragging);
      };

      document.addEventListener("dragstart", handleDragStart);
      document.addEventListener("drop", resetDragging);
      document.addEventListener("mouseup", resetDragging);
    });

    return [ new Plugin({ /* 省略，详情见前面的章节 */ }) ];
  }
}
```

## 5. 总结

Prosemirror 的插件系统还是非常强大的，它让扩展编辑器变得非常容易。具体的实现逻辑可参考我 fork 的 [rich-markdown-editor](https://github.com/nxjniexiao/rich-markdown-editor/blob/main/src/plugins/SideMenuTrigger.tsx) 。

