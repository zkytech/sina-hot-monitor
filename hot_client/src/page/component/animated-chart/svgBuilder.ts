import * as d3 from 'd3';
import { ChartData, ChartDataMap, ChartOption, ChartTitle } from './index';
import randomcolor from 'randomcolor';
const goldenRatio = 0.0618;
const arrowPath =
  'M950.857143 512v73.142857q0 30.285714-18.571429 51.714286T884 658.285714H481.714286l167.428571 168q21.714286 20.571429 21.714286 51.428572t-21.714286 51.428571l-42.857143 43.428572q-21.142857 21.142857-51.428571 21.142857-29.714286 0-52-21.142857l-372-372.571429q-21.142857-21.142857-21.142857-51.428571 0-29.714286 21.142857-52l372-371.428572q21.714286-21.714286 52-21.714286 29.714286 0 51.428571 21.714286l42.857143 42.285714q21.714286 21.714286 21.714286 52t-21.714286 52L481.714286 438.857143h402.285714q29.714286 0 48.285714 21.428571T950.857143 512z';
export class SVGChart {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private updateDuration = 1000;
  // @ts-ignore
  private nodes: d3.Selection<d3.BaseType, ChartData, d3.BaseType, undefined>;
  private data: ChartData[] = [];
  private dataMap: ChartDataMap = {};
  private colorMap: { [key: string]: string } = {};
  private keyword = '';
  private scaleX: d3.ScaleLinear<number, number> = d3
    .scaleLinear()
    .domain([0, 0])
    .range([0, 0]);
  // @ts-ignore
  private labelWidth: number = 0; // label占用的宽度
  private xAxisHeight = 20;
  private margin = { left: 10, right: 200, top: 20, bottom: 10 };
  // @ts-ignore
  private originData: ChartData[] | ChartDataMap;
  // @ts-ignore
  private info: Required<ChartTitle> = {
    content: '',
    color: '#0984e3',
    size: 70
  };
  // @ts-ignore
  private title: Required<ChartTitle> = {
    content: '',
    color: '#636e72',
    size: 30
  };

  get lineHeight(): number {
    return (
      (this.container.offsetHeight -
        this.chartOffsetBottom -
        this.chartOffsetTop) /
      this.data.length
    );
  }

  get titleHeight(): number {
    return this.title.size + this.margin.top;
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
    this.info.position = {
      x: this.container.offsetWidth - 300,
      y: this.container.offsetHeight - 100
    };
    this.title.position = {
      x: this.container.offsetWidth / 2,
      y: this.titleHeight
    };
    this.svg = this.buildSVG();
  }

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
    this.originData = option.data;
    option.updateDuration && (this.updateDuration = option.updateDuration);
    option.margin && (this.margin = option.margin);
    option.labelWidth && (this.labelWidth = option.labelWidth);
    typeof option.keyword !== 'undefined' && (this.keyword = option.keyword);
    Object.assign(this.info, option.info);
    Object.assign(this.title, option.title);
    this.draw();
  }

  private buildSVG() {
    const svg = d3
      .create('svg')
      .attr('height', this.container.offsetHeight)
      .attr('width', this.container.offsetWidth);
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
      .attr('text-anchor', 'middle'); // info容器

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
      .domain([0, d3.max(this.data, (d: ChartData) => d.value) as number])
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
      .attr('text-anchor', 'start')
      .attr('x', this.chartOffsetLeft)
      .attr('y', this.titleHeight)
      .style('font-size', this.titleHeight)
      .attr('stroke', this.title.color)
      .attr('stroke-width', 2)
      .attr('fill', this.title.color)
      .text(this.title.content);

    // 更新info
    this.svg
      .select('text.info')
      .attr('x', this.container.offsetWidth - 500)
      .attr('y', this.container.offsetHeight - 100)
      .style('font-size', this.info.size)
      .attr('stroke', this.info.color)
      .attr('stroke-width', 3)
      .attr('fill', this.info.color)
      .text(this.info.content);

    // 更新坐标轴
    const xAxis = d3.axisBottom(this.scaleX).ticks(5);
    this.svg
      .select('g.xAxis')
      .style('font-size', 0.5 * this.lineHeight)
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
        const el = d3.select(this).node();
        // @ts-ignore
        const st = window.getComputedStyle(el);
        // @ts-ignore
        const originProperty = st.getPropertyValue('transform');
        const properties = originProperty
          .split('(')[1]
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
      .style('font-size', this.lineHeight * (1 - goldenRatio))
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
      .style('font-size', this.lineHeight * 0.5);

    const updateBarLabel = updateNode.select('text.bar_label_text');
    updateBarLabel
      .transition('update')
      .duration(this.updateDuration)
      .ease(d3.easeLinear)
      .attr('x', (d: ChartData) => this.scaleX(d.value) - 20)
      .attr('y', 0.5 * this.lineHeight)
      .attr('font-size', this.lineHeight * 0.9)
      .style('opacity', d => (this.dataMap[d.id].rank <= 5 ? 1 : 0))
      .text(d => d.id);
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
      .style('font-size', this.lineHeight * (1 - goldenRatio))
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
      .style('font-size', this.lineHeight * 0.5)
      .text(d => d.id);

    // 添加位于bar上的label
    newNode
      .append('text')
      .attr('class', 'bar_label_text')
      .attr('text-anchor', 'end')
      .attr('fill', '#ffffff')
      .attr('stroke', this.getColor)
      .attr('stroke-width', 0.5)
      .attr('x', (d: ChartData) => this.scaleX(d.value) - 20)
      .attr('y', 0.5 * this.lineHeight)
      .attr('font-size', this.lineHeight * 0.9)
      .text(d => (this.dataMap[d.id].rank <= 5 ? d.id : ''));
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
