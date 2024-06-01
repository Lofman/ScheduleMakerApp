import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { v4 as uuidv4 } from 'uuid';
import './App.css'

let startTime = new Date(9*60*60*1000);
let endTime = new Date(24*60*60*1000);

function App() {
	const [count, setCount] = useState(0)
	const [data, setData] = useState("");
	const [name, setName] = useState("");
	
	let json;

	try {
		json = JSON.parse(data);
	} catch {
		json = {columns: {}}
	}

	useEffect(() => {
		let storedData = localStorage.getItem("scheduleData");
		setData(storedData ?? "");
	}, []);
	
	const saveData = (json) => {
		let dataString = JSON.stringify(json, null, 2);
		localStorage.setItem("scheduleData", dataString);
		setData(dataString)
	}

	const onDataChange = (e) => {
		let inputData = e.target.value;
		
		try {
			let json = JSON.parse(inputData);
			saveData(json);
		} catch {
			setData(inputData);
		}

		console.log("invalid data, skip saving");
	}

	const onAddActivity = (activity) => {
		console.log(activity)
		if (!json.columns[activity.column].activites) {
			json.columns[activity.column].activites = [];
		}
		json.columns[activity.column].activites.push({name: activity.name, timeStart: activity.timeStart, timeEnd: activity.timeEnd, id: uuidv4()});
		let dataString = JSON.stringify(json);

		saveData(json);
	}

	const addColumn = (e) => {
		if (!json.columns) {
			json.columns = {};
		}
		json.columns[uuidv4()] = {name: name};
		saveData(json);
	}
	
	return (
		<>
			<div style={{display: "flex", padding: "1rem", boxSizing: "border-box", gap: "1rem", flexDirection: "column", height: "100%"}}>
				<div className="do-not-print">
					<textarea onChange={onDataChange} value={data} style={{width: "100%", height: "20rem", resize: "vertical"}} className="" />
					<fieldset>
						<legend>Add Column:</legend>
						<input type="text" onChange={(e) => setName(e.target.value)} /><button onClick={addColumn}>Add</button>
					</fieldset>
					<AddActivity onAdd={onAddActivity} columns={json.columns} />
				</div>
				<Schedule data={json} />
			</div>
		</>
	)
}

function AddActivity({onAdd, columns}) {
	const column = useRef();
	const timeStart = useRef();
	const timeEnd = useRef();
	const activityName = useRef();

	return (
		<fieldset style={{display: "flex", gap: "1rem"}}>
			<legend>Add timeslot:</legend>
			<select ref={column}>
				{Object.keys(columns).map((id, key) => <option key={key} value={id}>{columns[id].name}</option>)}
			</select>
			<input type="text" ref={activityName} />
			<input type="time" ref={timeStart} />
			<input type="time" ref={timeEnd} />
			<button onClick={() => onAdd({column: column.current.value, timeStart: timeStart.current.value, timeEnd: timeEnd.current.value, name: activityName.current.value})}>Add</button>
		</fieldset>
	)
}

function Schedule({data}) {
	const [hide, setHide] = useState([]);

	const onToggleColumn = (e) => {
		let id = e.target.value;
		let newHide = [...hide];
		
		if (e.target.checked) {
			const index = newHide.indexOf(id);
			if (index >= 0) {
				newHide.splice(index, 1);
			}
		}
		else {
			newHide.push(id);
		}
		setHide(newHide);
	}

	return (
		<>
			<div style={{display: "flex", gap: "1rem"}} className="do-not-print">
				{
					Object.keys(data?.columns).map(
						column => 
							(
								<label>
									{data.columns[column].name}
									<input type="checkbox" value={column} defaultChecked={hide.indexOf(column) < 0 ? true : false} onChange={onToggleColumn}/>
								</label>
							)
						)
				}
			</div>
			<div style={{display: "flex", flexDirection: "row", gap: "1rem", width: "100%", flexGrow: "1"}}>
				{Object.keys(data?.columns).map(column => (hide.indexOf(column) < 0 ? <ScheduleColumn column={data.columns[column]} /> : <></>))}
			</div>
		</>
	)
}

function ScheduleColumn({column}) {
	return (
		<div style={{display: "flex", flexDirection: "column", flexGrow: "1"}}>
			<h3>{column.name}</h3>
			<div style={{flexGrow: "1", position: "relative"}}>
				{column.activites?.map(activity => <ScheduleActivity activity={activity} />)}
			</div>
		</div>
	)
}

function ScheduleActivity({activity}) {
	let activityStart = parseTime(activity.timeStart);
	let activityEnd = parseTime(activity.timeEnd);

	let duration = (activityEnd - activityStart);
	let height = (duration / (endTime - startTime)) * 100;
	let position = (activityStart - startTime) / (endTime - startTime) * 100;


	return (
		<div style={{position: "absolute", width: "100%", minHeight: height+"%", top: position+"%", boxSizing: "border-box", flexDirection: "column", background: "rgba(200,200,200,0.5)", border: "0.1rem solid #CCC", padding: "0.1rem 0.5rem"}}>
			<span style={{fontWeight: "bold", marginRight: "0.5rem"}}>{activity.timeStart} - {activity.timeEnd}</span>
			<span>-</span>
			<span style={{marginLeft: "0.5rem"}}>{activity.name}</span>
		</div>
	)
}

function parseTime(timeString) {	
	if (timeString == '') return null;
	
	var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);	
	if (time == null) return null;
	
	var hours = parseInt(time[1],10);	 

	var minutes = parseInt(time[3],10) || 0;

	var d = new Date(hours*60*60*1000 + minutes*60*1000);
	return d;
}

export default App
