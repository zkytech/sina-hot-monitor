import React from 'react';
import { ChartOption } from './animated-chart/index';
import BarChart from './animated-chart/index';
import { getSinaData, getZhihuData, getBilibiliData } from '../../api/data';

import moment from 'moment';

interface HotChartProps {
  paused: boolean;
  dateTime: Date;
  keyword: string;
  dataSource: DataSource;
}
function getHotData(
  startDate: number,
  endDate: number,
  dataSource: DataSource
) {
  switch (dataSource) {
    case 'sina':
      return getSinaData(startDate, endDate);
    case 'zhihu':
      return getZhihuData(startDate, endDate);
    case 'bilibili':
      return getBilibiliData(startDate, endDate);
    default:
      return getSinaData(startDate, endDate);
  }
}
type HotChartState = {
  datas: HotData[]; // 新浪热搜数据
  current: number; // 当前帧对应数据的起点
  loading: boolean; // echarts loading状态控制
};

export default class HotChart extends React.Component<
  HotChartProps,
  HotChartState
> {
  readonly state: HotChartState = {
    datas: [],
    current: 0,
    loading: true
  };
  interval: any; // 自动循环任务
  chartRef: any; // echart ref
  duration: number = 1000;
  requesting = false;
  get unit(): number {
    switch (this.props.dataSource) {
      case 'sina':
        return 1;
      case 'zhihu':
        return 10000;
      case 'bilibili':
        return 1;
    }
  }
  /** 每次获取数据的时间跨度 */
  getSpan(dataSource?: DataSource): number {
    switch (dataSource ? dataSource : this.props.dataSource) {
      case 'sina':
        return 3600000; // 一个小时
      case 'zhihu':
        return 3600000; // 一个小时
      case 'bilibili':
        return 2592000000; // 30天
      default:
        return 0;
    }
  }
  /**
   * 获取热搜数据
   */
  getData = (start_date: number, end_date: number, dataSource?: DataSource) =>
    getHotData(
      start_date,
      end_date,
      dataSource ? dataSource : this.props.dataSource
    )
      .then(res => {
        this.setState({
          datas: this.state.datas.concat(res.data)
        });
        return res;
      })
      .finally(() => {
        // 即使失败了也能够继续发送请求
        this.requesting = false;
      });

  get title(): { content: string; color: string } {
    switch (this.props.dataSource) {
      case 'sina':
        return { content: '微博热搜', color: '#E6162D' };
      case 'zhihu':
        return { content: '知乎热榜', color: '#0084FF' };
      case 'bilibili':
        return { content: 'Bilibili热榜', color: '#00A1D6' };
      default:
        return { content: '', color: '#000' };
    }
  }
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
      data: currentData
        .map(val => ({ id: val.title, value: Number(val.rate) * this.unit }))
        .slice(0, 30),
      title: this.title,
      updateDuration: this.duration,
      keyword: this.props.keyword,
      info: {
        content:
          currentData.length > 0
            ? moment(currentData[0].date_time).format('YYYY年MM月DD日 HH:mm')
            : ''
      }
    };
    this.chartRef.setOption(option);
    if (current >= datas.length - 15 * 50 && !this.requesting) {
      this.requesting = true;
      // 如果当前播放接近尾部，获取后面的数据
      const start_date = datas[datas.length - 1].date_time + 60000;
      const end_date = start_date + this.getSpan();
      this.getData(start_date, end_date);
    }
    current += 50;
    this.setState({ current });
  };

  /**
   * 播放动画
   */
  display = () => {
    this.interval = setInterval(this.goNext, this.duration - 20); // 为了使动画连贯，这里更新时间比动画时间短
  };

  /**
   * 暂停动画
   */
  pause = () => {
    clearInterval(this.interval);
  };

  componentWillReceiveProps(nextProps: HotChartProps) {
    if (
      nextProps.dateTime.toLocaleString() !==
        this.props.dateTime.toLocaleString() ||
      nextProps.dataSource !== this.props.dataSource
    ) {
      // 先暂停动画
      this.pause();
      // 时间改变，清空数据，显示加载动画
      this.setState({
        datas: [],
        current: 0,
        loading: true
      });
      // 获取新的数据
      const startDate = nextProps.dateTime.getTime();
      const endDate = startDate + this.getSpan(nextProps.dataSource);
      this.getData(startDate, endDate, nextProps.dataSource).then(res => {
        // 关闭加载动画
        this.setState({ loading: false });
        if (!res.data.length) return;

        // 开始动画
        this.display();
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
    const end_date = start_date + this.getSpan();
    this.setState({ loading: true });
    this.getData(start_date, end_date).then(res => {
      this.setState({ loading: false });
      this.display();
    });
  }

  componentWillUnmount() {
    // 暂停动画
    this.pause();
  }

  public render() {
    const { loading } = this.state;

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <BarChart
          loading={loading}
          ref={ref => (this.chartRef = ref)}
          chartOption={{ data: [], updateDuration: this.duration }}
          height={'calc(100vh - 120px)'}
          width="100%"
        ></BarChart>
      </div>
    );
  }
}
