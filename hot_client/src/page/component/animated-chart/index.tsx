import React, { CSSProperties } from 'react';
import { SVGChart } from './svgBuilder';

export interface IBarProps {
  chartOption: ChartOption;
  style?: CSSProperties;
  className?: string;
}
export type ChartTitle = {
  content: string;
  position?: {
    x: number;
    y: number;
  };
  size?: number;
  color?: string;
};

export type ChartData = { id: string; value: number }; // 原始数据
export type ChartDataMap = { [id: string]: { value: number; rank: number } }; //根据id存储数据的map
export type ChartOption = {
  data: ChartDataMap | ChartData[];
  keyword?: string;
  title?: ChartTitle;
  height?: string | number;
  width?: string | number;
  updateDuration?: number; // 动画时长
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  labelWidth?: number; // 标签所占空间
  info?: {
    content: string;
    position?: { x: number; y: number };
    size?: number;
    color?: string;
  };
};

export default class Bar extends React.Component<IBarProps> {
  // @ts-ignore
  container: HTMLDivElement; // 容器的ref
  // @ts-ignore
  svgChart: SVGChart;

  public setOption = (chartOption: ChartOption) => {
    this.svgChart.setOption(chartOption);
  };

  componentDidMount() {
    const { chartOption } = this.props;
    this.svgChart = new SVGChart(this.container);
    this.svgChart.setOption(chartOption);
  }

  public render() {
    const { chartOption, style, className } = this.props;
    const { height, width } = chartOption;

    return (
      <div
        ref={(ref: HTMLDivElement) => (this.container = ref)}
        style={{
          ...style,
          height: height ? height : '90vh',
          width: width ? width : '100%'
        }}
        className={className ? className : undefined}
      ></div>
    );
  }
}
