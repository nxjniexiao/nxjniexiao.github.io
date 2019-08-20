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
