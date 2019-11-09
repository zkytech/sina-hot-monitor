import React, { useState } from 'react';
import Controller from './component/controller';
import Sina from './component/sina';

interface HomeProps {}

const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() - 1);

const Home: React.FunctionComponent<HomeProps> = (props: HomeProps) => {
  const [paused, setPaused] = useState(false);
  const [dateTime, setDateTime] = useState(defaultDate);
  const [keyword, setKeyword] = useState('');
  return (
    <div>
      <Sina paused={paused} dateTime={dateTime} keyword={keyword} />
      <Controller
        onKeywordChange={setKeyword}
        onDateChange={(date: Date) => setDateTime(date)}
        onDisplayStatusChange={(paused: boolean) => setPaused(paused)}
        defaultDateTime={defaultDate}
      />
    </div>
  );
};

export default Home;
