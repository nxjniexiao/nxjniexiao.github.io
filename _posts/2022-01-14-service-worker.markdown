---
layout: post
title: Service Worker 研究
date: 2022-01-14 15:43:00 +0800
categories: learning-notes
tags: Service-worker
---


## 1. CRA中关于offline-first的考虑事项

[原文档地址](https://create-react-app.dev/docs/making-a-progressive-web-app "原文档地址")

1.  在初始缓存完成后，service worker生命周期控制着更新的内容何时最终被显示给用户。为了防止与懒惰加载的内容出现竞争条件，默认行为是保守地将更新的Service Worker保持在 "等待" 状态。这意味着用户最终会看到较旧的内容，直到他们**关闭**（重新加载是不够的）**他们现有的、打开的标签**。关于这种行为的更多细节，请参见这篇[博文](https://jeffy.info/2018/10/10/sw-in-c-r-a.html "博文")。

2.  用户并不总是熟悉离线优先的网络应用。让用户知道Service Worker何时完成了对缓存的填充（显示 "此 Web 应用程序可离线工作！"消息），以及让他们知道Service Worker何时获取了下次加载页面时可用的最新更新（显示 "关闭现有标签后即可获得新内容 "消息），都是很有用的。显示这些消息目前是留给开发人员的练习，但作为一个起点，您可以利用 `src/serviceWorkerRegistration.js` 中包含的逻辑，该逻辑演示了要监听哪些Service Worker生命周期事件来检测每种情况，而且作为默认情况，它只将适当的消息记录到 JavaScript 控制台。

3.  Service Worker需要**HTTPS**，尽管为了方便本地测试，该策略并不适用于`localhost`。如果你的生产网络服务器不支持HTTPS，那么Service Worker的注册将失败，但你的网络应用的其他部分将保持正常运行。

4.  Service Worker只在**生产环境**中启用，例如`npm run build`的输出。建议你不要在开发环境中启用离线优先的服务工，因为当使用先前缓存的资产，并且不包括你在本地所做的最新修改时，会导致挫败感。

5.  如果你需要在本地测试你的离线优先Service Worker，请构建应用程序（使用`npm run build`），并从构建目录中运行一个标准的http服务器。运行构建脚本后，`create-react-app`会给出在本地测试你的生产构建的一种方法的说明，部署说明中有使用其他方法的说明。请确保始终使用隐身窗口，以避免与你的浏览器缓存发生复杂关系。

6.  默认情况下，生成的Service Worker文件不会拦截或缓存任何跨源流量，如HTTP API请求、图像或从不同域加载的嵌入内容。从Create React App 4开始，这一点可以被定制，如上所述。

## 2. CRA中开启Service Worker并提示用户刷新页面以更新

[参考文章](https://stackoverflow.com/questions/40100922/activate-updated-service-worker-on-refresh "参考文章")

此demo 使用 `cra-template-pwa-typescript` 模板创建。

1.  index.tsx 中增加如下代码。

    ```typescript
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.register({
      onUpdate: (registration: ServiceWorkerRegistration) => {
        if (registration.waiting) {
          const update = window.confirm('当前有可用更新，立即更新？');
          if (update) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      },
    });
    ```

2.  serviceWorkerRegistration.ts 中增加如下代码。

    ```typescript
    function registerValidSW(swUrl: string, config?: Config) {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            // 省略...
          }
          // 当用户要求刷新用户界面时，我们需要重新加载窗口
          let refreshing: boolean;
          navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (refreshing) return; // 确保刷新只被调用一次
            window.location.reload();
            refreshing = true;
          });
        })
        .catch((error) => {
          console.error('Error during service worker registration:', error);
        });
    }
    ```

每次更新服务器后，浏览器会弹出如下是否更新的弹窗。点击确定会自动刷新页面，并看到最新的内容。

![](/images/2022-01-14-service-worker/image_1.png)

## 3. skipWaiting()

Service Worker在有可用更新时，调用`skipWaiting()` 前后的状态：

1.  初始状态：

    ![](/images/2022-01-14-service-worker/image_2.png)

2.  有可用更新：

    ![](/images/2022-01-14-service-worker/image_3.png)

3.  调用`skipWaiting()` ：

    ![](/images/2022-01-14-service-worker/image_4.png)

4.  最后刷新页面或调用`window.location.reload()` 就能看到最新的内容。
