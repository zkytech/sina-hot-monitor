import * as d3 from 'd3';
import { ChartData, ChartDataMap, ChartOption } from './index';

const goldenRatio = 0.0618;

export class SVGChart {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private appearColor = '#e67e22';
  private commonColor = '#3498db';
  private updateDuration = 1000;
  // @ts-ignore
  private nodes: d3.Selection<d3.BaseType, ChartData, d3.BaseType, undefined>;
  private data: ChartData[] = [];
  private dataMap: ChartDataMap = {};

  private scaleX: d3.ScaleLinear<number, number> = d3
    .scaleLinear()
    .domain([0, 0])
    .range([0, 0]);
  private labelWidth: number = 200; // label占用的宽度
  private xAxisHeight = 20;
  private margin = { left: 10, right: 10, top: 10, bottom: 10 };
  //@ts-ignore
  private titleSize: number;
  // @ts-ignore
  private originData: ChartData[] | ChartDataMap;
  // @ts-ignore
  private title: string;
  // @ts-ignore
  private info: string;

  get lineHeight(): number {
    return (
      (this.container.offsetHeight -
        this.chartOffsetBottom -
        this.chartOffsetTop) /
      this.data.length
    );
  }

  get titleHeight(): number {
    return this.titleSize ? this.titleSize + 10 : 30;
  }

  get chartOffsetLeft(): number {
    return this.labelWidth + this.margin.left;
  }

  get chartOffsetRight(): number {
    return this.margin.right;
  }

  get chartOffsetTop(): number {
    return this.titleHeight + this.margin.top;
  }

  get chartOffsetBottom(): number {
    return this.margin.bottom + this.xAxisHeight;
  }

  constructor(container: HTMLElement) {
    this.container = container;
    this.svg = this.buildSVG();
  }

  /**
   * 修改数据并渲染
   * @param option
   */
  public setOption(option: ChartOption) {
    this.originData = option.data;
    this.title = option.title;
    option.updateDuration && (this.updateDuration = option.updateDuration);
    option.margin && (this.margin = option.margin);
    option.titleSize && (this.titleSize = option.titleSize);
    option.labelWidth && (this.labelWidth = option.labelWidth);
    option.info && (this.info = option.info);
    this.draw();
  }

  private buildSVG() {
    const svg = d3
      .create('svg')
      .attr('height', this.container.offsetHeight)
      .attr('width', this.container.offsetWidth);
    svg
      .append('g')
      .attr('class', 'chart')
      .attr('transform', `translate(${this.labelWidth},0)`); // bar 容器

    svg
      .append('g')
      .attr('class', 'xAxis')
      // .style('width', this.container.offsetWidth - this.labelWidth)
      .attr(
        'transform',
        `translate(${this.labelWidth},${this.container.offsetHeight -
          this.chartOffsetBottom})`
      ); // x轴容器

    svg.append('text').attr('class', 'title'); // 标题容器
    svg.append('text').attr('class', 'info'); // info容器

    this.container.appendChild(svg.node() as SVGSVGElement);

    return svg;
  }

  /**
   * 绘制
   */
  private draw() {
    if (this.originData instanceof Array) {
      this.data = this.originData;
      this.originData.forEach(
        (d, index) => (this.dataMap[d.id] = { rank: index, value: d.value })
      );
    } else {
      this.dataMap = this.originData;
      this.data = Object.keys(this.originData).map(key => {
        return {
          id: key,
          value: this.dataMap[key].value
        };
      }); // 构建d3可接收的data
    }

    this.svg
      .attr('height', this.container.offsetHeight)
      .attr('width', this.container.offsetWidth);
    // 为了实现动态x轴长度，所以不使用固定的this.scaleX
    this.scaleX = d3
      .scaleLinear()
      .domain([
        0,
        1.1 * (d3.max(this.data, (d: ChartData) => d.value) as number)
      ])
      .range([
        0,
        this.container.offsetWidth -
          this.chartOffsetLeft -
          this.chartOffsetRight
      ]);

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
    // 更新title
    this.svg
      .select('text.title')
      .attr('text-anchor', 'middle')
      .attr('x', this.container.offsetWidth / 2)
      .attr('y', this.titleHeight)
      .style('font-size', this.titleHeight)
      .text(this.title);

    // 更新info
    this.svg
      .select('text.info')
      .attr('text-anchor', 'middle')
      .attr('x', this.container.offsetWidth - 500)
      .attr('y', this.container.offsetHeight - 100)
      .style('font-size', 50)
      .text(this.info);

    // 更新坐标轴
    const xAxis = d3.axisBottom(this.scaleX).ticks(5);
    this.svg
      .select('g.xAxis')

      .transition()
      .attr(
        'transform',
        `translate(${this.labelWidth},${this.container.offsetHeight -
          this.xAxisHeight -
          this.margin.bottom})`
      ) // TODO:自定义坐标轴文字
      // @ts-ignore
      .call(xAxis);

    // 更新bar
    const updateNode = this.nodes;
    updateNode
      .transition('update')
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

    const updateBar = updateNode.select('rect');
    updateBar
      .transition('update')
      .duration(this.updateDuration)
      .style('fill', this.commonColor) // 设置颜色
      .attr('width', (d: ChartData) => this.scaleX(d.value)) // 更新bar宽度
      .attr('height', this.lineHeight * 0.8); // 更新bar高度

    // 更新数值
    const updateValText = updateNode.select('.value_text');
    updateValText
      .style('font-size', this.lineHeight * (1 - goldenRatio))

      .transition('update')
      .duration(this.updateDuration * 1.1)
      .attr('text-anchor', 'end')
      .attr('x', (d: ChartData) => this.scaleX(d.value) + 20)
      .attr('y', 0.6 * this.lineHeight)
      .tween('text', function(d) {
        const self = this as any;
        // @ts-ignore
        const i = d3.interpolateNumber(this.textContent as number, d.value);
        return t => (self.textContent = Math.floor(i(t))); // 动画期间执行返回的这个函数，t的值代表动画执行的百分比
      });

    // 更新节点label
    const updateLabel = updateNode.select('.label_text');
    updateLabel
      .text(d => d.id)
      .attr('y', 0.6 * this.lineHeight)
      .style('font-size', this.lineHeight * (1 - goldenRatio));
  }

  /**
   * 新增节点
   */
  private enter() {
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
      .style('fill', this.appearColor) // bar颜色
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
      .attr('text-anchor', 'end')
      .attr('x', (d: ChartData) => this.scaleX(d.value) + 20)
      .attr('y', 0.6 * this.lineHeight)
      .style('font-size', this.lineHeight * (1 - goldenRatio))
      .text(d => d.value);

    // 添加label
    newNode
      .append('text')
      .attr('class', 'label_text')
      .attr('x', -this.labelWidth + this.margin.left)
      .attr('y', 0.6 * this.lineHeight)
      .style('font-size', this.lineHeight * (1 - goldenRatio))
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
}
