let country__code;

let APIkey = "25bd566df879147d8082c1787422c986";

let container = document.querySelector('.container');

function country_code(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () =>{
        try{
            country__code = JSON.parse(xhttp.responseText);
        }catch(err){}
        
    }
    xhttp.open("GET", "../Utils/Country_code/Country_code.json");
    xhttp.send();
}
country_code();

async function getLocations() {
    container.innerHTML = `
    <div class="loader">
    <svg version="1.1" class="icon" id="L9" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
    <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
    attributeName="transform"
    attributeType="XML"
    type="rotate"
    dur=".8s"
    from="0 50 50"
    to="360 50 50"
    repeatCount="indefinite" />
    </path>
    </svg>
    </div>
    `;
    let inp = document.querySelector('input[type="text"]').value;

    try {
        let link = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${inp}&limit=20&units=metric&appid=25bd566df879147d8082c1787422c986`);
        let d = await link.json();

        if (d.length > 0) {
            arrangeLocation(d, "Full");
        } else {
            let link_2 = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${inp}&units=metric&appid=25bd566df879147d8082c1787422c986`);
            let d_2 = await link_2.json();

            arrangeLocation([d_2], "Void");
        }
    }catch(e) {
        console.warn(e);
    }
}
function arrangeLocation(data, reason) {
    container.innerHTML = "";
    let list = data;
    console.log(list);
    if (list.length > 0) {
        if (reason == "Full") {
            list.forEach((json)=> {
                let d = {
                    'lat': json.lat,
                    'lon': json.lon
                };
                let country = country__code.filter(e => e.code == json.country);

                container.innerHTML += `
                <div class="results" data-key='${JSON.stringify(d)}' onclick="Open(this)">
                <button class="icon-holder"><svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path> </svg></button>
                <div>
                <button class="span">${json.name}, ${country[0].name}</button>
                <button class="coords">lat:${json.lat}, lon:${json.lon}</button>
                </div>
                </div>
                `;
            });
        } else {
            list.forEach((json)=> {
                let key = JSON.stringify({
                    'lat': json.coord.lat,
                    'lon': json.coord.lon
                });
                let country = country__code.filter(e => e.code == json.sys.country);

                container.innerHTML += `
                <div class="results" data-key='${key}' onclick="Open(this)">
                <button class="icon-holder"><svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path> </svg></button>
                <div>
                <button class="span">${json.name}, ${country[0].name}</button>
                <button class="coords">lat:${json.coord.lat}, lon:${json.coord.lon}</button>
                </div>
                </div>
                `;
            });
        }
    }
}

function Open(json) {
    let key = (json.getAttribute("data-key"));
    window.location.assign(`../Home/Home.html?name=${key}`);
}
function goBack() {
    window.loaction.assign(`../Home/Home.html?name=cache`);
}
