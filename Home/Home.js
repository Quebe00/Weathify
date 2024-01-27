let i = 0;
let j = 0;
let f = 0;
let p = 0;
let deg = 0;


let Mth = ["Jan", "Feb", "Mar", "Apr", "Mar", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let abbr_day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let APIkey = "c50628ef133323d00065d90759e3001a";

let media__date = document.querySelector(".media__Date");
let media__forcast = document.querySelector(".media__forcasts");

let weather__icon = document.querySelector(".weather__icon");
let weather__condition = document.querySelector(".weather__condition");
let weather__temp = document.querySelector(".weather__temp");
let weather__location = document.querySelector(".weather__location");
let sunset = document.querySelector(".sunset");
let sunrise = document.querySelector(".sunrise");
let weather__pressure = document.querySelector(".Details > div > .weather__pressure");
let weather__humidity = document.querySelector(".Details > div > .weather__humidity");
let weather__speed = document.querySelector(".Details > div > .weather__speed");
let weather__direction = document.querySelector(".Details > div > .weather__direction");
let weather__visibility = document.querySelector(".Details > div > .weather__visibility");
let Forcasts = document.querySelector(".Forcasts");
let forcast__data = [];

let weather__coords;
let temp__unit = "metric";
let temp__measure = "°C";
let pressure__unit = "hpa";
let speed__unit = "m/s";
let country__code;

const onDefaultData = () => {
    let s = dbTx("Settings", "readonly");
    let r = s.getAll();
    r.onsuccess = (ev) => {
        let d = ev.target.result.length;
        if (d == 0) {
            let s_2 = dbTx("Settings", "readwrite");
            let r_2 = s_2.put(JSON.stringify(
                {
                    "id": "Data",
                    "temp": "°C",
                    "pressure": "hpa",
                    "speed": "m/s"
                }
            ), "Data");
            r_2.onsuccess = () =>{}
            r_2.onerror = () => {}
        }
    }
    r.onerror = () => {}
}
const updateSettings = (el) =>{
    try{
    let st = dbTx("Settings", "readonly");
    let res = st.get("Data");
    res.onsuccess = (ev) =>{
        let settings_data = (ev.target.result);
        let t_unit = settings_data.temp;
        let p_unit = settings_data.pressure;
        let s_unit = settings_data.speed;
        
      const UpdateSettingsData = () => {
        let newSettingsData = {
          "id": "Data",
            "temp": t_unit,
            "pressure": p_unit,
            "speed": s_unit
        };
        let ntx = dbTx("Settings", "readwrite");
        let nr = ntx.put(newSettingsData, "Data");

        nr.onerror = (err) => {
          console.log("getAllSettingsData", err.error);
        }
      }
      
        let e = el.children[1];
        let txt = e.textContent;
        if (txt == "°C") {
                e.innerText =  `°F`;
                t_unit = '°F';
    
              } else if (txt === "°F") {
                e.innerText = "°C";
                t_unit = '°C';
    
              } else if (txt === "inHg") {
                e.innerText = "hpa";
                p_unit = "hpa";
    
              } else if (txt === "hpa") {
                e.innerText = "inHg";
                p_unit = "inHg";
    
              } else if (txt === "m/s") {
                e.innerText = "km/h";
                s_unit = "km/h"
    
              } else if (txt === "km/h") {
                e.innerText = "m/s";
                s_unit = "m/s";
              }else {
                  console.log(false,e);
              }
        
            UpdateSettingsData();

    }
    res.onerror = (err) =>{
        console.warn("loadaunit", err);
    }
    }catch(err){
        console.log(err);
    }
}
const checkSingleNumber = (val) => {
    if (val < 10 && val >= 0) {
        val = "0" + val;
        return val
    } else {
        return val
    }
}
const loadCountryCode = () => {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = (ev) => {
        try {
            country__code = JSON.parse(xhttp.responseText);
        }catch(err) {}
    }
    xhttp.open("GET", "../Utils/Country_code/Country_code.json");
    xhttp.send();
}
const loadUnits = (val) =>{
    let s = dbTx("Settings", "readonly");
    let r = s.get("Data");
    r.onsuccess = (ev) => {
        let d = (ev.target.result);
        temp__measure = d.temp;
        pressure__unit = d.pressure;
        speed__unit = d.speed;
    }
    r.onerror = () => {}
}
const Location = () => {
    document.querySelector(".loader").style.display = "block";

    let urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get("name");

    if (name == "cache") {
        let s = dbTx("Cache", "readonly");
        let r = s.get("Eaxi");
        r.onsuccess = (ev) => {
            let json = JSON.parse(JSON.parse(ev.target.result).data);
            getWeatherByLatLon(json.coord.lat, json.coord.lon);
        }
        r.onerror = (err) => {}
    } else if (name != null && name != "cache") {
        let search = JSON.parse(name);
        getWeatherByLatLon(search.lat, search.lon);

    } else {
        if (navigator.geo) {
            const geo = (pos) => {
                getWeatherByLatLon(pos.coords.lat, pos.coords.lon);
            }
            window.navigator.geolocation.getCurrentPosition(geo);
        } else {
            let s = dbTx("Cache", "readonly");
            let r = s.get("Eaxi");
            r.onsuccess = (ev) => {
                if (ev.target.result != undefined) {
                    let json = JSON.parse(JSON.parse(ev.target.result).data);
                    getWeatherByLatLon(json.coord.lat, json.coord.lon);
                } else {
                    getWeatherByName("London");
                }
            }
            r.onerror = (err) => {
                getWeatherByName("London");
            }
        }
    }

}

let sun_set_rise = (dt) =>{
    let d = new Date(dt*1000);
    let hr = d.getHours();
    let min = d.getMinutes();
    let format = (hr%12 == 0)? "PM":"AM";
    
    return `${hr}:${min} ${format}`
}
let air_pollution = async(coords) =>{
    let f = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${APIkey}`);
    let r = await f.json();
    
    let aqi = r.list[0].main.aqi;
    let perc = Math.round((aqi*50)/4);
    pollution_analysis(document.querySelector(".radius"), document.querySelector(".inner"), perc);
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
       return `${checkSingleNumber((val).toFixed(1))} m/s`;
    }else{
        return `${((val*1000)/3600).toFixed(1)} Km/h`;
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
        onDefaultData();
        loadUnits();
        loadCountryCode();
        Location();
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

function pollution_analysis(loader , temp , k) {
        let id = setInterval(()=> {
            if (j == k) {
                clearInterval(id);
                i = 0; j = 0; deg = 0;
            } else if (k < 1) {
                deg--;
                if (deg == k) {
                    clearInterval(id);
                } else {
                    loader.style.backgroundImage = `conic-gradient(#1d57e0 100% , #1C1C1C ${deg}%)`;
                    temp.innerText = `${deg}%`;
                }
            } else {
                j++; i++; deg++;
        if (j >= 37) {
          loader.style.backgroundImage = `conic-gradient(#dc1616 ${j+2}% , #1C1C1C ${i}%)`;
          temp.innerText = `${checkSingleNumber(deg)}%`;
        } else if (j <= 25) {
          temp.innerText = `${checkSingleNumber(deg)}%`;
          loader.style.backgroundImage = `conic-gradient(#32E900 ${j+2}% , #1C1C1C ${i}%)`;
        } else if (j <= 36) {
          temp.innerText = `${checkSingleNumber(deg)}%`;
          loader.style.backgroundImage = `conic-gradient(#FF7600 ${j+2}% , #1C1C1C ${i}%)`;
        } else {
          temp.innerText = `${checkSingleNumber(deg)}%`;
          loader.style.backgroundImage = `conic-gradient(#FF2900 ${j+2}%, #1C1C1C ${i}%)`;
        }            }
        },
            40);
    }

async function getWeatherByLatLon(Lat, Lon) {
    try {
        let link = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${Lat}&lon=${Lon}&exclude=daily,hourly&appid=${APIkey}&units=${temp__unit}`);
        let data = await link.json();

        arrangeData(JSON.stringify(data));
        arrangeForcast(JSON.stringify(data.coord));
        weather__coords = data.coord;
        air_pollution(data.coord);
    }catch (e) {
        console.log(e);
    }
}
async function getWeatherByName(name) {
    try {
        let link = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${APIkey}&units=${temp__unit}`);
        let d = await link.json();
        arrangeData(JSON.stringify(d));
        arrangeForcast(d.coord);
        air_pollution(d.coord);

    }catch (e) {
        console.log("err", err);
    }
}
async function arrangeForcast(c) {
    Forcasts.innerText = "";
    try {
        let coords = JSON.parse(c);
        let link_2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${APIkey}&units=${temp__unit}`);
        let d_2 = await link_2.json();

        loadForcastTempl(d_2);
    }catch(err) {
        console.log("err forcast", err);
    }
}
function arrangeData(data) {
    document.querySelector(".loader").style.display = "none";
    let d = JSON.parse(data);
    console.log(d);
    let country = country__code.filter(e => e.code === d.sys.country);

    let dt = new Date();

    weather__icon.setAttribute("src", `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`);
    weather__condition.innerText = `${d.weather[0]["description"]}`;
    weather__temp.innerText = `${temp_conv(d.main.temp)}`;
    weather__location.innerText = `${d.name}, ${country[0].name}`;
    sunrise.innerText =  `${sun_set_rise(d.sys.sunrise)}`;
    sunset.innerText =  `${sun_set_rise(d.sys.sunset)}`; 
    weather__pressure.innerText = `${press_conv(d.main.pressure)}`;
    weather__humidity.innerText = `${checkSingleNumber(d.main.humidity)}%`;
    weather__speed.innerText = `${speed(d.wind.speed)}`;
    weather__direction.innerText = `${direction(d.wind.deg)}`;
    weather__visibility.innerText = `${d["visibility"]/1000}km`;

    let cached_data = {
        "id": "Eaxi",
        "data": data
    };
    let st = dbTx("Cache", "readwrite");
    let r = st.put(JSON.stringify(cached_data), "Eaxi");
    r.onsuccess = () => {}
    r.onerror = () => {}


}
function loadForcastTempl(data) {
    let forcast = data['list'];
    let s = 0;
    let arr = [{
        'Sun': []},
        {
            'Mon': []},
        {
            'Tue': []},
        {
            'Wed': []},
        {
            'Thu': []},
        {
            'Fri': []},
        {
            'Sat': []}];
    let newArr = [];
    let t = 12;
    let h = (t-(t%3));
    let currTimeForcast = Math.trunc(h/2);

    while (s < forcast.length) {
        let dt = forcast[s].dt;
        let newDay = abbr_day[new Date(dt*1000).getDay()];

        switch (newDay) {
            case 'Sun': arr[0][newDay].push(forcast[s]); break;
            case 'Mon': arr[1][newDay].push(forcast[s]); break;
            case 'Tue': arr[2][newDay].push(forcast[s]); break;
            case 'Wed': arr[3][newDay].push(forcast[s]); break;
            case 'Thu': arr[4][newDay].push(forcast[s]); break;
            case 'Fri': arr[5][newDay].push(forcast[s]); break;
            case 'Sat': arr[6][newDay].push(forcast[s]); break;
            default: console.log("forcast issues");
            }
            s++;
            forcast__data = arr;
        }

        s = new Date().getDay()+1;
        while (s < new Date().getDay()+6) {
            let data = forcast__data[s%7][abbr_day[s%7]][0];
            let c = JSON.stringify(weather__coords);
            Forcasts.innerHTML += `
            <div data-json='${c}' data-time='${data.dt}' onclick="showForcast(this)">
            <button>${abbr_day[new Date(data.dt*1000).getDay()]}</button>
            <button class="fig"><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" /><div>${data.weather[0]["description"]}</div></button>
            <button>${temp_conv((data.main.temp).toFixed(1))}</button>
            </div>
            `;
            s++;
        }

    }

    function showForcast(el) {
        let param = el.getAttribute("data-json");
        let time = el.getAttribute("data-time");
        window.location.assign(`../Forcast/Forcast.html?c=${param}&t=${time}`);
    }
    
    function settingsForm(){
        let st = dbTx("Settings", "readonly");
        let r = st.get("Data");
        r.onsuccess = (ev) =>{
            let d = ev.target.result;
            let form = document.querySelector(".form > .mainItm");
            form.innerHTML = `
                    <div class="measurement" onclick="updateSettings(this)">
                        <button class="span">Temperature</button>
                        <button class="unit t_unit">${d.temp}</button>
                    </div>
                    <div class="measurement" onclick="updateSettings(this)">
                        <button class="span">Pressure</button>
                        <button class="unit p_unit">${d.pressure}</button>
                    </div>
                    <div class="measurement" onclick="updateSettings(this)">
                        <button class="span">Wind speed</button>
                        <button class="unit s_unit">${d.speed}</button>
                    </div>
            `;
        }
        r.onerror = () =>{}
    }