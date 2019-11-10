import React, { useState } from 'react';
import Controller from './component/controller';
import HotChart from './component/hotChart';

interface HomeProps {}

const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() - 1);

const Home: React.FunctionComponent<HomeProps> = (props: HomeProps) => {
  const [paused, setPaused] = useState(false);
  const [dateTime, setDateTime] = useState(defaultDate);
  const [keyword, setKeyword] = useState('');
  const [dataSource, setDataSource] = useState<DataSource>('sina');
  return (
    <div>
      <Controller
        onKeywordChange={setKeyword}
        onDateChange={(date: Date) => setDateTime(date)}
        onDisplayStatusChange={(paused: boolean) => setPaused(paused)}
        defaultDateTime={defaultDate}
        defaultDataSource={dataSource}
        onDataSourceChange={ds => setDataSource(ds)}
      />
      <HotChart
        paused={paused}
        dateTime={dateTime}
        keyword={keyword}
        dataSource={dataSource}
      />
    </div>
  );
};

export default Home;
