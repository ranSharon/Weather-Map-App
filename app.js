'use strict';

// array that hold all cites' objects (classes)
const CITES = [];

let mymap = L.map('mapid').setView([0, 0], 2);

// setting map from mapbox.com
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicmFuc2hhcm9uIiwiYSI6ImNqdWxoeHJtczIwazM0MW9hMGk1ZGR0dTMifQ.0pag0fm6gJELcd_i0SvR2g', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicmFuc2hhcm9uIiwiYSI6ImNqdWxoeHJtczIwazM0MW9hMGk1ZGR0dTMifQ.0pag0fm6gJELcd_i0SvR2g'
}).addTo(mymap);

const blueIcon = L.icon({
    iconUrl: './icon-marker-blue.png',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 38], // point of the icon which will correspond to marker's location
});

const redIcon = L.icon({
    iconUrl: './icon-marker-red.png',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 38], // point of the icon which will correspond to marker's location
});

class City {
    constructor(cityName, description, windSpeed, windDeg, temperature, humidity, lat, lon, lastFetchTime, marker) {
        this.cityName = cityName;
        this.description = description;
        this.windSpeed = windSpeed;
        this.windDeg = windDeg;
        this.temperature = temperature;
        this.humidity = humidity;
        this.lat = lat;
        this.lon = lon;
        this.lastFetchTime = lastFetchTime;
        this.marker = marker;
    }

    renderCityWeatherData() {
        document.getElementById('description').innerHTML = `description: ${this.description}`;
        document.getElementById('wind').innerHTML = `wind: speed ${this.windSpeed}, ${this.windDeg} degrees`;
        document.getElementById('temperature').innerHTML = `temperature: ${this.temperature}`;
        document.getElementById('humidity').innerHTML = `humidity: ${this.humidity}%`;
    }

    setMapViewForCity() {
        mymap.setView([this.lat, this.lon], 13);
    }

    setCityMarkerColor(icon) {
        this.marker.setIcon(icon);
    }

    onClickCityMarker() {
        document.getElementById('selectCity').value = this.cityName;
        updateDisplayByCity(this.cityName);
        setAllMarkersIconToBlue();
        this.setCityMarkerColor(redIcon);
    }
}

// Immediately Invoked Function Expressions
// initializing 'CITES' array and setting all markers on the map for the first time
(function () {
    const citesCoordinates = {
        'london': [51.5, -0.13],
        'paris': [48.86, 2.35],
        'jerusalem': [31.78, 35.23],
        'cancun': [21.17, -86.85],
        'miami': [25.77, -80.19],
        'new york': [40.73, -73.99],
        'san francisco': [37.78, -122.42],
        'barcelona': [41.38, 2.18]
    };
    for (let city in citesCoordinates) {
        CITES.push(new City(
            city,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            0,
            L.marker(citesCoordinates[city], {icon: blueIcon}).addTo(mymap)
        ));
    }

    // attaching all cites' markers to click event listener
    CITES.forEach(city => {
        city.marker.on('click', () => {
            city.onClickCityMarker();
        });
    });
}());

document.getElementById('selectCity').addEventListener('change', () => {
    const cityName = document.getElementById('selectCity').value;

    if (cityName === 'world') {
        mymap.setView([0, 0], 2);
        document.getElementById('description').innerHTML = `description:`;
        document.getElementById('wind').innerHTML = `wind:`;
        document.getElementById('temperature').innerHTML = `temperature:`;
        document.getElementById('humidity').innerHTML = `humidity:`;
        setAllMarkersIconToBlue();
    } else {
        updateDisplayByCity(cityName);
    }
});

const updateDisplayByCity = (cityName) => {
    const currTime = Date.now();
    const city = getCityObjectFromCitesArray(cityName);

    if (lastFetchWasLessThanFiveMinutesAgo(currTime, city.lastFetchTime)) {
        city.renderCityWeatherData();
        city.setMapViewForCity();
        city.setCityMarkerColor(redIcon);
    } else {
        city.lastFetchTime = currTime;
        fetchingAndSettingCityData(city);
    }
};

const fetchingAndSettingCityData = (city) => {
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city.cityName}&APPID=d51355a645edb7601e6e4de469eec8a4`)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            city.description = myJson.weather[0].description;
            city.windSpeed = myJson.wind.speed;
            city.windDeg = myJson.wind.deg;
            city.temperature = convertKelvinToCelsius(parseInt(myJson.main.temp)).toFixed(2);
            city.humidity = myJson.main.humidity;
            city.lon = parseFloat(myJson.coord.lon);
            city.lat = parseFloat(myJson.coord.lat);

            // update display for current city
            city.renderCityWeatherData();
            city.setMapViewForCity();
            city.setCityMarkerColor(redIcon);
        });
};

const getCityObjectFromCitesArray = (cityName) => {
    for (let i = 0; i <= CITES.length - 1; i++) {
        if (CITES[i].cityName === cityName) {
            return CITES[i];
        }
    }
};

const lastFetchWasLessThanFiveMinutesAgo = (currTime, lastTime) => {
    const fiveMinutes = 300000; // five minutes in milliseconds
    return (currTime - lastTime) < fiveMinutes;
};

const convertKelvinToCelsius = (kelvin) => {
    if (kelvin < (0)) {
        return 'below absolute zero (0 K)';
    } else {
        return (kelvin - 273.15);
    }
};

const setAllMarkersIconToBlue = () => {
    CITES.forEach(city => {
        city.setCityMarkerColor(blueIcon);
    });
};