import React, { useState } from 'react';
import { Button, DatePicker, TimePicker, Input } from 'antd';
import moment, { Moment } from 'moment';

export interface ControllerProps {
  /** 播放/暂停状态切换的回调 */
  onDisplayStatusChange: (paused: boolean) => any;
  /** 选择日期的回调 */
  onDateChange: (date: Date) => any;
  /** 默认的播放开始日期 */
  defaultDateTime: Date;
  /** 关键词改变的回调 */
  onKeywordChange: (keyword: string) => any;
}

const start = moment(new Date());
const end = moment(new Date());
start.subtract(30, 'days');
end.add(0, 'day');

function disabledDate(current: moment.Moment | undefined) {
  current = current as moment.Moment;
  return current.isAfter(end) || current.isBefore(start);
}

/**
 * 控制器
 * @param props
 */
const Controller: React.FunctionComponent<ControllerProps> = (
  props: ControllerProps
) => {
  const {
    onDisplayStatusChange,
    onDateChange,
    defaultDateTime,
    onKeywordChange
  } = props;
  const [paused, setPaused] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment(defaultDateTime));
  const [keyword, setKeyword] = useState('');
  const displayStatusChange = (status: boolean) => {
    /** 暂停 */
    setPaused(status);
    onDisplayStatusChange(status);
  };
  return (
    <div style={{ padding: '20px' }}>
      {/* 开始/暂停 按钮 */}
      <Button type={'primary'} onClick={() => displayStatusChange(!paused)}>
        {paused ? '开始' : '暂停'}
      </Button>
      &emsp;&emsp;&emsp;&emsp;
      <span>日期：</span>
      {/* 日期选择器 */}
      <DatePicker
        defaultValue={moment(defaultDateTime)}
        style={{ width: '120px' }}
        allowClear={false}
        disabledDate={disabledDate}
        onChange={(date: moment.Moment | null, dateString: string) => {
          date = date as moment.Moment;
          selectedDate.year(date.year());
          selectedDate.month(date.month());
          selectedDate.dayOfYear(date.dayOfYear());
          setSelectedDate(selectedDate);
          onDateChange(selectedDate.toDate());
          displayStatusChange(true);
        }}
      />
      {/* 时间选择器 */}
      <TimePicker
        defaultValue={moment(defaultDateTime)}
        style={{ width: '120px' }}
        allowClear={false}
        format={'HH:mm'}
        onChange={(time: moment.Moment | null, timeString: string) => {
          time = time as moment.Moment;
          selectedDate.hour(time.hour());
          selectedDate.minute(time.minute());
          selectedDate.second(time.second());
          setSelectedDate(selectedDate);
          onDateChange(selectedDate.toDate());
          displayStatusChange(true);
        }}
      />
      &emsp;&emsp;&emsp;&emsp;
      <span>标注：</span>
      <Input
        style={{ width: '120px' }}
        placeholder="标注"
        value={keyword}
        onChange={e => {
          setKeyword(e.target.value);
          onKeywordChange(e.target.value);
        }}
      />
    </div>
  );
};

export default Controller;
