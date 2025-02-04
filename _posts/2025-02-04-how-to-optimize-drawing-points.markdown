---
layout: post
title: 如何优化用户手绘点并减少内存占用
date: 2025-02-04 18:54:00 +0800
categories: Canvas
tags: Canvas
---

## 1. 前提

前阵子读过一篇 Miro 前端工程师写得一篇文章 [Fighting for bytes in the frontend](https://medium.com/miro-engineering/fighting-for-bytes-in-the-frontend-419c48103ef8)。里面讲了他们采用了哪些方法来减少 Ipad 内存被耗尽的几率。

里面提到他们已经对用户的手绘点做了如下处理：
1. 优化点的数量，有助于减少绘画。
2. 生成控制点，用于绘制贝塞尔曲线。

手绘点数据类型：

```ts
type Point = {
  x: number;
  y: number;
}
type Points = Point[];
```

处理后的定位点类型与手绘点一致，控制点类型如下：

```ts
// 贝塞尔曲线定位点
type OptimizedPoints = Point[];
// 贝塞尔曲线控制点
type ControlPoints = Point[][];
```

## 2. 优化方案

最终他们采取的优化方案是：**把所有点存储为** `Float64Array` 。

文中提到数组的内存占用是远大于 `Float64Array` 的：
- 对于点数组 `const points = [ {x: 0, y: 0}, {x: 5, y: 5} ]` 的占用内存如下：
   - Shallow Size: 20 字节；（points数组本身的占用）
   - Retained Size: **40 字节**；（一个点对象的占用）
- 改为 `Float64Array` 后为 `const points = [0, 0, 5, 5]`，其占用内存如下：
   - Shallow Size: 20 字节；
   - Retained Size: **16 字节**；
     (一个元素占 8 个字节，可通过 `Float64Array.BYTES_PER_ELEMENT` 查看，一个点由两个元素组成)

## 3. 如何实现

具体效果见[白板 Demo](/demos/whiteboard/)。

![whiteboard](/images/2025-02-04-how-to-optimize-drawing-points/whiteboard.png)

### 3.1 优化手绘点的数量

Miro 使用 RDP 算法优化手绘点的数量，减少绘制。

RDP 算法（Ramer-Douglas-Peucker 算法）是一种用于简化折线或多边形点集的算法。它的主要目的是减少点的数量，同时保持原始形状的近似特征。

该算法广泛应用于地理信息系统（GIS）、计算机图形学和数据压缩等领域。

算法步骤:
- 初始化：
  给定一条由多个点组成的折线，选择起点和终点作为关键点。

- 计算最大偏差：
  在起点和终点之间，计算所有中间点到这两点连线的垂直距离。
  找到距离最大的点，记录其距离为最大偏差。

- 判断简化条件：
   - 如果最大偏差小于预设的阈值（ε），则简化掉所有中间点，只保留起点和终点。
   - 如果最大偏差大于或等于阈值，则保留该点作为关键点，并将折线分为两部分，分别对这两部分递归应用RDP算法。

- 递归处理：
  对每一部分重复上述步骤，直到所有子段的最大偏差都小于阈值。

- 输出结果：
  最终得到简化后的点集，这些点能够较好地近似原始折线。

### 3.2 计算控制点

计算控制点的函数定义如下：

```ts
function generateControlPoints(
  points: Point[],
  threshold: number
): Point[][]
```

参数如下：
- `points: Point[]`：一个点数组，表示路径上的点。

- `threshold: number`：一个阈值，用于控制生成控制点的精度。

返回如下：

- `Point[][]`：一个二维数组，表示每个点对应的控制点。

控制点生成逻辑如下：

- 遍历点集，计算每个点的方向向量、垂直向量、中点等。

- 根据当前点、前一个点和下一个点的位置关系，计算左右控制点。

- 使用 computeDirection 函数计算方向，并根据方向生成控制点。

- 如果方向是直线（straight），则跳过生成控制点。


`computeDirection` 使用向量叉乘计算方向：
```ts
export interface Direction {
  toRight?: boolean;
  toLeft?: boolean;
  straight?: boolean;
}

export function computeDirection(
  start: Point,
  mid: Point,
  end: Point
): Direction {
  let direction: Direction = {};
  let crossProduct =
    (end.x - start.x) * (mid.y - start.y) -
    (end.y - start.y) * (mid.x - start.x);

  if (crossProduct < 0) direction.toRight = true;
  else if (crossProduct > 0) direction.toLeft = true;
  else direction.straight = true;

  return direction;
}
```

### 3.3 使用 Float64Array 储存定位点和控制点

Miro 使用 `OptimizedPoints` 和 `ControlPoints` 来分别存储贝塞尔曲线的定位点和控制点。

定位点 `OptimizedPoints` 类型如下：

```ts
class OptimizedPoints {
  private static readonly POINT_ELEMENTS_COUNT: number = 2;

  static fromArray(points: Point[]): OptimizedPoints;

  static createView(points: Point[]): Float64Array;

  private view: Float64Array;

  constructor(points: Point[]) {
    this.view = OptimizedPoints.createView(points);
  }

  toArray(): Point[];
}
```

控制点 `ControlPoints` 类型如下：

```ts
export class ControlPoints {
  private static readonly POINT_ELEMENTS_COUNT: number = 2;

  static fromArray(segments: Point[][]): ControlPoints;

  static getArrayInfo(segments: Point[][]): {
    totalPoints: number;
    segmentStartIndices: number[];
  }

  static createView(segments: Point[][]): {
    view: Float64Array;
    totalPoints: number;
    segmentStartIndices: number[];
  }

  private view: Float64Array;
  private totalPoints: number;
  private segmentStartIndices: number[];

  constructor(segments: Point[][]) {
    const { view, totalPoints, segmentStartIndices } =
      ControlPoints.createView(segments);
    this.view = view;
    this.totalPoints = totalPoints;
    this.segmentStartIndices = segmentStartIndices;
  }

  toArray(): Point[][];
}
```