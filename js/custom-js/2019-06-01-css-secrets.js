/* 3.5 */
(function() {
  var navDom = document.querySelector('.nav-3-5');
  var liDomArr = navDom.querySelectorAll('li');
  var contentDom = document.querySelector('.content-3-5');
  navDom.addEventListener('click', clickTab);
  // 点击 tab 页的回调函数
  function clickTab(event) {
    removeClass();
    event.target.classList.add('selected');
    contentDom.innerHTML = event.target.innerHTML;
  }
  // 移除所有 li 元素的 'selected' 类
  function removeClass() {
    liDomArr.forEach(function(dom) {
      dom.classList.remove('selected');
    });
  }
})();
