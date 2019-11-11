import * as d3 from 'd3';
import {
  ChartData,
  ChartDataMap,
  ChartOption,
  ChartTitle,
  Vector2D
} from './index';
import randomcolor from 'randomcolor';
import { deepAssign } from '../../../util';

type CSSMargin = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
let that: SVGChart;
const goldenRatio = 0.0618;
const arrowPath =
  'M950.857143 512v73.142857q0 30.285714-18.571429 51.714286T884 658.285714H481.714286l167.428571 168q21.714286 20.571429 21.714286 51.428572t-21.714286 51.428571l-42.857143 43.428572q-21.142857 21.142857-51.428571 21.142857-29.714286 0-52-21.142857l-372-372.571429q-21.142857-21.142857-21.142857-51.428571 0-29.714286 21.142857-52l372-371.428572q21.714286-21.714286 52-21.714286 29.714286 0 51.428571 21.714286l42.857143 42.285714q21.714286 21.714286 21.714286 52t-21.714286 52L481.714286 438.857143h402.285714q29.714286 0 48.285714 21.428571T950.857143 512z';
export class SVGChart {
  // TODO:所有长宽以容器大小为基准
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  // @ts-ignore
  private nodes: d3.Selection<d3.BaseType, ChartData, d3.BaseType, undefined>;
  private data: ChartData[] = [];
  private dataMap: ChartDataMap = {};
  private colorMap: { [key: string]: string } = {};
  private scaleX: d3.ScaleLinear<number, number> = d3
    .scaleLinear()
    .domain([0, 0])
    .range([0, 0]);
  get xAxisHeight() {
    return 10;
  }
  private option = {
    set data(originData: ChartData[] | ChartDataMap) {
      if (originData instanceof Array) {
        that.data = originData;
        originData.forEach(
          (d, index) => (that.dataMap[d.id] = { rank: index, value: d.value })
        );
      } else {
        that.dataMap = originData;
        that.data = Object.keys(originData).map(key => {
          return {
            id: key,
            value: that.dataMap[key].value
          };
        }); // 构建d3可接收的data
      }
    },
    height: 0,
    width: 0,
    info: {
      content: '',
      color: '#0984e3',
      size: 60,
      position: {
        x: 900,
        y: 900
      }
    },
    title: {
      content: '',
      color: '#636e72',
      size: 50,
      position: {
        x: 20,
        y: 50
      }
    },
    margin: {
      left: 5,
      right: 100,
      top: 10,
      bottom: 10
    },
    keyword: '',
    labelWidth: 100,
    updateDuration: 1000
  };

  /** 高度基准、字体大小基准 */
  get baseHeight(): number {
    return this.container.offsetHeight / 1000;
  }

  /** 宽度基准 */
  get baseWidth(): number {
    return this.container.offsetWidth / 1000;
  }

  /**
   * 标题属性
   */
  get title(): Required<ChartTitle> {
    return {
      content: that.option.title.content,
      color: that.option.title.color,
      get size(): number {
        return that.option.title.size * that.baseHeight;
      },
      position: {
        get x(): number {
          return that.option.title.position.x * that.baseWidth;
        },
        get y(): number {
          return that.option.title.position.y * that.baseHeight;
        }
      }
    };
  }

  get info(): Required<ChartTitle> {
    return {
      content: that.option.info.content,
      color: that.option.info.color,
      get size(): number {
        return that.option.info.size * that.baseHeight;
      },
      position: {
        get x(): number {
          return that.option.info.position.x * that.baseWidth;
        },
        get y(): number {
          return that.option.info.position.y * that.baseHeight;
        }
      }
    };
  }

  get updateDuration(): number {
    return that.option.updateDuration;
  }

  get keyword(): string {
    return that.option.keyword ? that.option.keyword : '';
  }

  get labelWidth(): number {
    return this.option.labelWidth * this.baseWidth;
  }

  get lineHeight(): number {
    return (
      (this.container.offsetHeight -
        this.chartOffsetBottom -
        this.chartOffsetTop) /
      this.data.length
    );
  }
  /** 每个bar占用的行高，包含空白部分 */
  get titleHeight(): number {
    return this.title.size + this.margin.top;
  }

  /** 图表主体的左侧偏移量 */
  get chartOffsetLeft(): number {
    return this.labelWidth + this.margin.left;
  }

  /** 图表主体的右侧偏移量 */
  get chartOffsetRight(): number {
    return this.margin.right;
  }

  /** 图表主体的顶部偏移量 */
  get chartOffsetTop(): number {
    return this.titleHeight + this.margin.top;
  }

  /** 图表主体的底部偏移量 */
  get chartOffsetBottom(): number {
    return this.margin.bottom + this.xAxisHeight;
  }

  get margin(): CSSMargin {
    return {
      top: this.option.margin.top * this.baseHeight,
      bottom: this.option.margin.bottom * this.baseHeight,
      left: this.option.margin.left * this.baseWidth,
      right: this.option.margin.right * this.baseWidth
    };
  }

  constructor(container: HTMLElement) {
    this.container = container;
    this.svg = this.buildSVG();
    that = this;
  }
  /** 初始化 */
  private buildSVG() {
    const svg = d3
      .create('svg')
      .attr('height', this.container.offsetHeight)
      .attr('width', this.container.offsetWidth);
    d3.select(this.container)
      .append('div')
      .attr('id', 'bar-chart-tooltip')
      .style('visibility', 'hidden')
      .style('background', 'RGBA(0,0,0,.8)')
      // .style('height', '10000px') // tooltip
      .style('color', '#ffffff')
      .style('position', 'absolute')
      .style('border', '1px solid RGBA(0,0,0,.8)')
      .style('border-radius', '2px');
    // .style('z-index', 10);
    svg.append('g').attr('class', 'chart');
    svg.append('g').attr('class', 'xAxis');
    // .style('width', this.container.offsetWidth - this.labelWidth)

    svg
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'right'); // 标题容器
    svg
      .append('text')
      .attr('class', 'info')
      .attr('text-anchor', 'end'); // info容器

    this.container.appendChild(svg.node() as SVGSVGElement);
    return svg;
  }
  /** 渲染 */
  private renderXGrid() {
    this.svg
      .selectAll('g.xAxis g.tick')
      .select('line.grid-line')
      .remove();
    const lines = d3
      .selectAll('g.xAxis g.tick')
      .append('line')
      .classed('grid-line', true);

    lines
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr(
        'y2',
        -(
          this.container.offsetHeight -
          this.chartOffsetBottom -
          this.chartOffsetTop
        )
      )
      .attr('stroke', 'black')
      .attr('stroke-opacity', 0.2);
  }

  /**
   * 修改数据并渲染
   * @param option
   */
  public setOption(option: ChartOption) {
    // @ts-ignore
    deepAssign(this.option, option);
    this.draw();
  }

  /**
   * 绘制
   */
  private draw() {
    this.svg
      .attr('height', this.container.offsetHeight)
      .attr('width', this.container.offsetWidth);
    // 为了实现动态x轴长度，所以不使用固定的this.scaleX
    const xWidth =
      this.container.offsetWidth - this.chartOffsetLeft - this.chartOffsetRight;
    this.scaleX = d3
      .scalePow()
      .exponent(0.3)
      .domain([0, d3.max(this.data, (d: ChartData) => d.value) as number])
      .range([0, xWidth]);

    this.nodes = this.svg
      .select('.chart')
      .selectAll('g')
      .data(this.data, (d: any) => d.id);

    // 更新节点
    this.update();

    // 新增节点
    this.enter();

    // 删除节点
    this.exit();
  }

  /**
   * 更新bar&坐标轴
   */
  private update() {
    // 更新svg宽高
    this.svg
      .attr('height', this.container.offsetHeight)
      .attr('width', this.container.offsetWidth);
    // 更新chart容器
    this.svg
      .select('g.chart')
      .attr('transform', `translate(${this.chartOffsetLeft},0)`);
    // 更新title
    this.svg
      .select('text.title')
      .transition('update')
      .duration(this.updateDuration)
      .ease(d3.easeLinear)
      .attr('text-anchor', 'start')
      .attr('x', this.title.position.x)
      .attr('y', this.title.position.y)
      .style('font-size', this.title.size + 'px')
      .attr('stroke', this.title.color)
      .attr('stroke-width', 2)
      .attr('fill', this.title.color)
      .text(this.title.content);

    // 更新info
    this.svg
      .select('text.info')
      .transition('update')
      .duration(this.updateDuration)
      .ease(d3.easeLinear)
      .attr('x', this.info.position.x)
      .attr('y', this.info.position.y)
      .style('font-size', this.info.size + 'px')
      .attr('stroke', this.info.color)
      .attr('stroke-width', 3)
      .attr('fill', this.info.color)
      .text(this.info.content);

    // 更新坐标轴
    const xAxis = d3
      .axisBottom(this.scaleX)
      .ticks(5)
      .tickFormat(d => d.toString().split('.')[0]);
    this.svg
      .select('g.xAxis')
      .style('font-size', 0.5 * this.lineHeight + 'px')
      .transition()
      .duration(this.updateDuration)
      .ease(d3.easeLinear)
      .attr(
        'transform',
        `translate(${this.chartOffsetLeft},${this.container.offsetHeight -
          this.xAxisHeight -
          this.margin.bottom})`
      )

      // @ts-ignore
      .call(xAxis);
    // 更新网格线
    this.renderXGrid();

    // 更新节点
    const updateNode = this.nodes;
    updateNode
      .transition('update')
      .ease(d3.easeLinear)
      .duration(this.updateDuration) // 设置动画时长
      .attr('transform', (d: ChartData) => {
        const target = this.dataMap[d.id];
        if (target) {
          const offset = this.chartOffsetTop + this.lineHeight * target.rank;
          return `translate(0,${offset})`;
        } else {
          return null;
        }
      }); // 更新节点位置

    // 更新箭头
    const that = this;
    updateNode
      .select('path.arrow')
      .transition('update')
      .ease(d3.easeLinear)
      .duration(this.updateDuration) // 设置动画时长
      .style('opacity', d => {
        const reg = new RegExp(`(${this.keyword})`, 'g');
        return this.keyword && reg.test(d.id) ? 1 : 0;
      })
      .attr('transform', function(d) {
        // const el = d3.select(this).node();
        // // @ts-ignore
        // const st = window.getComputedStyle(el);
        // // @ts-ignore
        // const originProperty = st.getPropertyValue('transform');
        // @ts-ignore
        const originProperty = d3.select(this).attr('transform');
        const properties = originProperty
          .split('(')[2]
          .split(')')[0]
          .split(',');
        // @ts-ignore
        const height = this.getBoundingClientRect().height / properties[0];
        const offset = that.scaleX(d.value) + 130;
        return `translate(${offset},${-0.3 * that.lineHeight}) scale(${that.lineHeight / height})`;
      });
    // 更新bar
    const updateBar = updateNode.select('rect');

    updateBar
      .transition('update')
      .ease(d3.easeLinear)
      .duration(this.updateDuration)
      .style('fill', this.getColor) // 设置颜色
      .attr('width', (d: ChartData) => this.scaleX(d.value)) // 更新bar宽度
      .attr('height', this.lineHeight * 0.8); // 更新bar高度

    // 更新数值
    const updateValText = updateNode.select('.value_text');
    updateValText
      .style('font-size', this.lineHeight * (1 - goldenRatio) + 'px')
      .transition('update')
      .ease(d3.easeLinear)
      .duration(this.updateDuration)
      .attr('x', (d: ChartData) => this.scaleX(d.value) + 20)
      .attr('y', 0.5 * this.lineHeight)
      .tween('text', function(d) {
        const self = this as any;
        const i = d3.interpolate(self.textContent, Number(d.value));
        // @ts-ignore
        return function(t) {
          self.textContent = Math.round(i(t));
        };
      });

    // 更新节点label
    const updateLabel = updateNode.select('text.label_text');
    updateLabel
      .text(d => d.id)
      .attr('y', 0.5 * this.lineHeight)
      .style('font-size', this.lineHeight * 0.5 + 'px');

    const updateBarLabel = updateNode.select('text.bar_label_text');
    updateBarLabel
      .transition('update')
      .duration(this.updateDuration)
      .ease(d3.easeLinear)
      .attr('x', (d: ChartData) => this.scaleX(d.value) - 20)
      .attr('y', 0.5 * this.lineHeight)
      .attr('font-size', this.lineHeight * 0.9 + 'px')
      .style('opacity', 1)
      .text(d => d.id);
  }

  /**
   * 新增节点
   */
  private enter() {
    this.nodes
      .style('cursor', 'default')
      .on('mouseover', function(d) {
        const [x, y] = d3.mouse(that.container); //相对于container的鼠标定位
        // 显示tooltip
        d3.select('#bar-chart-tooltip')
          .html(`${d.id}<br/><text style="color:#EC05BA">${d.value}</text>`)
          .transition()
          .duration(100)
          .style('visibility', 'visible')
          .style('font-size', that.lineHeight + 'px')
          .style('left', x + 'px')
          .style('top', y + 'px');
      })
      .on('mouseout', function(d) {
        d3.select('#bar-chart-tooltip').style('visibility', 'hidden');
      });
    const newNode = this.nodes.enter().append('g');
    newNode
      .attr('transform', `translate(0 ,${this.container.offsetHeight})`) // 从底部进入
      .transition('new')
      .duration(this.updateDuration) // 设置动画
      .attr('transform', d => {
        const offset =
          this.dataMap[d.id].rank * this.lineHeight + this.chartOffsetTop;
        return `translate(0,${offset})`;
      }); // 移动到正确位置

    // 构建bar
    newNode
      .append('rect')
      .attr('class', 'bar-chart-bar')
      .style('fill', this.getColor) // bar颜色
      .attr('fill-opacity', 0)
      .attr('height', this.lineHeight * 0.8) // bar高度
      .attr('width', d => {
        return this.scaleX(d.value);
      })
      .transition('new')
      .duration(this.updateDuration) // 设置动画
      .attr('fill-opacity', 1); // bar宽度

    // 添加数值文本
    newNode
      .append('text')
      .attr('class', 'value_text')
      .attr('stroke', this.getColor)
      .attr('stroke-size', '2px')
      .attr('fill', this.getColor)
      .attr('text-anchor', 'left') // 文本水平对齐方式
      .attr('dominant-baseline', 'middle') // 文本垂直对齐方式
      .attr('x', (d: ChartData) => this.scaleX(d.value) + 20)
      .attr('y', 0.5 * this.lineHeight)
      .style('font-size', this.lineHeight * (1 - goldenRatio) + 'px')
      .text(d => d.value);

    // 添加箭头
    const that = this;
    newNode
      .append('path')
      .attr('class', 'arrow')
      .attr('d', arrowPath)
      .style('opacity', d => {
        const reg = new RegExp(`(${this.keyword})`, 'g');
        return this.keyword && reg.test(d.id) ? 1 : 0;
      })
      .attr('transform', function(d) {
        d3.select(this);
        // @ts-ignore
        const height = this.getBoundingClientRect().height;
        const offset = that.scaleX(d.value) + 100;
        return `translate(${offset},${-0.3 * that.lineHeight}) scale(${that.lineHeight / height})`;
      })
      .attr('fill', this.getColor);

    // 添加label
    newNode
      .append('text')
      .attr('class', 'label_text')
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle') // 文本垂直对齐方式
      .attr('fill', this.getColor)
      .attr('x', -this.margin.left)
      .attr('y', 0.5 * this.lineHeight)
      .style('font-size', this.lineHeight * 0.5 + 'px')
      .text(d => d.id);

    // 添加位于bar上的label
    newNode
      .append('text')
      .attr('class', 'bar_label_text')
      .attr('text-anchor', 'end')
      .attr('fill', '#ffffff')
      .attr('opacity', 0.5)
      .attr('stroke', this.getColor)
      .attr('stroke-width', 0.5)
      .attr('x', (d: ChartData) => this.scaleX(d.value) - 20)
      .attr('y', 0.5 * this.lineHeight)
      .attr('font-size', this.lineHeight * 0.9 + 'px')
      .text(d => d.id);
  }

  /**
   * 删除节点
   */
  private exit() {
    const exitNode = this.nodes
      .exit()
      .attr('fill-opacity', 1) // 透明度
      .transition('exit')
      .duration(this.updateDuration * 0.8); // 删除动画时长

    exitNode
      .attr('fill-opacity', 0) // 完全透明

      .attr('transform', `translate(0 ,${this.container.offsetHeight})`) // 移动到最底端
      .remove(); // 从dom中删除
  }

  private getColor = (d: ChartData) => {
    if (this.colorMap[d.id]) {
      return this.colorMap[d.id];
    } else {
      const color = randomcolor({ luminosity: 'dark' });
      this.colorMap[d.id] = color;
      return color;
    }
  };
}
