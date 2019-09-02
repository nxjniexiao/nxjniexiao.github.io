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
/* 7.5 */
(function() {
  var mainDomArr = document.querySelectorAll(".container-7-5 main");
  mainDomArr.forEach(function(main) {
    main.addEventListener('click', function(e) {
      console.log(main.offsetHeight);
      if (main.offsetHeight < 500) {
        main.style = "height: 600px;";
      } else {
        main.style = "";
      }
    });
  })
})();