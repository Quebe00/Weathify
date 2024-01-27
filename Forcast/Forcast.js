let i = 0;
let j = 0;
let f = 0;
let p = 0;


let Mth = ["Jan", "Feb", "Mar", "Apr", "Mar", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let abbr_day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let APIkey = "25bd566df879147d8082c1787422c986";

let weather__forcast__date = document.querySelector(".Forcast__Date");
let weather__icon = document.querySelector(".weather__icon");
let weather__condition = document.querySelector(".weather__condition");
let weather__temp = document.querySelector(".weather__temp");
let weather__period = document.querySelector(".weather__period");
let weather__pressure = document.querySelector(".Details > div > .weather__pressure");
let weather__humidity = document.querySelector(".Details > div > .weather__humidity");
let weather__speed = document.querySelector(".Details > div > .weather__speed");
let weather__direction = document.querySelector(".Details > div > .weather__direction");
let weather__visibility = document.querySelector(".Details > div > .weather__visibility");
let weather__precipitation = document.querySelector(".Details > div > .weather__precipitation");
let Forcasts = document.querySelector(".Hourly_Forcasts");
let forcast__data = [];

let weather__coords;
let weather__unit = "metric";
let temp__measure = "°C";
let pressure__unit = "hpa";
let speed__unit = "m/s";
let country__code;

const checkSingleNumber = (val) => {
    if (val < 10 && val >= 0) {
        val = "0" + val;
        return val
    } else {
        return val
    }
}
const checkTimeFormat = (val) =>{
    let f = (val%12 == 0)? "AM":"PM";
    return f
}
const loadUnits = (val) =>{
    let s = dbTx("Settings", "readonly");
    let r = s.get("Data");
    r.onsuccess = (ev) => {
        let d = ev.target.result;
        temp__measure = d.temp;
        pressure__unit = d.pressure;
        speed__unit = d.pressure;
    }
    r.onerror = () => {}
}

let temp_conv = (val) =>{
    if(temp__measure == "°C"){
        return `${checkSingleNumber(Math.round(val))}°C`
    }else{
        return  `${checkSingleNumber(Math.round(((9*val)/5)+32))}°F`
    }
}
let press_conv = (val) =>{
    if(pressure__unit == "hpa"){
        return  `${val.toFixed(1)}hpa`
    }else{
        return `${(val*0.0295).toFixed(1)}inHg`
    }
}
let speed = (val) => {
    if(speed__unit == "m/s"){
       return `${checkSingleNumber(Math.round(val))}m/s`;
    }else{
        return `${checkSingleNumber(Math.round((val*1000)/3600))}Km/h`;
    }
}
let direction = (val) => {
    if (val > 315 && val < 46) {
        return `${90-(val/4)}°N`
    } else if (val < 136 && val > 45) {
        return `${90-(val/4)}°E`
    } else if (val < 226 && val > 135) {
        return `${90-(val/4)}°S`
    } else if (val < 316 && val > 225) {
        return `${90-(val/4)}°W`
    } else if (val == 0) {
        return `${90-(val/4)}°N`
    } else if (val <= 25 || val >= 45) {
        return `${90-(val/4)}°N`
    } else {
        return val
    }

}

let db = null;
let store = null;
let DBName = window.indexedDB.open("__Test2__", 1);

function startDB() {
    DBName.onerror = (err) => {
        console.warn("Error in opening DB", err.target.error);
    }
    DBName.onsuccess = (ev) => {
        db = ev.target.result;
        console.log("successfully opened DB", ev.target.result);
        loadUnits();
    }

    DBName.onupgradeneeded = (ev) => {
        db = ev.target.result;
        if (!db.objectStoreNames.contains('Cache') && !db.objectStoreNames.contains("Settings")) {
            db.createObjectStore("Cache", {
                keypath: "id", autoIncrement: false
            });
            db.createObjectStore("Settings", {
                keypath: "id", autoIncrement: false
            });
        }
    }

}
function dbTx(storageName, mode) {
    let createTran = db.transaction(storageName, `${mode}`);

    createTran.onerror = (err) => {
        console.warn("error in transaction", err.target);
    }
    let s = createTran.objectStore(storageName);

    return s

}
startDB();

const Forcast = () => {
    let urlParams = new URLSearchParams(window.location.search);
    let cd = urlParams.get("c");
    let t = urlParams.get("t");
    if (!cd) {
        window.location.assign("../Home/Home.html?name=cache");
    } else {
        let c = JSON.parse(cd);
        getWeatherByLatLon(c.lat, c.lon, t*1000);
    }
}

async function getWeatherByLatLon(Lat, Lon, time) {
    try {
        let link = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${Lat}&lon=${Lon}&appid=${APIkey}&units=${weather__unit}`);
        let d = await link.json();
        
            let arr = d["list"].filter(e => new Date(e.dt*1000).getDay() == new Date(time).getDay());

        arrangeData(arr[0], arr[0].dt*1000);
        arrangeForcastData(d.list, time);
        
        weather__forcast__date.innerHTML = `${abbr_day[new Date(time).getDay()]}, ${Mth[new Date(time).getMonth()]} ${checkSingleNumber(new Date(time).getDate())}`;
        forcast__data = JSON.stringify({
            "data": d.list,
            "time": time
        });
        
    }catch (e) {
        console.warn("error", e);
    }
}

function Hourly(el){
    let json = JSON.parse(el.getAttribute("data-json"));
    arrangeData(json, json.dt*1000);
}
function arrangeData(data, time) {
    let d = data;
    console.log(d);
    weather__icon.setAttribute("src", `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`);
    weather__condition.innerText = `${d.weather[0]["description"]}`;
    weather__temp.innerText = `${temp_conv(d.main.temp)}`;
    weather__period.innerText = `${checkSingleNumber(new Date(time).getHours()-1)}${checkTimeFormat(new Date(time).getHours()-1)} - ${checkSingleNumber(new Date(time).getHours()+2)}${checkTimeFormat(new Date(time).getHours()+2)}`;
    
    weather__pressure.innerText = `${press_conv(d.main.pressure)}`;
    weather__humidity.innerText = `${checkSingleNumber(d.main.humidity)}%`;
    weather__speed.innerText = `${speed(d.wind.speed)}`;
    weather__direction.innerText = `${direction(d.wind.deg)}`;
    weather__visibility.innerText = `${d["visibility"]/1000}km`;
    
}
function arrangeForcastData(data, time) {
    let l = data;
    let arr = l.filter(e => new Date(e.dt*1000).getDay() == new Date(time).getDay());
    arr.forEach((a)=> {
        Forcasts.innerHTML += `
            <div data-json='${JSON.stringify(a)}' onclick="Hourly(this)">
                <button class="time">${checkSingleNumber(new Date(a.dt*1000).getHours()-1)}:${checkSingleNumber(new Date(a.dt*1000).getMinutes())}</button>
                <button class="fig"><img src="https://openweathermap.org/img/wn/${a.weather[0].icon}@2x.png" /></button>
                <button class="temp">${temp_conv(a.main.temp)}</button>
            </div>
        `;
    });
}

Forcast();