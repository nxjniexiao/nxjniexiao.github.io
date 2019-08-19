/* 6.3 & 6.4 */
(function() {
  /* 6.3 */
  var btn_6_3_1 = document.querySelector("#btn-6-3_1");
  btn_6_3_1.addEventListener("click", function() {
    var modal_6_3_1 = document.querySelector("#modal-6-3_1");
    addClass(modal_6_3_1, "show");
  });
  var overlayArr = document.querySelectorAll(".overlay");
  // 隐藏弹窗函数
  function hideModal() {
    removeClassForDomArr(overlayArr, "show");
  }
  // 给所有隐藏弹窗按钮绑定点击回调
  var cancelBtnsArr = document.querySelectorAll(".hide-modal-btn");
  cancelBtnsArr.forEach(function(btn) {
    btn.addEventListener("click", hideModal);
  });
  // 给所有背景绑定点击回调
  overlayArr.forEach(function(overlay) {
    overlay.addEventListener("click", function(event) {
      if (hasClass(event.target, "overlay")) {
        hideModal(event);
      }
    });
  });
})();