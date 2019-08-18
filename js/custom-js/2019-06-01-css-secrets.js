// 判断 DOM 元素是否有指定的类名
function hasClass(dom, className) {
  return dom.className.indexOf(className) >= 0;
}
// 获取 DOM 元素的 class 名称数组
function getClassArr(dom, obmitedClassName) {
  var classNameArr = dom.className.split(/\s+/);
  if (obmitedClassName) {
    return classNameArr.filter(function(className) {
      return className !== obmitedClassName;
    });
  }
  return classNameArr;
}
// 给 DOM 元素添加类名
function addClass(dom, addClassName) {
  var classNameArr = getClassArr(dom, addClassName);
  classNameArr.push(addClassName);
  dom.setAttribute("class", classNameArr.join(" "));
}
// 从 DOM 元素上移除类名
function removeClass(dom, removeClassName) {
  var classNameArr = getClassArr(dom, removeClassName);
  dom.setAttribute("class", classNameArr.join(" "));
}
// 给 NodeList 数组中的每个节点添加类名
function addClassForDomArr(domArr, addClassName) {
  if (domArr instanceof NodeList) {
    Array.prototype.forEach.call(domArr, function(dom) {
      addClass(dom, addClassName);
    });
  }
}
// 从 NodeList 数组的每个节点上移除类名
function removeClassForDomArr(domArr, removeClassName) {
  if (domArr instanceof NodeList) {
    Array.prototype.forEach.call(domArr, function(dom) {
      removeClass(dom, removeClassName);
    });
  }
}
/* 3.5 */
(function() {
  var navDom = document.querySelector(".nav-3-5");
  var liDomArr = navDom.querySelectorAll("li");
  var contentDom = document.querySelector(".content-3-5");
  navDom.addEventListener("click", clickTab);
  // 点击 tab 页的回调函数
  function clickTab(event) {
    removeClassForDomArr(liDomArr, "selected");
    addClass(event.target, "selected");
    contentDom.innerHTML = event.target.innerHTML;
  }
})();

/* 3.6 */
(function() {
  var pieDomArr = document.querySelectorAll(".pie");
  pieDomArr.forEach(function(pieDom) {
    var ratial = parseFloat(pieDom.innerHTML); // `20%` 转 20
    pieDom.style.animationDelay = -ratial + "s";
  });
})();

(function() {
  var pieDomArr = document.querySelectorAll(".pie-svg");
  pieDomArr.forEach(function(pieDom) {
    var ratial = parseFloat(pieDom.innerHTML); // `20%` 转 20
    var ns = "http://www.w3.org/2000/svg";
    var svgDom = document.createElementNS(ns, "svg");
    var titleDom = document.createElementNS(ns, "title");
    var circleDom = document.createElementNS(ns, "circle");
    /* svg 元素 */
    svgDom.setAttribute("viewBox", "0 0 32 32"); //四个参数为: min-x min-y width height
    svgDom.style.transform = "rotate(-90deg)";
    svgDom.style.borderRadius = "50%";
    /* title 元素 */
    titleDom.innerHTML = pieDom.innerHTML;
    /* circle 元素 */
    circleDom.setAttribute("r", 16);
    circleDom.setAttribute("cx", 16);
    circleDom.setAttribute("cy", 16);
    circleDom.setAttribute("fill", "#ff7875");
    circleDom.setAttribute("stroke", "#69c0ff");
    circleDom.setAttribute("stroke-width", 32);
    circleDom.setAttribute("stroke-dasharray", ratial + " 100");
    /* 插入至 DOM 中 */
    svgDom.appendChild(titleDom);
    svgDom.appendChild(circleDom);
    pieDom.innerHTML = "";
    pieDom.appendChild(svgDom);
  });
})();

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
/* 7.2 */
(function() {
  var rangeInputs = document.querySelectorAll(".sibling-count-7-2 input");
  rangeInputs.forEach(function(input) {
    updateUlElement(input, true); //初始化
    input.addEventListener("change", function(e) {
      updateUlElement(e.target);
    });
  });
  // 更新 ul 元素
  function updateUlElement(target, isInit) {
    var value = target.value;
    var ulDom = createList(value);
    target.previousElementSibling.textContent = value;
    if (isInit) {
      target.parentNode.appendChild(ulDom);
    } else {
      target.parentNode.replaceChild(ulDom, target.nextElementSibling);
    }
  }
  // 根据 num 创建 ul
  function createList(num) {
    var i,
      divDom,
      doc = document;
    num = parseInt(num);
    var ul = document.createElement("ul");
    ul.className = "container";
    for (i = 0; i < num; i++) {
      divDom = doc.createElement("li");
      divDom.textContent = i + 1;
      ul.appendChild(divDom);
    }
    return ul;
  }
})();
