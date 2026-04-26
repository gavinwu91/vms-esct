export interface PieItem {
  id: number,
  name?: string;
  value: number;
  color?: string;
  opacity?: number;
  startRatio?: number;
  endRatio?: number;
}


interface SeriesItem {
  name: string;
  type: string;
  parametric: boolean;
  wireframe: {
    show: boolean;
  };
  pieData: PieItem;
  pieStatus: {
    selected: boolean;
    hovered: boolean;
    k: number;
  };
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
  parametricEquation?: any;
}

interface ParametricEquation {
  u: {
    min: number;
    max: number;
    step: number;
  };
  v: {
    min: number;
    max: number;
    step: number;
  };
  x: (u: number, v: number) => number;
  y: (u: number, v: number) => number;
  z: (u: number, v: number) => number;
}

/**
 * 绘制3d图
 */
const getPie3D = (
  pieData: PieItem[],
  distance: number = 180
): any => {
  //总数
  const total = pieData.reduce((a, b) => a + b.value, 0);
  const maxValue = pieData.reduce((max, item) => Math.max(max, item.value), -Infinity);

  //当前累加值
  let sumValue = 0;
  //辅助参数,控制饼图半径，（0-1）范围内控制环形大小，值越小环形内半径越大
  const k = 0.3;

  //series配置（每个扇形）
  const series = pieData.map((item) => {
    //当前扇形起始位置占饼图比例
    const startRatio = sumValue / total;
    //值累加
    sumValue += item.value;
    //当前扇形结束位置占饼图比例
    const endRatio = sumValue / total;

    return {
      name: item.name ?? null,
      type: "surface", //曲面图
      itemStyle: {
        color: item.color ?? null, //颜色
      },
      wireframe: {
        show: false, //不显示网格线
      },
      pieData: item, //数据
      //饼图状态
      pieStatus: {
        k, //辅助参数
        startRatio, //起始位置比例
        endRatio, //结束位置比例
        value: item.value, //数值
      },
      parametric: true, //参数曲面
      //曲面的参数方程
      parametricEquation: getParametricEquation(
        startRatio,
        endRatio,
        k,
        item.value
      ),
    };
  });

  //返回配置
  return {

    //提示框
    tooltip: {
      formatter: (params) => {
        if (
          params.seriesName !== "mouseoutSeries" &&
          params.seriesName !== "pie2d"
        ) {
          return `${
            params.seriesName
          }<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
            params.color
          };"></span>${series[params.seriesIndex].pieData.value}`;
        }
        return "";
      },
    },
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: 0,
      max: (maxValue<10?10:maxValue)/ 10,
    },
    //
    grid3D: {
      show: false, //不显示坐标系
      boxWidth: 200,
      boxDepth: 200,
      boxHeight: 50,
      // 用于鼠标的旋转，缩放等视角控制
      viewControl: {
        center: [0, -10, 0], // 把图形整体往上移
        alpha: 30, //视角
        distance: distance, //距离，值越大饼图越小
        rotateSensitivity: 1, //禁止旋转
        zoomSensitivity: 0, //禁止缩放
        panSensitivity: 0, //禁止平移
        autoRotate: false, //禁止自动旋转
        autoRotateSpeed: 60,
      },
    },
    series,
  };
};

/**
 * 获取面的参数方程
 * @param {*} startRatio 扇形起始位置比例
 * @param {*} endRatio 扇形结束位置比例
 * @param {*} k 辅助参数,控制饼图半径
 * @param {*} value 数值
 */
const getParametricEquation = (
  startRatio: number = 0,
  endRatio: number = 1,
  k: number = 1 / 3,
  value: number
): ParametricEquation => {
  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;

  k = typeof k === "number" && !isNaN(k) ? k : 1 / 3; //默认1/3

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },

    x(u, v) {
      if (u < startRadian) {
        return Math.cos(startRadian) * (1 + Math.cos(v) * k);
      }
      if (u > endRadian) {
        return Math.cos(endRadian) * (1 + Math.cos(v) * k);
      }
      return Math.cos(u) * (1 + Math.cos(v) * k);
    },

    y(u, v) {
      if (u < startRadian) {
        return Math.sin(startRadian) * (1 + Math.cos(v) * k);
      }
      if (u > endRadian) {
        return Math.sin(endRadian) * (1 + Math.cos(v) * k);
      }
      return Math.sin(u) * (1 + Math.cos(v) * k);
    },

    z(u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * value * 0.1;
      }
      // 扇形高度根据value值计算
      return Math.sin(v) > 0 ? value * 0.1 : -1;
    },
  }
};



/**
 * 浮点数格式化
 */
const fomatFloat = (num: number, n: number): string => {
  let f = parseFloat(num.toString());
  if (isNaN(f)) return '0.0000';
  f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n);
  let s = f.toString();
  let rs = s.indexOf(".");
  if (rs < 0) {
    rs = s.length;
    s += ".";
  }
  while (s.length <= rs + n) {
    s += "0";
  }
  return s;
};

export {getPie3D, getParametricEquation};
