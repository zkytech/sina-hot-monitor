import React from 'react';
import { getSinaData } from '../../api/sina';
import { ChartOption } from './animated-chart/index';
import BarChart from './animated-chart/index';
interface SinaProps {
  paused: boolean;
  dateTime: Date;
}

type SinaState = {
  datas: SinaHot[]; // 新浪热搜数据
  current: number; // 当前帧对应数据的起点
  loading: boolean; // echarts loading状态控制
};

export default class Sina extends React.Component<SinaProps, SinaState> {
  readonly state: SinaState = {
    datas: [],
    current: 0,
    loading: true
  };
  interval: any; // 自动循环任务
  chartRef: any; // echart ref
  duration: number = 500;
  /**
   * 获取新浪热搜数据
   */
  getData = (start_date: number, end_date: number) =>
    getSinaData(start_date, end_date).then(res => {
      this.setState({
        datas: this.state.datas.concat(res.data)
      });
      return res;
    });

  /**
   * 渲染动画帧
   */
  goNext = () => {
    let { current, datas } = this.state;
    // 一组数据 50 条
    if (datas.length === 0) return;
    const currentData = datas.slice(current, current + 50);
    if (currentData.length === 0) {
      this.pause();
      return;
    }
    // 获取option
    const option: ChartOption = {
      data: currentData.map(val => ({ id: val.title, value: val.rate })),
      title: '微博热搜',
      updateDuration: this.duration,
      info:
        currentData.length > 0
          ? new Date(currentData[0].date_time).toLocaleString()
          : ''
    };
    this.chartRef.setOption(option);
    if (current === datas.length - 15 * 50) {
      // 如果当前播放接近尾部，获取后面的数据
      const start_date = datas[datas.length - 1].date_time + 60000;
      const end_date = start_date + 1800000;
      this.getData(start_date, end_date);
    }
    current += 50;
    this.setState({ current });
  };

  /**
   * 播放动画
   */
  display = () => {
    this.interval = setInterval(this.goNext, this.duration - 10); // 为了使动画连贯，这里更新时间比动画时间短
  };

  /**
   * 暂停动画
   */
  pause = () => {
    clearInterval(this.interval);
  };

  componentWillReceiveProps(nextProps: SinaProps) {
    if (
      nextProps.dateTime.toLocaleString() !==
      this.props.dateTime.toLocaleString()
    ) {
      // 时间改变，清空数据，显示加载动画
      this.setState({
        datas: [],
        current: 0,
        loading: true
      });
      // 获取新的数据
      const startDate = nextProps.dateTime.getTime();
      const endDate = startDate + 1800000;
      this.getData(startDate, endDate).then(res => {
        // 关闭加载动画
        this.setState({ loading: false });
        if (!res.data.length) return;

        // 渲染当前帧
        this.goNext();
      });
    }
    if (nextProps.paused !== this.props.paused) {
      // 控制动画暂停、播放
      if (nextProps.paused) {
        this.pause();
      } else {
        this.display();
      }
    }
  }

  componentDidMount() {
    const start_date = new Date().getTime() - 86400000;
    const end_date = start_date + 1800000;
    this.setState({ loading: true });
    this.getData(start_date, end_date).then(res => {
      this.setState({ loading: false });
      this.display();
    });
  }

  componentWillUnmount() {
    // 取消动画
    this.pause();
  }

  public render() {
    const { loading } = this.state;

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <BarChart
          ref={ref => (this.chartRef = ref)}
          chartOption={{ data: [], title: '', updateDuration: 1000 }}
        ></BarChart>
      </div>
    );
  }
}
