import React, { CSSProperties } from 'react';
import { SVGChart } from './svgBuilder';
import ReactLoading from 'react-loading';
export interface IBarProps {
  chartOption: ChartOption;
  style?: CSSProperties;
  className?: string;
  loading?: boolean;
  height?: string | number;
  width?: string | number;
}
export type ChartTitle = {
  content: string;
  position?: Vector2D;
  size?: number;
  color?: string;
};
export type Vector2D = { x: number; y: number };
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
  info?: ChartTitle;
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
  componentWillReceiveProps(nextProps: IBarProps) {}

  loadingMask() {
    const { height, width, loading } = this.props;
    return (
      <div
        style={{
          height: height ? height : '100%',
          width: width ? width : '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: '#ffffff',
          opacity: 0.9,
          zIndex: 2
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            textAlign: 'center',
            zIndex: 3
          }}
        >
          <ReactLoading type={'spin'} height={50} width={50} color={'#000'} />
          Loading...
        </div>
      </div>
    );
  }

  public render() {
    const { style, className, height, width, loading } = this.props;

    return (
      <div
        style={{
          ...style,
          height: height ? height : '100%',
          width: width ? width : '100%'
        }}
        className={className ? className : undefined}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%'
          }}
        >
          <div
            ref={(ref: HTMLDivElement) => (this.container = ref)}
            style={{ height: '100%', width: '100%' }}
          ></div>
          {loading ? this.loadingMask() : ''}
        </div>
      </div>
    );
  }
}
