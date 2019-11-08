import React from 'react';
import {getSinaData} from '../../api/sina'
import ReactEcharts,{ ObjectMap } from 'echarts-for-react';


interface SinaProps {
  paused:boolean
  dateTime:Date
}

type SinaState = {
    datas:SinaHot[] // 新浪热搜数据
    current:number  // 当前帧对应数据的起点
    loading:boolean // echarts loading状态控制
}

/**
 * 获取echarts option
 * @param category y轴显示的数据名称
 * @param seriesData x轴的数据，与category一一对应
 * @param title 标题
 */
const getOption = (category:string[],seriesData:number[],title:string):ObjectMap=>{
    return {
        title:{
            show:true,
            text:title
        },
        color: ['#3398DB'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            data: seriesData,
            max:seriesData[seriesData.length - 1]?Math.round(seriesData[seriesData.length - 1] * 1.2):0,
            splitLine: {
                show: false
              },
              axisTick: {
                show: false
              }
          }
        ],
        yAxis: [
          {
            type: 'category',
            data:category.map(value=>value.length>10?value.slice(0,10) + '...':value),
            axisLine: {
                show: false
              },
              axisTick: {
                show:false,
              },
              axisLabel: {
                show: true,
                interval: 0,
              }
          }
        ],
        series: [
          {
            name: '热搜',
            type: 'bar',
            // barWidth: '60%',
            data: seriesData,
            label: {
                position: 'right',
                show: true,
                color: '#000000',
                // formatter:(params:any)=>params.name
            },
          }
        ]
      };
}

export default class Sina extends React.Component<SinaProps,SinaState> {

    readonly state:SinaState = {
        datas:[],
        current:0,
        loading:true
    }
    interval:any  // 自动循环任务
    chartRef:any  // echart ref
    
    /**
     * 获取新浪热搜数据
     */
    getData = (start_date:number,end_date:number)=>getSinaData(start_date,end_date).then(res=>{
        this.setState({
            datas:this.state.datas.concat(res.data)
        })
        return res
    })

    /**
     * 渲染动画帧
     */
    goNext = ()=>{
        let {current,datas} = this.state
        // 一组数据 50 条
        if(datas.length === 0) return
        const currentData = datas.slice(current,current+50)
        const category = currentData.map(value=>value.title)
        const seriesData = currentData.map(value=>value.rate)
        const title ="微博热搜\t" + new Date(currentData[0].date_time).toLocaleString()

        // 获取option
        const option = getOption(category.reverse(),seriesData.reverse(),title)
        this.chartRef && this.chartRef.getEchartsInstance().setOption(option)
        if(current === datas.length - 15*50){
            // 如果当前播放接近尾部，获取后面的数据
            const start_date = datas[datas.length - 1].date_time + 60000
            const end_date = start_date + 1800000
            this.getData(start_date,end_date)
        }
        current += 50
        this.setState({current})
    }


    /**
     * 播放动画
     */
    display = ()=>{
      this.interval = setInterval(this.goNext,500)   
    }

    /**
     * 暂停动画
     */
    pause = ()=>{
      clearInterval(this.interval)
    }

    componentWillReceiveProps(nextProps: SinaProps) {
      if(nextProps.dateTime.toLocaleString() !== this.props.dateTime.toLocaleString()){
        // 时间改变，清空数据，显示加载动画
        this.setState({
          datas:[],
          current:0,
          loading:true
        })
        // 获取新的数据
        const startDate = nextProps.dateTime.getTime()
        const endDate = startDate + 1800000
        this.getData(startDate,endDate).then(res=>{
          // 关闭加载动画
          this.setState({loading:false})  
          if(!res.data.length) return 

          // 渲染当前帧
          this.goNext()
        })
      }
      if(nextProps.paused !== this.props.paused){
        // 控制动画暂停、播放
        if(nextProps.paused){
          this.pause()
        }else{
          this.display()
        }
      }
    }



    componentDidMount(){
        const start_date = new Date().getTime() - 86400000
        const end_date = start_date + 1800000
        this.setState({loading:true})
        this.getData(start_date,end_date).then(
            res=>{
              this.setState({loading:false})
              this.display()
            }

        )
    }

    componentWillUnmount(){
        // 取消动画
        this.pause()
    }
    
    public render() {
        const {loading} = this.state

        return (
        <div>
            <ReactEcharts
                style = {{height:'90vh'}}
                option = {getOption([],[],'no data')}
                ref = {
                    ref=>this.chartRef = ref
                }
                showLoading = {loading}
            />    
        </div>
        );
    }
}
