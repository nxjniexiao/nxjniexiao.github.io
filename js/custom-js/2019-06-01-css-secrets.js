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
