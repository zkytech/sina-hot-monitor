import React,{useState} from 'react';
import Sina from './component/sina'
import Controller from './component/controller'


interface HomeProps {
}

const defaultDate = new Date()
defaultDate.setDate(defaultDate.getDate() - 1)

const Home: React.FunctionComponent<HomeProps> = (props:HomeProps) => {

    const [paused,setPaused] = useState(false)
    const [dateTime,setDateTime] = useState(defaultDate)
    return (
        <div>
            <Sina
                paused = {paused}
                dateTime = {dateTime}
            />
            <Controller
                onDateChange = {(date:Date)=>setDateTime(date)}
                onDisplayStatusChange = {(paused:boolean)=>setPaused(paused)}
                defaultDateTime = {defaultDate}
            />  
        </div>
    )
};

export default Home;
