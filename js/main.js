// 重定向时显示 loading 动画
(function showLoadingWhenRedirecting() {
  const loadingContainer = document.querySelector(".loading-container");
  if (!loadingContainer) return;

  document.addEventListener("click", e => {
    const target = e.target;
    const isLink = target.tagName.toUpperCase() === 'A';
    let link;
    if (isLink) {
      link = target;
    } else {
      link = target.closest("a");
    }
    if (!link) return;
    const href = link.getAttribute("href");
    if (href.startsWith("/")) {
      loadingContainer.setAttribute("style", "visibility: visible;")
    }
  }, false)

  // fix: 点击浏览器返回按钮后，页面仍显示 loading
  window.addEventListener("pageshow", event => {
    loadingContainer.setAttribute("style", "");
  }, false);

})();
