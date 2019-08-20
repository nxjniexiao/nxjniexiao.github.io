var btnCalcArr = document.querySelectorAll('.btn-calc');
btnCalcArr.forEach(function(btn) {
  btn.addEventListener('click', function() {
    var start, end, res, resultDom;
    // console.log(testData);
    start = new Date().getTime();
    switch (this.id) {
      case 'btn-3-1':
          res = arrayToTreeRecursion(testData, 0); // testData 来自 data.js
          break;
      case 'btn-3-2':
          res = arrayToTreeLoop(testData, 0); // testData 来自 data.js
          break;
      case 'btn-3-3':
          res = arrayToTree(testData); // testData 来自 data.js
          break;
    }
    end = new Date().getTime();
    resultDom = document.querySelector('#' + this.id + ' + .result');
    resultDom.textContent = '平级数组长度: ' + testData.length + "; 转换为树形数组耗时: " + (end - start) + 'ms。'
    // console.log(res);  
  });
})

// 3.1 递归实现
function arrayToTreeRecursion(array, parentId) {
  var arrayCopy = array.slice(); // 浅拷贝
  var res = [];
  for (var i = array.length - 1; i >= 0; i--) {
    var item = array[i];
    if (item.pid == parentId) {
      arrayCopy.splice(i, 1);
      res.unshift(item);
    }
  }
  for (var j = 0, max = res.length; j < max; j++) {
    var item = res[j];
    item.children = arrayToTreeRecursion(arrayCopy, item.id);
  }
  return res;
}

// 3.2 循环实现
function arrayToTreeLoop(array, parentId) {
  var arrayCopy = (array = array.slice());
  var currLevel = [];
  var nextLevel = [];
  var res = []; // 返回的结果
  var item, currItem;
  var i, j, len;
  // 查找根节点
  for (i = array.length - 1; i >= 0; i--) {
    item = array[i];
    if (item.pid == parentId) {
      currLevel.unshift(item);
      arrayCopy.splice(i, 1);
    }
  }
  if (currLevel.length <= 0) {
    throw new Error('未找到根节点');
  }
  array = arrayCopy.slice(); // 复制(浅拷贝)
  res = currLevel;
  do {
    // 循环当前层 currLevel，从 arrayCopy 中找出下一层 nextLevel
    for (i = 0, len = currLevel.length; i < len; i++) {
      currItem = currLevel[i];
      if (!currItem.children) {
        currItem.children = [];
      }
      for (j = array.length - 1; j >= 0; j--) {
        item = array[j];
        if (item.pid === currItem.id) {
          arrayCopy.splice(j, 1);
          currItem.children.unshift(item);
          nextLevel.unshift(item);
        }
      }
      if (currItem.children.length === 0) {
        delete currItem.children;
      }
      array = arrayCopy.slice(); // 更新 array (浅拷贝)：重要
    }
    currLevel = nextLevel;
    nextLevel = []; // 重置 nextLevel
  } while (array.length && currLevel.length);
  return res;
}

// 3.3: zTree 中的算法
function arrayToTree(arr, key, parentKey) {
  var i, l;
  key = key || 'id';
  parentKey = parentKey || 'pid';
  if (!key || key == '' || !arr) {
    return [];
  }
  if (arr instanceof Array) {
    var res = [];
    var tmpMap = {};
    for (i = 0, l = arr.length; i < l; i++) {
      tmpMap[arr[i][key]] = arr[i];
    }
    for (i = 0, l = arr.length; i < l; i++) {
      var parent = tmpMap[arr[i][parentKey]]; // 当前节点的父节点(对象)
      if (parent && arr[i][key] != arr[i][parentKey]) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(arr[i]);
      } else {
        res.push(arr[i]); //当前节点没有父节点
      }
    }
    return res;
  } else {
    return [arr];
  }
}
